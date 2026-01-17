'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Star,
  StarOff,
  Loader2,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { clientLogger } from '@/lib/client-logger'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CompanyTabs } from '@/components/dashboard/company-tabs'
import type { InsiderTransactionWithDetails } from '@/types/database'

/**
 * CompanyPageClient - Client component for company detail page
 *
 * Includes:
 * - Page header with watchlist toggle
 * - Metrics row
 * - Tab navigation (Overview, Insider Activity, Institutional Holdings)
 */

interface CompanyData {
  id: string
  ticker: string
  name: string
  sector: string | null
  industry: string | null
  marketCap: string | null
}

interface HolderData {
  institution_id: string
  institution_name: string
  institution_type: string | null
  shares: number
  value: number
  percent_of_portfolio: number | null
  shares_change: number | null
  shares_change_percent: number | null
  is_new_position: boolean
  is_closed_position: boolean
}

interface KeyInsider {
  name: string
  title: string | null
  lastActivity: string
  type: string
}

interface Stats {
  buyCount: number
  sellCount: number
  buyValue: number
  sellValue: number
  netValue: number
  institutionalHolders: number
  institutionalValue: number
  newPositions: number
  increasedPositions: number
}

interface ActivityDataPoint {
  date: string
  buys: number
  sells: number
}

interface CompanyPageClientProps {
  company: CompanyData
  transactions: InsiderTransactionWithDetails[]
  holders: HolderData[]
  activityData: ActivityDataPoint[]
  keyInsiders: KeyInsider[]
  stats: Stats
  watchlistItemId: string | null
  isLoggedIn: boolean
}

// Utility functions
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value)
}

// Metric Card component
function MetricCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
}: {
  label: string
  value: string
  subValue?: string
  icon: typeof TrendingUp
  trend?: 'positive' | 'negative' | 'neutral'
}) {
  return (
    <div
      className={cn(
        'rounded-lg p-4',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]'
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md',
            trend === 'positive' && 'bg-[hsl(var(--signal-positive)/0.15)]',
            trend === 'negative' && 'bg-[hsl(var(--signal-negative)/0.15)]',
            (!trend || trend === 'neutral') && 'bg-[hsl(var(--bg-elevated))]'
          )}
        >
          <Icon
            className={cn(
              'h-4 w-4',
              trend === 'positive' && 'text-[hsl(var(--signal-positive))]',
              trend === 'negative' && 'text-[hsl(var(--signal-negative))]',
              (!trend || trend === 'neutral') && 'text-[hsl(var(--text-muted))]'
            )}
            aria-hidden="true"
          />
        </div>
        <span
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.05em]',
            'text-[hsl(var(--text-muted))]'
          )}
        >
          {label}
        </span>
      </div>
      <p
        className={cn(
          'mt-2 text-xl font-bold tracking-tight',
          'font-mono tabular-nums',
          'text-[hsl(var(--text-primary))]'
        )}
      >
        {value}
      </p>
      {subValue && (
        <p className="mt-0.5 text-xs text-[hsl(var(--text-muted))]">{subValue}</p>
      )}
    </div>
  )
}

export function CompanyPageClient({
  company,
  transactions,
  holders,
  activityData,
  keyInsiders,
  stats,
  watchlistItemId,
  isLoggedIn,
}: CompanyPageClientProps) {
  const router = useRouter()
  const [isInWatchlist, setIsInWatchlist] = useState(!!watchlistItemId)
  const [itemId, setItemId] = useState(watchlistItemId)
  const [isPending, setIsPending] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleWatchlistToggle = async () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setIsPending(true)
    try {
      if (isInWatchlist && itemId) {
        // Remove from watchlist
        const { error } = await supabase
          .from('watchlist_items')
          .delete()
          .eq('id', itemId)

        if (error) throw error

        setIsInWatchlist(false)
        setItemId(null)
      } else {
        // Add to watchlist
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('watchlist_items')
          .insert({
            company_id: company.id,
            user_id: user.id,
          })
          .select('id')
          .single()

        if (error) throw error

        setIsInWatchlist(true)
        setItemId(data.id)
      }

      router.refresh()
    } catch (error) {
      clientLogger.error('Error toggling watchlist', { error })
    } finally {
      setIsPending(false)
    }
  }

  // Build subtitle
  const subtitleParts: string[] = []
  if (company.sector) subtitleParts.push(company.sector)
  if (company.marketCap) subtitleParts.push(`${company.marketCap} Market Cap`)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className={cn(
              'text-2xl font-bold tracking-tight',
              'text-[hsl(var(--text-primary))]'
            )}
          >
            {company.ticker}
            <span className="ml-2 font-normal text-[hsl(var(--text-muted))]">
              – {company.name}
            </span>
          </h1>
          {subtitleParts.length > 0 && (
            <p className="mt-1 text-sm text-[hsl(var(--text-tertiary))]">
              {subtitleParts.join(' · ')}
            </p>
          )}
        </div>

        <Button
          onClick={handleWatchlistToggle}
          disabled={isPending}
          variant={isInWatchlist ? 'outline' : 'primary'}
          className={cn(
            'gap-2',
            isInWatchlist
              ? [
                  'border-[hsl(var(--border-default))]',
                  'text-[hsl(var(--text-secondary))]',
                  'hover:border-[hsl(var(--signal-negative)/0.5)]',
                  'hover:text-[hsl(var(--signal-negative))]',
                ]
              : [
                  'bg-[hsl(var(--accent-amber))]',
                  'text-[hsl(var(--bg-app))]',
                  'hover:bg-[hsl(var(--accent-amber)/0.9)]',
                ]
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : isInWatchlist ? (
            <StarOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Star className="h-4 w-4" aria-hidden="true" />
          )}
          {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Insider Buys (1Y)"
          value={formatCurrency(stats.buyValue)}
          subValue={`${stats.buyCount} transactions`}
          icon={TrendingUp}
          trend="positive"
        />
        <MetricCard
          label="Insider Sells (1Y)"
          value={formatCurrency(stats.sellValue)}
          subValue={`${stats.sellCount} transactions`}
          icon={TrendingDown}
          trend="negative"
        />
        <MetricCard
          label="Net Insider Activity"
          value={formatCurrency(Math.abs(stats.netValue))}
          subValue={stats.netValue >= 0 ? 'Net Buying' : 'Net Selling'}
          icon={stats.netValue >= 0 ? TrendingUp : TrendingDown}
          trend={stats.netValue >= 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          label="Institutional Holders"
          value={stats.institutionalHolders.toString()}
          subValue={`${stats.newPositions} new positions`}
          icon={Building2}
          trend="neutral"
        />
      </div>

      {/* Tabs */}
      <CompanyTabs
        transactions={transactions}
        holders={holders}
        activityData={activityData}
        keyInsiders={keyInsiders}
        stats={stats}
      />
    </div>
  )
}
