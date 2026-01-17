'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * TrendSparkline - Modernized Bloomberg Design System
 *
 * Pure SVG-based mini-chart for inline trend visualization.
 * No axes, gridlines, or labels - just the trend line.
 *
 * Specifications:
 * - Width: 60-80px (default 72px)
 * - Height: 24px
 * - Stroke width: 1.5px
 * - Stroke linecap: round
 * - End point dot: radius 2.5px
 *
 * Colors by trend:
 * - Up: signal-positive (#00C853)
 * - Down: signal-negative (#FF5252)
 * - Neutral: text-muted (#737373)
 */

type TrendDirection = 'up' | 'down' | 'neutral' | 'flat'

interface TrendSparklineProps {
  /** Array of numeric values to plot */
  data: number[]
  /** Explicit trend direction (auto-calculated if not provided) */
  trend?: TrendDirection
  /** Show loading skeleton */
  loading?: boolean
  /** Width in pixels */
  width?: number
  /** Height in pixels */
  height?: number
  /** Additional CSS classes */
  className?: string
  /** Show the end point dot */
  showEndDot?: boolean
}

// CSS variable-based colors for theme compatibility
const TREND_COLORS = {
  up: 'hsl(var(--signal-positive))',
  down: 'hsl(var(--signal-negative))',
  neutral: 'hsl(var(--text-muted, 0 0% 45%))',
  flat: 'hsl(var(--text-muted, 0 0% 45%))',
} as const

/**
 * Calculate trend direction from data array
 */
function calculateTrend(data: number[]): TrendDirection {
  if (data.length < 2) return 'neutral'

  const first = data[0]
  const last = data[data.length - 1]

  // Use 2% threshold to determine significant change
  const threshold = Math.abs(first) * 0.02

  if (last - first > threshold) return 'up'
  if (first - last > threshold) return 'down'
  return 'neutral'
}

/**
 * Generate SVG path from data points
 */
function generatePath(
  data: number[],
  width: number,
  height: number,
  padding: number = 4
): string {
  if (data.length < 2) return ''

  const minValue = Math.min(...data)
  const maxValue = Math.max(...data)
  const range = maxValue - minValue || 1

  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth
    const y = padding + chartHeight - ((value - minValue) / range) * chartHeight
    return `${x},${y}`
  })

  return `M${points.join(' L')}`
}

/**
 * Get the last point coordinates for the end dot
 */
function getLastPoint(
  data: number[],
  width: number,
  height: number,
  padding: number = 4
): { x: number; y: number } {
  if (data.length < 1) return { x: 0, y: 0 }

  const minValue = Math.min(...data)
  const maxValue = Math.max(...data)
  const range = maxValue - minValue || 1

  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const lastValue = data[data.length - 1]
  const x = padding + chartWidth
  const y = padding + chartHeight - ((lastValue - minValue) / range) * chartHeight

  return { x, y }
}

/**
 * Main TrendSparkline component
 */
export function TrendSparkline({
  data,
  trend: explicitTrend,
  loading = false,
  width = 72,
  height = 24,
  className,
  showEndDot = true,
}: TrendSparklineProps) {
  if (loading) {
    return (
      <Skeleton
        className={cn('rounded', className)}
        style={{ width, height }}
      />
    )
  }

  if (!data || data.length < 2) {
    return (
      <div
        className={cn('flex items-center justify-center text-muted-foreground', className)}
        style={{ width, height }}
        aria-label="No trend data available"
      >
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <line
            x1={8}
            y1={height / 2}
            x2={width - 8}
            y2={height / 2}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="4 4"
            opacity={0.4}
          />
        </svg>
      </div>
    )
  }

  const trend = explicitTrend || calculateTrend(data)
  const color = TREND_COLORS[trend]
  const path = generatePath(data, width, height)
  const lastPoint = getLastPoint(data, width, height)

  return (
    <div
      className={cn('flex items-center', className)}
      style={{ width, height }}
      role="img"
      aria-label={`Trend: ${trend}`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        className="overflow-visible"
      >
        {/* Trend line */}
        <path
          d={path}
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* End point dot */}
        {showEndDot && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={2.5}
            fill={color}
          />
        )}
      </svg>
    </div>
  )
}

/**
 * Sparkline with change percentage label
 */
export function TrendSparklineWithChange({
  data,
  trend: explicitTrend,
  loading = false,
  className,
}: TrendSparklineProps) {
  if (loading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Skeleton className="h-6 w-[72px]" />
        <Skeleton className="h-4 w-10" />
      </div>
    )
  }

  if (!data || data.length < 2) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <TrendSparkline data={data} />
        <span className="text-xs text-muted-foreground">—</span>
      </div>
    )
  }

  const trend = explicitTrend || calculateTrend(data)
  const first = data[0]
  const last = data[data.length - 1]
  const changePercent = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0
  const formattedChange = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`
  const color = TREND_COLORS[trend]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TrendSparkline data={data} trend={trend} />
      <span
        className="text-xs font-medium tabular-nums"
        style={{ color }}
      >
        {formattedChange}
      </span>
    </div>
  )
}

/**
 * Compact table sparkline - optimized for table cells
 */
export function TableSparkline({
  data,
  trend,
  className,
}: {
  data: number[]
  trend?: TrendDirection
  className?: string
}) {
  return (
    <TrendSparkline
      data={data}
      trend={trend}
      width={60}
      height={24}
      showEndDot={true}
      className={className}
    />
  )
}

/**
 * Sparkline group for comparing multiple trends
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
            <Skeleton className="h-6 w-[60px]" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-16 truncate">
            {item.label}
          </span>
          <TrendSparkline
            data={item.data}
            trend={item.trend}
            width={60}
            height={24}
          />
        </div>
      ))}
    </div>
  )
}

// Export helper for external use
export { calculateTrend, TREND_COLORS }
export type { TrendDirection, TrendSparklineProps }
