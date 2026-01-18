/**
 * Seed Script: SEC Form 4 Filings
 *
 * Fetches and processes Form 4 insider trading filings from SEC daily index files.
 * Run with: npx tsx scripts/seed-30-days.ts
 *
 * Required environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import {
  fetchAndParseForm4,
  delay,
  buildForm4DocumentUrl,
} from '../lib/edgar/client'

// =============================================================================
// Configuration
// =============================================================================

// Configuration - can be overridden via environment variables
const DAYS_BACK = parseInt(process.env.DAYS_BACK || '14', 10) // Fetch last N days
const MAX_FILINGS = parseInt(process.env.MAX_FILINGS || '1000', 10) // Maximum filings to process
const RATE_LIMIT_DELAY = 150 // 150ms between SEC requests
// SEC requires User-Agent with company name and valid email
const SEC_USER_AGENT = process.env.SEC_USER_AGENT || 'InsiderIntel support@insiderintel.io'

// =============================================================================
// Types
// =============================================================================

interface FilingEntry {
  cik: string
  accessionNumber: string
  filedAt: string
  companyName: string
}

interface SeedStats {
  filingsFound: number
  filingsProcessed: number
  transactionsCreated: number
  companiesCreated: number
  insidersCreated: number
  skipped: number
  errors: string[]
}

// =============================================================================
// Daily Index Parsing
// =============================================================================

async function fetchDailyIndexForDate(date: Date): Promise<FilingEntry[]> {
  const filings: FilingEntry[] = []

  // Format date as YYYYMMDD
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`

  // Determine quarter
  const quarter = Math.ceil((date.getMonth() + 1) / 3)

  // Build URL
  const url = `https://www.sec.gov/Archives/edgar/daily-index/${year}/QTR${quarter}/form.${dateStr}.idx`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': SEC_USER_AGENT,
      },
    })

    if (!response.ok) {
      // File might not exist (weekend, holiday)
      return []
    }

    const text = await response.text()
    const lines = text.split('\n')

    for (const line of lines) {
      // Form 4 lines start with "4 " followed by company name
      if (!line.startsWith('4 ')) continue

      // Parse the fixed-width format
      // Format: Form Type (12) | Company Name (62) | CIK (12) | Date Filed (12) | File Name
      const companyName = line.slice(17, 79).trim()
      const cik = line.slice(79, 91).trim()
      const filedDate = line.slice(91, 103).trim()
      const filePath = line.slice(103).trim()

      // Extract accession number from file path
      // Path format: edgar/data/CIK/ACCESSION.txt
      const accessionMatch = filePath.match(/(\d{10}-\d{2}-\d{6})/)
      if (!accessionMatch) continue

      const accessionNumber = accessionMatch[1]

      // Format filed date
      const filedAt = `${filedDate.slice(0, 4)}-${filedDate.slice(4, 6)}-${filedDate.slice(6, 8)}`

      filings.push({
        cik,
        accessionNumber,
        filedAt,
        companyName,
      })
    }
  } catch {
    // Ignore errors for missing dates
  }

  return filings
}

async function fetchForm4FilingsFromIndex(daysBack: number): Promise<FilingEntry[]> {
  const allFilings: FilingEntry[] = []
  const seenAccessions = new Set<string>()

  // Fetch filings for each day
  for (let i = 0; i < daysBack; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const dayFilings = await fetchDailyIndexForDate(date)

    for (const filing of dayFilings) {
      if (seenAccessions.has(filing.accessionNumber)) continue
      seenAccessions.add(filing.accessionNumber)
      allFilings.push(filing)
    }

    // Small delay between index requests
    await delay(100)
  }

  return allFilings
}

// =============================================================================
// Supabase Client
// =============================================================================

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('\n❌ Missing required environment variables!')
    console.error('   Please set:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    console.error('\n   You can find these in your Supabase project settings.\n')
    process.exit(1)
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

// =============================================================================
// Progress Logging
// =============================================================================

function logProgress(message: string) {
  const timestamp = new Date().toISOString().slice(11, 19)
  console.log(`[${timestamp}] ${message}`)
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60))
  console.log(`  ${title}`)
  console.log('='.repeat(60))
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`
}

function formatNumber(num: number): string {
  return num.toLocaleString()
}

// =============================================================================
// Main Seeding Logic
// =============================================================================

async function seedForm4Filings(): Promise<SeedStats> {
  const stats: SeedStats = {
    filingsFound: 0,
    filingsProcessed: 0,
    transactionsCreated: 0,
    companiesCreated: 0,
    insidersCreated: 0,
    skipped: 0,
    errors: [],
  }

  const supabase = getSupabaseClient()

  logSection(`Fetching Form 4 Filings (Last ${DAYS_BACK} Days)`)
  logProgress(`Max filings to process: ${formatNumber(MAX_FILINGS)}`)

  // Fetch filings from daily index
  let filings: FilingEntry[] = []

  try {
    logProgress('Querying SEC daily index files...')
    filings = await fetchForm4FilingsFromIndex(DAYS_BACK)
    stats.filingsFound = filings.length
    logProgress(`✓ Found ${formatNumber(filings.length)} unique Form 4 filings`)
  } catch (error) {
    const errorMsg = `Failed to fetch filings: ${error instanceof Error ? error.message : 'Unknown error'}`
    logProgress(`❌ ${errorMsg}`)
    stats.errors.push(errorMsg)
    return stats
  }

  if (filings.length === 0) {
    logProgress('No filings found')
    return stats
  }

  // Process filings
  logSection('Processing Filings')

  const startTime = Date.now()
  const total = Math.min(filings.length, MAX_FILINGS)

  for (let i = 0; i < total; i++) {
    const filing = filings[i]
    stats.filingsProcessed++

    // Progress update every 10 filings
    if ((i + 1) % 10 === 0 || i + 1 === total) {
      const elapsed = Date.now() - startTime
      const avgPerFiling = elapsed / (i + 1)
      const remaining = (total - i - 1) * avgPerFiling
      const pct = Math.round(((i + 1) / total) * 100)

      process.stdout.write(
        `\r[${new Date().toISOString().slice(11, 19)}] Progress: ${i + 1}/${total} (${pct}%) | ` +
          `Txns: ${formatNumber(stats.transactionsCreated)} | ` +
          `ETA: ${formatDuration(remaining)}   `
      )
    }

    try {
      // Check if filing already exists
      const { data: existingTxn } = await supabase
        .from('insider_transactions')
        .select('id')
        .eq('accession_number', filing.accessionNumber)
        .limit(1)
        .single()

      if (existingTxn) {
        stats.skipped++
        continue
      }

      // Rate limiting
      await delay(RATE_LIMIT_DELAY)

      // Fetch and parse Form 4 XML
      let form4
      try {
        form4 = await fetchAndParseForm4(filing.cik, filing.accessionNumber)
      } catch {
        // Log but continue - some filings may be unavailable
        stats.skipped++
        continue
      }

      if (!form4.issuer.ticker || !form4.issuer.name) {
        stats.skipped++
        continue
      }

      if (form4.transactions.length === 0) {
        stats.skipped++
        continue
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

      if (form4.owner.cik) {
        const { data } = await supabase
          .from('insiders')
          .select('*')
          .eq('cik', form4.owner.cik)
          .single()
        insider = data
      }

      if (!insider && form4.owner.name) {
        const { data } = await supabase
          .from('insiders')
          .select('*')
          .eq('name', form4.owner.name)
          .single()
        insider = data
      }

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
        if (!txn.transactionCode || txn.shares === null) {
          continue
        }

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
          if (txnError.code !== '23505') {
            // Ignore duplicates
            stats.errors.push(`Transaction insert: ${txnError.message}`)
          }
        } else {
          stats.transactionsCreated++
        }
      }
    } catch (error) {
      const errorMsg = `Filing ${filing.accessionNumber}: ${error instanceof Error ? error.message : 'Unknown'}`
      stats.errors.push(errorMsg)
    }
  }

  // Clear the progress line
  console.log('')

  return stats
}

// =============================================================================
// Main Entry Point
// =============================================================================

async function main() {
  console.log('\n🚀 InsiderIntel - SEC Form 4 Seeding Script')
  console.log('=============================================\n')

  const startTime = Date.now()

  try {
    const stats = await seedForm4Filings()

    // Summary
    logSection('Seeding Complete')

    const duration = Date.now() - startTime
    console.log(`\n📊 Results:`)
    console.log(`   ├─ Filings found:        ${formatNumber(stats.filingsFound)}`)
    console.log(`   ├─ Filings processed:    ${formatNumber(stats.filingsProcessed)}`)
    console.log(`   ├─ Filings skipped:      ${formatNumber(stats.skipped)} (duplicates or invalid)`)
    console.log(`   ├─ Companies created:    ${formatNumber(stats.companiesCreated)}`)
    console.log(`   ├─ Insiders created:     ${formatNumber(stats.insidersCreated)}`)
    console.log(`   ├─ Transactions created: ${formatNumber(stats.transactionsCreated)}`)
    console.log(`   └─ Errors:               ${formatNumber(stats.errors.length)}`)
    console.log(`\n⏱️  Total time: ${formatDuration(duration)}`)

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Sample errors (first 5):')
      stats.errors.slice(0, 5).forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.slice(0, 80)}${err.length > 80 ? '...' : ''}`)
      })
    }

    if (stats.transactionsCreated > 0) {
      console.log('\n✅ Database seeded successfully!')
      console.log('   Your dashboard should now show insider trading data.\n')
    } else {
      console.log('\n⚠️  No new transactions were created.')
      console.log('   This might mean all filings were already in the database.\n')
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

main()
