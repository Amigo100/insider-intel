import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { startOfDay, subDays } from 'date-fns'
import { sendDailyDigestEmail } from '@/lib/email/send-email'
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
    const today = new Date()
    const yesterday = subDays(startOfDay(today), 1)

    // Get users who have daily digest enabled
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, notification_daily_digest')
      .eq('notification_daily_digest', true)
      .not('email', 'is', null)

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with daily digest enabled',
        emailsSent: 0,
      })
    }

    const results: { userId: string; success: boolean; error?: string }[] = []

    for (const user of users) {
      try {
        // Get user's watchlist
        const { data: watchlist } = await supabase
          .from('watchlist_items')
          .select('company_id')
          .eq('user_id', user.id)

        const companyIds = watchlist?.map((w) => w.company_id) || []

        if (companyIds.length === 0) {
          // Skip users with empty watchlist
          results.push({
            userId: user.id,
            success: true,
            error: 'No watchlist items',
          })
          continue
        }

        // Get transactions for watchlist companies from yesterday
        const { data: transactions } = await supabase
          .from('v_recent_insider_transactions')
          .select('*')
          .in('company_id', companyIds)
          .gte('filed_at', yesterday.toISOString())
          .lt('filed_at', startOfDay(today).toISOString())
          .order('total_value', { ascending: false })

        const formattedTransactions = (transactions || [])
          .filter(
            (t) =>
              t.ticker &&
              t.company_name &&
              t.insider_name &&
              t.transaction_type &&
              t.shares &&
              t.total_value &&
              t.filed_at
          )
          .map((t) => ({
            ticker: t.ticker!,
            companyName: t.company_name!,
            insiderName: t.insider_name!,
            insiderTitle: t.insider_title,
            transactionType: t.transaction_type as 'P' | 'S',
            shares: t.shares!,
            totalValue: t.total_value!,
            filedAt: t.filed_at!,
          }))

        // Send the email
        const result = await sendDailyDigestEmail({
          to: user.email!,
          userName: user.full_name || 'Investor',
          date: yesterday,
          transactions: formattedTransactions,
          watchlistCount: companyIds.length,
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
      message: `Daily digest emails processed`,
      emailsSent: successCount,
      emailsFailed: failureCount,
      details: results,
    })
  } catch (error) {
    log.error({ error }, 'Daily digest cron error')
    return NextResponse.json(
      { error: 'Failed to send daily digest emails' },
      { status: 500 }
    )
  }
}
