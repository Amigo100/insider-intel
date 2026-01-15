/**
 * API Route: Institutional Activity Summary
 *
 * GET /api/institutional/activity/[ticker]
 *
 * Returns buying/selling summary for a stock:
 * - Number of institutions buying vs selling
 * - Net share change
 * - Aggregate values
 *
 * Query params:
 * - quarter: Report quarter date (YYYY-MM-DD), defaults to most recent
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCompanyByTicker } from '@/lib/db/insider-transactions'
import { getNetBuyingSelling, getTopHolders } from '@/lib/db/institutional-holdings'
import { logger } from '@/lib/logger'

const log = logger.api

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params
    const searchParams = request.nextUrl.searchParams

    // Validate ticker
    if (!ticker || ticker.length > 10) {
      return NextResponse.json(
        { error: 'Invalid ticker parameter' },
        { status: 400 }
      )
    }

    const normalizedTicker = ticker.toUpperCase()

    // Parse query parameters
    const quarter = searchParams.get('quarter') || undefined

    // Validate quarter format if provided
    if (quarter && !/^\d{4}-\d{2}-\d{2}$/.test(quarter)) {
      return NextResponse.json(
        { error: 'Invalid quarter format. Use YYYY-MM-DD.' },
        { status: 400 }
      )
    }

    // Check if company exists
    const company = await getCompanyByTicker(normalizedTicker)

    if (!company) {
      return NextResponse.json(
        { error: `Company not found: ${normalizedTicker}` },
        { status: 404 }
      )
    }

    // Fetch buying/selling summary
    const activity = await getNetBuyingSelling(company.id, quarter)

    // Fetch top holders to get additional context
    const topHolders = await getTopHolders(company.id, { limit: 10, quarter })

    // Categorize activity
    const topBuyers = topHolders
      .filter((h) => (h.shares_change || 0) > 0)
      .sort((a, b) => (b.shares_change || 0) - (a.shares_change || 0))
      .slice(0, 5)
      .map((h) => ({
        institution: h.institution_name,
        type: h.institution_type,
        sharesAdded: h.shares_change,
        percentChange: h.shares_change_percent,
        isNewPosition: h.is_new_position,
      }))

    const topSellers = topHolders
      .filter((h) => (h.shares_change || 0) < 0)
      .sort((a, b) => (a.shares_change || 0) - (b.shares_change || 0))
      .slice(0, 5)
      .map((h) => ({
        institution: h.institution_name,
        type: h.institution_type,
        sharesReduced: Math.abs(h.shares_change || 0),
        percentChange: h.shares_change_percent,
      }))

    const newPositions = topHolders
      .filter((h) => h.is_new_position)
      .slice(0, 5)
      .map((h) => ({
        institution: h.institution_name,
        type: h.institution_type,
        shares: h.shares,
        value: h.value,
      }))

    // Calculate sentiment score (-1 to 1)
    const totalActivity = activity.totalBuyers + activity.totalSellers
    const sentimentScore =
      totalActivity > 0
        ? (activity.totalBuyers - activity.totalSellers) / totalActivity
        : 0

    // Determine sentiment label
    let sentiment: 'bullish' | 'bearish' | 'neutral'
    if (sentimentScore > 0.2) {
      sentiment = 'bullish'
    } else if (sentimentScore < -0.2) {
      sentiment = 'bearish'
    } else {
      sentiment = 'neutral'
    }

    // Get report date from top holders
    const reportDate = topHolders.length > 0 ? topHolders[0].report_date : quarter || null

    // Return response with cache headers
    return NextResponse.json(
      {
        company: {
          id: company.id,
          ticker: company.ticker,
          name: company.name,
        },
        activity: {
          totalBuyers: activity.totalBuyers,
          totalSellers: activity.totalSellers,
          netSharesChange: activity.netSharesChange,
          totalSharesBought: activity.totalSharesBought,
          totalSharesSold: activity.totalSharesSold,
          sentimentScore: Math.round(sentimentScore * 100) / 100,
          sentiment,
        },
        topBuyers,
        topSellers,
        newPositions,
        meta: {
          filters: {
            quarter: quarter || 'latest',
          },
          reportDate,
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 's-maxage=3600, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    log.error({ error }, 'Error fetching institutional activity')

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
