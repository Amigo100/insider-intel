import {
  Skeleton,
  SkeletonFilterBar,
  SkeletonDashboardCard,
  SkeletonStatCard,
} from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Insider Trades Loading Skeleton
 *
 * Matches the insider trades page structure:
 * - Header
 * - 4 stat cards
 * - Filter bar
 * - Results summary
 * - 10 table rows
 *
 * NO SPINNERS - uses shimmer animation exclusively
 */
export default function InsiderTradesLoading() {
  return (
    <div className="space-y-6" aria-label="Loading insider trades" role="status">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats Row - 4 cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Filter Bar */}
      <SkeletonFilterBar filters={4} />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Table */}
      <SkeletonDashboardCard title={false}>
        <div className="overflow-hidden">
          {/* Table Header */}
          <div
            className={cn(
              'flex items-center gap-4 px-5 py-3',
              'border-b border-[hsl(var(--border-subtle))]',
              'bg-[hsl(var(--bg-elevated)/0.3)]'
            )}
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Table Body - 10 rows */}
          <div className="divide-y divide-[hsl(var(--border-subtle))]">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                {/* Date */}
                <Skeleton className="h-4 w-20" />

                {/* Company */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>

                {/* Insider */}
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>

                {/* Type Badge */}
                <Skeleton className="h-5 w-14 rounded" />

                {/* Shares */}
                <Skeleton className="h-4 w-16 ml-auto" />

                {/* Value */}
                <Skeleton className="h-4 w-20" />

                {/* Significance */}
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </SkeletonDashboardCard>

      {/* Load More Button */}
      <div className="flex justify-center">
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading insider trades...</span>
    </div>
  )
}
