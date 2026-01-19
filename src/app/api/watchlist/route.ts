/**
 * API Route: Watchlist Management
 *
 * GET /api/watchlist - Get user's watchlist with company details and activity
 * POST /api/watchlist - Add company to watchlist
 * DELETE /api/watchlist - Remove company from watchlist
 *
 * Enforces free tier limit of 5 stocks.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const log = logger.api

const FREE_TIER_LIMIT = 5
const RETAIL_TIER_LIMIT = 25
const PRO_TIER_LIMIT = 100

function getWatchlistLimit(tier: string): number {
  switch (tier) {
    case 'pro':
      return PRO_TIER_LIMIT
    case 'retail':
      return RETAIL_TIER_LIMIT
    default:
      return FREE_TIER_LIMIT
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile for tier limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tier = profile?.subscription_tier || 'free'
    const limit = getWatchlistLimit(tier)

    // Get watchlist items with company details
    const { data: watchlistItems, error: watchlistError } = await supabase
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (watchlistError) {
      log.error({ error: watchlistError }, 'Error fetching watchlist')
      return NextResponse.json(
        { error: 'Failed to fetch watchlist' },
        { status: 500 }
      )
    }

    // Get company IDs for activity query
    const companyIds = (watchlistItems || []).map((item: any) => item.company_id)

    // Get recent transactions for watchlist companies
    let recentActivity: any[] = []
    let companyStats: Record<string, any> = {}

    if (companyIds.length > 0) {
      // Get recent activity (last 30 days)
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

        // Calculate simple sentiment (more buys = bullish, more sells = bearish)
        const buys = companyTransactions.filter(
          (t) => t.transaction_type === 'P'
        ).length
        const sells = companyTransactions.filter(
          (t) => t.transaction_type === 'S'
        ).length

        let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral'
        if (buys > sells * 2) sentiment = 'bullish'
        else if (sells > buys * 2) sentiment = 'bearish'

        // Get average AI significance score
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

    return NextResponse.json({
      watchlist,
      activity: recentActivity.slice(0, 20),
      meta: {
        count: watchlist.length,
        limit,
        tier,
        isAtLimit: watchlist.length >= limit,
      },
    })
  } catch (error) {
    log.error({ error }, 'Error in watchlist GET')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ticker } = body

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker is required' },
        { status: 400 }
      )
    }

    // Get user profile for tier limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tier = profile?.subscription_tier || 'free'
    const limit = getWatchlistLimit(tier)

    // Check current watchlist count
    const { count } = await supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count || 0) >= limit) {
      return NextResponse.json(
        {
          error: 'Watchlist limit reached',
          limit,
          tier,
          upgradeRequired: true,
        },
        { status: 403 }
      )
    }

    // Find company by ticker
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, ticker, name, sector')
      .eq('ticker', ticker.toUpperCase())
      .single()

    if (companyError || !company) {
      // Company not in database - this means no insider transactions have been filed yet
      return NextResponse.json(
        {
          error: 'No insider transaction data available',
          code: 'NO_INSIDER_DATA',
          message: `${ticker.toUpperCase()} has no recent insider transactions filed with the SEC. Only stocks with Form 4 filings can be added to your watchlist.`,
          ticker: ticker.toUpperCase(),
        },
        { status: 404 }
      )
    }

    // Check if already in watchlist
    const { data: existing } = await supabase
      .from('watchlist_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('company_id', company.id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already in watchlist', existingId: existing.id },
        { status: 409 }
      )
    }

    // Add to watchlist
    const { data: newItem, error: insertError } = await supabase
      .from('watchlist_items')
      .insert({
        user_id: user.id,
        company_id: company.id,
      })
      .select('id, company_id, created_at')
      .single()

    if (insertError) {
      log.error({ error: insertError }, 'Error adding to watchlist')
      return NextResponse.json(
        { error: 'Failed to add to watchlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      item: {
        id: newItem.id,
        companyId: newItem.company_id,
        createdAt: newItem.created_at,
        company,
        stats: {
          lastTransaction: null,
          sentiment: 'neutral',
          recentBuys: 0,
          recentSells: 0,
          avgSignificance: null,
          transactionCount: 0,
        },
      },
      meta: {
        count: (count || 0) + 1,
        limit,
        tier,
      },
    })
  } catch (error) {
    log.error({ error }, 'Error in watchlist POST')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json(
        { error: 'Watchlist item ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership and delete
    const { error: deleteError } = await supabase
      .from('watchlist_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id)

    if (deleteError) {
      log.error({ error: deleteError }, 'Error removing from watchlist')
      return NextResponse.json(
        { error: 'Failed to remove from watchlist' },
        { status: 500 }
      )
    }

    // Get updated count
    const { count } = await supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get user profile for tier limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tier = profile?.subscription_tier || 'free'
    const limit = getWatchlistLimit(tier)

    return NextResponse.json({
      success: true,
      meta: {
        count: count || 0,
        limit,
        tier,
      },
    })
  } catch (error) {
    log.error({ error }, 'Error in watchlist DELETE')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
