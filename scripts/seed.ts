/**
 * Database Seed Script
 *
 * Populates the database with initial data from SEC EDGAR:
 * 1. Last 14 days of Form 4 filings (insider transactions)
 * 2. Top 20 institutions by AUM with their latest 13F holdings
 * 3. AI context for 50 most significant transactions
 *
 * Usage: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'
import {
  fetchRecentForm4Filings,
  fetchAndParseForm4,
  delay,
  buildForm4DocumentUrl,
  type Form4FilingMetadata,
} from '../lib/edgar/client'
import {
  fetch13FFilingsByCik,
  fetchAndParse13FHoldings,
  cusipToTicker,
} from '../lib/edgar/13f-client'
import Anthropic from '@anthropic-ai/sdk'

// =============================================================================
// Configuration
// =============================================================================

const FORM4_DAYS_BACK = 14
const FORM4_BATCH_SIZE = 200 // Fetch 200 filings at a time from SEC
const MAX_FORM4_FILINGS = 500 // Maximum filings to process
const AI_CONTEXT_LIMIT = 50 // Generate AI context for top 50 transactions
const RATE_LIMIT_DELAY = 100 // 100ms between SEC requests

// Top 20 institutions by AUM (CIK numbers)
const TOP_INSTITUTIONS = [
  { cik: '1067983', name: 'Berkshire Hathaway Inc', type: 'Hedge Fund', aum: 350_000_000_000 },
  { cik: '1364742', name: 'Bridgewater Associates LP', type: 'Hedge Fund', aum: 125_000_000_000 },
  { cik: '1085635', name: 'BlackRock Inc', type: 'Asset Manager', aum: 9_000_000_000_000 },
  { cik: '102909', name: 'Vanguard Group Inc', type: 'Asset Manager', aum: 7_500_000_000_000 },
  { cik: '1350694', name: 'State Street Corporation', type: 'Asset Manager', aum: 3_500_000_000_000 },
  { cik: '315066', name: 'Fidelity Investments', type: 'Asset Manager', aum: 4_500_000_000_000 },
  { cik: '93751', name: 'Capital Group', type: 'Asset Manager', aum: 2_200_000_000_000 },
  { cik: '1166559', name: 'Citadel Advisors LLC', type: 'Hedge Fund', aum: 56_000_000_000 },
  { cik: '1037389', name: 'Renaissance Technologies LLC', type: 'Hedge Fund', aum: 106_000_000_000 },
  { cik: '1061768', name: 'Two Sigma Investments LP', type: 'Hedge Fund', aum: 60_000_000_000 },
  { cik: '1336528', name: 'D.E. Shaw & Co LP', type: 'Hedge Fund', aum: 60_000_000_000 },
  { cik: '1048445', name: 'AQR Capital Management LLC', type: 'Hedge Fund', aum: 90_000_000_000 },
  { cik: '1535392', name: 'Point72 Asset Management LP', type: 'Hedge Fund', aum: 26_000_000_000 },
  { cik: '1568820', name: 'Millennium Management LLC', type: 'Hedge Fund', aum: 52_000_000_000 },
  { cik: '1167483', name: 'Elliott Investment Management', type: 'Hedge Fund', aum: 55_000_000_000 },
  { cik: '1040273', name: 'Tiger Global Management LLC', type: 'Hedge Fund', aum: 35_000_000_000 },
  { cik: '1649339', name: 'Viking Global Investors LP', type: 'Hedge Fund', aum: 30_000_000_000 },
  { cik: '1159159', name: 'Pershing Square Capital', type: 'Hedge Fund', aum: 12_000_000_000 },
  { cik: '921669', name: 'T. Rowe Price Associates', type: 'Asset Manager', aum: 1_300_000_000_000 },
  { cik: '91530', name: 'JPMorgan Chase & Co', type: 'Bank', aum: 3_000_000_000_000 },
]

// =============================================================================
// Types
// =============================================================================

interface SeedStats {
  companiesCreated: number
  insidersCreated: number
  transactionsCreated: number
  institutionsCreated: number
  filingsCreated: number
  holdingsCreated: number
  aiContextsGenerated: number
  errors: string[]
}

// =============================================================================
// Supabase Client (Direct connection for seeding)
// =============================================================================

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
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

function logStats(stats: SeedStats) {
  console.log('\n📊 Seed Statistics:')
  console.log(`   Companies created: ${stats.companiesCreated}`)
  console.log(`   Insiders created: ${stats.insidersCreated}`)
  console.log(`   Transactions created: ${stats.transactionsCreated}`)
  console.log(`   Institutions created: ${stats.institutionsCreated}`)
  console.log(`   13F filings created: ${stats.filingsCreated}`)
  console.log(`   Holdings created: ${stats.holdingsCreated}`)
  console.log(`   AI contexts generated: ${stats.aiContextsGenerated}`)
  if (stats.errors.length > 0) {
    console.log(`   Errors: ${stats.errors.length}`)
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`
}

// =============================================================================
// Form 4 Processing
// =============================================================================

async function seedForm4Filings(
  supabase: ReturnType<typeof getSupabaseClient>,
  stats: SeedStats
): Promise<void> {
  logSection('Form 4 Insider Transactions (Last 14 Days)')

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - FORM4_DAYS_BACK)

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  logProgress(`Fetching Form 4 filings from ${startDateStr} to ${endDateStr}...`)

  // Fetch filings metadata from SEC
  let filings: Form4FilingMetadata[] = []
  try {
    filings = await fetchRecentForm4Filings(startDateStr, endDateStr, MAX_FORM4_FILINGS)
    logProgress(`Found ${filings.length} Form 4 filings`)
  } catch (error) {
    const errorMsg = `Failed to fetch Form 4 filings: ${error instanceof Error ? error.message : 'Unknown error'}`
    stats.errors.push(errorMsg)
    logProgress(`❌ ${errorMsg}`)
    return
  }

  // Process each filing
  let processed = 0
  const total = filings.length
  const startTime = Date.now()

  for (const filing of filings) {
    processed++
    const pct = Math.round((processed / total) * 100)
    const elapsed = Date.now() - startTime
    const avgPerFiling = elapsed / processed
    const remaining = (total - processed) * avgPerFiling
    const eta = formatDuration(remaining)

    if (processed % 10 === 0 || processed === total) {
      logProgress(`Processing filing ${processed}/${total} (${pct}%) - ETA: ${eta}`)
    }

    try {
      // Rate limiting
      await delay(RATE_LIMIT_DELAY)

      // Fetch and parse Form 4 XML
      const form4 = await fetchAndParseForm4(filing.cik, filing.accessionNumber)

      if (!form4.issuer.ticker || !form4.issuer.name) {
        continue // Skip if missing essential data
      }

      // Skip if no transactions
      if (form4.transactions.length === 0) {
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
        stats.errors.push(`Company upsert failed for ${form4.issuer.ticker}: ${companyError?.message}`)
        continue
      }
      stats.companiesCreated++

      // Upsert insider
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
          stats.errors.push(`Insider insert failed for ${form4.owner.name}: ${error.message}`)
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
          // Ignore duplicate constraint violations
          if (txnError.code !== '23505') {
            stats.errors.push(`Transaction insert failed: ${txnError.message}`)
          }
        } else {
          stats.transactionsCreated++
        }
      }
    } catch (error) {
      const errorMsg = `Failed to process filing ${filing.accessionNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`
      stats.errors.push(errorMsg)
      // Continue processing other filings
    }
  }

  logProgress(`✅ Form 4 seeding complete`)
}

// =============================================================================
// Institution & 13F Processing
// =============================================================================

async function seedInstitutions(
  supabase: ReturnType<typeof getSupabaseClient>,
  stats: SeedStats
): Promise<void> {
  logSection('Institutional Holdings (Top 20 Institutions)')

  logProgress(`Processing ${TOP_INSTITUTIONS.length} institutions...`)

  for (let i = 0; i < TOP_INSTITUTIONS.length; i++) {
    const inst = TOP_INSTITUTIONS[i]
    logProgress(`Processing institution ${i + 1}/${TOP_INSTITUTIONS.length}: ${inst.name}`)

    try {
      // Upsert institution
      const { data: institution, error: instError } = await supabase
        .from('institutions')
        .upsert(
          {
            cik: inst.cik,
            name: inst.name,
            institution_type: inst.type,
            aum_estimate: inst.aum,
          },
          { onConflict: 'cik' }
        )
        .select()
        .single()

      if (instError || !institution) {
        stats.errors.push(`Institution upsert failed for ${inst.name}: ${instError?.message}`)
        continue
      }
      stats.institutionsCreated++

      // Fetch most recent 13F filing
      await delay(RATE_LIMIT_DELAY)
      const filings = await fetch13FFilingsByCik(inst.cik, 1)

      if (filings.length === 0) {
        logProgress(`  No 13F filings found for ${inst.name}`)
        continue
      }

      const latestFiling = filings[0]
      logProgress(`  Found filing ${latestFiling.accessionNumber} from ${latestFiling.filedAt}`)

      // Check if filing already exists
      const { data: existingFiling } = await supabase
        .from('institutional_filings')
        .select('id')
        .eq('accession_number', latestFiling.accessionNumber)
        .single()

      if (existingFiling) {
        logProgress(`  Filing already exists, skipping`)
        continue
      }

      // Fetch and parse holdings
      await delay(RATE_LIMIT_DELAY)
      const holdings = await fetchAndParse13FHoldings(inst.cik, latestFiling.accessionNumber)

      logProgress(`  Parsed ${holdings.totalHoldings} holdings worth $${(holdings.totalValue / 1e9).toFixed(1)}B`)

      // Insert filing record
      const { data: filing, error: filingError } = await supabase
        .from('institutional_filings')
        .insert({
          institution_id: institution.id,
          accession_number: latestFiling.accessionNumber,
          report_date: latestFiling.periodOfReport || latestFiling.filedAt,
          filed_at: latestFiling.filedAt,
          total_value: holdings.totalValue,
        })
        .select()
        .single()

      if (filingError || !filing) {
        stats.errors.push(`Filing insert failed: ${filingError?.message}`)
        continue
      }
      stats.filingsCreated++

      // Process holdings (top 100 only to avoid overwhelming the DB)
      const topHoldings = holdings.holdings
        .sort((a, b) => b.value - a.value)
        .slice(0, 100)

      for (const holding of topHoldings) {
        // Try to find ticker from CUSIP mapping
        const ticker = holding.ticker || cusipToTicker(holding.cusip)

        if (!ticker) {
          continue // Skip holdings without ticker
        }

        // Upsert company (use issuer name from 13F)
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .upsert(
            {
              ticker: ticker.toUpperCase(),
              name: holding.nameOfIssuer,
            },
            { onConflict: 'ticker' }
          )
          .select()
          .single()

        if (companyError || !company) {
          continue
        }

        // Insert holding
        const { error: holdingError } = await supabase
          .from('institutional_holdings')
          .insert({
            filing_id: filing.id,
            institution_id: institution.id,
            company_id: company.id,
            report_date: latestFiling.periodOfReport || latestFiling.filedAt,
            shares: holding.shares,
            value: holding.value,
            percent_of_portfolio:
              holdings.totalValue > 0 ? (holding.value / holdings.totalValue) * 100 : null,
            is_new_position: false,
            is_closed_position: false,
          })

        if (holdingError) {
          // Ignore duplicate constraint violations
          if (holdingError.code !== '23505') {
            stats.errors.push(`Holding insert failed: ${holdingError.message}`)
          }
        } else {
          stats.holdingsCreated++
        }
      }

      logProgress(`  ✅ Inserted ${topHoldings.length} holdings for ${inst.name}`)
    } catch (error) {
      const errorMsg = `Failed to process institution ${inst.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      stats.errors.push(errorMsg)
      logProgress(`  ❌ ${errorMsg}`)
      // Continue processing other institutions
    }
  }

  logProgress(`✅ Institution seeding complete`)
}

// =============================================================================
// AI Context Generation
// =============================================================================

async function generateAIContexts(
  supabase: ReturnType<typeof getSupabaseClient>,
  stats: SeedStats
): Promise<void> {
  logSection('AI Context Generation (Top 50 Transactions)')

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    logProgress('⚠️ ANTHROPIC_API_KEY not set, skipping AI context generation')
    return
  }

  const anthropic = new Anthropic({ apiKey })

  // Fetch transactions needing context - prioritize purchases and large values
  const { data: transactions, error } = await supabase
    .from('v_recent_insider_transactions')
    .select('*')
    .is('ai_context', null)
    .order('total_value', { ascending: false, nullsFirst: false })
    .limit(AI_CONTEXT_LIMIT)

  if (error || !transactions || transactions.length === 0) {
    logProgress('No transactions found for AI context generation')
    return
  }

  logProgress(`Generating AI context for ${transactions.length} transactions...`)

  for (let i = 0; i < transactions.length; i++) {
    const txn = transactions[i]
    const pct = Math.round(((i + 1) / transactions.length) * 100)

    if ((i + 1) % 10 === 0 || i + 1 === transactions.length) {
      logProgress(`Processing transaction ${i + 1}/${transactions.length} (${pct}%)`)
    }

    try {
      const roles: string[] = []
      if (txn.is_officer) roles.push('Officer')
      if (txn.is_director) roles.push('Director')
      if (txn.is_ten_percent_owner) roles.push('10% Owner')

      const transactionTypes: Record<string, string> = {
        P: 'Purchase',
        S: 'Sale',
        A: 'Award',
        D: 'Disposition',
        G: 'Gift',
        M: 'Exercise',
      }

      const prompt = `Analyze this SEC Form 4 insider transaction and provide context on its significance:

Company: ${txn.company_name} (${txn.ticker})
Insider: ${txn.insider_name}
Title: ${txn.insider_title || 'Unknown'}
Roles: ${roles.length > 0 ? roles.join(', ') : 'Unknown'}
Transaction Type: ${transactionTypes[txn.transaction_type] || txn.transaction_type}
Shares: ${txn.shares?.toLocaleString() || 'Unknown'}
Price per Share: ${txn.price_per_share ? `$${txn.price_per_share.toFixed(2)}` : 'Unknown'}
Total Value: ${txn.total_value ? `$${txn.total_value.toLocaleString()}` : 'Unknown'}
Transaction Date: ${txn.transaction_date}
10b5-1 Plan: ${txn.is_10b5_1_plan ? 'Yes' : 'No'}

Provide your analysis as JSON with these fields:
- "context": A 2-3 sentence explanation of why this transaction matters (or doesn't) for investors.
- "significanceScore": A number from 0.0 to 1.0 indicating significance.

Respond ONLY with valid JSON:`

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      })

      const textContent = message.content.find((block) => block.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        continue
      }

      let jsonText = textContent.text.trim()
      if (jsonText.startsWith('```json')) jsonText = jsonText.slice(7)
      else if (jsonText.startsWith('```')) jsonText = jsonText.slice(3)
      if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3)
      jsonText = jsonText.trim()

      const parsed = JSON.parse(jsonText) as {
        context?: string
        significanceScore?: number
      }

      if (parsed.context && typeof parsed.significanceScore === 'number') {
        const score = Math.max(0, Math.min(1, parsed.significanceScore))

        const { error: updateError } = await supabase
          .from('insider_transactions')
          .update({
            ai_context: parsed.context,
            ai_significance_score: score,
            ai_generated_at: new Date().toISOString(),
          })
          .eq('id', txn.id)

        if (!updateError) {
          stats.aiContextsGenerated++
        }
      }

      // Rate limit for Claude API
      await delay(200)
    } catch (error) {
      stats.errors.push(
        `AI context generation failed for ${txn.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      // Continue processing other transactions
    }
  }

  logProgress(`✅ AI context generation complete`)
}

// =============================================================================
// Main Entry Point
// =============================================================================

async function main() {
  console.log('\n🚀 InsiderIntel Database Seed Script')
  console.log('=====================================\n')

  const startTime = Date.now()

  const stats: SeedStats = {
    companiesCreated: 0,
    insidersCreated: 0,
    transactionsCreated: 0,
    institutionsCreated: 0,
    filingsCreated: 0,
    holdingsCreated: 0,
    aiContextsGenerated: 0,
    errors: [],
  }

  try {
    const supabase = getSupabaseClient()

    // Phase 1: Seed Form 4 filings
    await seedForm4Filings(supabase, stats)

    // Phase 2: Seed institutions and 13F holdings
    await seedInstitutions(supabase, stats)

    // Phase 3: Generate AI contexts
    await generateAIContexts(supabase, stats)

    // Summary
    logSection('Seed Complete')
    const duration = Date.now() - startTime
    logProgress(`Total time: ${formatDuration(duration)}`)
    logStats(stats)

    if (stats.errors.length > 0) {
      console.log('\n⚠️ Errors encountered:')
      stats.errors.slice(0, 10).forEach((err) => console.log(`   - ${err}`))
      if (stats.errors.length > 10) {
        console.log(`   ... and ${stats.errors.length - 10} more errors`)
      }
    }

    console.log('\n✅ Seeding complete!\n')
  } catch (error) {
    console.error('\n❌ Fatal error during seeding:', error)
    process.exit(1)
  }
}

main()
