'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, Clock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityItem } from './use-watchlist'

/**
 * WatchlistActivityFeed - Recent activity for watched stocks
 *
 * Features:
 * - Grouped by date: "TODAY", "YESTERDAY", "THIS WEEK"
 * - Each item: Ticker, description, AI context preview
 * - Click → /company/[ticker]
 */

interface WatchlistActivityFeedProps {
  activity: ActivityItem[]
  className?: string
}

// Utility functions
function formatValue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

function getDateGroup(dateString: string): 'TODAY' | 'YESTERDAY' | 'THIS WEEK' | 'EARLIER' {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'TODAY'
  if (diffDays === 1) return 'YESTERDAY'
  if (diffDays < 7) return 'THIS WEEK'
  return 'EARLIER'
}

function groupActivityByDate(activity: ActivityItem[]): Map<string, ActivityItem[]> {
  const groups = new Map<string, ActivityItem[]>()
  const order = ['TODAY', 'YESTERDAY', 'THIS WEEK', 'EARLIER']

  // Initialize groups in order
  for (const group of order) {
    groups.set(group, [])
  }

  // Populate groups
  for (const item of activity) {
    const group = getDateGroup(item.filed_at)
    groups.get(group)?.push(item)
  }

  // Remove empty groups
  for (const [key, value] of groups) {
    if (value.length === 0) {
      groups.delete(key)
    }
  }

  return groups
}

function ActivityItemRow({ item }: { item: ActivityItem }) {
  const isBuy = item.transaction_type === 'P'

  return (
    <Link
      href={`/company/${item.ticker}`}
      className={cn(
        'flex items-start gap-4 p-4',
        'rounded-lg',
        'transition-colors duration-150',
        'hover:bg-[hsl(var(--bg-hover))]'
      )}
    >
      {/* Type indicator */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          isBuy
            ? 'bg-[hsl(var(--signal-positive)/0.15)] text-[hsl(var(--signal-positive))]'
            : 'bg-[hsl(var(--signal-negative)/0.15)] text-[hsl(var(--signal-negative))]'
        )}
      >
        {isBuy ? (
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <TrendingDown className="h-4 w-4" aria-hidden="true" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'font-semibold',
              'text-[hsl(var(--text-primary))]'
            )}
          >
            {item.ticker}
          </span>
          <span
            className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              isBuy
                ? 'bg-[hsl(var(--signal-positive)/0.15)] text-[hsl(var(--signal-positive))]'
                : 'bg-[hsl(var(--signal-negative)/0.15)] text-[hsl(var(--signal-negative))]'
            )}
          >
            {isBuy ? 'Buy' : 'Sell'}
          </span>
          <span className="text-sm text-[hsl(var(--text-muted))]">
            {formatValue(item.total_value)}
          </span>
        </div>

        <p className="mt-0.5 text-sm text-[hsl(var(--text-tertiary))] truncate">
          {item.insider_name}
          {item.insider_title && ` · ${item.insider_title}`}
        </p>

        {/* AI context preview */}
        {item.ai_context && (
          <div className="mt-2 flex items-start gap-1.5">
            <Sparkles
              className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[hsl(var(--accent-amber))]"
              aria-hidden="true"
            />
            <p className="text-sm text-[hsl(var(--text-secondary))] line-clamp-2">
              {item.ai_context}
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}

function DateGroupHeader({ label }: { label: string }) {
  return (
    <div
      className={cn(
        'px-4 py-2',
        'text-[11px] font-semibold uppercase tracking-[0.05em]',
        'text-[hsl(var(--text-muted))]',
        'bg-[hsl(var(--bg-elevated)/0.5)]',
        'border-y border-[hsl(var(--border-subtle))]'
      )}
    >
      {label}
    </div>
  )
}

export function WatchlistActivityFeed({
  activity,
  className,
}: WatchlistActivityFeedProps) {
  if (activity.length === 0) {
    return null
  }

  const groupedActivity = groupActivityByDate(activity)

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 px-5 py-4',
          'border-b border-[hsl(var(--border-subtle))]'
        )}
      >
        <Clock
          className="h-4 w-4 text-[hsl(var(--accent-amber))]"
          aria-hidden="true"
        />
        <h2
          className={cn(
            'text-base font-semibold',
            'text-[hsl(var(--text-primary))]'
          )}
        >
          Recent Activity for Watched Stocks
        </h2>
      </div>

      {/* Grouped activity */}
      <div>
        {Array.from(groupedActivity.entries()).map(([group, items]) => (
          <div key={group}>
            <DateGroupHeader label={group} />
            <div className="divide-y divide-[hsl(var(--border-subtle))]">
              {items.map((item) => (
                <ActivityItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WatchlistActivityFeed
