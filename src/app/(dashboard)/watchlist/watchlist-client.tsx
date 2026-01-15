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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Watchlist</h1>
          <p className="text-muted-foreground">
            {meta.count} of {meta.limit} stocks
            {meta.tier === 'free' && (
              <span className="ml-2 text-xs">(Free tier)</span>
            )}
          </p>
        </div>

        {/* Upgrade prompt at limit */}
        {meta.isAtLimit && meta.tier === 'free' && (
          <Button variant="default" size="sm" asChild>
            <Link href="/dashboard/settings/billing">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to track more
            </Link>
          </Button>
        )}
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={searchRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Search Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-md border bg-popover p-1 shadow-lg">
                {searchResults.map((result) => {
                  const alreadyAdded = isInWatchlist(result.ticker)
                  const isAdding = pendingAdd === result.ticker

                  return (
                    <button
                      key={result.ticker}
                      onClick={() => !alreadyAdded && handleAdd(result.ticker)}
                      disabled={alreadyAdded || isAdding}
                      className={cn(
                        'flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm',
                        alreadyAdded
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:bg-accent'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold">
                          {result.ticker}
                        </span>
                        <span className="text-muted-foreground truncate max-w-[200px]">
                          {result.name}
                        </span>
                        {result.has_recent_activity && (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      {alreadyAdded ? (
                        <Badge variant="outline" className="text-xs">
                          Added
                        </Badge>
                      ) : isAdding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Star className="h-4 w-4 text-muted-foreground" />
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
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-4 shadow-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    No companies found for &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}
          </div>

          {meta.isAtLimit && (
            <p className="mt-3 text-sm text-muted-foreground">
              You&apos;ve reached the free tier limit of {meta.limit} stocks.{' '}
              <Link href="/dashboard/settings/billing" className="text-primary hover:underline">
                Upgrade your plan
              </Link>{' '}
              to track more.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {watchlist.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Star className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">Start tracking stocks</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Add companies to your watchlist to monitor insider trading
              activity and get personalized insights. Use the search above to
              find stocks by ticker or name.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Watchlist Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {watchlist.map((item) => {
              const isRemoving = pendingRemove === item.id

              return (
                <Card
                  key={item.id}
                  className={cn(
                    'group relative transition-opacity',
                    isRemoving && 'opacity-50'
                  )}
                >
                  <Link href={`/dashboard/company/${item.company.ticker}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">
                              {item.company.ticker}
                            </span>
                            <Badge
                              variant={
                                item.stats.sentiment === 'bullish'
                                  ? 'default'
                                  : item.stats.sentiment === 'bearish'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {getSentimentIcon(item.stats.sentiment)}
                              <span className="ml-1">
                                {getSentimentLabel(item.stats.sentiment)}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                            {item.company.name}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        {item.stats.lastTransaction ? (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Last trade:
                            </span>
                            <span>
                              {item.stats.lastTransaction.transaction_type ===
                              'P'
                                ? 'Buy'
                                : 'Sell'}{' '}
                              {formatValue(
                                item.stats.lastTransaction.total_value || 0
                              )}
                            </span>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No recent activity
                          </p>
                        )}

                        {item.stats.transactionCount > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              30-day activity:
                            </span>
                            <span>
                              <span className="text-green-600">
                                {item.stats.recentBuys} buys
                              </span>
                              {' / '}
                              <span className="text-red-600">
                                {item.stats.recentSells} sells
                              </span>
                            </span>
                          </div>
                        )}

                        {item.stats.avgSignificance !== null && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Avg significance:
                            </span>
                            <Badge variant="outline">
                              {item.stats.avgSignificance.toFixed(1)}/10
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Link>

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRemove(item.id)
                    }}
                    disabled={isRemoving}
                    className="absolute right-2 top-2 rounded-full p-1.5 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                    title="Remove from watchlist"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    )}
                  </button>
                </Card>
              )
            })}
          </div>

          {/* Activity Feed */}
          {activity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Watchlist Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activity.map((transaction, index) => (
                    <div
                      key={transaction.id || index}
                      className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full',
                          transaction.transaction_type === 'P'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
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
                            href={`/dashboard/company/${transaction.ticker}`}
                            className="font-semibold hover:underline"
                          >
                            {transaction.ticker}
                          </Link>
                          <Badge
                            variant={
                              transaction.transaction_type === 'P'
                                ? 'default'
                                : 'destructive'
                            }
                            className="text-xs"
                          >
                            {transaction.transaction_type === 'P'
                              ? 'Buy'
                              : 'Sell'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {transaction.insider_name} ({transaction.insider_title}
                          )
                        </p>
                        {transaction.ai_context && (
                          <p className="mt-1 text-sm line-clamp-2">
                            {transaction.ai_context}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-medium">
                          {formatValue(transaction.total_value || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.filed_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  )
}
