export default function InsiderTradesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-9 w-64 bg-slate-700/50 rounded" />
        <div className="mt-2 h-5 w-96 bg-slate-700/50 rounded" />
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-slate-700/50" />
          <div className="h-4 w-48 bg-slate-700/50 rounded" />
        </div>
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-slate-700/50 p-4 flex flex-col justify-between"
          >
            <div className="h-3 w-20 bg-slate-600/50 rounded" />
            <div className="h-8 w-16 bg-slate-600/50 rounded" />
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-col gap-4 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 sm:flex-row sm:items-center">
        <div className="h-10 w-24 bg-slate-700/50 rounded" />
        <div className="h-10 w-24 bg-slate-700/50 rounded" />
        <div className="h-10 w-24 bg-slate-700/50 rounded" />
        <div className="h-10 w-24 bg-slate-700/50 rounded" />
        <div className="h-10 flex-1 bg-slate-700/50 rounded" />
      </div>

      {/* Results Summary Skeleton */}
      <div className="h-5 w-48 bg-slate-700/50 rounded" />

      {/* Table Skeleton */}
      <div className="rounded-md border border-slate-700/50">
        {/* Table Header */}
        <div className="border-b border-slate-700/50 p-4">
          <div className="flex items-center gap-6">
            <div className="h-4 w-16 bg-slate-700/50 rounded" />
            <div className="h-4 w-24 bg-slate-700/50 rounded" />
            <div className="h-4 w-20 bg-slate-700/50 rounded" />
            <div className="h-4 w-12 bg-slate-700/50 rounded" />
            <div className="h-4 w-16 bg-slate-700/50 rounded ml-auto" />
            <div className="h-4 w-20 bg-slate-700/50 rounded" />
            <div className="h-4 w-24 bg-slate-700/50 rounded" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              {/* Date */}
              <div className="h-4 w-20 bg-slate-700/50 rounded" />
              {/* Company with ticker */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-700/50" />
                <div>
                  <div className="h-4 w-16 bg-slate-700/50 rounded" />
                  <div className="mt-1 h-3 w-32 bg-slate-700/50 rounded" />
                </div>
              </div>
              {/* Insider */}
              <div>
                <div className="h-4 w-28 bg-slate-700/50 rounded" />
                <div className="mt-1 h-3 w-20 bg-slate-700/50 rounded" />
              </div>
              {/* Type Badge */}
              <div className="h-6 w-16 rounded-full bg-slate-700/50" />
              {/* Shares */}
              <div className="h-4 w-16 bg-slate-700/50 rounded ml-auto" />
              {/* Value */}
              <div className="h-4 w-20 bg-slate-700/50 rounded" />
              {/* Significance */}
              <div className="h-4 w-24 bg-slate-700/50 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Load More Button Skeleton */}
      <div className="flex justify-center">
        <div className="h-10 w-28 bg-slate-700/50 rounded" />
      </div>
    </div>
  )
}
