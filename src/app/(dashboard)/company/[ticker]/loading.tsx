import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard, CardContent, CardHeader } from '@/components/ui/card'

export default function CompanyLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-5 w-24 hidden sm:block" />
          </div>
          <Skeleton className="mt-2 h-5 w-48" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-md" />

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <DashboardCard key={i}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </CardContent>
            </DashboardCard>
          ))}
        </div>

        {/* Chart Skeleton */}
        <DashboardCard>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </DashboardCard>

        {/* Table Skeleton */}
        <DashboardCard>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {/* Table Header */}
              <div className="border-b p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              {/* Table Rows */}
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <div>
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="mt-1 h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </DashboardCard>
      </div>
    </div>
  )
}
