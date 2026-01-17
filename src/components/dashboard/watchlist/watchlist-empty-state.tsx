'use client'

import { Star, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/**
 * WatchlistEmptyState - Empty state for watchlist
 *
 * Features:
 * - Star icon (64px)
 * - "Your watchlist is empty"
 * - "Add stocks to track insider activity"
 * - "+ Add Your First Stock" button
 * - Popular suggestions: AAPL, MSFT, NVDA, TSLA, GOOGL
 */

interface WatchlistEmptyStateProps {
  popularTickers: string[]
  isInWatchlist: (ticker: string) => boolean
  pendingAdd: string | null
  onAdd: (ticker: string) => void
  className?: string
}

export function WatchlistEmptyState({
  popularTickers,
  isInWatchlist,
  pendingAdd,
  onAdd,
  className,
}: WatchlistEmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-lg p-8 text-center',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]',
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'mx-auto flex h-16 w-16 items-center justify-center',
          'rounded-full',
          'bg-[hsl(var(--accent-amber)/0.15)]'
        )}
      >
        <Star
          className="h-8 w-8 text-[hsl(var(--accent-amber))]"
          aria-hidden="true"
        />
      </div>

      {/* Text */}
      <h3
        className={cn(
          'mt-4 text-lg font-semibold',
          'text-[hsl(var(--text-primary))]'
        )}
      >
        Your watchlist is empty
      </h3>
      <p
        className={cn(
          'mt-1 text-sm',
          'text-[hsl(var(--text-muted))]'
        )}
      >
        Add stocks to track insider activity and get personalized alerts
      </p>

      {/* Popular suggestions */}
      <div className="mt-6">
        <p
          className={cn(
            'text-xs font-medium uppercase tracking-wider',
            'text-[hsl(var(--text-muted))]'
          )}
        >
          Popular stocks to watch
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {popularTickers.map((ticker) => {
            const alreadyAdded = isInWatchlist(ticker)
            const isAdding = pendingAdd === ticker

            return (
              <Button
                key={ticker}
                variant="outline"
                size="sm"
                onClick={() => !alreadyAdded && onAdd(ticker)}
                disabled={alreadyAdded || isAdding}
                className={cn(
                  'h-9 gap-1.5',
                  'border-[hsl(var(--border-default))]',
                  'text-[hsl(var(--text-secondary))]',
                  !alreadyAdded && [
                    'hover:border-[hsl(var(--accent-amber)/0.5)]',
                    'hover:text-[hsl(var(--accent-amber))]',
                    'hover:bg-[hsl(var(--accent-amber)/0.1)]',
                  ],
                  alreadyAdded && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isAdding ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {ticker}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default WatchlistEmptyState
