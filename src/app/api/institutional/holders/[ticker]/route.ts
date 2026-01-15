/**
 * API Route: Top Institutional Holders
 *
 * GET /api/institutional/holders/[ticker]
 *
 * Returns top institutional holders for a stock with quarter-over-quarter changes.
 *
 * Query params:
 * - limit: Maximum results (default: 20, max: 100)
 * - quarter: Report quarter date (YYYY-MM-DD), defaults to most recent
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCompanyByTicker } from '@/lib/db/insider-transactions'
import { getTopHolders, getAvailableQuarters } from '@/lib/db/institutional-holdings'
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
    const limitParam = searchParams.get('limit')
    const quarter = searchParams.get('quarter') || undefined

    // Validate and parse limit
    let limit = limitParam ? parseInt(limitParam, 10) : 20
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be a positive integer.' },
        { status: 400 }
      )
    }
    limit = Math.min(limit, 100) // Cap at 100

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

    // Fetch top holders
    const holders = await getTopHolders(company.id, { limit, quarter })

    // Calculate aggregate statistics
    const totalInstitutionalShares = holders.reduce((sum, h) => sum + h.shares, 0)
    const totalInstitutionalValue = holders.reduce((sum, h) => sum + h.value, 0)
    const netBuyers = holders.filter((h) => (h.shares_change || 0) > 0).length
    const netSellers = holders.filter((h) => (h.shares_change || 0) < 0).length
    const newPositions = holders.filter((h) => h.is_new_position).length

    // Get actual report date from first holder
    const reportDate = holders.length > 0 ? holders[0].report_date : quarter || null

    // Return response with cache headers
    return NextResponse.json(
      {
        company: {
          id: company.id,
          ticker: company.ticker,
          name: company.name,
          sector: company.sector,
          industry: company.industry,
        },
        holders,
        summary: {
          totalHolders: holders.length,
          totalInstitutionalShares,
          totalInstitutionalValue,
          netBuyers,
          netSellers,
          newPositions,
          reportDate,
        },
        meta: {
          filters: {
            limit,
            quarter: quarter || 'latest',
          },
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
    log.error({ error }, 'Error fetching institutional holders')

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
