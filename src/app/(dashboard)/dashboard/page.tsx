import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  TrendingUp,
  AlertCircle,
  Star,
  ArrowRight,
  Plus,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personalized insider trading dashboard with recent activity, watchlist, and market insights.',
}
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/stat-card'
import { TransactionTable } from '@/components/dashboard/transaction-table'
import { TransactionCardCompact } from '@/components/dashboard/transaction-card'
import {
  ClusterAlert,
} from '@/components/dashboard/cluster-alert'
import { Skeleton } from '@/components/ui/skeleton'
import type { InsiderTransactionWithDetails } from '@/types/database'

interface ClusterData {
  companyId: string
  ticker: string
  companyName: string
  buyerCount: number
  totalValue: number
  insiders: {
    name: string
    title: string | null
    value: number
    transactionDate: string
  }[]
}

async function getDashboardData(userId: string) {
  const supabase = await createClient()

  // Get date range for queries
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

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

  // Fetch high significance transactions (score > 0.7)
  const { data: notableTransactions } = await supabase
    .from('v_recent_insider_transactions')
    .select('*')
    .gt('ai_significance_score', 0.7)
    .gte('filed_at', thirtyDaysAgo.toISOString())
    .order('ai_significance_score', { ascending: false })
    .limit(5)

  // Fetch user's watchlist with company details
  const { data: watchlistItems } = await supabase
    .from('watchlist_items')
    .select(`
      id,
      company_id,
      created_at,
      companies (
        id,
        ticker,
        name,
        sector
      )
    `)
    .eq('user_id', userId)
    .limit(6)

  // Fetch watchlist alerts (recent activity on watched stocks)
  const watchlistCompanyIds = watchlistItems?.map((item) => item.company_id) || []
  let watchlistAlerts: InsiderTransactionWithDetails[] = []

  if (watchlistCompanyIds.length > 0) {
    const { data } = await supabase
      .from('v_recent_insider_transactions')
      .select('*')
      .in('company_id', watchlistCompanyIds)
      .gte('filed_at', thirtyDaysAgo.toISOString())
      .order('filed_at', { ascending: false })
      .limit(10)

    watchlistAlerts = (data || []) as InsiderTransactionWithDetails[]
  }

  // Build cluster data from purchases
  const { data: purchases } = await supabase
    .from('v_recent_insider_transactions')
    .select('*')
    .eq('transaction_type', 'P')
    .gte('filed_at', thirtyDaysAgo.toISOString())
    .order('filed_at', { ascending: false })

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
    notableTransactions: (notableTransactions || []) as InsiderTransactionWithDetails[],
    watchlistItems: watchlistItems || [],
    watchlistAlerts,
    clusters,
  }
}

async function getUserProfile(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single()

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
  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  const hasNotableActivity =
    data.clusters.length > 0 || data.notableTransactions.length > 0

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userName}
        </h1>
        <p className="text-muted-foreground">{today}</p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Trades Today"
          value={data.todayCount}
          icon={TrendingUp}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Notable Signals"
          value={data.notableTransactions.length}
          icon={AlertCircle}
          iconColor="text-orange-500"
        />
        <StatCard
          title="Watchlist Alerts"
          value={data.watchlistAlerts.length}
          icon={Star}
          iconColor="text-yellow-500"
        />
      </div>

      {/* Notable Activity Section */}
      {hasNotableActivity && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Notable Activity</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/insider-trades?filter=notable">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {/* Cluster Alerts */}
            {data.clusters.length > 0 && (
              <div className="space-y-3">
                {data.clusters.slice(0, 2).map((cluster) => (
                  <ClusterAlert
                    key={cluster.companyId}
                    ticker={cluster.ticker}
                    companyName={cluster.companyName}
                    insiders={cluster.insiders}
                    totalValue={cluster.totalValue}
                    days={30}
                  />
                ))}
              </div>
            )}

            {/* High Significance Transactions */}
            {data.notableTransactions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">
                    High Significance Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.notableTransactions.slice(0, 3).map((txn) => (
                    <TransactionCardCompact key={txn.id} transaction={txn} />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Recent Insider Trades */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Insider Trades</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/insider-trades">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Suspense fallback={<TransactionTableSkeleton />}>
          <TransactionTable transactions={data.recentTransactions} />
        </Suspense>
      </section>

      {/* Watchlist Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Watchlist</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/watchlist">
              Manage
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {data.watchlistItems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.watchlistItems.map((item: any) => {
              const company = item.companies
              const recentActivity = data.watchlistAlerts.filter(
                (a) => a.company_id === item.company_id
              )

              return (
                <Link
                  key={item.id}
                  href={`/dashboard/company/${company.ticker}`}
                >
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold">{company.ticker}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {company.name}
                          </p>
                        </div>
                        {recentActivity.length > 0 && (
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      {recentActivity.length > 0 ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {recentActivity.length} transaction
                          {recentActivity.length !== 1 ? 's' : ''} in last 30 days
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">
                          No recent activity
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">No stocks in your watchlist</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add stocks to track insider trading activity
              </p>
              <Button asChild>
                <Link href="/dashboard/watchlist">
                  <Plus className="mr-2 h-4 w-4" />
                  Add stocks
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}

function TransactionTableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
