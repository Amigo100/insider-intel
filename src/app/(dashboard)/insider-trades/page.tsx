import type { Metadata } from 'next'
import { Suspense } from 'react'
import { logger } from '@/lib/logger'
import { TransactionFilters, ResultsSummary } from '@/components/dashboard/transaction-filters'
import { TransactionTable } from '@/components/dashboard/transaction-table'
import { StatsRow } from '@/components/dashboard/stats-card'
import LiveIndicator from '@/components/dashboard/live-indicator'
import { InsiderTradesEmptyState } from './empty-state-client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { InsiderTransactionWithDetails } from '@/types/database'

/**
 * Calculate summary statistics from transactions
 */
function calculateStats(transactions: InsiderTransactionWithDetails[]) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000)

  let todayCount = 0
  let weekCount = 0
  let buyVolume = 0
  let sellVolume = 0
  const uniqueTickers = new Set<string>()

  for (const tx of transactions) {
    const filedDate = new Date(tx.filed_at)
    const value = tx.total_value || 0

    // Count today's trades
    if (filedDate >= todayStart) {
      todayCount++
    }

    // Count this week's trades
    if (filedDate >= weekStart) {
      weekCount++
    }

    // Calculate net buy volume (P = Purchase, S = Sale)
    if (tx.transaction_type === 'P') {
      buyVolume += value
    } else if (tx.transaction_type === 'S') {
      sellVolume += value
    }

    // Track unique companies
    if (tx.ticker) {
      uniqueTickers.add(tx.ticker)
    }
  }

  const netVolume = buyVolume - sellVolume

  // Format currency for display
  const formatVolume = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
    if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (absValue >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }

  return {
    todayCount: todayCount.toString(),
    weekCount: weekCount.toString(),
    netVolume: formatVolume(netVolume),
    netVolumeType: (netVolume >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
    activeCompanies: uniqueTickers.size.toString(),
  }
}

export const metadata: Metadata = {
  title: 'Insider Trades',
  description: 'Browse and filter SEC Form 4 insider trading filings. Track executive buys, sells, and option exercises.',
}

interface PageProps {
  searchParams: Promise<{
    type?: string
    days?: string
    ticker?: string
    page?: string
  }>
}

async function getTransactions(params: {
  type?: string
  days?: string
  ticker?: string
  page?: string
}) {
  const { type, days = '30', ticker, page = '1' } = params

  const limit = 50
  const offset = (parseInt(page, 10) - 1) * limit

  // Build API URL
  const apiUrl = new URL(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/insider/recent`
  )

  if (type && type !== 'all') {
    apiUrl.searchParams.set('type', type)
  }
  apiUrl.searchParams.set('days', days)
  apiUrl.searchParams.set('limit', String(limit + offset + 1)) // +1 to check if more exist

  if (ticker) {
    apiUrl.searchParams.set('ticker', ticker)
  }

  try {
    const response = await fetch(apiUrl.toString(), {
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      throw new Error('Failed to fetch transactions')
    }

    const data = await response.json()

    // Handle pagination
    const allTransactions: InsiderTransactionWithDetails[] = data.transactions || []
    const transactions = allTransactions.slice(offset, offset + limit)
    const hasMore = allTransactions.length > offset + limit

    return {
      transactions,
      total: allTransactions.length,
      hasMore,
      page: parseInt(page, 10),
    }
  } catch (error) {
    logger.app.error({ error }, 'Error fetching transactions')
    return {
      transactions: [],
      total: 0,
      hasMore: false,
      page: 1,
    }
  }
}

export default async function InsiderTradesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { transactions, total, hasMore, page } = await getTransactions(params)

  const filters = {
    type: params.type,
    days: params.days || '30',
    ticker: params.ticker,
  }

  // Calculate stats from transactions
  const stats = calculateStats(transactions)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Insider Transactions</h1>
        <p className="text-slate-400">
          Track insider buying and selling activity across all SEC filings
        </p>
        <div className="mt-2">
          <LiveIndicator />
        </div>
      </div>

      {/* Stats Summary */}
      <StatsRow
        stats={[
          { label: "Today's Trades", value: stats.todayCount },
          { label: 'This Week', value: stats.weekCount },
          { label: 'Net Buy Volume', value: stats.netVolume, changeType: stats.netVolumeType },
          { label: 'Active Companies', value: stats.activeCompanies },
        ]}
      />

      {/* Filters */}
      <Suspense fallback={<FiltersSkeleton />}>
        <TransactionFilters />
      </Suspense>

      {/* Results Summary */}
      <ResultsSummary count={transactions.length} filters={filters} />

      {/* Transaction Table */}
      <Suspense fallback={<TableSkeleton />}>
        <TransactionTable transactions={transactions} />
      </Suspense>

      {/* Pagination */}
      {hasMore && (
        <div className="flex justify-center">
          <LoadMoreButton currentPage={page} params={params} />
        </div>
      )}

      {/* No Results */}
      {transactions.length === 0 && <InsiderTradesEmptyState />}
    </div>
  )
}

function LoadMoreButton({
  currentPage,
  params,
}: {
  currentPage: number
  params: { type?: string; days?: string; ticker?: string }
}) {
  const nextPage = currentPage + 1
  const searchParams = new URLSearchParams()

  if (params.type && params.type !== 'all') {
    searchParams.set('type', params.type)
  }
  if (params.days && params.days !== '30') {
    searchParams.set('days', params.days)
  }
  if (params.ticker) {
    searchParams.set('ticker', params.ticker)
  }
  searchParams.set('page', String(nextPage))

  const href = `/insider-trades?${searchParams.toString()}`

  return (
    <Button variant="outline" asChild>
      <a href={href}>Load more</a>
    </Button>
  )
}

function FiltersSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 sm:flex-row sm:items-center">
      <Skeleton className="h-10 w-36 bg-slate-700/50" />
      <Skeleton className="h-10 w-32 bg-slate-700/50" />
      <Skeleton className="h-10 w-48 bg-slate-700/50" />
      <Skeleton className="h-10 w-20 bg-slate-700/50" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-md border border-slate-700/50 bg-slate-800/50">
      <div className="border-b border-slate-700/50 p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16 bg-slate-700/50" />
          <Skeleton className="h-4 w-24 bg-slate-700/50" />
          <Skeleton className="h-4 w-20 bg-slate-700/50" />
          <Skeleton className="h-4 w-12 bg-slate-700/50" />
          <Skeleton className="h-4 w-16 bg-slate-700/50" />
          <Skeleton className="h-4 w-20 bg-slate-700/50" />
          <Skeleton className="h-4 w-24 bg-slate-700/50" />
        </div>
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-20 bg-slate-700/50" />
            <div>
              <Skeleton className="h-4 w-16 bg-slate-700/50" />
              <Skeleton className="mt-1 h-3 w-24 bg-slate-700/50" />
            </div>
            <div>
              <Skeleton className="h-4 w-28 bg-slate-700/50" />
              <Skeleton className="mt-1 h-3 w-20 bg-slate-700/50" />
            </div>
            <Skeleton className="h-5 w-12 rounded-full bg-slate-700/50" />
            <Skeleton className="h-4 w-16 ml-auto bg-slate-700/50" />
            <Skeleton className="h-4 w-20 bg-slate-700/50" />
            <Skeleton className="h-4 w-16 bg-slate-700/50" />
          </div>
        ))}
      </div>
    </div>
  )
}
