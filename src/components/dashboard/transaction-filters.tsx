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
        'flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-slate-800/30 p-4 sm:flex-row sm:items-center',
        className
      )}
    >
      {/* Transaction Type Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleTypeChange('all')}
          disabled={isPending}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            type === 'all'
              ? 'bg-white/10 text-white border border-white/20'
              : 'bg-transparent text-slate-400 border border-transparent hover:bg-white/5 hover:text-white'
          )}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('P')}
          disabled={isPending}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            type === 'P'
              ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
              : 'bg-transparent text-slate-400 border border-transparent hover:bg-white/5 hover:text-white'
          )}
        >
          Buys
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('S')}
          disabled={isPending}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            type === 'S'
              ? 'bg-red-400/20 text-red-400 border border-red-400/30'
              : 'bg-transparent text-slate-400 border border-transparent hover:bg-white/5 hover:text-white'
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
        <SelectTrigger className="w-[130px]">
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
          className="pl-9 pr-9"
          disabled={isPending}
        />
        {ticker && (
          <button
            type="button"
            onClick={handleClearTicker}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Button */}
      <Button
        onClick={handleTickerSearch}
        disabled={isPending}
        variant="cyan"
        className="sm:w-auto"
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
      <p className="text-sm text-slate-500">Loading transactions...</p>
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
    <p className="text-sm text-slate-500">
      Showing {count.toLocaleString()} {parts.join(' ')}
    </p>
  )
}
