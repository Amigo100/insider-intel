'use client'

import { cn } from '@/lib/utils'

interface SignificanceBadgeProps {
  score: number | null
  showLabel?: boolean
  className?: string
}

/**
 * Displays a colored indicator based on AI significance score
 *
 * Uses dots + text + color to avoid relying on color alone:
 * - < 0.3: ●○○○ Gray (Low - routine transaction)
 * - 0.3 - 0.6: ●●○○ Yellow (Medium - notable)
 * - 0.6 - 0.8: ●●●○ Orange (High - significant)
 * - > 0.8: ●●●● Red (Very High - highly significant)
 */
export function SignificanceBadge({
  score,
  showLabel = false,
  className,
}: SignificanceBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <div className={cn('flex items-center gap-1.5', className)} role="status" aria-label="Significance: Not available">
        <div className="flex items-center gap-0.5" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-gray-300" />
          ))}
        </div>
        {showLabel && (
          <span className="text-xs text-muted-foreground">N/A</span>
        )}
      </div>
    )
  }

  // Get the number of filled dots (1-4)
  const getFilledDots = () => {
    if (score < 0.3) return 1
    if (score < 0.6) return 2
    if (score < 0.8) return 3
    return 4
  }

  const getColorClass = () => {
    if (score < 0.3) return 'bg-gray-400'
    if (score < 0.6) return 'bg-yellow-500'
    if (score < 0.8) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getLabel = () => {
    if (score < 0.3) return 'Low'
    if (score < 0.6) return 'Medium'
    if (score < 0.8) return 'High'
    return 'Very High'
  }

  const getTextColorClass = () => {
    if (score < 0.3) return 'text-gray-500'
    if (score < 0.6) return 'text-yellow-600'
    if (score < 0.8) return 'text-orange-600'
    return 'text-red-600'
  }

  const label = getLabel()
  const filledDots = getFilledDots()
  const colorClass = getColorClass()

  return (
    <div className={cn('flex items-center gap-1.5', className)} role="status" aria-label={`Significance: ${label}`}>
      {/* Dot indicator - filled dots show level without relying on color alone */}
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              i < filledDots ? colorClass : 'bg-gray-300 dark:bg-gray-600'
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', getTextColorClass())}>
          {label}
        </span>
      )}
    </div>
  )
}

/**
 * Larger version for detail views
 * Uses dots + text + color for accessibility
 */
export function SignificanceIndicator({
  score,
  className,
}: {
  score: number | null
  className?: string
}) {
  if (score === null || score === undefined) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-md bg-gray-100 dark:bg-gray-800 px-3 py-1.5',
          className
        )}
        role="status"
        aria-label="Significance: Not analyzed"
      >
        <div className="flex items-center gap-0.5" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">Not analyzed</span>
      </div>
    )
  }

  const getConfig = () => {
    if (score < 0.3)
      return {
        bgClass: 'bg-gray-100 dark:bg-gray-800',
        dotClass: 'bg-gray-400',
        textClass: 'text-gray-600 dark:text-gray-400',
        label: 'Low Significance',
        filledDots: 1,
      }
    if (score < 0.6)
      return {
        bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
        dotClass: 'bg-yellow-500',
        textClass: 'text-yellow-700 dark:text-yellow-400',
        label: 'Notable',
        filledDots: 2,
      }
    if (score < 0.8)
      return {
        bgClass: 'bg-orange-50 dark:bg-orange-900/20',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-700 dark:text-orange-400',
        label: 'Significant',
        filledDots: 3,
      }
    return {
      bgClass: 'bg-red-50 dark:bg-red-900/20',
      dotClass: 'bg-red-500',
      textClass: 'text-red-700 dark:text-red-400',
      label: 'Highly Significant',
      filledDots: 4,
    }
  }

  const config = getConfig()

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-1.5',
        config.bgClass,
        className
      )}
      role="status"
      aria-label={`Significance: ${config.label}`}
    >
      {/* Dot indicator - filled dots show level without relying on color alone */}
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              'h-2 w-2 rounded-full',
              i < config.filledDots ? config.dotClass : 'bg-gray-300 dark:bg-gray-600'
            )}
          />
        ))}
      </div>
      <span className={cn('text-sm font-medium', config.textClass)}>
        {config.label}
      </span>
    </div>
  )
}
