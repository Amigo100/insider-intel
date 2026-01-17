import {
  Skeleton,
  SkeletonWatchlistCard,
  SkeletonDashboardCard,
  SkeletonActivityItem,
} from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Watchlist Loading Skeleton
 *
 * Matches the watchlist page structure:
 * - Header with count and Add button
 * - Search card
 * - 6 watchlist cards (3-column grid)
 * - Activity feed (3 items)
 *
 * NO SPINNERS - uses shimmer animation exclusively
 */
export default function WatchlistLoading() {
  return (
    <div className="space-y-6" aria-label="Loading watchlist" role="status">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Add Stock Search Card */}
      <SkeletonDashboardCard>
        <div className="p-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Skeleton className="h-3 w-14" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-14 rounded-md" />
            ))}
          </div>
        </div>
      </SkeletonDashboardCard>

      {/* Watchlist Cards Grid - 6 cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonWatchlistCard key={i} />
        ))}
      </div>

      {/* Activity Feed */}
      <SkeletonDashboardCard>
        <div className="p-4">
          {/* Date Header */}
          <div className="mb-3">
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Activity Items - 3 items */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonActivityItem key={i} />
            ))}
          </div>
        </div>
      </SkeletonDashboardCard>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading your watchlist...</span>
    </div>
  )
}
