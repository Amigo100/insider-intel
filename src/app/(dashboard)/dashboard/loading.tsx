import {
  Skeleton,
  SkeletonStatCard,
  SkeletonChart,
  SkeletonDashboardCard,
  SkeletonTableRow,
  SkeletonActivityItem,
} from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Dashboard Loading Skeleton
 *
 * Matches the dashboard page structure:
 * - 4 metric cards (grid)
 * - 2-column content grid (chart + clusters)
 * - 5 table rows
 *
 * NO SPINNERS - uses shimmer animation exclusively
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard" role="status">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* 2-Column Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart Card - 2/3 width */}
        <SkeletonDashboardCard className="lg:col-span-2">
          <div className="p-5">
            <SkeletonChart height={280} />
          </div>
        </SkeletonDashboardCard>

        {/* Cluster Alerts - 1/3 width */}
        <SkeletonDashboardCard>
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-md p-3',
                  'bg-[hsl(var(--bg-elevated)/0.3)]'
                )}
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-5 w-16 rounded" />
                      <Skeleton className="h-5 w-16 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SkeletonDashboardCard>
      </div>

      {/* Recent Transactions Table */}
      <SkeletonDashboardCard>
        <div className="overflow-hidden">
          {/* Table Header */}
          <div
            className={cn(
              'flex items-center gap-4 px-5 py-3',
              'border-b border-[hsl(var(--border-subtle))]'
            )}
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-3 w-20" />
          </div>

          {/* Table Body - 5 rows */}
          <div className="divide-y divide-[hsl(var(--border-subtle))]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-12 rounded" />
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </SkeletonDashboardCard>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading dashboard content...</span>
    </div>
  )
}
