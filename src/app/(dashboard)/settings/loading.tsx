import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Navigation Skeleton */}
        <aside className="lg:w-48">
          <nav className="flex flex-row gap-2 lg:flex-col">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </nav>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form Fields Skeleton */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))}

              {/* Save Button Skeleton */}
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
