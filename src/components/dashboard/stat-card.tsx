'use client'

import { type LucideIcon, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { CardElevated, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label?: string
  }
  icon?: LucideIcon
  iconColor?: string
  className?: string
}

/**
 * StatCard - Dashboard summary numbers with optional change indicator
 *
 * Uses the standardized CardElevated component for consistent styling:
 * 12px radius, subtle border, cyan glow on hover with lift effect.
 *
 * Color independence: Change indicators use icon + text + color for accessibility
 */
export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-slate-300',
  className,
}: StatCardProps) {
  const formatChange = (changeValue: number) => {
    const prefix = changeValue > 0 ? '+' : ''
    return `${prefix}${changeValue.toLocaleString()}`
  }

  // Get change icon and color
  const getChangeStyles = (val: number) => {
    if (val > 0) {
      return {
        color: 'text-emerald-400',
        Icon: TrendingUp,
        ariaLabel: `Increased by ${Math.abs(val).toLocaleString()}`,
      }
    }
    if (val < 0) {
      return {
        color: 'text-red-400',
        Icon: TrendingDown,
        ariaLabel: `Decreased by ${Math.abs(val).toLocaleString()}`,
      }
    }
    return {
      color: 'text-slate-400',
      Icon: ArrowRight,
      ariaLabel: 'No change',
    }
  }

  const changeStyles = change ? getChangeStyles(change.value) : null

  return (
    <CardElevated className={cn('p-0', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-300">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change && changeStyles && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  changeStyles.color
                )}
                role="status"
                aria-label={`${changeStyles.ariaLabel}${change.label ? ` ${change.label}` : ''}`}
              >
                <changeStyles.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{formatChange(change.value)}</span>
                {change.label && (
                  <span className="text-slate-400">{change.label}</span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                'rounded-full bg-slate-700/50 p-2.5',
                iconColor
              )}
            >
              <Icon className="h-5 w-5 text-slate-300" />
            </div>
          )}
        </div>
      </CardContent>
    </CardElevated>
  )
}

/**
 * Compact stat for inline displays
 * Color independence: Change indicators use icon + text + color
 */
export function StatInline({
  label,
  value,
  change,
  className,
}: {
  label: string
  value: string | number
  change?: number
  className?: string
}) {
  // Get change icon and color
  const getChangeStyles = (val: number) => {
    if (val > 0) {
      return {
        color: 'text-emerald-400',
        Icon: TrendingUp,
      }
    }
    if (val < 0) {
      return {
        color: 'text-red-400',
        Icon: TrendingDown,
      }
    }
    return {
      color: 'text-slate-400',
      Icon: ArrowRight,
    }
  }

  const changeStyles = change !== undefined ? getChangeStyles(change) : null

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className="text-sm text-slate-300">{label}:</span>
      <span className="font-semibold text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      {change !== undefined && changeStyles && (
        <span
          className={cn(
            'inline-flex items-center gap-0.5 text-xs font-medium',
            changeStyles.color
          )}
        >
          <changeStyles.Icon className="h-3 w-3" aria-hidden="true" />
          ({change > 0 ? '+' : ''}{change.toLocaleString()})
        </span>
      )}
    </div>
  )
}
