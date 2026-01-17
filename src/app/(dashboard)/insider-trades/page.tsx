import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Download } from 'lucide-react'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TransactionFilters,
  ResultsSummary,
  Pagination,
} from '@/components/dashboard/transaction-filters'
import { TransactionTable } from '@/components/dashboard/transaction-table'
import { InsiderTradesEmptyState } from './empty-state-client'
import type { InsiderTransactionWithDetails } from '@/types/database'

/**
 * Insider Trades Page - Modernized Bloomberg Design System
 *
 * Structure:
 * 1. PAGE HEADER: Title + Export CSV button
 * 2. FILTER BAR: Card-style with search, type, date range, significance
 * 3. RESULTS SUMMARY BAR: Count + density toggle
 * 4. DATA TABLE: Expandable rows with AI context
 * 5. PAGINATION: Prev/Next navigation
 */

export const metadata: Metadata = {
  title: 'Insider Trades',
  description: 'Browse and filter SEC Form 4 insider trading filings. Track executive buys, sells, and option exercises.',
}

interface PageProps {
  searchParams: Promise<{
    type?: string
    days?: string
    ticker?: string
    significance?: string
    page?: string
  }>
}

const ITEMS_PER_PAGE = 50

async function getTransactions(params: {
  type?: string
  days?: string
  ticker?: string
  significance?: string
  page?: string
}) {
  const { type, days = '30', ticker, significance, page = '1' } = params

  const currentPage = parseInt(page, 10) || 1
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  // Build API URL
  const apiUrl = new URL(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/insider/recent`
  )

  if (type && type !== 'all') {
    apiUrl.searchParams.set('type', type)
  }
  apiUrl.searchParams.set('days', days)
  // Fetch more than needed to calculate total and check for more pages
  apiUrl.searchParams.set('limit', '1000')

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

    // Filter by significance if specified
    let allTransactions: InsiderTransactionWithDetails[] = data.transactions || []

    if (significance && significance !== 'all') {
      allTransactions = allTransactions.filter((tx) => {
        const score = tx.ai_significance_score || 0
        switch (significance) {
          case 'high':
            return score >= 0.7
          case 'medium':
            return score >= 0.4 && score < 0.7
          case 'low':
            return score < 0.4
          default:
            return true
        }
      })
    }

    const total = allTransactions.length
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

    // Paginate
    const transactions = allTransactions.slice(offset, offset + ITEMS_PER_PAGE)

    return {
      transactions,
      total,
      totalPages,
      currentPage,
      pageStart: total > 0 ? offset + 1 : 0,
      pageEnd: Math.min(offset + ITEMS_PER_PAGE, total),
    }
  } catch (error) {
    logger.app.error({ error }, 'Error fetching transactions')
    return {
      transactions: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      pageStart: 0,
      pageEnd: 0,
    }
  }
}

export default async function InsiderTradesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { transactions, total, totalPages, currentPage, pageStart, pageEnd } =
    await getTransactions(params)

  const searchParamsRecord = {
    type: params.type,
    days: params.days,
    ticker: params.ticker,
    significance: params.significance,
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1
          className={cn(
            'text-2xl font-bold tracking-tight',
            'text-[hsl(var(--text-primary))]'
          )}
        >
          Insider Trades
        </h1>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9',
            'border-[hsl(var(--border-default))]',
            'text-[hsl(var(--text-secondary))]',
            'hover:text-[hsl(var(--text-primary))]',
            'hover:bg-[hsl(var(--bg-hover))]'
          )}
        >
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <Suspense fallback={<FiltersSkeleton />}>
        <TransactionFilters />
      </Suspense>

      {/* Main Content Card */}
      <div
        className={cn(
          'rounded-lg overflow-hidden',
          'bg-[hsl(var(--bg-card))]',
          'border border-[hsl(var(--border-default))]'
        )}
      >
        {/* Results Summary Bar (inside the card) */}
        <ResultsSummary
          start={pageStart}
          end={pageEnd}
          total={total}
          loading={false}
        />

        {/* Transaction Table */}
        <Suspense fallback={<TableSkeleton />}>
          {transactions.length > 0 ? (
            <TransactionTable
              transactions={transactions}
              totalCount={total}
              pageStart={pageStart}
              pageEnd={pageEnd}
              showResultsSummary={false}
              expandable={true}
              maxHeight="calc(100vh - 380px)"
            />
          ) : (
            <div className="p-8">
              <InsiderTradesEmptyState />
            </div>
          )}
        </Suspense>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-[hsl(var(--border-default))]">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              searchParams={searchParamsRecord}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div
      className={cn(
        'rounded-lg p-4',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]'
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-[200px] bg-[hsl(var(--bg-elevated))]" />
        <Skeleton className="h-9 w-[120px] bg-[hsl(var(--bg-elevated))]" />
        <Skeleton className="h-9 w-[130px] bg-[hsl(var(--bg-elevated))]" />
        <Skeleton className="h-9 w-[140px] bg-[hsl(var(--bg-elevated))]" />
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-[hsl(var(--border-subtle))]">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 px-4 py-3 bg-[hsl(var(--bg-elevated))]">
        <Skeleton className="h-4 w-10 bg-[hsl(var(--bg-card))]" />
        <Skeleton className="h-4 w-24 bg-[hsl(var(--bg-card))]" />
        <Skeleton className="h-4 w-20 bg-[hsl(var(--bg-card))]" />
        <Skeleton className="h-4 w-16 bg-[hsl(var(--bg-card))]" />
        <Skeleton className="h-4 w-20 bg-[hsl(var(--bg-card))]" />
        <Skeleton className="h-4 w-24 bg-[hsl(var(--bg-card))]" />
        <Skeleton className="h-4 w-16 bg-[hsl(var(--bg-card))]" />
        <Skeleton className="h-4 w-20 bg-[hsl(var(--bg-card))]" />
        <Skeleton className="h-4 w-20 bg-[hsl(var(--bg-card))]" />
      </div>
      {/* Row skeletons */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <Skeleton className="h-5 w-5 bg-[hsl(var(--bg-elevated))]" />
          <div className="flex-1">
            <Skeleton className="h-4 w-28 bg-[hsl(var(--bg-elevated))]" />
            <Skeleton className="mt-1 h-3 w-20 bg-[hsl(var(--bg-elevated))]" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 bg-[hsl(var(--bg-elevated))]" />
            <Skeleton className="mt-1 h-3 w-24 bg-[hsl(var(--bg-elevated))]" />
          </div>
          <Skeleton className="h-6 w-14 rounded-full bg-[hsl(var(--bg-elevated))]" />
          <Skeleton className="h-4 w-20 bg-[hsl(var(--bg-elevated))]" />
          <Skeleton className="h-4 w-16 bg-[hsl(var(--bg-elevated))] hidden md:block" />
          <Skeleton className="h-4 w-16 bg-[hsl(var(--bg-elevated))]" />
          <Skeleton className="h-4 w-16 bg-[hsl(var(--bg-elevated))]" />
          <Skeleton className="h-4 w-20 bg-[hsl(var(--bg-elevated))]" />
        </div>
      ))}
    </div>
  )
}
