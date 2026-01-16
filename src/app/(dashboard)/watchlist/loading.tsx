import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard, CardContent, CardHeader } from '@/components/ui/card'

export default function WatchlistLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-32" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Add Stock Search Skeleton */}
      <DashboardCard>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </DashboardCard>

      {/* Watchlist Cards Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <DashboardCard key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="mt-2 h-4 w-32" />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </div>
            </CardContent>
          </DashboardCard>
        ))}
      </div>

      {/* Activity Feed Skeleton */}
      <DashboardCard>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0"
              >
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-10 rounded-full" />
                  </div>
                  <Skeleton className="mt-1 h-4 w-40" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="mt-1 h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </DashboardCard>
    </div>
  )
}
