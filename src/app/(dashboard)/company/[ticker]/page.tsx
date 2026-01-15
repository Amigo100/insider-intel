import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Star, StarOff, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CompanyTabs } from '@/components/dashboard/company-tabs'
import { WatchlistButton } from './watchlist-button'
import type { InsiderTransactionWithDetails } from '@/types/database'

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

  // Get current year for YTD calculation
  const currentYear = new Date().getFullYear()
  const yearStart = `${currentYear}-01-01`

  // Get transactions
  const { data: transactions } = await supabase
    .from('v_recent_insider_transactions')
    .select('*')
    .eq('company_id', company.id)
    .order('filed_at', { ascending: false })
    .limit(100)

  // Get YTD transactions for stats
  const { data: ytdTransactions } = await supabase
    .from('insider_transactions')
    .select('transaction_type, total_value')
    .eq('company_id', company.id)
    .gte('transaction_date', yearStart)

  // Calculate YTD stats
  const ytdBuys = ytdTransactions?.filter((t) => t.transaction_type === 'P') || []
  const ytdSells = ytdTransactions?.filter((t) => t.transaction_type === 'S') || []
  const ytdBuyValue = ytdBuys.reduce((sum, t) => sum + (t.total_value || 0), 0)
  const ytdSellValue = ytdSells.reduce((sum, t) => sum + (t.total_value || 0), 0)

  // Get institutional holders
  const { data: holders } = await supabase
    .from('v_institutional_holdings')
    .select('*')
    .eq('company_id', company.id)
    .eq('is_closed_position', false)
    .order('value', { ascending: false })
    .limit(50)

  // Build activity chart data (group by month)
  const activityMap = new Map<string, { buys: number; sells: number }>()

  for (const txn of transactions || []) {
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

  // Convert to array and sort
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
    .slice(-12) // Last 12 months

  return {
    company,
    transactions: (transactions || []) as InsiderTransactionWithDetails[],
    holders: holders || [],
    activityData,
    stats: {
      ytdBuys: ytdBuys.length,
      ytdSells: ytdSells.length,
      ytdBuyValue,
      ytdSellValue,
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

  const { company, transactions, holders, activityData, stats } = data

  // Check if company is in user's watchlist
  const watchlistItemId = user
    ? await checkWatchlist(company.id, user.id)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {company.ticker}
            </h1>
            {company.sector && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                <Building2 className="mr-1 h-3 w-3" />
                {company.sector}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{company.name}</p>
          {company.industry && (
            <p className="text-sm text-muted-foreground">{company.industry}</p>
          )}
        </div>

        {user && (
          <WatchlistButton
            companyId={company.id}
            watchlistItemId={watchlistItemId}
          />
        )}
      </div>

      {/* Mobile sector badge */}
      {company.sector && (
        <Badge variant="secondary" className="sm:hidden">
          <Building2 className="mr-1 h-3 w-3" />
          {company.sector}
        </Badge>
      )}

      {/* Tabs */}
      <CompanyTabs
        transactions={transactions}
        holders={holders}
        activityData={activityData}
        stats={stats}
      />
    </div>
  )
}
