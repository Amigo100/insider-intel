import type { Metadata } from 'next'
import { Suspense } from 'react'
import { logger } from '@/lib/logger'
import { TransactionFilters, ResultsSummary } from '@/components/dashboard/transaction-filters'
import { TransactionTable } from '@/components/dashboard/transaction-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { InsiderTransactionWithDetails } from '@/types/database'

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insider Transactions</h1>
        <p className="text-muted-foreground">
          Track insider buying and selling activity across all SEC filings
        </p>
      </div>

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
      {transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border py-12">
          <p className="text-lg font-medium">No transactions found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or check back later
          </p>
        </div>
      )}
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

  const href = `/dashboard/insider-trades?${searchParams.toString()}`

  return (
    <Button variant="outline" asChild>
      <a href={href}>Load more</a>
    </Button>
  )
}

function FiltersSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-10 w-20" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="border-b p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="mt-1 h-3 w-24" />
            </div>
            <div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-1 h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-4 w-16 ml-auto" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
