// Transaction type codes from SEC Form 4 filings
export type TransactionType = 'P' | 'S' | 'A' | 'D' | 'G' | 'M'

// Transaction type labels for display
export const TransactionTypeLabels: Record<TransactionType, string> = {
  P: 'Purchase',
  S: 'Sale',
  A: 'Award',
  D: 'Disposition',
  G: 'Gift',
  M: 'Exercise',
}

// Subscription tiers
export type SubscriptionTier = 'free' | 'retail' | 'pro'

// =============================================================================
// Core Entity Types
// =============================================================================

export interface Company {
  id: string
  ticker: string
  name: string
  cik: string | null
  sector: string | null
  industry: string | null
  market_cap: number | null
  created_at: string
  updated_at: string
}

export interface Insider {
  id: string
  cik: string | null
  name: string
  created_at: string
}

export interface InsiderTransaction {
  id: string
  company_id: string
  insider_id: string
  accession_number: string
  filed_at: string
  transaction_date: string
  transaction_type: TransactionType
  shares: number | null
  price_per_share: number | null
  total_value: number | null
  shares_owned_after: number | null
  insider_title: string | null
  is_director: boolean
  is_officer: boolean
  is_ten_percent_owner: boolean
  is_10b5_1_plan: boolean
  ai_context: string | null
  ai_significance_score: number | null
  ai_generated_at: string | null
  raw_filing_url: string | null
  created_at: string
}

export interface Institution {
  id: string
  cik: string
  name: string
  institution_type: string | null
  aum_estimate: number | null
  created_at: string
  updated_at: string
}

export interface InstitutionalHolding {
  id: string
  filing_id: string
  institution_id: string
  company_id: string
  report_date: string
  shares: number
  value: number
  percent_of_portfolio: number | null
  shares_change: number | null
  shares_change_percent: number | null
  is_new_position: boolean
  is_closed_position: boolean
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  subscription_tier: SubscriptionTier
  stripe_customer_id: string | null
  notification_daily_digest: boolean
  notification_instant_alerts: boolean
  notification_weekly_summary: boolean
  created_at: string
  updated_at: string
}

export interface WatchlistItem {
  id: string
  user_id: string
  company_id: string
  created_at: string
}

// =============================================================================
// Joined View Types (for queries with related data)
// =============================================================================

export interface InsiderTransactionWithDetails extends InsiderTransaction {
  ticker: string
  company_name: string
  insider_name: string
}

export interface InstitutionalHoldingWithDetails extends InstitutionalHolding {
  ticker: string
  company_name: string
  institution_name: string
}

// =============================================================================
// Insert/Update Types (for database mutations)
// =============================================================================

export type CompanyInsert = Omit<Company, 'id' | 'created_at' | 'updated_at'>
export type CompanyUpdate = Partial<CompanyInsert>

export type InsiderInsert = Omit<Insider, 'id' | 'created_at'>
export type InsiderUpdate = Partial<InsiderInsert>

export type InsiderTransactionInsert = Omit<InsiderTransaction, 'id' | 'created_at'>
export type InsiderTransactionUpdate = Partial<InsiderTransactionInsert>

export type InstitutionInsert = Omit<Institution, 'id' | 'created_at' | 'updated_at'>
export type InstitutionUpdate = Partial<InstitutionInsert>

export type InstitutionalHoldingInsert = Omit<InstitutionalHolding, 'id' | 'created_at'>
export type InstitutionalHoldingUpdate = Partial<InstitutionalHoldingInsert>

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>
export type ProfileUpdate = Partial<Omit<ProfileInsert, 'id'>>

export type WatchlistItemInsert = Omit<WatchlistItem, 'id' | 'created_at'>
export type WatchlistItemUpdate = Partial<WatchlistItemInsert>

// =============================================================================
// Watchlist with Company Details
// =============================================================================

export interface WatchlistItemWithCompany extends WatchlistItem {
  company: Company
}
