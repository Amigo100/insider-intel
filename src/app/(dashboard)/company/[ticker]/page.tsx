import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { CompanyPageClient } from './company-page-client'
import { cn } from '@/lib/utils'
import type { InsiderTransactionWithDetails } from '@/types/database'
import type { Database } from '@/types/supabase'

interface PageProps {
  params: Promise<{ ticker: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params
  const upperTicker = ticker.toUpperCase()

  return {
    title: `${upperTicker} Insider Trading`,
    description: `View insider trading activity, institutional holdings, and AI analysis for ${upperTicker}. Track executive buys, sells, and more.`,
  }
}

async function getCompanyData(ticker: string) {
  const supabase = await createClient()

  // Get company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('ticker', ticker.toUpperCase())
    .single()

  if (companyError || !company) {
    return null
  }

  // Get date ranges
  const now = new Date()
  const oneYearAgo = new Date(now)
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  // Get 1Y transactions for stats
  const { data: yearTransactions } = await supabase
    .from('v_recent_insider_transactions')
    .select('*')
    .eq('company_id', company.id)
    .gte('filed_at', oneYearAgo.toISOString())
    .order('filed_at', { ascending: false })

  const transactions = yearTransactions || []

  // Calculate 1Y stats
  const buys = transactions.filter((t) => t.transaction_type === 'P')
  const sells = transactions.filter((t) => t.transaction_type === 'S')
  const buyValue = buys.reduce((sum, t) => sum + (t.total_value || 0), 0)
  const sellValue = sells.reduce((sum, t) => sum + (t.total_value || 0), 0)
  const netValue = buyValue - sellValue

  // Get institutional holders
  const { data: holders } = await supabase
    .from('v_institutional_holdings')
    .select('*')
    .eq('company_id', company.id)
    .order('value', { ascending: false })
    .limit(50)

  // Calculate institutional stats
  const activeHolders = (holders || []).filter((h) => !h.is_closed_position)
  const totalInstitutionalValue = activeHolders.reduce(
    (sum, h) => sum + (h.value || 0),
    0
  )
  const newPositions = activeHolders.filter((h) => h.is_new_position).length
  const increasedPositions = activeHolders.filter(
    (h) => !h.is_new_position && (h.shares_change || 0) > 0
  ).length

  // Build activity chart data (group by month for 12 months)
  const activityMap = new Map<string, { buys: number; sells: number }>()

  for (const txn of transactions) {
    if (!txn.filed_at) continue
    const date = new Date(txn.filed_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    const existing = activityMap.get(monthKey) || { buys: 0, sells: 0 }

    if (txn.transaction_type === 'P') {
      existing.buys += txn.total_value || 0
    } else if (txn.transaction_type === 'S') {
      existing.sells += txn.total_value || 0
    }

    activityMap.set(monthKey, existing)
  }

  const activityData = Array.from(activityMap.entries())
    .map(([date, values]) => ({
      date: new Date(date + '-01').toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      }),
      buys: values.buys,
      sells: values.sells,
    }))
    .reverse()
    .slice(-12)

  // Get unique insiders with their most recent activity
  const insiderMap = new Map<
    string,
    { name: string; title: string | null; lastActivity: string; type: string }
  >()
  for (const txn of transactions) {
    // Skip transactions with null required fields
    if (!txn.insider_name || !txn.filed_at || !txn.transaction_type) continue

    if (!insiderMap.has(txn.insider_name)) {
      insiderMap.set(txn.insider_name, {
        name: txn.insider_name,
        title: txn.insider_title,
        lastActivity: txn.filed_at,
        type: txn.transaction_type,
      })
    }
  }
  const keyInsiders = Array.from(insiderMap.values()).slice(0, 5)

  // Fetch stock price data for chart (last 12 months)
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)
  const priceStartDate = twelveMonthsAgo.toISOString().split('T')[0]

  const { data: priceData } = await supabase
    .from('stock_prices')
    .select('price_date, open, high, low, close, volume')
    .eq('ticker', ticker.toUpperCase())
    .gte('price_date', priceStartDate)
    .order('price_date', { ascending: true })

  // Format price data for chart
  const formattedPriceData = (priceData || []).map((p) => ({
    date: p.price_date,
    open: p.open,
    high: p.high,
    low: p.low,
    close: p.close,
    volume: p.volume,
  }))

  // Format trade markers for chart overlay
  const tradeMarkers = transactions
    .filter((t) => t.transaction_type === 'P' || t.transaction_type === 'S')
    .filter((t) => t.transaction_date && t.total_value && t.shares)
    .map((t) => ({
      date: t.transaction_date!,
      type: t.transaction_type as 'P' | 'S',
      value: t.total_value!,
      insiderName: t.insider_name || 'Unknown',
      shares: t.shares!,
    }))

  return {
    company,
    transactions: transactions as InsiderTransactionWithDetails[],
    holders: (holders || [])
      .filter(
        (h) =>
          h.institution_id !== null &&
          h.institution_name !== null &&
          h.shares !== null &&
          h.value !== null
      )
      .map((h) => ({
        institution_id: h.institution_id!,
        institution_name: h.institution_name!,
        institution_type: h.institution_type,
        shares: h.shares!,
        value: h.value!,
        percent_of_portfolio: h.percent_of_portfolio,
        shares_change: h.shares_change,
        shares_change_percent: h.shares_change
          ? (h.shares_change / ((h.shares || 1) - (h.shares_change || 0))) * 100
          : null,
        is_new_position: h.is_new_position || false,
        is_closed_position: h.is_closed_position || false,
      })),
    activityData,
    keyInsiders,
    priceData: formattedPriceData,
    tradeMarkers,
    stats: {
      buyCount: buys.length,
      sellCount: sells.length,
      buyValue,
      sellValue,
      netValue,
      institutionalHolders: activeHolders.length,
      institutionalValue: totalInstitutionalValue,
      newPositions,
      increasedPositions,
    },
  }
}

async function checkWatchlist(companyId: string, userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('watchlist_items')
    .select('id')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .single()

  return data?.id || null
}

export default async function CompanyPage({ params }: PageProps) {
  const { ticker } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const data = await getCompanyData(ticker)

  if (!data) {
    notFound()
  }

  const {
    company,
    transactions,
    holders,
    activityData,
    keyInsiders,
    priceData,
    tradeMarkers,
    stats,
  } = data

  // Check if company is in user's watchlist
  const watchlistItemId = user ? await checkWatchlist(company.id, user.id) : null

  // Format market cap
  const formatMarketCap = (value: number | null) => {
    if (!value) return null
    if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`
    return `$${value.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className={cn(
          'inline-flex items-center gap-1.5',
          'text-sm',
          'text-[hsl(var(--text-muted))]',
          'hover:text-[hsl(var(--text-primary))]',
          'transition-colors duration-150'
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Dashboard
      </Link>

      {/* Client Component with all the interactive parts */}
      <CompanyPageClient
        company={{
          id: company.id,
          ticker: company.ticker,
          name: company.name,
          sector: company.sector,
          industry: company.industry,
          marketCap: formatMarketCap(company.market_cap),
        }}
        transactions={transactions}
        holders={holders}
        activityData={activityData}
        keyInsiders={keyInsiders}
        priceData={priceData}
        tradeMarkers={tradeMarkers}
        stats={stats}
        watchlistItemId={watchlistItemId}
        isLoggedIn={!!user}
      />
    </div>
  )
}
