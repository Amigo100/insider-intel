'use client'

import { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface HoldingDataPoint {
  name: string
  value: number
  percent: number
}

interface HoldingsPieChartProps {
  data: HoldingDataPoint[]
  loading?: boolean
  className?: string
  height?: number
  showLegend?: boolean
}

// Color palette for chart segments
const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray (for Others)
]

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
 * Custom tooltip component
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: HoldingDataPoint }>
}) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md">
      <p className="font-medium">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        {formatCurrency(data.value)}
      </p>
      <p className="text-sm font-medium text-primary">
        {data.percent.toFixed(1)}% of portfolio
      </p>
    </div>
  )
}

/**
 * Custom active shape for hover effect
 */
function renderActiveShape(props: any) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
  } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        className="text-sm font-medium"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
        className="text-xs"
      >
        {payload.percent.toFixed(1)}%
      </text>
    </g>
  )
}

/**
 * Custom legend component
 */
function CustomLegend({
  payload,
}: {
  payload?: Array<{ value: string; color: string; payload: HoldingDataPoint }>
}) {
  if (!payload) return null

  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
      {payload.map((entry, index) => (
        <li key={index} className="flex items-center gap-1.5 text-xs">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground truncate max-w-[100px]">
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
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
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

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
        <p className="text-sm text-muted-foreground">No holdings data available</p>
      </div>
    )
  }

  const processedData = processData(data)

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
            {processedData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              content={<CustomLegend />}
              verticalAlign="bottom"
              height={36}
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
          'flex h-[150px] items-center justify-center rounded-lg border bg-muted/20',
          className
        )}
      >
        <p className="text-xs text-muted-foreground">No data</p>
      </div>
    )
  }

  const processedData = processData(data)

  return (
    <div className={cn('h-[150px] w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={50}
            paddingAngle={2}
            dataKey="value"
          >
            {processedData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="hsl(var(--background))"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
