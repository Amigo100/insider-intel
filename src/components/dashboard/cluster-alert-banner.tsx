import Link from 'next/link'
import { TrendingUp, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClusterAlertBannerProps {
  ticker: string
  companyName: string
  insiderCount: number
  totalValue: number
  timeframeDays: number
  href: string
  className?: string
}

/**
 * Format currency value for display
 */
function formatValue(value: number): string {
  const absValue = Math.abs(value)
  if (absValue >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (absValue >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

/**
 * Banner component for displaying cluster buying alerts
 *
 * Shows when multiple insiders have purchased stock within a short timeframe,
 * which can be a significant signal for investors.
 */
export function ClusterAlertBanner({
  ticker,
  companyName,
  insiderCount,
  totalValue,
  timeframeDays,
  href,
  className,
}: ClusterAlertBannerProps) {
  return (
    <Link href={href} className="block">
      <div
        className={cn(
          'bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 hover:bg-emerald-500/15 transition-colors',
          className
        )}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20" aria-hidden="true">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white">
              {insiderCount} insiders bought {formatValue(totalValue)} of{' '}
              <span className="text-emerald-400">{ticker}</span> in {timeframeDays} days
            </p>
            <p className="text-sm text-slate-400 truncate">
              Cluster buying detected at {companyName}
            </p>
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-1 text-sm font-medium text-emerald-400 shrink-0" aria-hidden="true">
            <span className="hidden sm:inline">View details</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
