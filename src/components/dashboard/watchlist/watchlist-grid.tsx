'use client'

import { cn } from '@/lib/utils'
import { WatchlistCard } from './watchlist-card'
import type { WatchlistItem } from './use-watchlist'

/**
 * WatchlistGrid - Responsive grid of watchlist cards
 *
 * Grid layout:
 * - 3 columns on desktop (lg)
 * - 2 columns on tablet (md)
 * - 1 column on mobile
 * - Gap: 16px
 */

interface WatchlistGridProps {
  items: WatchlistItem[]
  pendingRemove: string | null
  onRemove: (id: string) => void
  className?: string
}

export function WatchlistGrid({
  items,
  pendingRemove,
  onRemove,
  className,
}: WatchlistGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {items.map((item) => (
        <WatchlistCard
          key={item.id}
          item={item}
          isRemoving={pendingRemove === item.id}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

export default WatchlistGrid
