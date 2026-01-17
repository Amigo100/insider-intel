import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { StatCard, StatsRow, StatCardSkeleton } from '@/components/dashboard/stats-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { InsiderTransactionWithDetails } from '@/types/database'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personalized insider trading dashboard with recent activity, watchlist, and market insights.',
}

interface ClusterData {
  companyId: string
  ticker: string
  companyName: string
  buyerCount: number
  totalValue: number
  daysSpan: number
  insiders: {
    name: string
    title: string | null
    value: number
    transactionDate: string
  }[]
}

/**
 * Format currency value for display
 */
function formatCurrency(value: number): string {
  const absValue = Math.abs(value)
  if (absValue >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (absValue >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

async function getDashboardData(userId: string) {
  try {
    const supabase = await createClient()

    // Get date range for queries (last 7 days)
    const rangeStart = new Date()
    rangeStart.setDate(rangeStart.getDate() - 7)

    // Fetch recent transactions for table
    const { data: recentTransactions } = await supabase
      .from('v_recent_insider_transactions')
      .select('*')
      .gte('filed_at', rangeStart.toISOString())
      .order('filed_at', { ascending: false })
      .limit(10)

    // Fetch buy count for date range
    const { count: buyCount } = await supabase
      .from('v_recent_insider_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('transaction_type', 'P')
      .gte('filed_at', rangeStart.toISOString())

    // Fetch sell count for date range
    const { count: sellCount } = await supabase
      .from('v_recent_insider_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('transaction_type', 'S')
      .gte('filed_at', rangeStart.toISOString())

    // Fetch user's watchlist company IDs
    const { data: watchlistItems } = await supabase
      .from('watchlist_items')
      .select('company_id')
      .eq('user_id', userId)

    const watchlistCompanyIds = watchlistItems?.map((item) => item.company_id) || []
    const watchlistCount = watchlistCompanyIds.length

    // Fetch watchlist activity
    const watchlistActivity: InsiderTransactionWithDetails[] = []
    if (watchlistCompanyIds.length > 0) {
      const { data } = await supabase
        .from('v_recent_insider_transactions')
        .select('*')
        .in('company_id', watchlistCompanyIds)
        .gte('filed_at', rangeStart.toISOString())
        .order('filed_at', { ascending: false })
        .limit(5)

      if (data) {
        watchlistActivity.push(...(data as InsiderTransactionWithDetails[]))
      }
    }

    // Build cluster data from purchases (7-day window for clusters)
    const { data: purchases } = await supabase
      .from('v_recent_insider_transactions')
      .select('*')
      .eq('transaction_type', 'P')
      .gte('filed_at', rangeStart.toISOString())

    const clusterMap = new Map<string, ClusterData>()

    for (const txn of purchases || []) {
      if (!txn.company_id || !txn.ticker || !txn.company_name || !txn.insider_name || !txn.transaction_date) continue

      const existing = clusterMap.get(txn.company_id)

      if (existing) {
        const existingInsider = existing.insiders.find((i) => i.name === txn.insider_name)
        if (!existingInsider) {
          existing.insiders.push({
            name: txn.insider_name,
            title: txn.insider_title,
            value: txn.total_value || 0,
            transactionDate: txn.transaction_date,
          })
          existing.buyerCount = existing.insiders.length
        } else {
          existingInsider.value += txn.total_value || 0
        }
        existing.totalValue += txn.total_value || 0
      } else {
        clusterMap.set(txn.company_id, {
          companyId: txn.company_id,
          ticker: txn.ticker,
          companyName: txn.company_name,
          buyerCount: 1,
          totalValue: txn.total_value || 0,
          daysSpan: 7,
          insiders: [
            {
              name: txn.insider_name,
              title: txn.insider_title,
              value: txn.total_value || 0,
              transactionDate: txn.transaction_date,
            },
          ],
        })
      }
    }

    const clusters = Array.from(clusterMap.values())
      .filter((c) => c.buyerCount >= 2)
      .sort((a, b) => b.buyerCount - a.buyerCount || b.totalValue - a.totalValue)
      .slice(0, 5)

    return {
      recentTransactions: (recentTransactions || []) as InsiderTransactionWithDetails[],
      buyCount: buyCount || 0,
      sellCount: sellCount || 0,
      clusterCount: clusters.length,
      watchlistCount,
      clusters,
      watchlistActivity,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      recentTransactions: [] as InsiderTransactionWithDetails[],
      buyCount: 0,
      sellCount: 0,
      clusterCount: 0,
      watchlistCount: 0,
      clusters: [],
      watchlistActivity: [],
    }
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const data = await getDashboardData(user.id)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={cn(
              'text-2xl font-bold tracking-tight',
              'text-[hsl(var(--text-primary))]'
            )}
          >
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--text-muted))]">
            Latest insider trading activity
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <Suspense fallback={<MetricsRowSkeleton />}>
        <StatsRow>
          <StatCard
            label="Insider Buys"
            value={data.buyCount}
            icon={TrendingUp}
            iconColor="positive"
          />
          <StatCard
            label="Insider Sells"
            value={data.sellCount}
            icon={TrendingDown}
            iconColor="negative"
          />
          <StatCard
            label="Cluster Alerts"
            value={data.clusterCount}
            icon={Users}
            iconColor="amber"
          />
          <StatCard
            label="Watchlist Items"
            value={data.watchlistCount}
            icon={Star}
            iconColor="muted"
          />
        </StatsRow>
      </Suspense>

      {/* Content Grid - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Insider Activity Card */}
          <div
            className={cn(
              'rounded-lg border',
              'bg-[hsl(var(--bg-card))]',
              'border-[hsl(var(--border-default))]'
            )}
          >
            {/* Card Header */}
            <div
              className={cn(
                'flex items-center justify-between',
                'px-5 py-4',
                'border-b border-[hsl(var(--border-subtle))]'
              )}
            >
              <h2
                className={cn(
                  'text-base font-semibold',
                  'text-[hsl(var(--text-primary))]'
                )}
              >
                Recent Insider Activity
              </h2>
              <Link
                href="/insider-trades"
                className={cn(
                  'group flex items-center gap-1',
                  'text-sm font-medium',
                  'text-[hsl(var(--accent-amber))]',
                  'hover:text-[hsl(var(--accent-amber-hover))]',
                  'transition-colors duration-150'
                )}
              >
                View all
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            {/* Transaction Table */}
            <Suspense fallback={<TransactionTableSkeleton />}>
              {data.recentTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[hsl(var(--border-subtle))]">
                        <th
                          scope="col"
                          className={cn(
                            'px-5 py-3 text-left',
                            'text-[11px] font-semibold uppercase tracking-[0.05em]',
                            'text-[hsl(var(--text-muted))]'
                          )}
                        >
                          Company
                        </th>
                        <th
                          scope="col"
                          className={cn(
                            'px-5 py-3 text-left',
                            'text-[11px] font-semibold uppercase tracking-[0.05em]',
                            'text-[hsl(var(--text-muted))]'
                          )}
                        >
                          Insider
                        </th>
                        <th
                          scope="col"
                          className={cn(
                            'px-5 py-3 text-left',
                            'text-[11px] font-semibold uppercase tracking-[0.05em]',
                            'text-[hsl(var(--text-muted))]'
                          )}
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className={cn(
                            'px-5 py-3 text-right',
                            'text-[11px] font-semibold uppercase tracking-[0.05em]',
                            'text-[hsl(var(--text-muted))]'
                          )}
                        >
                          Value
                        </th>
                        <th
                          scope="col"
                          className={cn(
                            'px-5 py-3 text-right',
                            'text-[11px] font-semibold uppercase tracking-[0.05em]',
                            'text-[hsl(var(--text-muted))]'
                          )}
                        >
                          Filed
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border-subtle))]">
                      {data.recentTransactions.slice(0, 8).map((transaction) => {
                        const isBuy = transaction.transaction_type === 'P'
                        const isSell = transaction.transaction_type === 'S'

                        return (
                          <tr
                            key={transaction.id}
                            className={cn(
                              'transition-colors duration-150',
                              'hover:bg-[hsl(var(--bg-hover))]'
                            )}
                          >
                            <td className="px-5 py-3.5">
                              <Link
                                href={`/company/${transaction.ticker}`}
                                className={cn(
                                  'font-semibold',
                                  'text-[hsl(var(--text-primary))]',
                                  'hover:text-[hsl(var(--accent-amber))]',
                                  'transition-colors duration-150'
                                )}
                              >
                                {transaction.ticker}
                              </Link>
                              <p
                                className={cn(
                                  'text-xs truncate max-w-[150px]',
                                  'text-[hsl(var(--text-muted))]'
                                )}
                              >
                                {transaction.company_name}
                              </p>
                            </td>
                            <td className="px-5 py-3.5">
                              <p
                                className={cn(
                                  'font-medium truncate max-w-[150px]',
                                  'text-[hsl(var(--text-secondary))]'
                                )}
                              >
                                {transaction.insider_name}
                              </p>
                              <p
                                className={cn(
                                  'text-xs truncate max-w-[150px]',
                                  'text-[hsl(var(--text-muted))]'
                                )}
                              >
                                {transaction.insider_title || 'Insider'}
                              </p>
                            </td>
                            <td className="px-5 py-3.5">
                              {isBuy ? (
                                <Badge
                                  className={cn(
                                    'bg-[hsl(var(--signal-positive)/0.15)]',
                                    'text-[hsl(var(--signal-positive))]',
                                    'border border-[hsl(var(--signal-positive)/0.3)]',
                                    'font-medium'
                                  )}
                                >
                                  <ArrowUpRight className="mr-1 h-3 w-3" aria-hidden="true" />
                                  BUY
                                </Badge>
                              ) : isSell ? (
                                <Badge
                                  className={cn(
                                    'bg-[hsl(var(--signal-negative)/0.15)]',
                                    'text-[hsl(var(--signal-negative))]',
                                    'border border-[hsl(var(--signal-negative)/0.3)]',
                                    'font-medium'
                                  )}
                                >
                                  <ArrowDownRight className="mr-1 h-3 w-3" aria-hidden="true" />
                                  SELL
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  {transaction.transaction_type}
                                </Badge>
                              )}
                            </td>
                            <td
                              className={cn(
                                'px-5 py-3.5 text-right',
                                'font-mono font-semibold tabular-nums',
                                isBuy
                                  ? 'text-[hsl(var(--signal-positive))]'
                                  : isSell
                                    ? 'text-[hsl(var(--signal-negative))]'
                                    : 'text-[hsl(var(--text-secondary))]'
                              )}
                            >
                              {formatCurrency(transaction.total_value || 0)}
                            </td>
                            <td
                              className={cn(
                                'px-5 py-3.5 text-right text-sm',
                                'text-[hsl(var(--text-muted))]'
                              )}
                            >
                              {formatDistanceToNow(new Date(transaction.filed_at), { addSuffix: true })}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-5 py-12 text-center">
                  <TrendingUp
                    className={cn(
                      'mx-auto h-10 w-10',
                      'text-[hsl(var(--text-muted))]',
                      'opacity-50'
                    )}
                    aria-hidden="true"
                  />
                  <p
                    className={cn(
                      'mt-3 text-sm font-medium',
                      'text-[hsl(var(--text-secondary))]'
                    )}
                  >
                    No recent transactions
                  </p>
                  <p
                    className={cn(
                      'mt-1 text-sm',
                      'text-[hsl(var(--text-muted))]'
                    )}
                  >
                    Insider activity will appear here as filings are processed.
                  </p>
                </div>
              )}
            </Suspense>
          </div>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Cluster Alerts Card */}
          <div
            className={cn(
              'rounded-lg border',
              'bg-[hsl(var(--bg-card))]',
              'border-[hsl(var(--border-default))]'
            )}
          >
            <div
              className={cn(
                'px-5 py-4',
                'border-b border-[hsl(var(--border-subtle))]'
              )}
            >
              <h2
                className={cn(
                  'text-base font-semibold',
                  'text-[hsl(var(--text-primary))]'
                )}
              >
                Cluster Alerts
              </h2>
            </div>
            <Suspense fallback={<ClusterAlertsSkeleton />}>
              {data.clusters.length > 0 ? (
                <div className="divide-y divide-[hsl(var(--border-subtle))]">
                  {data.clusters.slice(0, 4).map((cluster) => (
                    <Link
                      key={cluster.companyId}
                      href={`/company/${cluster.ticker}`}
                      className={cn(
                        'flex items-center gap-3 px-5 py-4',
                        'transition-colors duration-150',
                        'hover:bg-[hsl(var(--bg-hover))]'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg',
                          'bg-[hsl(var(--signal-positive)/0.15)]'
                        )}
                      >
                        <Users
                          className="h-4.5 w-4.5 text-[hsl(var(--signal-positive))]"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'font-semibold',
                            'text-[hsl(var(--text-primary))]'
                          )}
                        >
                          {cluster.ticker}
                          <span className="text-[hsl(var(--text-muted))] font-normal"> · </span>
                          <span className="text-[hsl(var(--signal-positive))]">
                            {cluster.buyerCount} buyers
                          </span>
                        </p>
                        <p className="text-xs text-[hsl(var(--text-muted))]">
                          {formatCurrency(cluster.totalValue)} in {cluster.daysSpan} days
                        </p>
                      </div>
                      <ArrowRight
                        className="h-4 w-4 text-[hsl(var(--text-muted))]"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <Users
                    className={cn(
                      'mx-auto h-8 w-8',
                      'text-[hsl(var(--text-muted))]',
                      'opacity-50'
                    )}
                    aria-hidden="true"
                  />
                  <p
                    className={cn(
                      'mt-2 text-sm',
                      'text-[hsl(var(--text-muted))]'
                    )}
                  >
                    No cluster activity detected
                  </p>
                </div>
              )}
            </Suspense>
          </div>

          {/* Watchlist Activity Card */}
          <div
            className={cn(
              'rounded-lg border',
              'bg-[hsl(var(--bg-card))]',
              'border-[hsl(var(--border-default))]'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-between',
                'px-5 py-4',
                'border-b border-[hsl(var(--border-subtle))]'
              )}
            >
              <h2
                className={cn(
                  'text-base font-semibold',
                  'text-[hsl(var(--text-primary))]'
                )}
              >
                Watchlist Activity
              </h2>
              <Link
                href="/watchlist"
                className={cn(
                  'text-sm font-medium',
                  'text-[hsl(var(--accent-amber))]',
                  'hover:text-[hsl(var(--accent-amber-hover))]',
                  'transition-colors duration-150'
                )}
              >
                Manage
              </Link>
            </div>
            <Suspense fallback={<WatchlistActivitySkeleton />}>
              {data.watchlistActivity.length > 0 ? (
                <div className="divide-y divide-[hsl(var(--border-subtle))]">
                  {data.watchlistActivity.slice(0, 4).map((transaction) => {
                    const isBuy = transaction.transaction_type === 'P'
                    const isSell = transaction.transaction_type === 'S'

                    return (
                      <Link
                        key={transaction.id}
                        href={`/company/${transaction.ticker}`}
                        className={cn(
                          'flex items-center gap-3 px-5 py-4',
                          'transition-colors duration-150',
                          'hover:bg-[hsl(var(--bg-hover))]'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg',
                            isBuy
                              ? 'bg-[hsl(var(--signal-positive)/0.15)]'
                              : 'bg-[hsl(var(--signal-negative)/0.15)]'
                          )}
                        >
                          {isBuy ? (
                            <ArrowUpRight
                              className="h-4.5 w-4.5 text-[hsl(var(--signal-positive))]"
                              aria-hidden="true"
                            />
                          ) : (
                            <ArrowDownRight
                              className="h-4.5 w-4.5 text-[hsl(var(--signal-negative))]"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'font-semibold',
                              'text-[hsl(var(--text-primary))]'
                            )}
                          >
                            {transaction.ticker}
                            <span className="text-[hsl(var(--text-muted))] font-normal"> · </span>
                            <span
                              className={
                                isBuy
                                  ? 'text-[hsl(var(--signal-positive))]'
                                  : 'text-[hsl(var(--signal-negative))]'
                              }
                            >
                              {isBuy ? 'Buy' : isSell ? 'Sell' : transaction.transaction_type}
                            </span>
                          </p>
                          <p className="text-xs text-[hsl(var(--text-muted))] truncate">
                            {transaction.insider_name} · {formatCurrency(transaction.total_value || 0)}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : data.watchlistCount > 0 ? (
                <div className="px-5 py-8 text-center">
                  <Star
                    className={cn(
                      'mx-auto h-8 w-8',
                      'text-[hsl(var(--text-muted))]',
                      'opacity-50'
                    )}
                    aria-hidden="true"
                  />
                  <p
                    className={cn(
                      'mt-2 text-sm',
                      'text-[hsl(var(--text-muted))]'
                    )}
                  >
                    No recent activity on watched stocks
                  </p>
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <Star
                    className={cn(
                      'mx-auto h-8 w-8',
                      'text-[hsl(var(--text-muted))]',
                      'opacity-50'
                    )}
                    aria-hidden="true"
                  />
                  <p
                    className={cn(
                      'mt-2 text-sm font-medium',
                      'text-[hsl(var(--text-secondary))]'
                    )}
                  >
                    No stocks in watchlist
                  </p>
                  <p
                    className={cn(
                      'mt-1 text-sm',
                      'text-[hsl(var(--text-muted))]'
                    )}
                  >
                    Add stocks to track insider activity.
                  </p>
                  <Link
                    href="/watchlist"
                    className={cn(
                      'inline-block mt-3',
                      'text-sm font-medium',
                      'text-[hsl(var(--accent-amber))]',
                      'hover:text-[hsl(var(--accent-amber-hover))]',
                      'transition-colors duration-150'
                    )}
                  >
                    Add stocks →
                  </Link>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton loaders
 */
function MetricsRowSkeleton() {
  return (
    <StatsRow>
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </StatsRow>
  )
}

function TransactionTableSkeleton() {
  return (
    <div className="divide-y divide-[hsl(var(--border-subtle))]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <div>
            <Skeleton className="h-4 w-16 bg-[hsl(var(--bg-elevated))]" />
            <Skeleton className="mt-1 h-3 w-24 bg-[hsl(var(--bg-elevated))]" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-4 w-28 bg-[hsl(var(--bg-elevated))]" />
            <Skeleton className="mt-1 h-3 w-20 bg-[hsl(var(--bg-elevated))]" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full bg-[hsl(var(--bg-elevated))]" />
          <Skeleton className="h-4 w-20 bg-[hsl(var(--bg-elevated))]" />
          <Skeleton className="h-4 w-16 bg-[hsl(var(--bg-elevated))]" />
        </div>
      ))}
    </div>
  )
}

function ClusterAlertsSkeleton() {
  return (
    <div className="divide-y divide-[hsl(var(--border-subtle))]">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-4">
          <Skeleton className="h-9 w-9 rounded-lg bg-[hsl(var(--bg-elevated))]" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 bg-[hsl(var(--bg-elevated))]" />
            <Skeleton className="mt-1 h-3 w-24 bg-[hsl(var(--bg-elevated))]" />
          </div>
        </div>
      ))}
    </div>
  )
}

function WatchlistActivitySkeleton() {
  return (
    <div className="divide-y divide-[hsl(var(--border-subtle))]">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-4">
          <Skeleton className="h-9 w-9 rounded-lg bg-[hsl(var(--bg-elevated))]" />
          <div className="flex-1">
            <Skeleton className="h-4 w-28 bg-[hsl(var(--bg-elevated))]" />
            <Skeleton className="mt-1 h-3 w-36 bg-[hsl(var(--bg-elevated))]" />
          </div>
        </div>
      ))}
    </div>
  )
}
