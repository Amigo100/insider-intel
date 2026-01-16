import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  TrendingUp,
  Users,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard, StatsRow } from '@/components/dashboard/stats-card'
import LiveIndicator from '@/components/dashboard/live-indicator'
import EmptyState from '@/components/dashboard/empty-state'
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
 * Get time-appropriate greeting
 */
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
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

    // Get date range for queries
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch recent transactions
    const { data: recentTransactions } = await supabase
      .from('v_recent_insider_transactions')
      .select('*')
      .order('filed_at', { ascending: false })
      .limit(10)

    // Fetch today's transactions count
    const { count: todayCount } = await supabase
      .from('insider_transactions')
      .select('*', { count: 'exact', head: true })
      .gte('filed_at', today.toISOString())

    // Fetch user's watchlist company IDs
    const { data: watchlistItems } = await supabase
      .from('watchlist_items')
      .select('company_id')
      .eq('user_id', userId)

    const watchlistCompanyIds = watchlistItems?.map((item) => item.company_id) || []

    // Fetch watchlist activity count
    let watchlistActivityCount = 0
    if (watchlistCompanyIds.length > 0) {
      const { count } = await supabase
        .from('insider_transactions')
        .select('*', { count: 'exact', head: true })
        .in('company_id', watchlistCompanyIds)
        .gte('filed_at', thirtyDaysAgo.toISOString())

      watchlistActivityCount = count || 0
    }

    // Calculate net buy volume from recent purchases
    const { data: purchases } = await supabase
      .from('v_recent_insider_transactions')
      .select('*')
      .eq('transaction_type', 'P')
      .gte('filed_at', thirtyDaysAgo.toISOString())

    const { data: sales } = await supabase
      .from('v_recent_insider_transactions')
      .select('*')
      .eq('transaction_type', 'S')
      .gte('filed_at', thirtyDaysAgo.toISOString())

    const buyVolume = (purchases || []).reduce((sum, tx) => sum + (tx.total_value || 0), 0)
    const sellVolume = (sales || []).reduce((sum, tx) => sum + (tx.total_value || 0), 0)
    const netBuyVolume = buyVolume - sellVolume

    // Build cluster data from purchases (7-day window for clusters)
    const clusterMap = new Map<string, ClusterData>()

    for (const txn of purchases || []) {
      if (!txn.company_id || !txn.ticker || !txn.company_name || !txn.insider_name || !txn.transaction_date) continue

      const txnDate = new Date(txn.transaction_date)
      if (txnDate < sevenDaysAgo) continue

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
      todayCount: todayCount || 0,
      watchlistActivityCount,
      netBuyVolume,
      clusters,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      recentTransactions: [] as InsiderTransactionWithDetails[],
      todayCount: 0,
      watchlistActivityCount: 0,
      netBuyVolume: 0,
      clusters: [],
    }
  }
}

async function getUserProfile(userId: string) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single()

  if (error) {
    return null
  }

  return profile
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [profile, data] = await Promise.all([
    getUserProfile(user.id),
    getDashboardData(user.id),
  ])

  const userName = profile?.full_name || user.email?.split('@')[0] || 'there'
  const greeting = getGreeting()

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            {greeting}, {userName}
          </h1>
          <p className="text-lg text-slate-400 mt-1">
            Here&apos;s what&apos;s happening with insider trades today
          </p>
        </div>
        <LiveIndicator />
      </div>

      {/* Stats Row */}
      <StatsRow>
        <StatCard
          label="Today's Trades"
          value={data.todayCount}
          icon={TrendingUp}
        />
        <StatCard
          label="Cluster Alerts"
          value={data.clusters.length}
          icon={Users}
        />
        <StatCard
          label="Watchlist Activity"
          value={data.watchlistActivityCount}
        />
        <StatCard
          label="Net Buy Volume"
          value={formatCurrency(data.netBuyVolume)}
          change={data.netBuyVolume >= 0 ? 'Net buying' : 'Net selling'}
          changeType={data.netBuyVolume >= 0 ? 'positive' : 'negative'}
        />
      </StatsRow>

      {/* Cluster Alert Banner */}
      {data.clusters.length > 0 && (
        <div className="space-y-3">
          {data.clusters.slice(0, 2).map((cluster) => (
            <Link
              key={cluster.companyId}
              href={`/company/${cluster.ticker}`}
              className="block"
            >
              <Card className="border-l-4 border-l-emerald-500 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                      <Users className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">
                        {cluster.buyerCount} insiders bought {formatCurrency(cluster.totalValue)} of{' '}
                        <span className="text-emerald-400">{cluster.ticker}</span> in {cluster.daysSpan} days
                      </p>
                      <p className="text-sm text-slate-400">
                        Cluster buying detected
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Recent Transactions Table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Insider Transactions</h2>
          <Link
            href="/insider-trades"
            className="group flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View all transactions
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <Suspense fallback={<TransactionTableSkeleton />}>
          {data.recentTransactions.length > 0 ? (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/70 rounded-xl border border-white/[0.08]">
              <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                          Company
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                          Insider
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                          Type
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-400">
                          Value
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-400">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {data.recentTransactions.slice(0, 8).map((transaction) => {
                        const isBuy = transaction.transaction_type === 'P'
                        const isSell = transaction.transaction_type === 'S'

                        return (
                          <tr
                            key={transaction.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-4 py-3">
                              <Link
                                href={`/company/${transaction.ticker}`}
                                className="font-semibold text-white hover:underline"
                              >
                                {transaction.ticker}
                              </Link>
                              <p className="text-xs text-slate-400 truncate max-w-[150px]">
                                {transaction.company_name}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-200 truncate max-w-[150px]">
                                {transaction.insider_name}
                              </p>
                              <p className="text-xs text-slate-400 truncate max-w-[150px]">
                                {transaction.insider_title || 'Insider'}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              {isBuy ? (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                                  <ArrowUpRight className="mr-1 h-3 w-3" />
                                  BUY
                                </Badge>
                              ) : isSell ? (
                                <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 font-medium">
                                  <ArrowDownRight className="mr-1 h-3 w-3" />
                                  SELL
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  {transaction.transaction_type}
                                </Badge>
                              )}
                            </td>
                            <td className={`px-4 py-3 text-right font-mono font-semibold ${isBuy ? 'text-emerald-400' : isSell ? 'text-red-400' : 'text-slate-200'}`}>
                              {formatCurrency(transaction.total_value || 0)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-slate-400">
                              {formatDistanceToNow(new Date(transaction.filed_at), { addSuffix: true })}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/70 rounded-xl border border-white/[0.08]">
              <EmptyState
                icon={TrendingUp}
                title="No recent transactions"
                description="Check back later for new insider trading activity"
                action={{
                  label: 'View all trades',
                  href: '/insider-trades',
                }}
              />
            </div>
          )}
        </Suspense>
      </section>
    </div>
  )
}

function TransactionTableSkeleton() {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/70 rounded-xl border border-white/[0.08]">
      <div className="divide-y divide-white/[0.06]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div>
              <Skeleton className="h-4 w-16 bg-slate-700/50" />
              <Skeleton className="mt-1 h-3 w-24 bg-slate-700/50" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-4 w-28 bg-slate-700/50" />
              <Skeleton className="mt-1 h-3 w-20 bg-slate-700/50" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full bg-slate-700/50" />
            <Skeleton className="h-4 w-20 bg-slate-700/50" />
            <Skeleton className="h-4 w-16 bg-slate-700/50" />
          </div>
        ))}
      </div>
    </div>
  )
}
