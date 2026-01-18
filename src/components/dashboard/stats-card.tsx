'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, Users, Star } from 'lucide-react'

/**
 * StatCard - Modernized Bloomberg Design System
 *
 * Dashboard metrics card with:
 * - Icon in colored container
 * - Label (muted)
 * - Large value (mono font for numbers)
 * - Change indicator with trend icon
 *
 * Specifications:
 * - Padding: 20px
 * - Value font: 32px, mono, bold
 * - Label font: 11px, uppercase, tracking
 * - Icon container: 40x40, colored background
 */

// Icon mapping to avoid passing functions from server components
const iconMap = {
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Minus,
} as const

type IconName = keyof typeof iconMap

interface StatCardProps {
  /** Card label (e.g., "Insider Buys") */
  label: string
  /** Main value to display */
  value: string | number
  /** Change value (numeric) */
  change?: number
  /** Change label text (e.g., "vs last week") */
  changeLabel?: string
  /** Icon name to display (must be one of the predefined icons) */
  iconName?: IconName
  /** Icon background color (CSS variable or hex) */
  iconColor?: 'amber' | 'positive' | 'negative' | 'muted'
  /** Additional className */
  className?: string
}

/**
 * Get icon color styles based on color prop
 */
function getIconColorStyles(color: StatCardProps['iconColor']) {
  switch (color) {
    case 'amber':
      return {
        bg: 'bg-[hsl(var(--accent-amber)/0.15)]',
        icon: 'text-[hsl(var(--accent-amber))]',
      }
    case 'positive':
      return {
        bg: 'bg-[hsl(var(--signal-positive)/0.15)]',
        icon: 'text-[hsl(var(--signal-positive))]',
      }
    case 'negative':
      return {
        bg: 'bg-[hsl(var(--signal-negative)/0.15)]',
        icon: 'text-[hsl(var(--signal-negative))]',
      }
    case 'muted':
    default:
      return {
        bg: 'bg-[hsl(var(--bg-elevated))]',
        icon: 'text-[hsl(var(--text-muted))]',
      }
  }
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  iconName,
  iconColor = 'muted',
  className,
}: StatCardProps) {
  const iconStyles = getIconColorStyles(iconColor)
  const Icon = iconName ? iconMap[iconName] : null

  // Format change value
  const formatChange = (val: number) => {
    const prefix = val > 0 ? '+' : ''
    return `${prefix}${val.toLocaleString()}`
  }

  // Determine change color and icon
  const getChangeStyles = (val: number) => {
    if (val > 0) {
      return {
        color: 'text-[hsl(var(--signal-positive))]',
        Icon: TrendingUp,
      }
    }
    if (val < 0) {
      return {
        color: 'text-[hsl(var(--signal-negative))]',
        Icon: TrendingDown,
      }
    }
    return {
      color: 'text-[hsl(var(--text-muted))]',
      Icon: Minus,
    }
  }

  const changeStyles = change !== undefined ? getChangeStyles(change) : null

  return (
    <div
      className={cn(
        // Base styles
        'relative rounded-lg p-5',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]',
        // Hover state
        'transition-all duration-150',
        'hover:border-[hsl(var(--border-strong))]',
        'hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Label */}
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.05em]',
              'text-[hsl(var(--text-muted))]'
            )}
          >
            {label}
          </p>

          {/* Value */}
          <p
            className={cn(
              'text-[32px] font-bold tracking-tight leading-none',
              'font-mono tabular-nums',
              'text-[hsl(var(--text-primary))]'
            )}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>

          {/* Change indicator - uses icon + text + color for accessibility */}
          {change !== undefined && changeStyles && (
            <div
              className={cn('flex items-center gap-1.5 mt-1', changeStyles.color)}
              role="status"
              aria-label={`${change > 0 ? 'Increased by' : change < 0 ? 'Decreased by' : 'No change:'} ${Math.abs(change).toLocaleString()}${changeLabel ? ` ${changeLabel}` : ''}`}
            >
              <changeStyles.Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-xs font-medium tabular-nums">
                {formatChange(change)}
              </span>
              {changeLabel && (
                <span className="text-xs text-[hsl(var(--text-muted))]">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              'shrink-0 flex items-center justify-center',
              'h-10 w-10 rounded-lg',
              iconStyles.bg
            )}
          >
            <Icon className={cn('h-5 w-5', iconStyles.icon)} aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * StatsRow - Grid container for stat cards
 */
interface StatsRowProps {
  children: React.ReactNode
  className?: string
}

export function StatsRow({ children, className }: StatsRowProps) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {children}
    </div>
  )
}

/**
 * StatCardSkeleton - Loading state for StatCard
 */
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative rounded-lg p-5',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]',
        'animate-pulse',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-3 w-20 rounded bg-[hsl(var(--bg-elevated))]" />
          <div className="h-8 w-24 rounded bg-[hsl(var(--bg-elevated))]" />
          <div className="h-3 w-16 rounded bg-[hsl(var(--bg-elevated))]" />
        </div>
        <div className="h-10 w-10 rounded-lg bg-[hsl(var(--bg-elevated))]" />
      </div>
    </div>
  )
}

export default StatCard
