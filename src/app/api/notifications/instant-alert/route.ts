import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendInstantAlertEmail } from '@/lib/email/send-email'
import type { Database } from '@/types/supabase'
import { logger } from '@/lib/logger'

const log = logger.email

// Use service role client for internal API calls
function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface InstantAlertRequest {
  transactionId: string
}

export async function POST(request: NextRequest) {
  // Verify internal API secret for security
  const authHeader = request.headers.get('authorization')
  const apiSecret = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET

  if (apiSecret && authHeader !== `Bearer ${apiSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: InstantAlertRequest = await request.json()
    const { transactionId } = body

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get the transaction details
    const { data: transaction, error: txError } = await supabase
      .from('v_recent_insider_transactions')
      .select('*')
      .eq('id', transactionId)
      .single()

    if (txError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Skip if not a buy or sell or missing required data
    if (
      transaction.transaction_type !== 'P' &&
      transaction.transaction_type !== 'S'
    ) {
      return NextResponse.json({
        success: true,
        message: 'Transaction type not eligible for instant alerts',
        emailsSent: 0,
      })
    }

    if (!transaction.company_id) {
      return NextResponse.json(
        { error: 'Transaction missing company ID' },
        { status: 400 }
      )
    }

    // Get users who:
    // 1. Have instant alerts enabled
    // 2. Are on retail or pro tier (instant alerts require paid plan)
    // 3. Have this company in their watchlist
    const { data: eligibleUsers, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        notification_instant_alerts,
        subscription_tier
      `)
      .eq('notification_instant_alerts', true)
      .in('subscription_tier', ['retail', 'pro'])
      .not('email', 'is', null)

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    if (!eligibleUsers || eligibleUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No eligible users for instant alerts',
        emailsSent: 0,
      })
    }

    // Filter to users who have this company in their watchlist
    const userIds = eligibleUsers.map((u) => u.id)
    const { data: watchlistItems } = await supabase
      .from('watchlist_items')
      .select('user_id')
      .eq('company_id', transaction.company_id)
      .in('user_id', userIds)

    const usersWithWatchlist = new Set(watchlistItems?.map((w) => w.user_id) || [])
    const usersToNotify = eligibleUsers.filter((u) => usersWithWatchlist.has(u.id))

    if (usersToNotify.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users watching this company',
        emailsSent: 0,
      })
    }

    const results: { userId: string; success: boolean; error?: string }[] = []

    for (const user of usersToNotify) {
      try {
        const result = await sendInstantAlertEmail({
          to: user.email!,
          userName: user.full_name || 'Investor',
          ticker: transaction.ticker!,
          companyName: transaction.company_name!,
          insiderName: transaction.insider_name!,
          insiderTitle: transaction.insider_title,
          transactionType: transaction.transaction_type as 'P' | 'S',
          shares: transaction.shares!,
          pricePerShare: transaction.price_per_share || 0,
          totalValue: transaction.total_value!,
          isDirector: transaction.is_director || false,
          isOfficer: transaction.is_officer || false,
          isTenPercentOwner: transaction.is_ten_percent_owner || false,
          filedAt: new Date(transaction.filed_at!),
          aiContext: transaction.ai_context,
          significanceScore: transaction.ai_significance_score,
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
      message: `Instant alert emails processed`,
      transactionId,
      ticker: transaction.ticker,
      emailsSent: successCount,
      emailsFailed: failureCount,
    })
  } catch (error) {
    log.error({ error }, 'Instant alert error')
    return NextResponse.json(
      { error: 'Failed to send instant alerts' },
      { status: 500 }
    )
  }
}
