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
 * Score ranges:
 * - < 0.3: Gray (Low - routine transaction)
 * - 0.3 - 0.6: Yellow (Medium - notable)
 * - 0.6 - 0.8: Orange (High - significant)
 * - > 0.8: Red (Very High - highly significant)
 */
export function SignificanceBadge({
  score,
  showLabel = false,
  className,
}: SignificanceBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        {showLabel && (
          <span className="text-xs text-muted-foreground">N/A</span>
        )}
      </div>
    )
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

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className={cn('h-2.5 w-2.5 rounded-full', getColorClass())} />
      {showLabel && (
        <span className={cn('text-xs font-medium', getTextColorClass())}>
          {getLabel()}
        </span>
      )}
    </div>
  )
}

/**
 * Larger version for detail views
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
          'flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5',
          className
        )}
      >
        <span className="h-3 w-3 rounded-full bg-gray-300" />
        <span className="text-sm text-muted-foreground">Not analyzed</span>
      </div>
    )
  }

  const getConfig = () => {
    if (score < 0.3)
      return {
        bgClass: 'bg-gray-100',
        dotClass: 'bg-gray-400',
        textClass: 'text-gray-600',
        label: 'Low Significance',
      }
    if (score < 0.6)
      return {
        bgClass: 'bg-yellow-50',
        dotClass: 'bg-yellow-500',
        textClass: 'text-yellow-700',
        label: 'Notable',
      }
    if (score < 0.8)
      return {
        bgClass: 'bg-orange-50',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-700',
        label: 'Significant',
      }
    return {
      bgClass: 'bg-red-50',
      dotClass: 'bg-red-500',
      textClass: 'text-red-700',
      label: 'Highly Significant',
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
    >
      <span className={cn('h-3 w-3 rounded-full', config.dotClass)} />
      <span className={cn('text-sm font-medium', config.textClass)}>
        {config.label}
      </span>
    </div>
  )
}
