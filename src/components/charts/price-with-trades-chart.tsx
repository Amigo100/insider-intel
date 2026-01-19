'use client'

import { useMemo } from 'react'
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Legend,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface PriceDataPoint {
  date: string
  open: number | null
  high: number | null
  low: number | null
  close: number | null
  volume: number | null
}

interface TradeMarker {
  date: string
  type: 'P' | 'S' // Purchase or Sale
  value: number
  insiderName: string
  shares: number
}

interface PriceWithTradesChartProps {
  priceData: PriceDataPoint[]
  trades: TradeMarker[]
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
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
  trades,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
  trades: TradeMarker[]
}) {
  if (!active || !payload || !payload.length) return null

  // Find any trades on this date
  const dateTrades = trades.filter((t) => t.date === label)

  return (
    <div
      className={cn(
        'rounded-lg border p-3 shadow-md',
        'bg-[hsl(var(--bg-card))]',
        'border-[hsl(var(--border-default))]'
      )}
    >
      <p className="mb-2 font-medium text-[hsl(var(--text-primary))]">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[hsl(var(--text-muted))]">{entry.name}:</span>
          <span className="font-medium font-mono text-[hsl(var(--text-primary))]">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}

      {dateTrades.length > 0 && (
        <>
          <div className="my-2 border-t border-[hsl(var(--border-subtle))]" />
          <p className="text-xs font-medium text-[hsl(var(--text-muted))] uppercase tracking-wide mb-1">
            Insider Activity
          </p>
          {dateTrades.map((trade, idx) => (
            <div key={idx} className="text-sm mt-1">
              <span
                className={cn(
                  'font-medium',
                  trade.type === 'P'
                    ? 'text-[hsl(var(--signal-positive))]'
                    : 'text-[hsl(var(--signal-negative))]'
                )}
              >
                {trade.type === 'P' ? 'BUY' : 'SELL'}
              </span>
              <span className="text-[hsl(var(--text-secondary))]">
                {' '}
                {trade.insiderName}
              </span>
              <span className="text-[hsl(var(--text-muted))]">
                {' '}
                · {formatNumber(trade.shares)} shares · {formatCompactCurrency(trade.value)}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

/**
 * Custom dot for trade markers
 */
function TradeDot({
  cx,
  cy,
  trade,
}: {
  cx?: number
  cy?: number
  trade: TradeMarker
}) {
  if (cx === undefined || cy === undefined) return null

  const isBuy = trade.type === 'P'
  const size = Math.min(Math.max(Math.log10(trade.value) * 2, 6), 16)

  return (
    <g>
      {/* Outer ring for visibility */}
      <circle
        cx={cx}
        cy={cy}
        r={size + 2}
        fill="none"
        stroke={isBuy ? '#10b981' : '#ef4444'}
        strokeWidth={2}
        opacity={0.5}
      />
      {/* Inner filled circle */}
      <circle
        cx={cx}
        cy={cy}
        r={size}
        fill={isBuy ? '#10b981' : '#ef4444'}
        stroke="white"
        strokeWidth={1.5}
      />
      {/* Arrow indicator */}
      <path
        d={
          isBuy
            ? `M${cx - 3} ${cy + 1} L${cx} ${cy - 3} L${cx + 3} ${cy + 1}`
            : `M${cx - 3} ${cy - 1} L${cx} ${cy + 3} L${cx + 3} ${cy - 1}`
        }
        fill="white"
        stroke="none"
      />
    </g>
  )
}

/**
 * Price chart with insider/institutional trade markers overlay
 *
 * Shows stock price as a line chart with colored markers indicating
 * when insiders bought (green) or sold (red). Marker size reflects
 * transaction value.
 */
export function PriceWithTradesChart({
  priceData,
  trades,
  loading = false,
  className,
  height = 350,
}: PriceWithTradesChartProps) {
  // Merge price data with trade markers for the chart
  const chartData = useMemo(() => {
    if (!priceData || priceData.length === 0) return []

    // Create a map of trades by date for quick lookup
    const tradesByDate = new Map<string, TradeMarker[]>()
    trades.forEach((trade) => {
      const existing = tradesByDate.get(trade.date) || []
      existing.push(trade)
      tradesByDate.set(trade.date, existing)
    })

    return priceData
      .filter((p) => p.close !== null)
      .map((p) => ({
        ...p,
        trades: tradesByDate.get(p.date) || [],
      }))
  }, [priceData, trades])

  // Calculate price range for Y-axis
  const priceRange = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 100 }
    const prices = chartData.map((d) => d.close).filter((p): p is number => p !== null)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const padding = (max - min) * 0.1
    return { min: Math.max(0, min - padding), max: max + padding }
  }, [chartData])

  if (loading) {
    return (
      <div className={cn('w-full', className)} style={{ height }}>
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (!priceData || priceData.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg',
          'border border-[hsl(var(--border-default))]',
          'bg-[hsl(var(--bg-elevated)/0.3)]',
          className
        )}
        style={{ height }}
      >
        <p className="text-sm text-[hsl(var(--text-muted))]">
          No price data available
        </p>
      </div>
    )
  }

  // Get all trade points for reference dots (filter out null prices)
  const tradePoints = chartData
    .filter((d) => d.close !== null)
    .flatMap((d) =>
      d.trades.map((t) => ({
        date: d.date,
        price: d.close as number,
        trade: t,
      }))
    )

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border-subtle, var(--border)))"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'hsl(var(--text-muted))' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border-default, var(--border)))' }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            }}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            domain={[priceRange.min, priceRange.max]}
            tick={{ fontSize: 11, fill: 'hsl(var(--text-muted))' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            width={50}
          />
          <Tooltip content={<CustomTooltip trades={trades} />} />
          <Legend
            verticalAlign="top"
            height={36}
            content={() => (
              <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-0.5 w-6 rounded"
                    style={{ backgroundColor: 'hsl(var(--accent-amber))' }}
                  />
                  <span className="text-[hsl(var(--text-muted))]">Stock Price</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-[#10b981]">
                    <span className="text-[8px] text-white">▲</span>
                  </span>
                  <span className="text-[hsl(var(--text-muted))]">Buy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-[#ef4444]">
                    <span className="text-[8px] text-white">▼</span>
                  </span>
                  <span className="text-[hsl(var(--text-muted))]">Sell</span>
                </div>
              </div>
            )}
          />

          {/* Price line */}
          <Line
            type="monotone"
            dataKey="close"
            name="Price"
            stroke="hsl(var(--accent-amber))"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: 'hsl(var(--accent-amber))',
              stroke: 'white',
              strokeWidth: 2,
            }}
          />

          {/* Trade markers as reference dots */}
          {tradePoints.map((point, idx) => (
            <ReferenceDot
              key={`trade-${idx}`}
              x={point.date}
              y={point.price}
              shape={(props) => <TradeDot {...props} trade={point.trade} />}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
