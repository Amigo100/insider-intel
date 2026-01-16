'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
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

interface TransactionFiltersProps {
  className?: string
}

type TransactionType = 'all' | 'P' | 'S'
type TimePeriod = '7' | '30' | '90'

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

  const updateUrl = useCallback(
    (newType: TransactionType, newDays: TimePeriod, newTicker: string) => {
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
    updateUrl(newType, days, ticker)
  }

  const handleDaysChange = (newDays: TimePeriod) => {
    setDays(newDays)
    updateUrl(type, newDays, ticker)
  }

  const handleTickerSearch = () => {
    updateUrl(type, days, ticker)
  }

  const handleTickerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTickerSearch()
    }
  }

  const handleClearTicker = () => {
    setTicker('')
    updateUrl(type, days, '')
  }

  const handleReset = () => {
    setType('all')
    setDays('30')
    setTicker('')
    startTransition(() => {
      router.push('/insider-trades')
    })
  }

  const hasActiveFilters =
    type !== 'all' || days !== '30' || ticker !== ''

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-slate-800/30 p-4 sm:flex-row sm:items-center',
        className
      )}
    >
      {/* Transaction Type Toggle - Segmented Control */}
      <div
        className="inline-flex h-11 items-center rounded-lg border border-white/[0.08] bg-slate-900/50 p-1"
        role="group"
        aria-label="Transaction type filter"
      >
        <button
          type="button"
          onClick={() => handleTypeChange('all')}
          disabled={isPending}
          aria-pressed={type === 'all'}
          className={cn(
            'min-h-[36px] min-w-[44px] px-4 rounded-md text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900',
            type === 'all'
              ? 'bg-cyan-400 text-slate-900 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('P')}
          disabled={isPending}
          aria-pressed={type === 'P'}
          className={cn(
            'min-h-[36px] min-w-[44px] px-4 rounded-md text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900',
            type === 'P'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10'
          )}
        >
          Buys
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('S')}
          disabled={isPending}
          aria-pressed={type === 'S'}
          className={cn(
            'min-h-[36px] min-w-[44px] px-4 rounded-md text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900',
            type === 'S'
              ? 'bg-red-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-red-400 hover:bg-red-400/10'
          )}
        >
          Sells
        </button>
      </div>

      {/* Time Period Select */}
      <Select
        value={days}
        onValueChange={(value) => handleDaysChange(value as TimePeriod)}
        disabled={isPending}
      >
        <SelectTrigger className="h-10 min-w-[140px] rounded-lg">
          <SelectValue placeholder="Time period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Last 7 days</SelectItem>
          <SelectItem value="30">Last 30 days</SelectItem>
          <SelectItem value="90">Last 90 days</SelectItem>
        </SelectContent>
      </Select>

      {/* Ticker Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Filter by ticker..."
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          onKeyDown={handleTickerKeyDown}
          className="h-10 pl-9 pr-9"
          disabled={isPending}
        />
        {ticker && (
          <button
            type="button"
            onClick={handleClearTicker}
            aria-label="Clear ticker filter"
            className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[24px] min-w-[24px] flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Search Button */}
      <Button
        onClick={handleTickerSearch}
        disabled={isPending}
        variant="outline"
        className="h-10 px-5 sm:w-auto"
      >
        {isPending ? 'Loading...' : 'Search'}
      </Button>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={isPending}
          className="h-10 text-slate-400 hover:text-white"
        >
          Reset
        </Button>
      )}
    </div>
  )
}

/**
 * Results summary component
 */
export function ResultsSummary({
  count,
  loading,
  filters,
}: {
  count: number
  loading?: boolean
  filters?: {
    type?: string
    days?: string
    ticker?: string
  }
}) {
  if (loading) {
    return (
      <p className="text-sm text-slate-400">Loading transactions...</p>
    )
  }

  const parts: string[] = []

  if (filters?.ticker) {
    parts.push(`for ${filters.ticker}`)
  }

  if (filters?.type === 'P') {
    parts.push('purchases')
  } else if (filters?.type === 'S') {
    parts.push('sales')
  } else {
    parts.push('transactions')
  }

  if (filters?.days) {
    parts.push(`in the last ${filters.days} days`)
  }

  return (
    <p className="text-sm text-slate-400">
      Showing {count.toLocaleString()} {parts.join(' ')}
    </p>
  )
}
