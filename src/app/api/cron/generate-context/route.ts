/**
 * Cron Job: Generate AI Context for Insider Transactions
 *
 * Runs hourly to process transactions that lack AI-generated context.
 * Fetches up to 20 transactions, generates context via Claude API,
 * and updates the database with results.
 */

import { NextResponse } from 'next/server'
import { getTransactionsNeedingAIContext, updateTransactionAIContext } from '@/lib/db/insider-transactions'
import { generateInsiderContext } from '@/lib/ai/claude-client'

// Vercel cron jobs have a 10-second timeout on hobby, 60s on pro
// Process in smaller batches to stay within limits
const BATCH_SIZE = 20

export async function GET(request: Request) {
  const startTime = Date.now()

  // Optional: Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('Unauthorized cron request attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[generate-context] Starting AI context generation job')

  let processed = 0
  let successful = 0
  let failed = 0
  const errors: { id: string; error: string }[] = []

  try {
    // Fetch transactions needing AI context
    const transactions = await getTransactionsNeedingAIContext(BATCH_SIZE)

    console.log(`[generate-context] Found ${transactions.length} transactions needing context`)

    if (transactions.length === 0) {
      return NextResponse.json({
        processed: 0,
        successful: 0,
        failed: 0,
        message: 'No transactions need AI context',
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      })
    }

    // Process each transaction
    for (const transaction of transactions) {
      processed++

      try {
        console.log(
          `[generate-context] Processing ${processed}/${transactions.length}: ` +
          `${transaction.ticker} - ${transaction.insider_name}`
        )

        // Generate AI context
        const result = await generateInsiderContext(transaction)

        if (result) {
          // Update database with generated context
          const updated = await updateTransactionAIContext(
            transaction.id,
            result.context,
            result.significanceScore
          )

          if (updated) {
            successful++
            console.log(
              `[generate-context] Success: ${transaction.ticker} - ` +
              `Score: ${result.significanceScore.toFixed(2)}`
            )
          } else {
            failed++
            errors.push({
              id: transaction.id,
              error: 'Failed to update database',
            })
            console.error(
              `[generate-context] Database update failed for ${transaction.id}`
            )
          }
        } else {
          failed++
          errors.push({
            id: transaction.id,
            error: 'AI context generation returned null',
          })
          console.error(
            `[generate-context] AI generation failed for ${transaction.id}`
          )
        }
      } catch (error) {
        failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push({
          id: transaction.id,
          error: errorMessage,
        })
        console.error(
          `[generate-context] Error processing ${transaction.id}:`,
          errorMessage
        )
        // Continue with next transaction - don't fail the entire batch
      }

      // Small delay between API calls to avoid rate limiting
      if (processed < transactions.length) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    const durationMs = Date.now() - startTime

    console.log(
      `[generate-context] Completed: ${successful}/${processed} successful ` +
      `in ${durationMs}ms`
    )

    return NextResponse.json({
      processed,
      successful,
      failed,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      durationMs,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('[generate-context] Fatal error:', errorMessage)

    return NextResponse.json(
      {
        processed,
        successful,
        failed,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    )
  }
}

// Disable body parsing for cron requests
export const dynamic = 'force-dynamic'
