/**
 * Institutional Holdings Database Operations
 *
 * Supabase database operations for institutions, 13F filings, and holdings.
 */

import { createClient } from '@/lib/supabase/server'
import type {
  Institution,
  InstitutionalHolding,
  InstitutionalHoldingWithDetails,
} from '@/types/database'

// =============================================================================
// Types
// =============================================================================

/** Input for upserting an institution */
export interface InstitutionInput {
  cik: string
  name: string
  institution_type?: string | null
  aum_estimate?: number | null
}

/** Input for inserting a 13F filing */
export interface FilingInput {
  institution_id: string
  accession_number: string
  report_date: string
  filed_at: string
  total_value?: number | null
}

/** Input for inserting a holding */
export interface HoldingInput {
  filing_id: string
  institution_id: string
  company_id: string
  report_date: string
  shares: number
  value: number
  percent_of_portfolio?: number | null
  shares_change?: number | null
  shares_change_percent?: number | null
  is_new_position?: boolean
  is_closed_position?: boolean
}

/** 13F filing record */
export interface InstitutionalFiling {
  id: string
  institution_id: string
  accession_number: string
  report_date: string
  filed_at: string
  total_value: number | null
  created_at: string
}

/** Aggregated buying/selling data */
export interface NetBuyingSelling {
  totalBuyers: number
  totalSellers: number
  netSharesChange: number
  totalSharesBought: number
  totalSharesSold: number
}

/** Top holder with details */
export interface TopHolder {
  institution_id: string
  institution_name: string
  institution_type: string | null
  shares: number
  value: number
  percent_of_portfolio: number | null
  shares_change: number | null
  shares_change_percent: number | null
  is_new_position: boolean
  report_date: string
}

/** New position entry */
export interface NewPosition {
  id: string
  institution_id: string
  institution_name: string
  institution_type: string | null
  company_id: string
  ticker: string
  company_name: string
  shares: number
  value: number
  percent_of_portfolio: number | null
  report_date: string
  created_at: string
}

// =============================================================================
// Institution Operations
// =============================================================================

/**
 * Insert or update an institution by CIK
 *
 * @param institution - Institution data with CIK (required)
 * @returns Institution record with id, or null on error
 */
export async function upsertInstitution(
  institution: InstitutionInput
): Promise<Institution | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('institutions')
    .upsert(
      {
        cik: institution.cik,
        name: institution.name,
        institution_type: institution.institution_type || null,
        aum_estimate: institution.aum_estimate || null,
      },
      {
        onConflict: 'cik',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error upserting institution:', error)
    return null
  }

  return data as Institution
}

/**
 * Get an institution by CIK
 *
 * @param cik - Institution CIK number
 * @returns Institution record or null if not found
 */
export async function getInstitutionByCik(cik: string): Promise<Institution | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('cik', cik)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching institution:', error)
    }
    return null
  }

  return data as Institution
}

/**
 * Get an institution by ID
 *
 * @param id - Institution UUID
 * @returns Institution record or null if not found
 */
export async function getInstitutionById(id: string): Promise<Institution | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching institution:', error)
    }
    return null
  }

  return data as Institution
}

// =============================================================================
// Filing Operations
// =============================================================================

/**
 * Insert a 13F filing record
 *
 * Skips if accession_number already exists.
 *
 * @param filing - Filing data
 * @returns Filing record or null if duplicate/error
 */
export async function insertFiling(
  filing: FilingInput
): Promise<InstitutionalFiling | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('institutional_filings')
    .insert({
      institution_id: filing.institution_id,
      accession_number: filing.accession_number,
      report_date: filing.report_date,
      filed_at: filing.filed_at,
      total_value: filing.total_value || null,
    })
    .select()
    .single()

  if (error) {
    // Handle duplicate accession_number
    if (error.code === '23505') {
      console.log(`Filing ${filing.accession_number} already exists, skipping`)
      return null
    }

    console.error('Error inserting filing:', error)
    return null
  }

  return data as InstitutionalFiling
}

/**
 * Get a filing by accession number
 *
 * @param accessionNumber - SEC accession number
 * @returns Filing record or null if not found
 */
export async function getFilingByAccessionNumber(
  accessionNumber: string
): Promise<InstitutionalFiling | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('institutional_filings')
    .select('*')
    .eq('accession_number', accessionNumber)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching filing:', error)
    }
    return null
  }

  return data as InstitutionalFiling
}

/**
 * Get the most recent filing for an institution
 *
 * @param institutionId - Institution UUID
 * @returns Most recent filing or null
 */
export async function getLatestFiling(
  institutionId: string
): Promise<InstitutionalFiling | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('institutional_filings')
    .select('*')
    .eq('institution_id', institutionId)
    .order('report_date', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching latest filing:', error)
    }
    return null
  }

  return data as InstitutionalFiling
}

// =============================================================================
// Holdings Operations
// =============================================================================

/**
 * Get previous quarter's holdings for an institution to calculate changes
 *
 * @param institutionId - Institution UUID
 * @param currentReportDate - Current quarter report date
 * @returns Map of company_id to previous holding
 */
async function getPreviousQuarterHoldings(
  institutionId: string,
  currentReportDate: string
): Promise<Map<string, InstitutionalHolding>> {
  const supabase = await createClient()

  // Get the previous quarter's report date
  const currentDate = new Date(currentReportDate)
  currentDate.setMonth(currentDate.getMonth() - 3)
  const previousQuarterEnd = currentDate.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('institutional_holdings')
    .select('*')
    .eq('institution_id', institutionId)
    .lt('report_date', currentReportDate)
    .gte('report_date', previousQuarterEnd)
    .order('report_date', { ascending: false })

  if (error) {
    console.error('Error fetching previous holdings:', error)
    return new Map()
  }

  // Create map of company_id to holding
  const holdingsMap = new Map<string, InstitutionalHolding>()
  for (const holding of data || []) {
    if (!holdingsMap.has(holding.company_id)) {
      holdingsMap.set(holding.company_id, holding as InstitutionalHolding)
    }
  }

  return holdingsMap
}

/**
 * Insert holdings for a filing with calculated changes
 *
 * Calculates percent_of_portfolio and shares_change vs previous quarter.
 *
 * @param holdings - Array of holding data
 * @param totalFilingValue - Total value of filing for percent calculation
 * @returns Number of successfully inserted holdings
 */
export async function insertHoldings(
  holdings: Omit<HoldingInput, 'percent_of_portfolio' | 'shares_change' | 'shares_change_percent' | 'is_new_position' | 'is_closed_position'>[],
  totalFilingValue?: number
): Promise<number> {
  const supabase = await createClient()

  if (holdings.length === 0) {
    return 0
  }

  // Get institution_id and report_date from first holding
  const { institution_id, report_date } = holdings[0]

  // Get previous quarter holdings for comparison
  const previousHoldings = await getPreviousQuarterHoldings(institution_id, report_date)

  // Calculate total value if not provided
  const totalValue = totalFilingValue || holdings.reduce((sum, h) => sum + h.value, 0)

  // Prepare holdings with calculated fields
  const enrichedHoldings: HoldingInput[] = holdings.map((holding) => {
    const previousHolding = previousHoldings.get(holding.company_id)

    let shares_change: number | null = null
    let shares_change_percent: number | null = null
    let is_new_position = false

    if (previousHolding) {
      shares_change = holding.shares - previousHolding.shares
      if (previousHolding.shares > 0) {
        shares_change_percent = ((holding.shares - previousHolding.shares) / previousHolding.shares) * 100
      }
    } else {
      // This is a new position
      is_new_position = true
      shares_change = holding.shares
    }

    const percent_of_portfolio = totalValue > 0
      ? (holding.value / totalValue) * 100
      : null

    return {
      ...holding,
      percent_of_portfolio,
      shares_change,
      shares_change_percent,
      is_new_position,
      is_closed_position: false,
    }
  })

  // Track closed positions (positions in previous quarter but not in current)
  const currentCompanyIds = new Set(holdings.map((h) => h.company_id))
  const closedPositions: HoldingInput[] = []

  for (const [companyId, previousHolding] of previousHoldings) {
    if (!currentCompanyIds.has(companyId)) {
      closedPositions.push({
        filing_id: holdings[0].filing_id,
        institution_id,
        company_id: companyId,
        report_date,
        shares: 0,
        value: 0,
        percent_of_portfolio: 0,
        shares_change: -previousHolding.shares,
        shares_change_percent: -100,
        is_new_position: false,
        is_closed_position: true,
      })
    }
  }

  // Combine holdings and closed positions
  const allHoldings = [...enrichedHoldings, ...closedPositions]

  // Insert in batches to avoid request size limits
  const BATCH_SIZE = 100
  let insertedCount = 0

  for (let i = 0; i < allHoldings.length; i += BATCH_SIZE) {
    const batch = allHoldings.slice(i, i + BATCH_SIZE)

    const { error } = await supabase
      .from('institutional_holdings')
      .insert(batch)

    if (error) {
      // Handle duplicates gracefully
      if (error.code === '23505') {
        console.log(`Some holdings already exist, skipping duplicates`)
        continue
      }
      console.error('Error inserting holdings batch:', error)
    } else {
      insertedCount += batch.length
    }
  }

  return insertedCount
}

// =============================================================================
// Query Operations
// =============================================================================

/**
 * Get top institutional holders for a company
 *
 * @param companyId - Company UUID
 * @param options - Query options
 * @param options.limit - Maximum results (default 20)
 * @param options.quarter - Filter by report quarter (YYYY-MM-DD)
 * @returns Array of top holders with details
 */
export async function getTopHolders(
  companyId: string,
  options: { limit?: number; quarter?: string } = {}
): Promise<TopHolder[]> {
  const supabase = await createClient()
  const { limit = 20, quarter } = options

  let query = supabase
    .from('v_institutional_holdings')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_closed_position', false)
    .order('value', { ascending: false })
    .limit(limit)

  if (quarter) {
    query = query.eq('report_date', quarter)
  } else {
    // Get the most recent quarter
    const { data: latestData } = await supabase
      .from('institutional_holdings')
      .select('report_date')
      .eq('company_id', companyId)
      .order('report_date', { ascending: false })
      .limit(1)
      .single()

    if (latestData) {
      query = query.eq('report_date', latestData.report_date)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching top holders:', error)
    return []
  }

  return (data || []).map((row) => ({
    institution_id: row.institution_id,
    institution_name: row.institution_name,
    institution_type: row.institution_type,
    shares: row.shares,
    value: row.value,
    percent_of_portfolio: row.percent_of_portfolio,
    shares_change: row.shares_change,
    shares_change_percent: row.shares_change_percent,
    is_new_position: row.is_new_position,
    report_date: row.report_date,
  }))
}

/**
 * Get all holdings for an institution
 *
 * @param institutionId - Institution UUID
 * @param options - Query options
 * @param options.quarter - Filter by report quarter (YYYY-MM-DD)
 * @param options.limit - Maximum results (default 100)
 * @returns Array of holdings with details
 */
export async function getInstitutionHoldings(
  institutionId: string,
  options: { quarter?: string; limit?: number } = {}
): Promise<InstitutionalHoldingWithDetails[]> {
  const supabase = await createClient()
  const { quarter, limit = 100 } = options

  let query = supabase
    .from('v_institutional_holdings')
    .select('*')
    .eq('institution_id', institutionId)
    .eq('is_closed_position', false)
    .order('value', { ascending: false })
    .limit(limit)

  if (quarter) {
    query = query.eq('report_date', quarter)
  } else {
    // Get the most recent quarter
    const { data: latestData } = await supabase
      .from('institutional_holdings')
      .select('report_date')
      .eq('institution_id', institutionId)
      .order('report_date', { ascending: false })
      .limit(1)
      .single()

    if (latestData) {
      query = query.eq('report_date', latestData.report_date)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching institution holdings:', error)
    return []
  }

  return data as InstitutionalHoldingWithDetails[]
}

/**
 * Get new positions opened in a quarter
 *
 * @param options - Query options
 * @param options.quarter - Filter by report quarter (YYYY-MM-DD)
 * @param options.institutionType - Filter by institution type
 * @param options.limit - Maximum results (default 50)
 * @returns Array of new positions with details
 */
export async function getNewPositions(
  options: { quarter?: string; institutionType?: string; limit?: number } = {}
): Promise<NewPosition[]> {
  const supabase = await createClient()
  const { quarter, institutionType, limit = 50 } = options

  let query = supabase
    .from('v_institutional_holdings')
    .select('*')
    .eq('is_new_position', true)
    .order('value', { ascending: false })
    .limit(limit)

  if (quarter) {
    query = query.eq('report_date', quarter)
  }

  if (institutionType) {
    query = query.eq('institution_type', institutionType)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching new positions:', error)
    return []
  }

  return (data || []).map((row) => ({
    id: row.id,
    institution_id: row.institution_id,
    institution_name: row.institution_name,
    institution_type: row.institution_type,
    company_id: row.company_id,
    ticker: row.ticker,
    company_name: row.company_name,
    shares: row.shares,
    value: row.value,
    percent_of_portfolio: row.percent_of_portfolio,
    report_date: row.report_date,
    created_at: row.created_at,
  }))
}

/**
 * Get aggregate buying/selling activity for a company
 *
 * @param companyId - Company UUID
 * @param quarter - Optional quarter filter (defaults to most recent)
 * @returns Aggregated buying/selling data
 */
export async function getNetBuyingSelling(
  companyId: string,
  quarter?: string
): Promise<NetBuyingSelling> {
  const supabase = await createClient()

  let reportDate = quarter

  if (!reportDate) {
    // Get the most recent quarter
    const { data: latestData } = await supabase
      .from('institutional_holdings')
      .select('report_date')
      .eq('company_id', companyId)
      .order('report_date', { ascending: false })
      .limit(1)
      .single()

    reportDate = latestData?.report_date
  }

  if (!reportDate) {
    return {
      totalBuyers: 0,
      totalSellers: 0,
      netSharesChange: 0,
      totalSharesBought: 0,
      totalSharesSold: 0,
    }
  }

  const { data, error } = await supabase
    .from('institutional_holdings')
    .select('shares_change, is_new_position, is_closed_position')
    .eq('company_id', companyId)
    .eq('report_date', reportDate)

  if (error) {
    console.error('Error fetching net buying/selling:', error)
    return {
      totalBuyers: 0,
      totalSellers: 0,
      netSharesChange: 0,
      totalSharesBought: 0,
      totalSharesSold: 0,
    }
  }

  let totalBuyers = 0
  let totalSellers = 0
  let totalSharesBought = 0
  let totalSharesSold = 0

  for (const holding of data || []) {
    const change = holding.shares_change || 0

    if (change > 0 || holding.is_new_position) {
      totalBuyers++
      totalSharesBought += Math.abs(change)
    } else if (change < 0 || holding.is_closed_position) {
      totalSellers++
      totalSharesSold += Math.abs(change)
    }
  }

  return {
    totalBuyers,
    totalSellers,
    netSharesChange: totalSharesBought - totalSharesSold,
    totalSharesBought,
    totalSharesSold,
  }
}

/**
 * Get available quarters for institutional data
 *
 * @returns Array of quarter dates in descending order
 */
export async function getAvailableQuarters(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('institutional_holdings')
    .select('report_date')
    .order('report_date', { ascending: false })

  if (error) {
    console.error('Error fetching available quarters:', error)
    return []
  }

  // Get unique quarters
  const quarters = [...new Set((data || []).map((row) => row.report_date))]
  return quarters
}

/**
 * Search institutions by name
 *
 * @param searchTerm - Search term
 * @param limit - Maximum results (default 20)
 * @returns Array of matching institutions
 */
export async function searchInstitutions(
  searchTerm: string,
  limit: number = 20
): Promise<Institution[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('aum_estimate', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) {
    console.error('Error searching institutions:', error)
    return []
  }

  return data as Institution[]
}
