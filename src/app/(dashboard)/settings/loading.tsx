import { Skeleton, SkeletonDashboardCard } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Settings Loading Skeleton
 *
 * Matches the settings page structure:
 * - Header
 * - Side navigation
 * - Form fields
 *
 * NO SPINNERS - uses shimmer animation exclusively
 */
export default function SettingsLoading() {
  return (
    <div className="space-y-6" aria-label="Loading settings" role="status">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Side Navigation */}
        <aside className="lg:w-48 shrink-0">
          <nav className="flex flex-row gap-2 lg:flex-col">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-2 px-3 py-2',
                  'rounded-md',
                  i === 0 && 'bg-[hsl(var(--bg-elevated)/0.5)]'
                )}
              >
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <SkeletonDashboardCard>
            <div className="p-6 space-y-6">
              {/* Section Header */}
              <div className="space-y-1.5 pb-4 border-b border-[hsl(var(--border-subtle))]">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-64" />
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                {/* Field 1 */}
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-3 w-48" />
                </div>

                {/* Field 2 */}
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>

                {/* Field 3 - Textarea */}
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-24 w-full rounded-md" />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[hsl(var(--border-subtle))] pt-6">
                {/* Toggle Fields */}
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 flex justify-end">
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
            </div>
          </SkeletonDashboardCard>
        </main>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading settings...</span>
    </div>
  )
}
