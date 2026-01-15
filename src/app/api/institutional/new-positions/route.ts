/**
 * API Route: New Institutional Positions
 *
 * GET /api/institutional/new-positions
 *
 * Returns new positions opened by institutions this quarter.
 *
 * Query params:
 * - quarter: Report quarter date (YYYY-MM-DD), defaults to most recent
 * - type: Institution type filter (e.g., 'Hedge Fund', 'Mutual Fund')
 * - limit: Maximum results (default: 50, max: 200)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getNewPositions, getAvailableQuarters } from '@/lib/db/institutional-holdings'
import { logger } from '@/lib/logger'

const log = logger.api

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const quarter = searchParams.get('quarter') || undefined
    const institutionType = searchParams.get('type') || undefined
    const limitParam = searchParams.get('limit')

    // Validate and parse limit
    let limit = limitParam ? parseInt(limitParam, 10) : 50
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be a positive integer.' },
        { status: 400 }
      )
    }
    limit = Math.min(limit, 200) // Cap at 200

    // Validate quarter format if provided
    if (quarter && !/^\d{4}-\d{2}-\d{2}$/.test(quarter)) {
      return NextResponse.json(
        { error: 'Invalid quarter format. Use YYYY-MM-DD.' },
        { status: 400 }
      )
    }

    // Fetch new positions
    const positions = await getNewPositions({
      quarter,
      institutionType,
      limit,
    })

    // Group by company to show which companies are attracting new institutional interest
    const companyInterest = new Map<
      string,
      {
        ticker: string
        companyName: string
        newInstitutions: number
        totalValue: number
        institutions: string[]
      }
    >()

    for (const position of positions) {
      const existing = companyInterest.get(position.company_id)

      if (existing) {
        existing.newInstitutions++
        existing.totalValue += position.value
        if (!existing.institutions.includes(position.institution_name)) {
          existing.institutions.push(position.institution_name)
        }
      } else {
        companyInterest.set(position.company_id, {
          ticker: position.ticker,
          companyName: position.company_name,
          newInstitutions: 1,
          totalValue: position.value,
          institutions: [position.institution_name],
        })
      }
    }

    // Get top companies by new institutional interest
    const topCompanies = Array.from(companyInterest.values())
      .sort((a, b) => b.newInstitutions - a.newInstitutions || b.totalValue - a.totalValue)
      .slice(0, 10)

    // Calculate summary statistics
    const totalNewPositions = positions.length
    const totalValue = positions.reduce((sum, p) => sum + p.value, 0)
    const uniqueInstitutions = new Set(positions.map((p) => p.institution_id)).size
    const uniqueCompanies = companyInterest.size

    // Get report date from first position
    const reportDate = positions.length > 0 ? positions[0].report_date : quarter || null

    // Return response with cache headers
    return NextResponse.json(
      {
        positions,
        topCompanies,
        summary: {
          totalNewPositions,
          totalValue,
          uniqueInstitutions,
          uniqueCompanies,
          reportDate,
        },
        meta: {
          filters: {
            quarter: quarter || 'latest',
            type: institutionType || 'all',
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
    log.error({ error }, 'Error fetching new positions')

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
