'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ActivityDataPoint {
  date: string
  buys: number
  sells: number
  [key: string]: string | number
}

interface InsiderActivityChartProps {
  data: ActivityDataPoint[]
  loading?: boolean
  className?: string
  height?: number
}

/**
 * Formats currency for tooltip display
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value)
}

/**
 * Custom tooltip component
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md">
      <p className="mb-2 font-medium">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Bar chart showing insider buying vs selling activity over time
 *
 * Green bars represent purchases, red bars represent sales
 */
export function InsiderActivityChart({
  data,
  loading = false,
  className,
  height = 300,
}: InsiderActivityChartProps) {
  if (loading) {
    return (
      <div className={cn('w-full', className)} style={{ height }}>
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border bg-muted/20',
          className
        )}
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">No activity data available</p>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              new Intl.NumberFormat('en-US', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value)
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span className="text-sm capitalize">{value}</span>
            )}
          />
          <Bar
            dataKey="buys"
            name="Buys"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="sells"
            name="Sells"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Compact version for smaller spaces
 */
export function InsiderActivityChartCompact({
  data,
  loading = false,
  className,
}: Omit<InsiderActivityChartProps, 'height'>) {
  if (loading) {
    return <Skeleton className={cn('h-[150px] w-full', className)} />
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'flex h-[150px] items-center justify-center rounded-lg border bg-muted/20',
          className
        )}
      >
        <p className="text-xs text-muted-foreground">No data</p>
      </div>
    )
  }

  return (
    <div className={cn('h-[150px] w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="buys" fill="#10b981" radius={[2, 2, 0, 0]} />
          <Bar dataKey="sells" fill="#ef4444" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
