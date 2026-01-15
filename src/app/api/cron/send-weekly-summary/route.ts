import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { sendWeeklySummaryEmail } from '@/lib/email/send-email'
import { requireCronAuth } from '@/lib/auth/cron'
import type { Database } from '@/types/supabase'
import { logger } from '@/lib/logger'

const log = logger.cron

// Use service role client for cron jobs
function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  // Verify cron secret (required in production)
  const authError = requireCronAuth(request)
  if (authError) return authError

  try {
    const supabase = createServiceClient()

    // Get last week's date range
    const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
    const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })

    // Get users who have weekly summary enabled
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, notification_weekly_summary')
      .eq('notification_weekly_summary', true)
      .not('email', 'is', null)

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with weekly summary enabled',
        emailsSent: 0,
      })
    }

    // Get market-wide stats for the week
    const { data: allTransactions } = await supabase
      .from('v_recent_insider_transactions')
      .select('*')
      .gte('filed_at', lastWeekStart.toISOString())
      .lte('filed_at', lastWeekEnd.toISOString())

    const transactions = allTransactions || []

    // Calculate market stats
    const stats = {
      totalTransactions: transactions.length,
      totalBuyValue: transactions
        .filter((t) => t.transaction_type === 'P')
        .reduce((sum, t) => sum + (t.total_value || 0), 0),
      totalSellValue: transactions
        .filter((t) => t.transaction_type === 'S')
        .reduce((sum, t) => sum + (t.total_value || 0), 0),
      uniqueCompanies: new Set(transactions.map((t) => t.company_id)).size,
      uniqueInsiders: new Set(transactions.map((t) => t.insider_id)).size,
    }

    // Calculate top movers
    const companyStats = new Map<
      string,
      {
        ticker: string
        companyName: string
        buyValue: number
        sellValue: number
        transactionCount: number
      }
    >()

    for (const t of transactions) {
      if (!t.company_id || !t.ticker || !t.company_name) continue

      const existing = companyStats.get(t.company_id) || {
        ticker: t.ticker,
        companyName: t.company_name,
        buyValue: 0,
        sellValue: 0,
        transactionCount: 0,
      }

      if (t.transaction_type === 'P') {
        existing.buyValue += t.total_value || 0
      } else if (t.transaction_type === 'S') {
        existing.sellValue += t.total_value || 0
      }
      existing.transactionCount++

      companyStats.set(t.company_id, existing)
    }

    const allMovers = Array.from(companyStats.values()).map((c) => ({
      ...c,
      netValue: c.buyValue - c.sellValue,
    }))

    const topBuys = [...allMovers]
      .sort((a, b) => b.buyValue - a.buyValue)
      .slice(0, 5)

    const topSells = [...allMovers]
      .sort((a, b) => b.sellValue - a.sellValue)
      .slice(0, 5)

    const results: { userId: string; success: boolean; error?: string }[] = []

    for (const user of users) {
      try {
        // Get user's watchlist activity
        const { data: watchlist } = await supabase
          .from('watchlist_items')
          .select('company_id, company:companies(ticker, name)')
          .eq('user_id', user.id)

        const watchlistCompanyIds = watchlist?.map((w) => w.company_id) || []

        // Calculate watchlist-specific activity
        const watchlistActivity = watchlistCompanyIds
          .map((companyId) => {
            const companyTransactions = transactions.filter(
              (t) => t.company_id === companyId
            )
            if (companyTransactions.length === 0) return null

            const firstTx = companyTransactions[0]
            return {
              ticker: firstTx.ticker || 'Unknown',
              companyName: firstTx.company_name || 'Unknown',
              transactionCount: companyTransactions.length,
              totalValue: companyTransactions.reduce(
                (sum, t) => sum + (t.total_value || 0),
                0
              ),
            }
          })
          .filter((w): w is NonNullable<typeof w> => w !== null)
          .sort((a, b) => b.totalValue - a.totalValue)

        // Send the email
        const result = await sendWeeklySummaryEmail({
          to: user.email!,
          userName: user.full_name || 'Investor',
          weekStart: lastWeekStart,
          weekEnd: lastWeekEnd,
          stats,
          topBuys,
          topSells,
          watchlistActivity,
        })

        results.push({
          userId: user.id,
          success: result.success,
          error: result.error,
        })
      } catch (err) {
        results.push({
          userId: user.id,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Weekly summary emails processed`,
      emailsSent: successCount,
      emailsFailed: failureCount,
      details: results,
    })
  } catch (error) {
    log.error({ error }, 'Weekly summary cron error')
    return NextResponse.json(
      { error: 'Failed to send weekly summary emails' },
      { status: 500 }
    )
  }
}
