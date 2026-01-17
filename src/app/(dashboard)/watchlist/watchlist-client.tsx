'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Star,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useWatchlist,
  WatchlistGrid,
  WatchlistActivityFeed,
  WatchlistEmptyState,
  RemoveConfirmationDialog,
  type WatchlistData,
} from '@/components/dashboard/watchlist'

/**
 * WatchlistClient - Main client component for watchlist page
 *
 * Refactored from 686 lines to use modular components (UI_AUDIT #146)
 */

interface WatchlistClientProps {
  initialData: WatchlistData
}

const POPULAR_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL']

export function WatchlistClient({ initialData }: WatchlistClientProps) {
  const searchRef = useRef<HTMLDivElement>(null)

  const {
    watchlist,
    activity,
    meta,
    searchQuery,
    searchResults,
    isSearching,
    isSearchOpen,
    pendingAdd,
    pendingRemove,
    removeConfirmId,
    error,
    handleSearch,
    closeSearch,
    openSearch,
    isInWatchlist,
    handleAdd,
    showRemoveConfirm,
    cancelRemoveConfirm,
    confirmRemove,
    clearError,
  } = useWatchlist(initialData)

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        closeSearch()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeSearch])

  // Find the item being confirmed for removal
  const removeConfirmItem = removeConfirmId
    ? watchlist.find((item) => item.id === removeConfirmId) || null
    : null

  return (
    <>
      {/* Error Toast */}
      {error && (
        <div
          role="alert"
          className={cn(
            'fixed bottom-4 right-4 z-50',
            'flex items-center gap-2',
            'rounded-lg px-4 py-3',
            'bg-[hsl(var(--signal-negative)/0.15)]',
            'border border-[hsl(var(--signal-negative)/0.3)]',
            'text-sm text-[hsl(var(--signal-negative))]',
            'shadow-lg'
          )}
        >
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <span>{error}</span>
          <button
            onClick={clearError}
            aria-label="Dismiss error"
            className={cn(
              'ml-2 flex h-7 w-7 items-center justify-center',
              'rounded',
              'hover:bg-[hsl(var(--signal-negative)/0.2)]',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[hsl(var(--accent-amber))]'
            )}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      <RemoveConfirmationDialog
        item={removeConfirmItem}
        onConfirm={confirmRemove}
        onCancel={cancelRemoveConfirm}
      />

      {/* Add Stock Search Card */}
      <div
        className={cn(
          'rounded-lg overflow-hidden',
          'bg-[hsl(var(--bg-card))]',
          'border border-[hsl(var(--border-default))]'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2 px-5 py-4',
            'border-b border-[hsl(var(--border-subtle))]'
          )}
        >
          <Star
            className="h-4 w-4 text-[hsl(var(--accent-amber))]"
            aria-hidden="true"
          />
          <h2
            className={cn(
              'text-base font-semibold',
              'text-[hsl(var(--text-primary))]'
            )}
          >
            Add Stock
          </h2>
        </div>
        <div className="p-4">
          <div ref={searchRef} className="relative">
            <div className="relative">
              <Search
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2',
                  'h-4 w-4',
                  'text-[hsl(var(--text-muted))]'
                )}
                aria-hidden="true"
              />
              <Input
                placeholder={
                  meta.isAtLimit
                    ? 'Upgrade to add more stocks...'
                    : 'Search by ticker or company name...'
                }
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={openSearch}
                disabled={meta.isAtLimit}
                aria-label="Search for stocks to add"
                className={cn(
                  'h-10 pl-10 pr-10',
                  'bg-[hsl(var(--bg-app))]',
                  'border-[hsl(var(--border-default))]',
                  'text-[hsl(var(--text-primary))]',
                  'placeholder:text-[hsl(var(--text-muted))]',
                  'focus-visible:ring-[hsl(var(--accent-amber))]'
                )}
              />
              {isSearching ? (
                <Loader2
                  className={cn(
                    'absolute right-3 top-1/2 -translate-y-1/2',
                    'h-4 w-4 animate-spin',
                    'text-[hsl(var(--text-muted))]'
                  )}
                  aria-hidden="true"
                />
              ) : searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearch('')}
                  aria-label="Clear search"
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

            {/* Search Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div
                className={cn(
                  'absolute top-full left-0 right-0 z-50 mt-1',
                  'max-h-64 overflow-auto',
                  'rounded-lg p-1',
                  'bg-[hsl(var(--bg-elevated))]',
                  'border border-[hsl(var(--border-default))]',
                  'shadow-lg'
                )}
              >
                {searchResults.map((result) => {
                  const alreadyAdded = isInWatchlist(result.ticker)
                  const isAdding = pendingAdd === result.ticker

                  return (
                    <button
                      key={result.ticker}
                      onClick={() => !alreadyAdded && handleAdd(result.ticker)}
                      disabled={alreadyAdded || isAdding}
                      className={cn(
                        'flex w-full items-center justify-between',
                        'rounded-md px-3 py-2',
                        'text-left text-sm',
                        alreadyAdded
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:bg-[hsl(var(--bg-hover))]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'font-mono font-semibold',
                            'text-[hsl(var(--text-primary))]'
                          )}
                        >
                          {result.ticker}
                        </span>
                        <span
                          className={cn(
                            'truncate max-w-[200px]',
                            'text-[hsl(var(--text-muted))]'
                          )}
                        >
                          {result.name}
                        </span>
                        {result.has_recent_activity && (
                          <span
                            className={cn(
                              'px-1.5 py-0.5 text-xs font-medium rounded',
                              'bg-[hsl(var(--signal-positive)/0.15)]',
                              'text-[hsl(var(--signal-positive))]'
                            )}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      {alreadyAdded ? (
                        <span
                          className={cn(
                            'px-1.5 py-0.5 text-xs font-medium rounded',
                            'bg-[hsl(var(--bg-elevated))]',
                            'text-[hsl(var(--text-muted))]'
                          )}
                        >
                          Added
                        </span>
                      ) : isAdding ? (
                        <Loader2
                          className="h-4 w-4 animate-spin text-[hsl(var(--accent-amber))]"
                          aria-hidden="true"
                        />
                      ) : (
                        <Plus
                          className="h-4 w-4 text-[hsl(var(--text-muted))]"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* No results */}
            {isSearchOpen &&
              searchQuery &&
              !isSearching &&
              searchResults.length === 0 && (
                <div
                  className={cn(
                    'absolute top-full left-0 right-0 z-50 mt-1',
                    'rounded-lg p-4',
                    'bg-[hsl(var(--bg-elevated))]',
                    'border border-[hsl(var(--border-default))]',
                    'shadow-lg'
                  )}
                >
                  <p className="text-sm text-center text-[hsl(var(--text-muted))]">
                    No companies found for &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}
          </div>

          {/* Popular suggestions */}
          {!meta.isAtLimit && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[hsl(var(--text-muted))]">
                Popular:
              </span>
              {POPULAR_TICKERS.map((ticker) => {
                const alreadyAdded = isInWatchlist(ticker)
                const isAdding = pendingAdd === ticker

                return (
                  <button
                    key={ticker}
                    onClick={() => !alreadyAdded && handleAdd(ticker)}
                    disabled={alreadyAdded || isAdding}
                    aria-label={
                      alreadyAdded
                        ? `${ticker} already in watchlist`
                        : `Add ${ticker} to watchlist`
                    }
                    className={cn(
                      'min-h-[36px] px-3 py-1.5',
                      'text-xs font-semibold',
                      'rounded-md border',
                      'transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-[hsl(var(--accent-amber))]',
                      alreadyAdded
                        ? [
                            'bg-[hsl(var(--bg-elevated))]',
                            'border-[hsl(var(--border-subtle))]',
                            'text-[hsl(var(--text-muted))]',
                            'cursor-not-allowed opacity-50',
                          ]
                        : [
                            'bg-[hsl(var(--bg-elevated))]',
                            'border-[hsl(var(--border-default))]',
                            'text-[hsl(var(--text-secondary))]',
                            'hover:border-[hsl(var(--accent-amber)/0.5)]',
                            'hover:text-[hsl(var(--accent-amber))]',
                            'hover:bg-[hsl(var(--accent-amber)/0.1)]',
                            'active:scale-95',
                          ]
                    )}
                  >
                    {isAdding ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                    ) : (
                      ticker
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* At limit message */}
          {meta.isAtLimit && (
            <p className="mt-3 text-sm text-[hsl(var(--text-muted))]">
              You&apos;ve reached the {meta.tier} tier limit of {meta.limit}{' '}
              stocks.{' '}
              <Link
                href="/settings/billing"
                className={cn(
                  'text-[hsl(var(--accent-amber))]',
                  'hover:underline'
                )}
              >
                Upgrade your plan
              </Link>{' '}
              to track more.
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      {watchlist.length === 0 ? (
        <WatchlistEmptyState
          popularTickers={POPULAR_TICKERS}
          isInWatchlist={isInWatchlist}
          pendingAdd={pendingAdd}
          onAdd={handleAdd}
        />
      ) : (
        <>
          {/* Watchlist Grid */}
          <WatchlistGrid
            items={watchlist}
            pendingRemove={pendingRemove}
            onRemove={showRemoveConfirm}
          />

          {/* Activity Feed */}
          <WatchlistActivityFeed activity={activity} />
        </>
      )}
    </>
  )
}
