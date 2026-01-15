import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Welcome Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-72" />
        <Skeleton className="mt-2 h-5 w-48" />
      </div>

      {/* Quick Stats Row Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notable Activity Section Skeleton */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-20" />
        </div>

        <div className="space-y-4">
          {/* Cluster Alert Skeletons */}
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-64" />
                      <div className="flex gap-2 mt-3">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* High Significance Transactions Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-12" />
                    <div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-1 h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-3 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Insider Trades Section Skeleton */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-8 w-20" />
        </div>

        <div className="rounded-md border">
          {/* Table Header */}
          <div className="border-b p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Table Rows */}
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <div>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="mt-1 h-3 w-24" />
                </div>
                <div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-1 h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Watchlist Section Skeleton */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="mt-1 h-4 w-28" />
                  </div>
                  <Skeleton className="h-2 w-2 rounded-full" />
                </div>
                <Skeleton className="mt-3 h-3 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
