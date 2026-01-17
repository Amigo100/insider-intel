import {
  Skeleton,
  SkeletonStatCard,
  SkeletonChart,
  SkeletonDashboardCard,
} from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Root Dashboard Layout Loading Skeleton
 *
 * Generic skeleton that works for any dashboard page:
 * - Header
 * - 4 stat cards
 * - Chart area
 * - 2-column content grid
 *
 * NO SPINNERS - uses shimmer animation exclusively
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading" role="status">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats Cards Grid - 4 cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Chart Area */}
      <SkeletonDashboardCard>
        <div className="p-5">
          <SkeletonChart height={280} />
        </div>
      </SkeletonDashboardCard>

      {/* 2-Column Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - List */}
        <SkeletonDashboardCard>
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3 p-3',
                  'rounded-md',
                  'bg-[hsl(var(--bg-elevated)/0.3)]'
                )}
              >
                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonDashboardCard>

        {/* Right Column - List */}
        <SkeletonDashboardCard>
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center justify-between p-3',
                  'rounded-md',
                  'bg-[hsl(var(--bg-elevated)/0.3)]'
                )}
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            ))}
          </div>
        </SkeletonDashboardCard>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading content...</span>
    </div>
  )
}
