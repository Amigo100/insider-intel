'use client'

import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type TrendDirection = 'up' | 'down' | 'flat'

interface TrendSparklineProps {
  data: number[]
  trend?: TrendDirection
  loading?: boolean
  width?: number
  height?: number
  className?: string
}

/**
 * Determines trend direction from data
 */
function calculateTrend(data: number[]): TrendDirection {
  if (data.length < 2) return 'flat'

  const first = data[0]
  const last = data[data.length - 1]
  const threshold = Math.abs(first) * 0.01 // 1% threshold

  if (last - first > threshold) return 'up'
  if (first - last > threshold) return 'down'
  return 'flat'
}

/**
 * Gets color based on trend direction
 */
function getTrendColor(trend: TrendDirection): string {
  switch (trend) {
    case 'up':
      return '#10b981' // emerald-500
    case 'down':
      return '#ef4444' // red-500
    case 'flat':
    default:
      return '#6b7280' // gray-500
  }
}

/**
 * Mini inline sparkline chart for tables
 *
 * Displays a small trend line (default 80x30px) with color
 * indicating direction: green (up), red (down), gray (flat)
 */
export function TrendSparkline({
  data,
  trend: explicitTrend,
  loading = false,
  width = 80,
  height = 30,
  className,
}: TrendSparklineProps) {
  if (loading) {
    return (
      <Skeleton
        className={cn(className)}
        style={{ width, height }}
      />
    )
  }

  if (!data || data.length < 2) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ width, height }}
      >
        <span className="text-xs text-muted-foreground">—</span>
      </div>
    )
  }

  // Calculate trend if not explicitly provided
  const trend = explicitTrend || calculateTrend(data)
  const color = getTrendColor(trend)

  // Transform data for Recharts
  const chartData = data.map((value, index) => ({
    index,
    value,
  }))

  // Calculate Y domain with padding
  const minValue = Math.min(...data)
  const maxValue = Math.max(...data)
  const padding = (maxValue - minValue) * 0.1 || 1

  return (
    <div className={cn(className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <YAxis
            domain={[minValue - padding, maxValue + padding]}
            hide
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Sparkline with value label
 */
export function TrendSparklineWithValue({
  data,
  trend: explicitTrend,
  value,
  loading = false,
  className,
}: TrendSparklineProps & { value?: string | number }) {
  const trend = explicitTrend || (data.length >= 2 ? calculateTrend(data) : 'flat')
  const color = getTrendColor(trend)

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Skeleton className="h-[30px] w-[80px]" />
        <Skeleton className="h-4 w-12" />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TrendSparkline data={data} trend={trend} />
      {value !== undefined && (
        <span
          className="text-sm font-medium"
          style={{ color }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      )}
    </div>
  )
}

/**
 * Multiple sparklines for comparison
 */
export function SparklineGroup({
  items,
  loading = false,
  className,
}: {
  items: Array<{
    label: string
    data: number[]
    trend?: TrendDirection
  }>
  loading?: boolean
  className?: string
}) {
  if (loading) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-[24px] w-[60px]" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, index) => {
        const trend = item.trend || calculateTrend(item.data)
        return (
          <div key={index} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-16 truncate">
              {item.label}
            </span>
            <TrendSparkline
              data={item.data}
              trend={trend}
              width={60}
              height={24}
            />
          </div>
        )
      })}
    </div>
  )
}

/**
 * Inline sparkline for table cells
 */
export function TableSparkline({
  data,
  className,
}: {
  data: number[]
  className?: string
}) {
  return (
    <TrendSparkline
      data={data}
      width={60}
      height={24}
      className={className}
    />
  )
}
