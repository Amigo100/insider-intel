'use client'

import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  Eye,
  X,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { WatchlistItem } from './use-watchlist'

/**
 * WatchlistCard - Individual stock card in the watchlist grid
 *
 * Specifications:
 * - Background: var(--bg-card)
 * - Border: 1px solid var(--border-default)
 * - Padding: 20px
 * - Border-radius: 8px
 * - Green border + "Active" badge if active today
 * - Hover actions: View, Remove (with confirmation)
 */

interface WatchlistCardProps {
  item: WatchlistItem
  isRemoving: boolean
  onRemove: (id: string) => void
}

// Utility functions
function formatValue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isActiveToday(lastTransaction: WatchlistItem['stats']['lastTransaction']): boolean {
  if (!lastTransaction?.filed_at) return false
  const filedDate = new Date(lastTransaction.filed_at)
  const today = new Date()
  return (
    filedDate.getDate() === today.getDate() &&
    filedDate.getMonth() === today.getMonth() &&
    filedDate.getFullYear() === today.getFullYear()
  )
}

function SentimentIndicator({ sentiment }: { sentiment: 'bullish' | 'bearish' | 'neutral' }) {
  const config = {
    bullish: {
      icon: TrendingUp,
      label: 'Bullish',
      className: 'text-[hsl(var(--signal-positive))]',
    },
    bearish: {
      icon: TrendingDown,
      label: 'Bearish',
      className: 'text-[hsl(var(--signal-negative))]',
    },
    neutral: {
      icon: Minus,
      label: 'Neutral',
      className: 'text-[hsl(var(--text-muted))]',
    },
  }

  const { icon: Icon, label, className } = config[sentiment]

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="text-xs font-medium">{label}</span>
    </span>
  )
}

function MiniSparkline({ buys, sells }: { buys: number; sells: number }) {
  const total = buys + sells
  if (total === 0) return null

  const buyPercent = (buys / total) * 100
  const sellPercent = (sells / total) * 100

  return (
    <div
      className="h-1.5 w-full rounded-full overflow-hidden bg-[hsl(var(--bg-elevated))]"
      role="img"
      aria-label={`${buys} buys, ${sells} sells in last 30 days`}
    >
      <div className="h-full flex">
        <div
          className="bg-[hsl(var(--signal-positive))]"
          style={{ width: `${buyPercent}%` }}
        />
        <div
          className="bg-[hsl(var(--signal-negative))]"
          style={{ width: `${sellPercent}%` }}
        />
      </div>
    </div>
  )
}

export function WatchlistCard({ item, isRemoving, onRemove }: WatchlistCardProps) {
  const activeToday = isActiveToday(item.stats.lastTransaction)

  return (
    <div
      className={cn(
        // Base styles
        'group relative rounded-lg p-5',
        'bg-[hsl(var(--bg-card))]',
        'border',
        // Active today: green border
        activeToday
          ? 'border-[hsl(var(--signal-positive)/0.5)]'
          : 'border-[hsl(var(--border-default))]',
        // Hover state
        'transition-all duration-150',
        'hover:border-[hsl(var(--border-strong))]',
        'hover:shadow-sm',
        // Removing state
        isRemoving && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/company/${item.company.ticker}`}
              className={cn(
                'text-lg font-bold',
                'text-[hsl(var(--text-primary))]',
                'hover:text-[hsl(var(--accent-amber))]',
                'transition-colors duration-150'
              )}
            >
              {item.company.ticker}
            </Link>
            {activeToday && (
              <Badge
                className={cn(
                  'bg-[hsl(var(--signal-positive)/0.15)]',
                  'text-[hsl(var(--signal-positive))]',
                  'border border-[hsl(var(--signal-positive)/0.3)]'
                )}
              >
                Active
              </Badge>
            )}
          </div>
          <p
            className={cn(
              'mt-0.5 text-[13px] truncate',
              'text-[hsl(var(--text-tertiary))]'
            )}
            title={item.company.name}
          >
            {item.company.name}
          </p>
        </div>

        {/* Sentiment indicator */}
        <SentimentIndicator sentiment={item.stats.sentiment} />
      </div>

      {/* Sparkline / Activity bar */}
      <div className="mt-4">
        <MiniSparkline
          buys={item.stats.recentBuys}
          sells={item.stats.recentSells}
        />
        {item.stats.transactionCount > 0 && (
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[hsl(var(--signal-positive))]">
              {item.stats.recentBuys} buys
            </span>
            <span className="text-[hsl(var(--signal-negative))]">
              {item.stats.recentSells} sells
            </span>
          </div>
        )}
      </div>

      {/* Last activity */}
      <p
        className={cn(
          'mt-3 text-xs',
          'text-[hsl(var(--text-muted))]'
        )}
      >
        {item.stats.lastTransaction ? (
          <>
            Last activity:{' '}
            <span className="text-[hsl(var(--text-secondary))]">
              {formatRelativeDate(item.stats.lastTransaction.filed_at)}
            </span>
            {' · '}
            <span
              className={cn(
                item.stats.lastTransaction.transaction_type === 'P'
                  ? 'text-[hsl(var(--signal-positive))]'
                  : 'text-[hsl(var(--signal-negative))]'
              )}
            >
              {item.stats.lastTransaction.transaction_type === 'P' ? 'Buy' : 'Sell'}{' '}
              {formatValue(item.stats.lastTransaction.total_value)}
            </span>
          </>
        ) : (
          'No recent activity'
        )}
      </p>

      {/* Hover actions */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0',
          'flex items-center justify-end gap-2',
          'px-4 py-3',
          'rounded-b-lg',
          'bg-gradient-to-t from-[hsl(var(--bg-card))] via-[hsl(var(--bg-card)/0.9)] to-transparent',
          'opacity-0 translate-y-1',
          'transition-all duration-150',
          'group-hover:opacity-100 group-hover:translate-y-0'
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          asChild
          className={cn(
            'h-8 gap-1.5',
            'text-[hsl(var(--text-secondary))]',
            'hover:text-[hsl(var(--text-primary))]',
            'hover:bg-[hsl(var(--bg-hover))]'
          )}
        >
          <Link href={`/company/${item.company.ticker}`}>
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            View
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          disabled={isRemoving}
          className={cn(
            'h-8 gap-1.5',
            'text-[hsl(var(--text-muted))]',
            'hover:text-[hsl(var(--signal-negative))]',
            'hover:bg-[hsl(var(--signal-negative)/0.1)]'
          )}
        >
          {isRemoving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Remove
        </Button>
      </div>
    </div>
  )
}

export default WatchlistCard
