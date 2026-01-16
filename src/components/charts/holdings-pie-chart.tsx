'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface HoldingDataPoint {
  name: string
  value: number
  percent: number
  [key: string]: string | number
}

interface HoldingsPieChartProps {
  data: HoldingDataPoint[]
  loading?: boolean
  className?: string
  height?: number
  showLegend?: boolean
}

// Accessible color palette - well-separated on color wheel, distinct for color blindness
// Using colors that are distinguishable even with various forms of color blindness
const COLORS = [
  '#22d3ee', // cyan-400 (primary accent)
  '#a855f7', // purple-500
  '#f97316', // orange-500
  '#3b82f6', // blue-500
  '#ec4899', // pink-500
  '#64748b', // slate-500 (for Others - intentionally muted)
]

// Color names for accessibility/screen readers
const COLOR_NAMES = ['Cyan', 'Purple', 'Orange', 'Blue', 'Pink', 'Gray']

/**
 * Formats currency for display
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
 * Custom tooltip component - styled for dark theme
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: HoldingDataPoint; color: string }>
}) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const color = payload[0].color

  return (
    <div className="rounded-lg border border-white/[0.08] bg-slate-800 p-3 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="h-3 w-3 rounded-sm shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <p className="font-medium text-white truncate max-w-[180px]">{data.name}</p>
      </div>
      <p className="text-sm text-slate-300">
        {formatCurrency(data.value)}
      </p>
      <p className="text-sm font-semibold text-cyan-400">
        {data.percent.toFixed(1)}% of portfolio
      </p>
    </div>
  )
}

/**
 * Custom legend component - improved readability and accessibility
 */
function CustomLegend({
  payload,
}: {
  payload?: Array<{ value: string; color: string; payload: HoldingDataPoint }>
}) {
  if (!payload) return null

  return (
    <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-2" role="list" aria-label="Chart legend">
      {payload.map((entry, index) => (
        <li key={index} className="flex items-center gap-2 text-sm">
          <span
            className="h-3 w-3 rounded-sm shrink-0"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span className="text-slate-300 truncate max-w-[120px]" title={entry.value}>
            {entry.value}
          </span>
          {entry.payload && (
            <span className="text-slate-500 text-xs">
              ({entry.payload.percent.toFixed(0)}%)
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * Custom label renderer for pie segments
 * Only shows percentage on segments >= 10% to avoid clutter
 */
function renderCustomLabel(props: {
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  percent?: number
}) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props

  // Guard against undefined values and only show label for segments >= 10%
  if (
    cx === undefined ||
    cy === undefined ||
    midAngle === undefined ||
    innerRadius === undefined ||
    outerRadius === undefined ||
    percent === undefined ||
    percent < 0.1
  ) {
    return null
  }

  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

/**
 * Processes data to show top 5 holders + Others
 */
function processData(data: HoldingDataPoint[]): HoldingDataPoint[] {
  if (data.length <= 6) return data

  const sorted = [...data].sort((a, b) => b.value - a.value)
  const top5 = sorted.slice(0, 5)
  const others = sorted.slice(5)

  const othersTotal = others.reduce((sum, item) => sum + item.value, 0)
  const othersPercent = others.reduce((sum, item) => sum + item.percent, 0)

  return [
    ...top5,
    {
      name: `Others (${others.length})`,
      value: othersTotal,
      percent: othersPercent,
    },
  ]
}

/**
 * Donut chart displaying top institutional holders
 *
 * Shows top 5 holders by value with an "Others" category
 * for remaining holders
 */
export function HoldingsPieChart({
  data,
  loading = false,
  className,
  height = 300,
  showLegend = true,
}: HoldingsPieChartProps) {
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
          'flex items-center justify-center rounded-lg border border-white/[0.08] bg-slate-800/30',
          className
        )}
        style={{ height }}
      >
        <p className="text-sm text-slate-400">No holdings data available</p>
      </div>
    )
  }

  const processedData = processData(data)

  return (
    <div className={cn('w-full', className)} style={{ height }} role="img" aria-label="Institutional holdings distribution chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={renderCustomLabel}
            labelLine={false}
          >
            {processedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="hsl(222.2 84% 4.9%)"
                strokeWidth={2}
                aria-label={`${entry.name}: ${entry.percent.toFixed(1)}%`}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              content={<CustomLegend />}
              verticalAlign="bottom"
              height={50}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Compact version for smaller spaces
 */
export function HoldingsPieChartCompact({
  data,
  loading = false,
  className,
}: Omit<HoldingsPieChartProps, 'height' | 'showLegend'>) {
  if (loading) {
    return <Skeleton className={cn('h-[150px] w-full', className)} />
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'flex h-[150px] items-center justify-center rounded-lg border border-white/[0.08] bg-slate-800/30',
          className
        )}
      >
        <p className="text-xs text-slate-400">No data</p>
      </div>
    )
  }

  const processedData = processData(data)

  return (
    <div className={cn('h-[150px] w-full', className)} role="img" aria-label="Holdings distribution">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={55}
            paddingAngle={2}
            dataKey="value"
          >
            {processedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="hsl(222.2 84% 4.9%)"
                strokeWidth={1}
                aria-label={`${entry.name}: ${entry.percent.toFixed(1)}%`}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
