/**
 * Cron Job: Ingest SEC Form 4 Filings
 *
 * Runs every 4 hours to fetch recent Form 4 filings from SEC EDGAR.
 * Processes filings from the last 2 days to ensure no filings are missed.
 *
 * Schedule: "0 *\/4 * * *" (every 4 hours)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  fetchRecentForm4Filings,
  fetchAndParseForm4,
  delay,
  buildForm4DocumentUrl,
  type Form4FilingMetadata,
} from '@/lib/edgar/client'
import { requireCronAuth } from '@/lib/auth/cron'
import { logger } from '@/lib/logger'
import type { Database } from '@/types/supabase'

const log = logger.cron

// Configuration
const DAYS_BACK = 2 // Fetch last 2 days to ensure overlap and catch any missed filings
const MAX_FILINGS = 200 // Maximum filings per run
const RATE_LIMIT_DELAY = 100 // 100ms between SEC requests

// Vercel Pro timeout is 60s, Hobby is 10s
// Process in batches that fit within timeout
const MAX_PROCESS_TIME_MS = 55000 // 55 seconds max processing time

/**
 * Create a Supabase client with service role key for cron jobs
 */
function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

export async function GET(request: Request) {
  // Verify cron secret
  const authError = requireCronAuth(request)
  if (authError) return authError

  const startTime = Date.now()

  const stats = {
    filingsFound: 0,
    filingsProcessed: 0,
    transactionsCreated: 0,
    companiesCreated: 0,
    insidersCreated: 0,
    skipped: 0,
    errors: [] as string[],
  }

  log.info('Starting Form 4 filing ingestion')

  try {
    const supabase = getSupabaseServiceClient()

    // Calculate date range (last 2 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - DAYS_BACK)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    log.info({ startDate: startDateStr, endDate: endDateStr }, 'Fetching Form 4 filings')

    // Fetch filings metadata from SEC EDGAR
    let filings: Form4FilingMetadata[] = []
    try {
      filings = await fetchRecentForm4Filings(startDateStr, endDateStr, MAX_FILINGS)
      stats.filingsFound = filings.length
      log.info({ count: filings.length }, 'Found Form 4 filings')
    } catch (error) {
      const errorMsg = `Failed to fetch Form 4 filings: ${error instanceof Error ? error.message : 'Unknown error'}`
      log.error({ error: errorMsg }, 'SEC EDGAR fetch failed')
      stats.errors.push(errorMsg)

      return NextResponse.json(
        {
          ...stats,
          error: errorMsg,
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - startTime,
        },
        { status: 500 }
      )
    }

    if (filings.length === 0) {
      log.info('No filings found in date range')
      return NextResponse.json({
        ...stats,
        message: 'No filings found in date range',
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      })
    }

    // Process each filing
    for (const filing of filings) {
      // Check if we're running out of time
      if (Date.now() - startTime > MAX_PROCESS_TIME_MS) {
        log.warn({ processed: stats.filingsProcessed, total: filings.length }, 'Timeout approaching, stopping early')
        break
      }

      stats.filingsProcessed++

      try {
        // Check if filing already exists (by accession_number)
        const { data: existingTxn } = await supabase
          .from('insider_transactions')
          .select('id')
          .eq('accession_number', filing.accessionNumber)
          .limit(1)
          .single()

        if (existingTxn) {
          stats.skipped++
          continue // Already processed
        }

        // Rate limiting for SEC API
        await delay(RATE_LIMIT_DELAY)

        // Fetch and parse Form 4 XML
        const form4 = await fetchAndParseForm4(filing.cik, filing.accessionNumber)

        if (!form4.issuer.ticker || !form4.issuer.name) {
          stats.skipped++
          continue // Skip if missing essential data
        }

        if (form4.transactions.length === 0) {
          stats.skipped++
          continue // Skip if no transactions
        }

        // Upsert company
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .upsert(
            {
              ticker: form4.issuer.ticker.toUpperCase(),
              name: form4.issuer.name,
              cik: form4.issuer.cik || null,
            },
            { onConflict: 'ticker' }
          )
          .select()
          .single()

        if (companyError || !company) {
          stats.errors.push(`Company upsert failed: ${companyError?.message}`)
          continue
        }
        stats.companiesCreated++

        // Find or create insider
        let insider = null

        // Try to find by CIK first
        if (form4.owner.cik) {
          const { data } = await supabase
            .from('insiders')
            .select('*')
            .eq('cik', form4.owner.cik)
            .single()
          insider = data
        }

        // Try to find by name if no CIK match
        if (!insider && form4.owner.name) {
          const { data } = await supabase
            .from('insiders')
            .select('*')
            .eq('name', form4.owner.name)
            .single()
          insider = data
        }

        // Create new insider if not found
        if (!insider) {
          const { data, error } = await supabase
            .from('insiders')
            .insert({
              cik: form4.owner.cik || null,
              name: form4.owner.name,
            })
            .select()
            .single()

          if (error) {
            stats.errors.push(`Insider insert failed: ${error.message}`)
            continue
          }
          insider = data
          stats.insidersCreated++
        }

        // Insert transactions
        for (const txn of form4.transactions) {
          // Skip transactions without code or shares
          if (!txn.transactionCode || txn.shares === null) {
            continue
          }

          // Only include P, S, A, D, G, M transaction types
          if (!['P', 'S', 'A', 'D', 'G', 'M'].includes(txn.transactionCode)) {
            continue
          }

          const totalValue =
            txn.shares && txn.pricePerShare ? Math.round(txn.shares * txn.pricePerShare) : null

          const { error: txnError } = await supabase.from('insider_transactions').insert({
            company_id: company.id,
            insider_id: insider.id,
            accession_number: filing.accessionNumber,
            filed_at: filing.filedAt,
            transaction_date: txn.transactionDate || form4.periodOfReport,
            transaction_type: txn.transactionCode,
            shares: txn.shares,
            price_per_share: txn.pricePerShare,
            total_value: totalValue,
            shares_owned_after: txn.sharesOwnedAfter,
            insider_title: form4.owner.officerTitle,
            is_director: form4.owner.isDirector,
            is_officer: form4.owner.isOfficer,
            is_ten_percent_owner: form4.owner.isTenPercentOwner,
            is_10b5_1_plan: form4.is10b51Plan,
            raw_filing_url: buildForm4DocumentUrl(filing.cik, filing.accessionNumber),
          })

          if (txnError) {
            // Ignore duplicate constraint violations (23505)
            if (txnError.code !== '23505') {
              stats.errors.push(`Transaction insert failed: ${txnError.message}`)
            }
          } else {
            stats.transactionsCreated++
          }
        }

        // Log progress every 20 filings
        if (stats.filingsProcessed % 20 === 0) {
          log.info(
            { processed: stats.filingsProcessed, total: filings.length, transactions: stats.transactionsCreated },
            'Ingestion progress'
          )
        }
      } catch (error) {
        const errorMsg = `Filing ${filing.accessionNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`
        stats.errors.push(errorMsg)
        // Continue processing other filings
      }
    }

    const durationMs = Date.now() - startTime

    log.info(
      {
        filingsProcessed: stats.filingsProcessed,
        transactionsCreated: stats.transactionsCreated,
        skipped: stats.skipped,
        errors: stats.errors.length,
        durationMs,
      },
      'Form 4 ingestion completed'
    )

    return NextResponse.json({
      ...stats,
      errors: stats.errors.length > 0 ? stats.errors.slice(0, 10) : undefined, // Limit errors in response
      timestamp: new Date().toISOString(),
      durationMs,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    log.fatal({ error: errorMessage }, 'Fatal error in Form 4 ingestion')

    return NextResponse.json(
      {
        ...stats,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    )
  }
}

// Force dynamic execution for cron
export const dynamic = 'force-dynamic'
