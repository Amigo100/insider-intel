import {
  Skeleton,
  SkeletonTabs,
  SkeletonFilterBar,
  SkeletonDashboardCard,
} from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Institutions Loading Skeleton
 *
 * Matches the institutions page structure:
 * - Header
 * - Tabs navigation
 * - Filter bar
 * - 8 table rows
 *
 * NO SPINNERS - uses shimmer animation exclusively
 */
export default function InstitutionsLoading() {
  return (
    <div className="space-y-6" aria-label="Loading institutions" role="status">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Tabs Navigation */}
      <SkeletonTabs count={5} />

      {/* Filter Bar */}
      <SkeletonFilterBar filters={3} />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Table */}
      <div
        className={cn(
          'rounded-lg overflow-hidden',
          'bg-[hsl(var(--bg-card))]',
          'border border-[hsl(var(--border-default))]'
        )}
      >
        <div className="overflow-hidden">
          {/* Table Header */}
          <div
            className={cn(
              'flex items-center gap-4 px-5 py-3',
              'border-b border-[hsl(var(--border-subtle))]',
              'bg-[hsl(var(--bg-elevated)/0.3)]'
            )}
          >
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24 ml-auto" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Table Body - 8 rows */}
          <div className="divide-y divide-[hsl(var(--border-subtle))]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                {/* Institution */}
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                  <div className="space-y-1 min-w-0">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>

                {/* Type Badge */}
                <Skeleton className="h-5 w-20 rounded" />

                {/* Value */}
                <Skeleton className="h-4 w-24 ml-auto" />

                {/* Shares */}
                <Skeleton className="h-4 w-20" />

                {/* Change */}
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading institutional holdings...</span>
    </div>
  )
}
