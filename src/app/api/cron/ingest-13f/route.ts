/**
 * Cron Job: Ingest SEC 13F Filings
 *
 * Runs daily to fetch recent 13F-HR filings from SEC EDGAR.
 * Processes filings from the current and previous quarter.
 *
 * Schedule: "0 6 * * *" (daily at 6 AM UTC)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  fetch13FFilings,
  fetchAndParse13FHoldingsWithTickers,
  build13FFilingUrl,
  type Filing13FMetadata,
} from '@/lib/edgar/13f-client'
import { delay } from '@/lib/edgar/client'
import { requireCronAuth } from '@/lib/auth/cron'
import { logger } from '@/lib/logger'
import type { Database } from '@/types/supabase'

const log = logger.cron

// Configuration
const MAX_FILINGS = 50 // Maximum filings per run
const RATE_LIMIT_DELAY = 150 // 150ms between SEC requests

// Vercel Pro timeout is 60s, Hobby is 10s
const MAX_PROCESS_TIME_MS = 55000 // 55 seconds max processing time

// List of notable institutions to prioritize (by partial name match)
const NOTABLE_INSTITUTIONS = [
  'BERKSHIRE HATHAWAY',
  'BRIDGEWATER',
  'BLACKROCK',
  'VANGUARD',
  'STATE STREET',
  'FIDELITY',
  'CITADEL',
  'RENAISSANCE',
  'TWO SIGMA',
  'DE SHAW',
  'POINT72',
  'MILLENNIUM',
  'AQR',
  'TIGER GLOBAL',
  'COATUE',
  'DRAGONEER',
  'ARK INVEST',
  'CATHIE WOOD',
  'SOROS',
  'ICAHN',
  'ACKMAN',
  'PERSHING',
  'THIRD POINT',
  'ELLIOTT',
  'BAUPOST',
  'APPALOOSA',
  'GREENLIGHT',
  'LONE PINE',
  'VIKING GLOBAL',
  'MAVERICK',
]

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

/**
 * Get current quarter info
 */
function getCurrentQuarter(): { year: number; quarter: 1 | 2 | 3 | 4 } {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const quarter = Math.ceil(month / 3) as 1 | 2 | 3 | 4
  return { year, quarter }
}

/**
 * Get previous quarter info
 */
function getPreviousQuarter(): { year: number; quarter: 1 | 2 | 3 | 4 } {
  const { year, quarter } = getCurrentQuarter()
  if (quarter === 1) {
    return { year: year - 1, quarter: 4 }
  }
  return { year, quarter: (quarter - 1) as 1 | 2 | 3 | 4 }
}

/**
 * Check if a filer name is notable
 */
function isNotableInstitution(name: string): boolean {
  const upperName = name.toUpperCase()
  return NOTABLE_INSTITUTIONS.some((notable) => upperName.includes(notable))
}

export async function GET(request: Request) {
  // Verify cron secret
  const authError = requireCronAuth(request)
  if (authError) return authError

  const startTime = Date.now()

  const stats = {
    filingsFound: 0,
    filingsProcessed: 0,
    institutionsCreated: 0,
    filingsCreated: 0,
    holdingsCreated: 0,
    skipped: 0,
    errors: [] as string[],
  }

  log.info('Starting 13F filing ingestion')

  try {
    const supabase = getSupabaseServiceClient()

    // Get current and previous quarter
    const prevQuarter = getPreviousQuarter()

    log.info(
      { year: prevQuarter.year, quarter: prevQuarter.quarter, maxFilings: MAX_FILINGS },
      'Fetching 13F filings'
    )

    // Fetch filings from SEC EDGAR
    let filings: Filing13FMetadata[] = []
    try {
      filings = await fetch13FFilings(prevQuarter.year, prevQuarter.quarter, MAX_FILINGS * 2)
      stats.filingsFound = filings.length
      log.info({ count: filings.length }, 'Found 13F filings')
    } catch (error) {
      const errorMsg = `Failed to fetch 13F filings: ${error instanceof Error ? error.message : 'Unknown error'}`
      log.error({ error: errorMsg }, 'SEC EDGAR 13F fetch failed')
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
      log.warn('No 13F filings found')
      return NextResponse.json({
        ...stats,
        message: 'No 13F filings found in date range',
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      })
    }

    // Sort filings: prioritize notable institutions
    filings.sort((a, b) => {
      const aNotable = isNotableInstitution(a.filerName) ? 0 : 1
      const bNotable = isNotableInstitution(b.filerName) ? 0 : 1
      return aNotable - bNotable
    })

    // Limit to MAX_FILINGS
    filings = filings.slice(0, MAX_FILINGS)

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
        const { data: existingFiling } = await supabase
          .from('institutional_filings')
          .select('id')
          .eq('accession_number', filing.accessionNumber)
          .limit(1)
          .single()

        if (existingFiling) {
          stats.skipped++
          continue // Already processed
        }

        // Rate limiting for SEC API
        await delay(RATE_LIMIT_DELAY)

        // Fetch and parse 13F holdings
        let holdings
        try {
          holdings = await fetchAndParse13FHoldingsWithTickers(
            filing.cik,
            filing.accessionNumber,
            true // Enrich with tickers
          )
        } catch (error) {
          const errorMsg = `Failed to parse 13F: ${error instanceof Error ? error.message : 'Unknown'}`
          log.warn({ accession: filing.accessionNumber, error: errorMsg }, 'Skipping filing')
          stats.errors.push(errorMsg)
          continue
        }

        if (holdings.holdings.length === 0) {
          stats.skipped++
          continue // No holdings to process
        }

        // Upsert institution
        const { data: institution, error: instError } = await supabase
          .from('institutions')
          .upsert(
            {
              cik: filing.cik,
              name: filing.filerName,
              institution_type: isNotableInstitution(filing.filerName) ? 'Hedge Fund' : null,
              aum_estimate: holdings.totalValue,
            },
            { onConflict: 'cik' }
          )
          .select()
          .single()

        if (instError || !institution) {
          stats.errors.push(`Institution upsert failed: ${instError?.message}`)
          continue
        }
        stats.institutionsCreated++

        // Insert filing record
        const reportDate = filing.periodOfReport || `${prevQuarter.year}-${String(prevQuarter.quarter * 3).padStart(2, '0')}-30`

        const { data: filingRecord, error: filingError } = await supabase
          .from('institutional_filings')
          .insert({
            institution_id: institution.id,
            accession_number: filing.accessionNumber,
            report_date: reportDate,
            filed_at: filing.filedAt,
            total_value: holdings.totalValue,
          })
          .select()
          .single()

        if (filingError || !filingRecord) {
          if (filingError?.code !== '23505') {
            stats.errors.push(`Filing insert failed: ${filingError?.message}`)
          }
          continue
        }
        stats.filingsCreated++

        // Process holdings - need to map tickers to company IDs
        const holdingsToInsert = []

        for (const holding of holdings.holdings) {
          // Skip if no ticker (can't map to company)
          if (!holding.ticker) {
            continue
          }

          // Find or create company by ticker
          let company = null
          const { data: existingCompany } = await supabase
            .from('companies')
            .select('*')
            .eq('ticker', holding.ticker.toUpperCase())
            .single()

          if (existingCompany) {
            company = existingCompany
          } else {
            // Create new company
            const { data: newCompany, error: companyError } = await supabase
              .from('companies')
              .insert({
                ticker: holding.ticker.toUpperCase(),
                name: holding.nameOfIssuer,
              })
              .select()
              .single()

            if (companyError) {
              // Try to fetch again in case of race condition
              const { data: refetchedCompany } = await supabase
                .from('companies')
                .select('*')
                .eq('ticker', holding.ticker.toUpperCase())
                .single()
              company = refetchedCompany
            } else {
              company = newCompany
            }
          }

          if (!company) {
            continue
          }

          holdingsToInsert.push({
            filing_id: filingRecord.id,
            institution_id: institution.id,
            company_id: company.id,
            report_date: reportDate,
            shares: holding.shares,
            value: holding.value,
            percent_of_portfolio: holdings.totalValue > 0
              ? (holding.value / holdings.totalValue) * 100
              : null,
            is_new_position: false, // Will be calculated later
            is_closed_position: false,
          })
        }

        // Insert holdings in batches
        const BATCH_SIZE = 50
        for (let i = 0; i < holdingsToInsert.length; i += BATCH_SIZE) {
          const batch = holdingsToInsert.slice(i, i + BATCH_SIZE)

          const { error: holdingsError } = await supabase
            .from('institutional_holdings')
            .insert(batch)

          if (holdingsError && holdingsError.code !== '23505') {
            stats.errors.push(`Holdings insert failed: ${holdingsError.message}`)
          } else {
            stats.holdingsCreated += batch.length
          }
        }

        // Log progress every 10 filings
        if (stats.filingsProcessed % 10 === 0) {
          log.info(
            {
              processed: stats.filingsProcessed,
              total: filings.length,
              holdings: stats.holdingsCreated,
            },
            '13F ingestion progress'
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
        institutionsCreated: stats.institutionsCreated,
        holdingsCreated: stats.holdingsCreated,
        skipped: stats.skipped,
        errors: stats.errors.length,
        durationMs,
      },
      '13F ingestion completed'
    )

    return NextResponse.json({
      ...stats,
      errors: stats.errors.length > 0 ? stats.errors.slice(0, 10) : undefined,
      timestamp: new Date().toISOString(),
      durationMs,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    log.fatal({ error: errorMessage }, 'Fatal error in 13F ingestion')

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
