'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { clientLogger } from '@/lib/client-logger'
import {
  Star,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Loader2,
  ArrowUpRight,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import EmptyState from '@/components/dashboard/empty-state'
import LiveIndicator from '@/components/dashboard/live-indicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardCard, CardInteractive } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Company {
  id: string
  ticker: string
  name: string
  sector: string | null
}

interface TransactionStats {
  lastTransaction: any | null
  sentiment: 'bullish' | 'bearish' | 'neutral'
  recentBuys: number
  recentSells: number
  avgSignificance: number | null
  transactionCount: number
}

interface WatchlistItem {
  id: string
  companyId: string
  createdAt: string
  company: Company
  stats: TransactionStats
}

interface WatchlistData {
  watchlist: WatchlistItem[]
  activity: any[]
  meta: {
    count: number
    limit: number
    tier: string
    isAtLimit: boolean
  }
}

interface SearchResult {
  ticker: string
  name: string
  sector: string | null
  has_recent_activity: boolean
}

interface WatchlistClientProps {
  initialData: WatchlistData
}

export function WatchlistClient({ initialData }: WatchlistClientProps) {
  const router = useRouter()
  const [data, setData] = useState<WatchlistData>(initialData)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [pendingAdd, setPendingAdd] = useState<string | null>(null)
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { watchlist, activity, meta } = data

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.length < 1) {
      setSearchResults([])
      setIsSearchOpen(false)
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSearchResults(data.results || [])
        setIsSearchOpen(true)
      } catch (err) {
        clientLogger.error('Search error', { error: err })
        setError('Failed to search. Please try again.')
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }, [])

  // Optimistic add to watchlist
  const handleAdd = async (ticker: string) => {
    if (meta.isAtLimit) return

    setPendingAdd(ticker)
    setIsSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])

    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      })

      const result = await res.json()

      if (!res.ok) {
        if (result.upgradeRequired) {
          // Show upgrade prompt handled by UI
        }
        throw new Error(result.error)
      }

      // Add item to local state (optimistic update confirmation)
      setData((prev) => ({
        ...prev,
        watchlist: [result.item, ...prev.watchlist],
        meta: {
          ...prev.meta,
          count: result.meta.count,
          isAtLimit: result.meta.count >= result.meta.limit,
        },
      }))

      router.refresh()
    } catch (err) {
      clientLogger.error('Error adding to watchlist', { error: err })
      setError('Failed to add to watchlist. Please try again.')
    } finally {
      setPendingAdd(null)
    }
  }

  // Optimistic remove from watchlist
  const handleRemove = async (itemId: string) => {
    setPendingRemove(itemId)

    // Optimistically remove from UI
    const removedItem = watchlist.find((item) => item.id === itemId)
    setData((prev) => ({
      ...prev,
      watchlist: prev.watchlist.filter((item) => item.id !== itemId),
      meta: {
        ...prev.meta,
        count: prev.meta.count - 1,
        isAtLimit: false,
      },
    }))

    try {
      const res = await fetch(`/api/watchlist?id=${itemId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        // Revert optimistic update on error
        if (removedItem) {
          setData((prev) => ({
            ...prev,
            watchlist: [...prev.watchlist, removedItem],
            meta: {
              ...prev.meta,
              count: prev.meta.count + 1,
              isAtLimit: prev.meta.count + 1 >= prev.meta.limit,
            },
          }))
        }
        throw new Error('Failed to remove')
      }

      router.refresh()
    } catch (err) {
      clientLogger.error('Error removing from watchlist', { error: err })
      setError('Failed to remove from watchlist. Please try again.')
    } finally {
      setPendingRemove(null)
    }
  }

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-buy" />
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-sell" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'Bullish'
      case 'bearish':
        return 'Bearish'
      default:
        return 'Neutral'
    }
  }

  // Check if ticker is already in watchlist
  const isInWatchlist = (ticker: string) =>
    watchlist.some((item) => item.company.ticker === ticker)

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">Your Watchlist</h1>
            <span className={cn(
              'px-2.5 py-1 text-xs font-medium rounded-full',
              meta.tier === 'free'
                ? 'bg-slate-700 text-slate-300'
                : meta.tier === 'retail'
                ? 'bg-cyan-400/20 text-cyan-400'
                : 'bg-purple-400/20 text-purple-400'
            )}>
              {meta.tier === 'free' ? 'Free' : meta.tier === 'retail' ? 'Retail' : 'Pro'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Upgrade prompt at limit */}
            {meta.isAtLimit && meta.tier === 'free' && (
              <Button variant="cyan" size="sm" asChild>
                <Link href="/settings/billing">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade to track more
                </Link>
              </Button>
            )}
            <LiveIndicator text="Activity monitored in real-time" />
          </div>
        </div>
        <p className="text-slate-400">
          {meta.count} of {meta.limit} stocks tracked
          {meta.tier === 'free' && !meta.isAtLimit && (
            <span className="ml-2">
              ·{' '}
              <Link href="/settings/billing" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Upgrade for unlimited
              </Link>
            </span>
          )}
        </p>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 rounded p-1 hover:bg-destructive/20"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Add Stock Search */}
      <DashboardCard>
        <div className="border-b border-white/[0.06] p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Star className="h-5 w-5 text-cyan-400" />
            Add Stock
          </h3>
        </div>
        <div className="p-4">
          <div ref={searchRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={
                  meta.isAtLimit
                    ? 'Upgrade to add more stocks...'
                    : 'Search by ticker or company name...'
                }
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setIsSearchOpen(true)}
                disabled={meta.isAtLimit}
                className="pl-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
              )}
            </div>

            {/* Search Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-white/[0.08] bg-slate-800 p-1 shadow-lg">
                {searchResults.map((result) => {
                  const alreadyAdded = isInWatchlist(result.ticker)
                  const isAdding = pendingAdd === result.ticker

                  return (
                    <button
                      key={result.ticker}
                      onClick={() => !alreadyAdded && handleAdd(result.ticker)}
                      disabled={alreadyAdded || isAdding}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-white',
                        alreadyAdded
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:bg-white/5'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-white">
                          {result.ticker}
                        </span>
                        <span className="text-slate-400 truncate max-w-[200px]">
                          {result.name}
                        </span>
                        {result.has_recent_activity && (
                          <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-emerald-400/20 text-emerald-400">
                            Active
                          </span>
                        )}
                      </div>
                      {alreadyAdded ? (
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-white/10 text-slate-400">
                          Added
                        </span>
                      ) : isAdding ? (
                        <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                      ) : (
                        <Star className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {isSearchOpen &&
              searchQuery &&
              !isSearching &&
              searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-white/[0.08] bg-slate-800 p-4 shadow-lg">
                  <p className="text-sm text-slate-400 text-center">
                    No companies found for &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}
          </div>

          {/* Ticker suggestions */}
          {!meta.isAtLimit && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-slate-500">Popular:</span>
              {['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL'].map((tickerSuggestion) => {
                const alreadyAdded = isInWatchlist(tickerSuggestion)
                return (
                  <button
                    key={tickerSuggestion}
                    onClick={() => !alreadyAdded && handleAdd(tickerSuggestion)}
                    disabled={alreadyAdded || pendingAdd === tickerSuggestion}
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-md border transition-all',
                      alreadyAdded
                        ? 'bg-white/5 text-slate-500 border-white/5 cursor-not-allowed'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-cyan-400/10 hover:text-cyan-400 hover:border-cyan-400/30'
                    )}
                  >
                    {pendingAdd === tickerSuggestion ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      tickerSuggestion
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {meta.isAtLimit && (
            <p className="mt-3 text-sm text-slate-500">
              You&apos;ve reached the free tier limit of {meta.limit} stocks.{' '}
              <Link href="/settings/billing" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Upgrade your plan
              </Link>{' '}
              to track more.
            </p>
          )}
        </div>
      </DashboardCard>

      {/* Empty State */}
      {watchlist.length === 0 ? (
        <DashboardCard>
          <EmptyState
            icon={Star}
            title="Build your watchlist"
            description="Track insider trading activity for the companies you care about. Search for a stock above by ticker or company name, or browse recent insider trades to discover opportunities."
            action={{
              label: 'Explore insider trades',
              href: '/insider-trades',
            }}
          />
        </DashboardCard>
      ) : (
        <>
          {/* Watchlist Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {watchlist.map((item) => {
              const isRemoving = pendingRemove === item.id

              return (
                <CardInteractive
                  key={item.id}
                  className={cn(
                    'group relative p-0',
                    isRemoving && 'opacity-50'
                  )}
                >
                  <Link href={`/company/${item.company.ticker}`}>
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white">
                              {item.company.ticker}
                            </span>
                            <span
                              className={cn(
                                'px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1',
                                item.stats.sentiment === 'bullish'
                                  ? 'bg-emerald-400/20 text-emerald-400'
                                  : item.stats.sentiment === 'bearish'
                                  ? 'bg-red-400/20 text-red-400'
                                  : 'bg-slate-700 text-slate-400'
                              )}
                            >
                              {getSentimentIcon(item.stats.sentiment)}
                              <span>
                                {getSentimentLabel(item.stats.sentiment)}
                              </span>
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 truncate max-w-[180px]">
                            {item.company.name}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        {item.stats.lastTransaction ? (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">
                              Last trade:
                            </span>
                            <span className="text-white">
                              <span className={item.stats.lastTransaction.transaction_type === 'P' ? 'text-emerald-400' : 'text-red-400'}>
                                {item.stats.lastTransaction.transaction_type === 'P' ? 'Buy' : 'Sell'}
                              </span>
                              {' '}
                              {formatValue(
                                item.stats.lastTransaction.total_value || 0
                              )}
                            </span>
                          </div>
                        ) : (
                          <p className="text-slate-500">
                            No recent activity
                          </p>
                        )}

                        {item.stats.transactionCount > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">
                              30-day activity:
                            </span>
                            <span>
                              <span className="text-emerald-400">
                                {item.stats.recentBuys} buys
                              </span>
                              {' / '}
                              <span className="text-red-400">
                                {item.stats.recentSells} sells
                              </span>
                            </span>
                          </div>
                        )}

                        {item.stats.avgSignificance !== null && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">
                              Avg significance:
                            </span>
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-white/10 text-white">
                              {item.stats.avgSignificance.toFixed(1)}/10
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRemove(item.id)
                    }}
                    disabled={isRemoving}
                    className="absolute right-1 top-1 flex items-center justify-center rounded-full min-h-[44px] min-w-[44px] opacity-0 transition-opacity hover:bg-red-400/10 group-hover:opacity-100"
                    aria-label="Remove from watchlist"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : (
                      <X className="h-4 w-4 text-slate-400 hover:text-red-400" />
                    )}
                  </button>
                </CardInteractive>
              )
            })}
          </div>

          {/* Activity Feed */}
          {activity.length > 0 && (
            <DashboardCard>
              <div className="border-b border-white/[0.06] p-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <Clock className="h-5 w-5 text-cyan-400" />
                  Recent Watchlist Activity
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {activity.map((transaction, index) => (
                    <div
                      key={transaction.id || index}
                      className="flex items-start gap-4 border-b border-white/[0.06] pb-4 last:border-0 last:pb-0"
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full',
                          transaction.transaction_type === 'P'
                            ? 'bg-emerald-400/20 text-emerald-400'
                            : 'bg-red-400/20 text-red-400'
                        )}
                      >
                        {transaction.transaction_type === 'P' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/company/${transaction.ticker}`}
                            className="font-semibold text-white hover:text-cyan-400 transition-colors"
                          >
                            {transaction.ticker}
                          </Link>
                          <span
                            className={cn(
                              'px-2 py-0.5 text-xs font-medium rounded-full',
                              transaction.transaction_type === 'P'
                                ? 'bg-emerald-400/20 text-emerald-400'
                                : 'bg-red-400/20 text-red-400'
                            )}
                          >
                            {transaction.transaction_type === 'P'
                              ? 'Buy'
                              : 'Sell'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">
                          {transaction.insider_name} ({transaction.insider_title}
                          )
                        </p>
                        {transaction.ai_context && (
                          <p className="mt-1 text-sm text-slate-300 line-clamp-2">
                            {transaction.ai_context}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-medium text-white">
                          {formatValue(transaction.total_value || 0)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(transaction.filed_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardCard>
          )}
        </>
      )}
    </>
  )
}
