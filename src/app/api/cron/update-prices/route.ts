/**
 * Cron Job: Update Stock Prices
 *
 * Runs daily to fetch latest stock prices for all companies in the system.
 * Updates the stock_prices table with fresh data from Yahoo Finance.
 *
 * Schedule: "0 22 * * 1-5" (10 PM UTC, Monday-Friday, after market close)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getHistoricalPrices } from '@/lib/yfinance/client'
import { requireCronAuth } from '@/lib/auth/cron'
import { logger } from '@/lib/logger'
import type { Database } from '@/types/supabase'

const log = logger.cron

// Configuration
const DAYS_TO_FETCH = 7 // Fetch last 7 days to catch any missed days
const RATE_LIMIT_DELAY = 200 // 200ms between Yahoo Finance requests
const MAX_PROCESS_TIME_MS = 55000 // 55 seconds max

/**
 * Create Supabase client with service role key
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

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function GET(request: Request) {
  // Verify cron secret
  const authError = requireCronAuth(request)
  if (authError) return authError

  const startTime = Date.now()

  const stats = {
    companiesFound: 0,
    companiesProcessed: 0,
    pricesUpdated: 0,
    errors: [] as string[],
  }

  log.info('Starting stock price update')

  try {
    const supabase = getSupabaseServiceClient()

    // Get all companies with tickers
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, ticker')
      .not('ticker', 'is', null)
      .order('ticker')

    if (companiesError) {
      throw new Error(`Failed to fetch companies: ${companiesError.message}`)
    }

    stats.companiesFound = companies?.length || 0
    log.info({ count: stats.companiesFound }, 'Found companies to update')

    if (!companies || companies.length === 0) {
      return NextResponse.json({
        ...stats,
        message: 'No companies found to update',
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      })
    }

    // Process each company
    for (const company of companies) {
      // Check timeout
      if (Date.now() - startTime > MAX_PROCESS_TIME_MS) {
        log.warn(
          { processed: stats.companiesProcessed, total: companies.length },
          'Timeout approaching, stopping early'
        )
        break
      }

      stats.companiesProcessed++

      try {
        // Rate limiting
        await delay(RATE_LIMIT_DELAY)

        // Fetch recent prices (1 month to ensure we get last 7 days)
        const result = await getHistoricalPrices(company.ticker, 1)

        if (result.prices.length === 0) {
          log.warn({ ticker: company.ticker }, 'No prices returned')
          continue
        }

        // Filter to last 7 days
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_FETCH)
        const cutoffStr = cutoffDate.toISOString().split('T')[0]

        const recentPrices = result.prices.filter((p) => p.date >= cutoffStr)

        // Upsert prices
        const pricesToInsert = recentPrices.map((p) => ({
          company_id: company.id,
          ticker: company.ticker,
          price_date: p.date,
          open: p.open,
          high: p.high,
          low: p.low,
          close: p.close,
          volume: p.volume,
        }))

        if (pricesToInsert.length > 0) {
          const { error: upsertError } = await supabase
            .from('stock_prices')
            .upsert(pricesToInsert, {
              onConflict: 'ticker,price_date',
              ignoreDuplicates: false,
            })

          if (upsertError) {
            stats.errors.push(`${company.ticker}: ${upsertError.message}`)
          } else {
            stats.pricesUpdated += pricesToInsert.length
          }
        }

        // Log progress every 10 companies
        if (stats.companiesProcessed % 10 === 0) {
          log.info(
            {
              processed: stats.companiesProcessed,
              total: companies.length,
              pricesUpdated: stats.pricesUpdated,
            },
            'Price update progress'
          )
        }
      } catch (error) {
        const errorMsg = `${company.ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`
        stats.errors.push(errorMsg)
        log.warn({ ticker: company.ticker, error }, 'Failed to update prices')
      }
    }

    const durationMs = Date.now() - startTime

    log.info(
      {
        companiesProcessed: stats.companiesProcessed,
        pricesUpdated: stats.pricesUpdated,
        errors: stats.errors.length,
        durationMs,
      },
      'Stock price update completed'
    )

    return NextResponse.json({
      ...stats,
      errors: stats.errors.length > 0 ? stats.errors.slice(0, 10) : undefined,
      timestamp: new Date().toISOString(),
      durationMs,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    log.fatal({ error: errorMessage }, 'Fatal error in price update')

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

// Force dynamic execution
export const dynamic = 'force-dynamic'
