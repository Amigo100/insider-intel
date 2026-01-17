import {
  Skeleton,
  SkeletonTabs,
  SkeletonChart,
  SkeletonDashboardCard,
  SkeletonMetricCard,
} from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Company Loading Skeleton
 *
 * Matches the company page structure:
 * - Back link
 * - Header (title, subtitle, watchlist button)
 * - 4 metric cards
 * - Tabs navigation
 * - Content area (chart + insiders + table)
 *
 * NO SPINNERS - uses shimmer animation exclusively
 */
export default function CompanyLoading() {
  return (
    <div className="space-y-6" aria-label="Loading company details" role="status">
      {/* Back Link */}
      <Skeleton className="h-4 w-32" />

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {/* Title: AAPL - Apple Inc. */}
          <Skeleton className="h-8 w-64" />
          {/* Subtitle: Technology · $2.89T */}
          <Skeleton className="h-4 w-48" />
        </div>
        {/* Watchlist Button */}
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Metrics Row - 4 cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonMetricCard key={i} />
        ))}
      </div>

      {/* Tabs Navigation */}
      <SkeletonTabs count={3} />

      {/* Content Area - Overview Tab */}
      <div className="space-y-6">
        {/* 2-column layout: Chart + Key Insiders */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Chart - 2/3 width */}
          <SkeletonDashboardCard className="lg:col-span-2">
            <div className="p-5">
              <SkeletonChart height={250} />
            </div>
          </SkeletonDashboardCard>

          {/* Key Insiders - 1/3 width */}
          <SkeletonDashboardCard>
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center justify-between',
                    'rounded-md p-3',
                    'bg-[hsl(var(--bg-elevated)/0.5)]'
                  )}
                >
                  <div className="min-w-0 space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="text-right shrink-0 ml-2 space-y-1">
                    <Skeleton className="h-5 w-12 rounded" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </SkeletonDashboardCard>
        </div>

        {/* Recent Transactions */}
        <SkeletonDashboardCard>
          <div className="p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-lg p-4',
                  'border border-[hsl(var(--border-subtle))]',
                  'bg-[hsl(var(--bg-elevated)/0.3)]'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-12 rounded" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-3 w-48" />
                    <div className="flex items-start gap-2 mt-3">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-3 w-full max-w-md" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonDashboardCard>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading company details...</span>
    </div>
  )
}
