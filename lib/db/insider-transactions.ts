/**
 * Insider Transactions Database Operations
 *
 * Supabase database operations for companies, insiders, and insider transactions.
 */

import { createClient } from '@/lib/supabase/server'
import type {
  Company,
  CompanyInsert,
  Insider,
  InsiderInsert,
  InsiderTransaction,
  InsiderTransactionInsert,
  InsiderTransactionWithDetails,
} from '@/types/database'
import { logger } from '@/lib/logger'

const log = logger.db

// =============================================================================
// Company Operations
// =============================================================================

/**
 * Insert or update a company by ticker
 *
 * @param company - Company data with ticker (required), name, and optional fields
 * @returns Company record with id, or null on error
 */
export async function upsertCompany(company: {
  ticker: string
  name: string
  cik?: string | null
  sector?: string | null
  industry?: string | null
  market_cap?: number | null
}): Promise<Company | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('companies')
    .upsert(
      {
        ticker: company.ticker.toUpperCase(),
        name: company.name,
        cik: company.cik || null,
        sector: company.sector || null,
        industry: company.industry || null,
        market_cap: company.market_cap || null,
      },
      {
        onConflict: 'ticker',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single()

  if (error) {
    log.error({ error }, 'Error upserting company')
    return null
  }

  return data as Company
}

/**
 * Get a company by ticker
 *
 * @param ticker - Stock ticker symbol
 * @returns Company record or null if not found
 */
export async function getCompanyByTicker(ticker: string): Promise<Company | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('ticker', ticker.toUpperCase())
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      // Not a "not found" error
      log.error({ error }, 'Error fetching company')
    }
    return null
  }

  return data as Company
}

/**
 * Get a company by ID
 *
 * @param id - Company UUID
 * @returns Company record or null if not found
 */
export async function getCompanyById(id: string): Promise<Company | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      log.error({ error }, 'Error fetching company')
    }
    return null
  }

  return data as Company
}

// =============================================================================
// Insider Operations
// =============================================================================

/**
 * Insert or update an insider by name/CIK combination
 *
 * Uses CIK as primary identifier if available, otherwise matches by name.
 *
 * @param insider - Insider data with name (required) and optional CIK
 * @returns Insider record with id, or null on error
 */
export async function upsertInsider(insider: {
  cik?: string | null
  name: string
}): Promise<Insider | null> {
  const supabase = await createClient()

  // First, try to find existing insider by CIK or name
  let existingInsider: Insider | null = null

  if (insider.cik) {
    const { data } = await supabase
      .from('insiders')
      .select('*')
      .eq('cik', insider.cik)
      .single()

    existingInsider = data as Insider | null
  }

  if (!existingInsider) {
    const { data } = await supabase
      .from('insiders')
      .select('*')
      .eq('name', insider.name)
      .single()

    existingInsider = data as Insider | null
  }

  if (existingInsider) {
    // Update existing insider if we have new CIK info
    if (insider.cik && !existingInsider.cik) {
      const { data, error } = await supabase
        .from('insiders')
        .update({ cik: insider.cik })
        .eq('id', existingInsider.id)
        .select()
        .single()

      if (error) {
        log.error({ error }, 'Error updating insider')
        return existingInsider
      }

      return data as Insider
    }

    return existingInsider
  }

  // Insert new insider
  const { data, error } = await supabase
    .from('insiders')
    .insert({
      cik: insider.cik || null,
      name: insider.name,
    })
    .select()
    .single()

  if (error) {
    log.error({ error }, 'Error inserting insider')
    return null
  }

  return data as Insider
}

/**
 * Get an insider by ID
 *
 * @param id - Insider UUID
 * @returns Insider record or null if not found
 */
export async function getInsiderById(id: string): Promise<Insider | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('insiders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      log.error({ error }, 'Error fetching insider')
    }
    return null
  }

  return data as Insider
}

// =============================================================================
// Transaction Operations
// =============================================================================

/**
 * Insert a new insider transaction
 *
 * Handles duplicate accession_number gracefully by returning null.
 *
 * @param transaction - Transaction data (without id and created_at)
 * @returns Inserted transaction record, or null if duplicate or error
 */
export async function insertTransaction(
  transaction: InsiderTransactionInsert
): Promise<InsiderTransaction | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('insider_transactions')
    .insert(transaction)
    .select()
    .single()

  if (error) {
    // Handle duplicate accession_number (unique constraint violation)
    if (error.code === '23505') {
      log.debug({ accessionNumber: transaction.accession_number }, 'Transaction already exists, skipping')
      return null
    }

    log.error({ error }, 'Error inserting transaction')
    return null
  }

  return data as InsiderTransaction
}

/**
 * Get recent insider transactions with company and insider details
 *
 * @param options - Query options
 * @param options.limit - Maximum number of results (default 50)
 * @param options.ticker - Filter by company ticker
 * @param options.type - Filter by transaction type (P, S, A, D, G, M)
 * @param options.days - Filter to transactions within N days
 * @returns Array of transactions with joined company and insider data
 */
export async function getRecentTransactions(options: {
  limit?: number
  ticker?: string
  type?: string
  days?: number
} = {}): Promise<InsiderTransactionWithDetails[]> {
  const supabase = await createClient()
  const { limit = 50, ticker, type, days } = options

  let query = supabase
    .from('v_recent_insider_transactions')
    .select('*')
    .order('filed_at', { ascending: false })
    .limit(limit)

  if (ticker) {
    query = query.eq('ticker', ticker.toUpperCase())
  }

  if (type) {
    query = query.eq('transaction_type', type.toUpperCase())
  }

  if (days) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    query = query.gte('filed_at', startDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    log.error({ error }, 'Error fetching recent transactions')
    return []
  }

  return data as InsiderTransactionWithDetails[]
}

/**
 * Get all transactions for a specific company
 *
 * @param companyId - Company UUID
 * @param options - Query options
 * @param options.limit - Maximum number of results (default 100)
 * @returns Array of transactions with joined data
 */
export async function getTransactionsByCompany(
  companyId: string,
  options: { limit?: number } = {}
): Promise<InsiderTransactionWithDetails[]> {
  const supabase = await createClient()
  const { limit = 100 } = options

  const { data, error } = await supabase
    .from('v_recent_insider_transactions')
    .select('*')
    .eq('company_id', companyId)
    .order('filed_at', { ascending: false })
    .limit(limit)

  if (error) {
    log.error({ error }, 'Error fetching company transactions')
    return []
  }

  return data as InsiderTransactionWithDetails[]
}

/**
 * Get transactions that need AI context generation
 *
 * @param limit - Maximum number of transactions to return
 * @returns Transactions where ai_context is NULL, ordered by filed_at DESC
 */
export async function getTransactionsNeedingAIContext(
  limit: number = 10
): Promise<InsiderTransactionWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('v_recent_insider_transactions')
    .select('*')
    .is('ai_context', null)
    .order('filed_at', { ascending: false })
    .limit(limit)

  if (error) {
    log.error({ error }, 'Error fetching transactions needing AI context')
    return []
  }

  return data as InsiderTransactionWithDetails[]
}

/**
 * Update transaction with AI-generated context
 *
 * @param id - Transaction UUID
 * @param context - AI-generated context text
 * @param score - AI significance score (0-1)
 * @returns Updated transaction or null on error
 */
export async function updateTransactionAIContext(
  id: string,
  context: string,
  score: number
): Promise<InsiderTransaction | null> {
  const supabase = await createClient()

  // Clamp score to valid range
  const clampedScore = Math.max(0, Math.min(1, score))

  const { data, error } = await supabase
    .from('insider_transactions')
    .update({
      ai_context: context,
      ai_significance_score: clampedScore,
      ai_generated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    log.error({ error }, 'Error updating transaction AI context')
    return null
  }

  return data as InsiderTransaction
}

/**
 * Get a single transaction by ID
 *
 * @param id - Transaction UUID
 * @returns Transaction with details or null if not found
 */
export async function getTransactionById(
  id: string
): Promise<InsiderTransactionWithDetails | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('v_recent_insider_transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      log.error({ error }, 'Error fetching transaction')
    }
    return null
  }

  return data as InsiderTransactionWithDetails
}

/**
 * Get transaction by accession number
 *
 * @param accessionNumber - SEC filing accession number
 * @returns Transaction or null if not found
 */
export async function getTransactionByAccessionNumber(
  accessionNumber: string
): Promise<InsiderTransaction | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('insider_transactions')
    .select('*')
    .eq('accession_number', accessionNumber)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      log.error({ error }, 'Error fetching transaction')
    }
    return null
  }

  return data as InsiderTransaction
}

/**
 * Bulk insert transactions with conflict handling
 *
 * @param transactions - Array of transaction data
 * @returns Number of successfully inserted transactions
 */
export async function bulkInsertTransactions(
  transactions: InsiderTransactionInsert[]
): Promise<number> {
  const supabase = await createClient()

  if (transactions.length === 0) {
    return 0
  }

  // Supabase doesn't support ON CONFLICT DO NOTHING with count,
  // so we insert one by one and count successes
  let insertedCount = 0

  for (const transaction of transactions) {
    const result = await insertTransaction(transaction)
    if (result) {
      insertedCount++
    }
  }

  return insertedCount
}
