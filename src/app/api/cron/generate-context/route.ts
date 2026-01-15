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
import { requireCronAuth } from '@/lib/auth/cron'
import { logger } from '@/lib/logger'

const log = logger.cron

// Vercel cron jobs have a 10-second timeout on hobby, 60s on pro
// Process in smaller batches to stay within limits
const BATCH_SIZE = 20

export async function GET(request: Request) {
  // Verify cron secret (required in production)
  const authError = requireCronAuth(request)
  if (authError) return authError

  const startTime = Date.now()

  log.info('Starting AI context generation job')

  let processed = 0
  let successful = 0
  let failed = 0
  const errors: { id: string; error: string }[] = []

  try {
    // Fetch transactions needing AI context
    const transactions = await getTransactionsNeedingAIContext(BATCH_SIZE)

    log.info({ count: transactions.length }, 'Found transactions needing context')

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
        log.debug(
          { progress: `${processed}/${transactions.length}`, ticker: transaction.ticker, insider: transaction.insider_name },
          'Processing transaction'
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
            log.debug(
              { ticker: transaction.ticker, score: result.significanceScore.toFixed(2) },
              'Context generated successfully'
            )
          } else {
            failed++
            errors.push({
              id: transaction.id,
              error: 'Failed to update database',
            })
            log.error({ transactionId: transaction.id }, 'Database update failed')
          }
        } else {
          failed++
          errors.push({
            id: transaction.id,
            error: 'AI context generation returned null',
          })
          log.error({ transactionId: transaction.id }, 'AI generation returned null')
        }
      } catch (error) {
        failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push({
          id: transaction.id,
          error: errorMessage,
        })
        log.error({ transactionId: transaction.id, error: errorMessage }, 'Error processing transaction')
        // Continue with next transaction - don't fail the entire batch
      }

      // Small delay between API calls to avoid rate limiting
      if (processed < transactions.length) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    const durationMs = Date.now() - startTime

    log.info(
      { successful, processed, durationMs },
      'AI context generation completed'
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

    log.fatal({ error: errorMessage }, 'Fatal error in AI context generation')

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
