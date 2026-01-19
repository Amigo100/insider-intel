'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { clientLogger } from '@/lib/client-logger'

/**
 * useWatchlist - Hook for managing watchlist state and operations
 *
 * Handles:
 * - Search with debouncing
 * - Optimistic add/remove operations
 * - Error state management
 */

export interface Company {
  id: string
  ticker: string
  name: string
  sector: string | null
}

export interface TransactionStats {
  lastTransaction: {
    transaction_type: string
    total_value: number
    filed_at: string
  } | null
  sentiment: 'bullish' | 'bearish' | 'neutral'
  recentBuys: number
  recentSells: number
  avgSignificance: number | null
  transactionCount: number
}

export interface WatchlistItem {
  id: string
  companyId: string
  createdAt: string
  company: Company
  stats: TransactionStats
}

export interface ActivityItem {
  id: string
  ticker: string
  company_name: string
  insider_name: string
  insider_title: string
  transaction_type: string
  total_value: number
  filed_at: string
  ai_context: string | null
  ai_significance_score: number | null
}

export interface WatchlistMeta {
  count: number
  limit: number
  tier: 'free' | 'retail' | 'pro'
  isAtLimit: boolean
}

export interface WatchlistData {
  watchlist: WatchlistItem[]
  activity: ActivityItem[]
  meta: WatchlistMeta
}

export interface SearchResult {
  ticker: string
  name: string
  sector: string | null
  has_recent_activity: boolean
}

export function useWatchlist(initialData: WatchlistData) {
  const router = useRouter()
  const [data, setData] = useState<WatchlistData>(initialData)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [pendingAdd, setPendingAdd] = useState<string | null>(null)
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { watchlist, activity, meta } = data

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

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

  // Close search dropdown
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false)
  }, [])

  // Open search dropdown
  const openSearch = useCallback(() => {
    if (searchQuery) {
      setIsSearchOpen(true)
    }
  }, [searchQuery])

  // Check if ticker is already in watchlist
  const isInWatchlist = useCallback(
    (ticker: string) => watchlist.some((item) => item.company.ticker === ticker),
    [watchlist]
  )

  // Optimistic add to watchlist
  const handleAdd = useCallback(
    async (ticker: string) => {
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
          // Use the descriptive message from API if available
          const errorMessage = result.message || result.error || 'Failed to add'
          throw new Error(errorMessage)
        }

        // Add item to local state
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
    },
    [meta.isAtLimit, router]
  )

  // Show remove confirmation dialog
  const showRemoveConfirm = useCallback((itemId: string) => {
    setRemoveConfirmId(itemId)
  }, [])

  // Cancel remove confirmation
  const cancelRemoveConfirm = useCallback(() => {
    setRemoveConfirmId(null)
  }, [])

  // Confirm and execute remove
  const confirmRemove = useCallback(async () => {
    if (!removeConfirmId) return

    const itemId = removeConfirmId
    setRemoveConfirmId(null)
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
  }, [removeConfirmId, watchlist, router])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Data
    watchlist,
    activity,
    meta,
    // Search state
    searchQuery,
    searchResults,
    isSearching,
    isSearchOpen,
    // Pending states
    pendingAdd,
    pendingRemove,
    removeConfirmId,
    // Error state
    error,
    // Actions
    handleSearch,
    closeSearch,
    openSearch,
    isInWatchlist,
    handleAdd,
    showRemoveConfirm,
    cancelRemoveConfirm,
    confirmRemove,
    clearError,
  }
}
