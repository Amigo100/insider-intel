import { cn } from '@/lib/utils'

/**
 * Skeleton Component - Modernized Bloomberg Design System
 *
 * IMPORTANT: NO SPINNERS EVER. Use skeleton screens exclusively.
 *
 * Uses shimmer animation with gradient background:
 * - Animates from right to left
 * - 1.5s duration, infinite loop
 * - Uses theme-aware background colors
 *
 * Variants:
 * - Skeleton: Base component for custom sizes
 * - SkeletonText: For text content (14px height)
 * - SkeletonHeading: For headings (24px height)
 * - SkeletonAvatar: For avatars (40x40, circular)
 * - SkeletonButton: For buttons (36px height)
 * - SkeletonCard: For cards (120px height)
 * - SkeletonTableRow: For table rows (52px or 36px compact)
 * - SkeletonChart: For charts (200px height)
 */

// Base skeleton styles with shimmer animation
const skeletonBaseStyles = [
  // Shimmer gradient background
  'bg-gradient-to-r',
  'from-[hsl(var(--bg-hover))]',
  'via-[hsl(var(--bg-elevated))]',
  'to-[hsl(var(--bg-hover))]',
  'bg-[length:200%_100%]',
  // Animation
  'animate-shimmer',
  // Base appearance
  'rounded-[4px]',
].join(' ')

/**
 * Base Skeleton - Use for custom sizes
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(skeletonBaseStyles, className)}
      aria-hidden="true"
      {...props}
    />
  )
}

/**
 * SkeletonText - For text content
 * Height: 14px, Width: varies (default 100%)
 */
function SkeletonText({
  className,
  width = '100%',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  width?: '60%' | '80%' | '100%' | string
}) {
  return (
    <div
      className={cn(skeletonBaseStyles, 'h-3.5', className)}
      style={{ width }}
      aria-hidden="true"
      {...props}
    />
  )
}

/**
 * SkeletonHeading - For headings
 * Height: 24px, Width: 50% default
 */
function SkeletonHeading({
  className,
  width = '50%',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  width?: string
}) {
  return (
    <div
      className={cn(skeletonBaseStyles, 'h-6', className)}
      style={{ width }}
      aria-hidden="true"
      {...props}
    />
  )
}

/**
 * SkeletonAvatar - For avatars
 * Size: 40x40, circular
 */
function SkeletonAvatar({
  className,
  size = 40,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  size?: number
}) {
  return (
    <div
      className={cn(skeletonBaseStyles, 'rounded-full shrink-0', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
      {...props}
    />
  )
}

/**
 * SkeletonButton - For buttons
 * Height: 36px, Width: 100px default
 */
function SkeletonButton({
  className,
  width = 100,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  width?: number | string
}) {
  return (
    <div
      className={cn(skeletonBaseStyles, 'h-9 rounded-[6px]', className)}
      style={{ width }}
      aria-hidden="true"
      {...props}
    />
  )
}

/**
 * SkeletonCard - For cards
 * Height: 120px default, full width
 */
function SkeletonCard({
  className,
  height = 120,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  height?: number
}) {
  return (
    <div
      className={cn(skeletonBaseStyles, 'w-full rounded-lg', className)}
      style={{ height }}
      aria-hidden="true"
      {...props}
    />
  )
}

/**
 * SkeletonTableRow - For table rows
 * Height: 52px (comfortable) or 36px (compact)
 */
function SkeletonTableRow({
  className,
  compact = false,
  columns = 4,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  compact?: boolean
  columns?: number
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4',
        compact ? 'h-9' : 'h-[52px]',
        className
      )}
      aria-hidden="true"
      {...props}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className={cn(
            skeletonBaseStyles,
            'h-4 flex-1',
            // First column slightly wider
            i === 0 && 'max-w-[150px]',
            // Last column slightly narrower
            i === columns - 1 && 'max-w-[80px]'
          )}
        />
      ))}
    </div>
  )
}

/**
 * SkeletonChart - For charts
 * Height: 200px default, full width
 */
function SkeletonChart({
  className,
  height = 200,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  height?: number
}) {
  return (
    <div
      className={cn(
        'w-full rounded-lg overflow-hidden relative',
        className
      )}
      style={{ height }}
      aria-hidden="true"
      {...props}
    >
      {/* Chart area */}
      <div className={cn(skeletonBaseStyles, 'absolute inset-0')} />
      {/* Fake bars for visual interest */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end gap-2 h-2/3">
        {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75].map((h, i) => (
          <div
            key={i}
            className={cn(
              skeletonBaseStyles,
              'flex-1 opacity-50'
            )}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * SkeletonParagraph - Multiple lines of text
 */
function SkeletonParagraph({
  className,
  lines = 3,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  lines?: number
}) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonText
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  )
}

/**
 * SkeletonStatCard - For stat cards on dashboard
 * Matches MetricCard / StatCard layout
 */
function SkeletonStatCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]',
        'p-5',
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * SkeletonMetricCard - For metric cards (4 per row)
 */
function SkeletonMetricCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]',
        'p-4',
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  )
}

/**
 * SkeletonTabs - For tab navigation
 */
function SkeletonTabs({
  className,
  count = 3,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  count?: number
}) {
  return (
    <div
      className={cn(
        'flex gap-1 pb-2',
        'border-b border-[hsl(var(--border-default))]',
        className
      )}
      aria-hidden="true"
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-10 rounded-md',
            i === 0 ? 'w-28' : i === 1 ? 'w-32' : 'w-36'
          )}
        />
      ))}
    </div>
  )
}

/**
 * SkeletonFilterBar - For filter controls
 */
function SkeletonFilterBar({
  className,
  filters = 4,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  filters?: number
}) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]',
        'p-4',
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-4 w-4 rounded" />
        {Array.from({ length: filters }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-[120px] rounded-md" />
        ))}
        <Skeleton className="h-9 flex-1 min-w-[200px] rounded-md" />
      </div>
    </div>
  )
}

/**
 * SkeletonTableHeader - For table headers
 */
function SkeletonTableHeader({
  className,
  columns = 5,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  columns?: number
}) {
  const widths = ['w-20', 'w-28', 'w-24', 'w-16', 'w-20', 'w-24', 'w-16']
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-5 py-3',
        'border-b border-[hsl(var(--border-subtle))]',
        className
      )}
      aria-hidden="true"
      {...props}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', widths[i % widths.length])} />
      ))}
    </div>
  )
}

/**
 * SkeletonTableBody - For table body with rows
 */
function SkeletonTableBody({
  className,
  rows = 5,
  columns = 5,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  rows?: number
  columns?: number
}) {
  return (
    <div className={cn('divide-y divide-[hsl(var(--border-subtle))]', className)} aria-hidden="true" {...props}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} />
      ))}
    </div>
  )
}

/**
 * SkeletonDashboardCard - Card with header and content area
 */
function SkeletonDashboardCard({
  className,
  title,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: boolean | undefined
}) {
  const showTitle = title !== false
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]',
        className
      )}
      aria-hidden="true"
      {...props}
    >
      {showTitle && (
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[hsl(var(--border-subtle))]">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
      )}
      {children}
    </div>
  )
}

/**
 * SkeletonActivityItem - For activity feed items
 */
function SkeletonActivityItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3',
        'rounded-md',
        'bg-[hsl(var(--bg-elevated)/0.3)]',
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-5 w-14 rounded" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="text-right shrink-0 space-y-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}

/**
 * SkeletonWatchlistCard - For watchlist grid cards
 */
function SkeletonWatchlistCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]',
        'p-4',
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-16 rounded" />
      </div>
      <Skeleton className="h-12 w-full rounded mb-3" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-14 rounded" />
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonHeading,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonChart,
  SkeletonParagraph,
  SkeletonStatCard,
  SkeletonMetricCard,
  SkeletonTabs,
  SkeletonFilterBar,
  SkeletonTableHeader,
  SkeletonTableBody,
  SkeletonDashboardCard,
  SkeletonActivityItem,
  SkeletonWatchlistCard,
  skeletonBaseStyles,
}
