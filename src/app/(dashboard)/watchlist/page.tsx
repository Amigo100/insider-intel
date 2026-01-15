import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WatchlistClient } from './watchlist-client'

export const metadata: Metadata = {
  title: 'Watchlist',
  description: 'Your personalized stock watchlist. Track insider trading activity for the companies you care about.',
}

async function getWatchlistData(userId: string) {
  const supabase = await createClient()

  // Get user profile for tier limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const tier = profile?.subscription_tier || 'free'
  const limit = tier === 'pro' ? 100 : tier === 'retail' ? 25 : 5

  // Get watchlist items with company details
  const { data: watchlistItems } = await supabase
    .from('watchlist_items')
    .select(
      `
      id,
      company_id,
      created_at,
      companies (
        id,
        ticker,
        name,
        sector
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Get company IDs for activity query
  const companyIds = (watchlistItems || []).map((item: any) => item.company_id)

  // Get recent transactions for watchlist companies
  let recentActivity: any[] = []
  let companyStats: Record<string, any> = {}

  if (companyIds.length > 0) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: transactions } = await supabase
      .from('v_recent_insider_transactions')
      .select('*')
      .in('company_id', companyIds)
      .gte('filed_at', thirtyDaysAgo.toISOString())
      .order('filed_at', { ascending: false })
      .limit(50)

    recentActivity = transactions || []

    // Build stats per company
    for (const companyId of companyIds) {
      const companyTransactions = recentActivity.filter(
        (t) => t.company_id === companyId
      )
      const lastTransaction = companyTransactions[0] || null

      const buys = companyTransactions.filter(
        (t) => t.transaction_type === 'P'
      ).length
      const sells = companyTransactions.filter(
        (t) => t.transaction_type === 'S'
      ).length

      let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral'
      if (buys > sells * 2) sentiment = 'bullish'
      else if (sells > buys * 2) sentiment = 'bearish'

      const scoresWithValues = companyTransactions.filter(
        (t) => t.ai_significance_score != null
      )
      const avgSignificance =
        scoresWithValues.length > 0
          ? scoresWithValues.reduce(
              (sum, t) => sum + t.ai_significance_score,
              0
            ) / scoresWithValues.length
          : null

      companyStats[companyId] = {
        lastTransaction,
        sentiment,
        recentBuys: buys,
        recentSells: sells,
        avgSignificance,
        transactionCount: companyTransactions.length,
      }
    }
  }

  // Format watchlist items with stats
  const watchlist = (watchlistItems || []).map((item: any) => ({
    id: item.id,
    companyId: item.company_id,
    createdAt: item.created_at,
    company: item.companies,
    stats: companyStats[item.company_id] || {
      lastTransaction: null,
      sentiment: 'neutral',
      recentBuys: 0,
      recentSells: 0,
      avgSignificance: null,
      transactionCount: 0,
    },
  }))

  return {
    watchlist,
    activity: recentActivity.slice(0, 20),
    meta: {
      count: watchlist.length,
      limit,
      tier,
      isAtLimit: watchlist.length >= limit,
    },
  }
}

export default async function WatchlistPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const data = await getWatchlistData(user.id)

  return (
    <div className="space-y-8">
      <WatchlistClient initialData={data} />
    </div>
  )
}
