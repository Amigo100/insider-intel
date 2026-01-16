'use client'

import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
 * Stat card for dashboard summary numbers
 *
 * Displays a metric with optional change indicator and icon
 */
export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-muted-foreground',
  className,
}: StatCardProps) {
  const formatChange = (changeValue: number) => {
    const prefix = changeValue > 0 ? '+' : ''
    return `${prefix}${changeValue.toLocaleString()}`
  }

  return (
    <Card
      className={cn(
        'relative rounded-xl p-0',
        'bg-gradient-to-br from-slate-800 to-slate-900',
        'border border-white/[0.08]',
        'transition-all duration-200',
        'hover:-translate-y-0.5',
        'hover:border-cyan-400/30',
        'hover:shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_15px_rgba(34,211,238,0.1)]',
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change && (
              <p
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  change.value > 0
                    ? 'text-emerald-400'
                    : change.value < 0
                      ? 'text-red-400'
                      : 'text-slate-400'
                )}
              >
                <span>{formatChange(change.value)}</span>
                {change.label && (
                  <span className="text-slate-400">{change.label}</span>
                )}
              </p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                'rounded-full bg-slate-700/50 p-2.5',
                iconColor
              )}
            >
              <Icon className="h-5 w-5 text-slate-400" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact stat for inline displays
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
  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className="text-sm text-slate-400">{label}:</span>
      <span className="font-semibold text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      {change !== undefined && (
        <span
          className={cn(
            'text-xs font-medium',
            change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-slate-400'
          )}
        >
          ({change > 0 ? '+' : ''}{change.toLocaleString()})
        </span>
      )}
    </div>
  )
}
