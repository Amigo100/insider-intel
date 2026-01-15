/**
 * API Route: Recent Insider Transactions
 *
 * GET /api/insider/recent
 *
 * Query params:
 * - ticker: Filter by stock ticker (optional)
 * - type: Transaction type - 'P' (purchase), 'S' (sale), 'all' (default: 'all')
 * - days: Number of days to look back (default: 30)
 * - limit: Maximum results (default: 50, max: 200)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRecentTransactions } from '@/lib/db/insider-transactions'
import { logger } from '@/lib/logger'

const log = logger.api

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const ticker = searchParams.get('ticker') || undefined
    const typeParam = searchParams.get('type') || 'all'
    const daysParam = searchParams.get('days')
    const limitParam = searchParams.get('limit')

    // Validate and parse days
    const days = daysParam ? parseInt(daysParam, 10) : 30
    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Invalid days parameter. Must be between 1 and 365.' },
        { status: 400 }
      )
    }

    // Validate and parse limit
    let limit = limitParam ? parseInt(limitParam, 10) : 50
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be a positive integer.' },
        { status: 400 }
      )
    }
    limit = Math.min(limit, 200) // Cap at 200

    // Validate type parameter
    const validTypes = ['P', 'S', 'A', 'D', 'G', 'M', 'all']
    if (!validTypes.includes(typeParam.toUpperCase())) {
      return NextResponse.json(
        { error: `Invalid type parameter. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const type = typeParam.toUpperCase() === 'ALL' ? undefined : typeParam.toUpperCase()

    // Fetch transactions
    const transactions = await getRecentTransactions({
      ticker,
      type,
      days,
      limit,
    })

    // Return response with cache headers
    return NextResponse.json(
      {
        transactions,
        meta: {
          count: transactions.length,
          filters: {
            ticker: ticker || null,
            type: type || 'all',
            days,
            limit,
          },
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    log.error({ error }, 'Error fetching recent transactions')

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
