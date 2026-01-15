import { Skeleton } from '@/components/ui/skeleton'

export default function InsiderTradesLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-20" />
      </div>

      {/* Results Summary Skeleton */}
      <Skeleton className="h-5 w-48" />

      {/* Table Skeleton */}
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
          {Array.from({ length: 10 }).map((_, i) => (
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

      {/* Load More Button Skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
}
