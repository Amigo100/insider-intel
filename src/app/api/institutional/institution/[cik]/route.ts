/**
 * API Route: Institution Holdings
 *
 * GET /api/institutional/institution/[cik]
 *
 * Returns all holdings for a specific institution.
 *
 * Query params:
 * - quarter: Report quarter date (YYYY-MM-DD), defaults to most recent
 * - limit: Maximum results (default: 100, max: 500)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getInstitutionByCik,
  getInstitutionHoldings,
  getAvailableQuarters,
} from '@/lib/db/institutional-holdings'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cik: string }> }
) {
  try {
    const { cik } = await params
    const searchParams = request.nextUrl.searchParams

    // Validate CIK
    if (!cik || !/^\d+$/.test(cik)) {
      return NextResponse.json(
        { error: 'Invalid CIK parameter. Must be numeric.' },
        { status: 400 }
      )
    }

    // Parse query parameters
    const quarter = searchParams.get('quarter') || undefined
    const limitParam = searchParams.get('limit')

    // Validate and parse limit
    let limit = limitParam ? parseInt(limitParam, 10) : 100
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be a positive integer.' },
        { status: 400 }
      )
    }
    limit = Math.min(limit, 500) // Cap at 500

    // Validate quarter format if provided
    if (quarter && !/^\d{4}-\d{2}-\d{2}$/.test(quarter)) {
      return NextResponse.json(
        { error: 'Invalid quarter format. Use YYYY-MM-DD.' },
        { status: 400 }
      )
    }

    // Check if institution exists
    const institution = await getInstitutionByCik(cik)

    if (!institution) {
      return NextResponse.json(
        { error: `Institution not found: CIK ${cik}` },
        { status: 404 }
      )
    }

    // Fetch holdings
    const holdings = await getInstitutionHoldings(institution.id, { quarter, limit })

    // Calculate aggregate statistics
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
    const totalPositions = holdings.length
    const newPositions = holdings.filter((h) => h.is_new_position).length
    const increasedPositions = holdings.filter(
      (h) => !h.is_new_position && (h.shares_change || 0) > 0
    ).length
    const decreasedPositions = holdings.filter(
      (h) => (h.shares_change || 0) < 0
    ).length

    // Get top 5 holdings by value
    const topHoldings = holdings.slice(0, 5).map((h) => ({
      ticker: h.ticker,
      companyName: h.company_name,
      value: h.value,
      percentOfPortfolio: h.percent_of_portfolio,
    }))

    // Get report date from first holding
    const reportDate = holdings.length > 0 ? holdings[0].report_date : quarter || null

    // Return response with cache headers
    return NextResponse.json(
      {
        institution: {
          id: institution.id,
          cik: institution.cik,
          name: institution.name,
          type: institution.institution_type,
          aumEstimate: institution.aum_estimate,
        },
        holdings,
        summary: {
          totalValue,
          totalPositions,
          newPositions,
          increasedPositions,
          decreasedPositions,
          topHoldings,
          reportDate,
        },
        meta: {
          filters: {
            quarter: quarter || 'latest',
            limit,
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
    console.error('Error fetching institution holdings:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
