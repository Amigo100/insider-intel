'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

/**
 * TransactionFilters - Modernized Bloomberg Design System
 *
 * Card-style filter bar with:
 * - Search input with icon
 * - Type dropdown: All, Buy, Sell
 * - Date range: 7d, 30d, 90d
 * - Significance: All, High, Medium, Low
 * - Clear filters button (ghost, when active)
 *
 * Accessibility:
 * - role="group" on filter container
 * - aria-label for filter group
 * - Individual labels for each control
 */

interface TransactionFiltersProps {
  className?: string
}

type TransactionType = 'all' | 'P' | 'S'
type TimePeriod = '7' | '30' | '90'
type SignificanceLevel = 'all' | 'high' | 'medium' | 'low'

export function TransactionFilters({ className }: TransactionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Initialize from URL params
  const [type, setType] = useState<TransactionType>(
    (searchParams.get('type') as TransactionType) || 'all'
  )
  const [days, setDays] = useState<TimePeriod>(
    (searchParams.get('days') as TimePeriod) || '30'
  )
  const [ticker, setTicker] = useState(searchParams.get('ticker') || '')
  const [significance, setSignificance] = useState<SignificanceLevel>(
    (searchParams.get('significance') as SignificanceLevel) || 'all'
  )

  const updateUrl = useCallback(
    (
      newType: TransactionType,
      newDays: TimePeriod,
      newTicker: string,
      newSignificance: SignificanceLevel
    ) => {
      const params = new URLSearchParams()

      if (newType !== 'all') {
        params.set('type', newType)
      }
      if (newDays !== '30') {
        params.set('days', newDays)
      }
      if (newTicker) {
        params.set('ticker', newTicker.toUpperCase())
      }
      if (newSignificance !== 'all') {
        params.set('significance', newSignificance)
      }

      const queryString = params.toString()
      const url = queryString
        ? `/insider-trades?${queryString}`
        : '/insider-trades'

      startTransition(() => {
        router.push(url)
      })
    },
    [router]
  )

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType)
    updateUrl(newType, days, ticker, significance)
  }

  const handleDaysChange = (newDays: TimePeriod) => {
    setDays(newDays)
    updateUrl(type, newDays, ticker, significance)
  }

  const handleSignificanceChange = (newSignificance: SignificanceLevel) => {
    setSignificance(newSignificance)
    updateUrl(type, days, ticker, newSignificance)
  }

  const handleTickerChange = (value: string) => {
    setTicker(value.toUpperCase())
  }

  const handleTickerSearch = () => {
    updateUrl(type, days, ticker, significance)
  }

  const handleTickerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTickerSearch()
    }
  }

  const handleClearTicker = () => {
    setTicker('')
    updateUrl(type, days, '', significance)
  }

  const handleClearFilters = () => {
    setType('all')
    setDays('30')
    setTicker('')
    setSignificance('all')
    startTransition(() => {
      router.push('/insider-trades')
    })
  }

  const hasActiveFilters =
    type !== 'all' || days !== '30' || ticker !== '' || significance !== 'all'

  return (
    <div
      role="group"
      aria-label="Transaction filters"
      className={cn(
        // Card-style container
        'rounded-lg p-4',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Ticker Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2',
              'h-4 w-4',
              'text-[hsl(var(--text-muted))]'
            )}
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Search ticker..."
            value={ticker}
            onChange={(e) => handleTickerChange(e.target.value)}
            onKeyDown={handleTickerKeyDown}
            disabled={isPending}
            aria-label="Search by ticker symbol"
            className={cn(
              'h-9 pl-9 pr-9',
              'bg-[hsl(var(--bg-app))]',
              'border-[hsl(var(--border-default))]',
              'text-[hsl(var(--text-primary))]',
              'placeholder:text-[hsl(var(--text-muted))]',
              'focus-visible:ring-[hsl(var(--accent-amber))]'
            )}
          />
          {ticker && (
            <button
              type="button"
              onClick={handleClearTicker}
              aria-label="Clear ticker filter"
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2',
                'flex h-6 w-6 items-center justify-center rounded',
                'text-[hsl(var(--text-muted))]',
                'hover:text-[hsl(var(--text-primary))]',
                'hover:bg-[hsl(var(--bg-hover))]',
                'focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-amber))]',
                'transition-colors duration-150'
              )}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Type Dropdown */}
        <Select
          value={type}
          onValueChange={(value) => handleTypeChange(value as TransactionType)}
          disabled={isPending}
        >
          <SelectTrigger
            className={cn(
              'h-9 w-[120px]',
              'bg-[hsl(var(--bg-app))]',
              'border-[hsl(var(--border-default))]',
              'text-[hsl(var(--text-primary))]',
              'focus:ring-[hsl(var(--accent-amber))]'
            )}
            aria-label="Filter by transaction type"
          >
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="P">Buy</SelectItem>
            <SelectItem value="S">Sell</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Dropdown */}
        <Select
          value={days}
          onValueChange={(value) => handleDaysChange(value as TimePeriod)}
          disabled={isPending}
        >
          <SelectTrigger
            className={cn(
              'h-9 w-[130px]',
              'bg-[hsl(var(--bg-app))]',
              'border-[hsl(var(--border-default))]',
              'text-[hsl(var(--text-primary))]',
              'focus:ring-[hsl(var(--accent-amber))]'
            )}
            aria-label="Filter by date range"
          >
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        {/* Significance Dropdown */}
        <Select
          value={significance}
          onValueChange={(value) => handleSignificanceChange(value as SignificanceLevel)}
          disabled={isPending}
        >
          <SelectTrigger
            className={cn(
              'h-9 w-[140px]',
              'bg-[hsl(var(--bg-app))]',
              'border-[hsl(var(--border-default))]',
              'text-[hsl(var(--text-primary))]',
              'focus:ring-[hsl(var(--accent-amber))]'
            )}
            aria-label="Filter by significance level"
          >
            <SelectValue placeholder="Significance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Signals</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            disabled={isPending}
            className={cn(
              'h-9 px-3',
              'text-[hsl(var(--text-muted))]',
              'hover:text-[hsl(var(--text-primary))]',
              'hover:bg-[hsl(var(--bg-hover))]'
            )}
          >
            <X className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Clear filters
          </Button>
        )}

        {/* Loading indicator */}
        {isPending && (
          <span className="text-xs text-[hsl(var(--text-muted))]">
            Loading...
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Results summary bar with pagination info and density toggle
 */
export interface ResultsSummaryProps {
  /** Current page start index (1-indexed) */
  start: number
  /** Current page end index */
  end: number
  /** Total number of transactions */
  total: number
  /** Loading state */
  loading?: boolean
  /** Additional className */
  className?: string
  /** Children (e.g., density toggle) */
  children?: React.ReactNode
}

export function ResultsSummary({
  start,
  end,
  total,
  loading = false,
  className,
  children,
}: ResultsSummaryProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center justify-between',
          'px-4 py-3',
          'bg-[hsl(var(--bg-surface))]',
          'border-b border-[hsl(var(--border-default))]',
          className
        )}
      >
        <span className="text-sm text-[hsl(var(--text-muted))]">
          Loading transactions...
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'px-4 py-3',
        'bg-[hsl(var(--bg-surface))]',
        'border-b border-[hsl(var(--border-default))]',
        className
      )}
    >
      <p className="text-sm text-[hsl(var(--text-secondary))]">
        Showing{' '}
        <span className="font-medium text-[hsl(var(--text-primary))] tabular-nums">
          {start.toLocaleString()}-{end.toLocaleString()}
        </span>{' '}
        of{' '}
        <span className="font-medium text-[hsl(var(--text-primary))] tabular-nums">
          {total.toLocaleString()}
        </span>{' '}
        transactions
      </p>
      {children}
    </div>
  )
}

/**
 * Pagination component
 */
export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Base URL path for pagination links */
  basePath?: string
  /** Current search params to preserve */
  searchParams?: Record<string, string | undefined>
  /** Callback when page changes (for client-side navigation) */
  onPageChange?: (page: number) => void
  /** Additional className */
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = '/insider-trades',
  searchParams = {},
  onPageChange,
  className,
}: PaginationProps) {
  const buildHref = (page: number) => {
    const params = new URLSearchParams()

    // Preserve existing params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value)
      }
    })

    // Set page param
    if (page > 1) {
      params.set('page', String(page))
    }

    const queryString = params.toString()
    return queryString ? `${basePath}?${queryString}` : basePath
  }

  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1)
    }
  }

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  // If only one page, don't show pagination
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn(
        'flex items-center justify-center gap-2',
        'py-4',
        className
      )}
    >
      {/* Previous button */}
      <Button
        variant="ghost"
        size="sm"
        disabled={!hasPrev}
        onClick={onPageChange ? handlePrev : undefined}
        asChild={!onPageChange && hasPrev}
        className={cn(
          'h-9 px-3',
          'text-[hsl(var(--text-secondary))]',
          'hover:text-[hsl(var(--text-primary))]',
          'hover:bg-[hsl(var(--bg-hover))]',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Go to previous page"
      >
        {!onPageChange && hasPrev ? (
          <a href={buildHref(currentPage - 1)}>← Prev</a>
        ) : (
          <span>← Prev</span>
        )}
      </Button>

      {/* Page indicator */}
      <span
        className={cn(
          'px-4 py-2',
          'text-sm',
          'text-[hsl(var(--text-secondary))]'
        )}
      >
        Page{' '}
        <span className="font-medium text-[hsl(var(--text-primary))] tabular-nums">
          {currentPage}
        </span>{' '}
        of{' '}
        <span className="font-medium text-[hsl(var(--text-primary))] tabular-nums">
          {totalPages}
        </span>
      </span>

      {/* Next button */}
      <Button
        variant="ghost"
        size="sm"
        disabled={!hasNext}
        onClick={onPageChange ? handleNext : undefined}
        asChild={!onPageChange && hasNext}
        className={cn(
          'h-9 px-3',
          'text-[hsl(var(--text-secondary))]',
          'hover:text-[hsl(var(--text-primary))]',
          'hover:bg-[hsl(var(--bg-hover))]',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Go to next page"
      >
        {!onPageChange && hasNext ? (
          <a href={buildHref(currentPage + 1)}>Next →</a>
        ) : (
          <span>Next →</span>
        )}
      </Button>
    </nav>
  )
}
