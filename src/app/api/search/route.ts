/**
 * API Route: Company Search
 *
 * GET /api/search
 *
 * Powers the dashboard search bar with company autocomplete.
 *
 * Query params:
 * - q: Search term (required, min 1 character)
 *
 * Returns companies where:
 * - Ticker starts with the search term, OR
 * - Name contains the search term (case insensitive)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const log = logger.api

interface SearchResult {
  ticker: string
  name: string
  sector: string | null
  has_recent_activity: boolean
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.trim() || ''

    // Return empty array if query is too short
    if (query.length < 1) {
      return NextResponse.json(
        { results: [] },
        {
          headers: {
            'Cache-Control': 's-maxage=3600, stale-while-revalidate=300',
          },
        }
      )
    }

    const supabase = await createClient()

    // Search companies: ticker starts with OR name contains (case insensitive)
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, ticker, name, sector')
      .or(`ticker.ilike.${query}%,name.ilike.%${query}%`)
      .order('ticker')
      .limit(10)

    if (error) {
      log.error({ error }, 'Error searching companies')
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }

    if (!companies || companies.length === 0) {
      return NextResponse.json(
        { results: [] },
        {
          headers: {
            'Cache-Control': 's-maxage=3600, stale-while-revalidate=300',
          },
        }
      )
    }

    // Check for recent activity (transactions in last 30 days)
    const companyIds = companies.map((c) => c.id)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentTransactions } = await supabase
      .from('insider_transactions')
      .select('company_id')
      .in('company_id', companyIds)
      .gte('filed_at', thirtyDaysAgo.toISOString())

    // Create set of company IDs with recent activity
    const activeCompanyIds = new Set(
      (recentTransactions || []).map((t) => t.company_id)
    )

    // Build results with has_recent_activity flag
    const results: SearchResult[] = companies.map((company) => ({
      ticker: company.ticker,
      name: company.name,
      sector: company.sector,
      has_recent_activity: activeCompanyIds.has(company.id),
    }))

    // Sort results: exact ticker matches first, then by activity, then alphabetically
    results.sort((a, b) => {
      const aExactMatch = a.ticker.toUpperCase() === query.toUpperCase()
      const bExactMatch = b.ticker.toUpperCase() === query.toUpperCase()

      if (aExactMatch && !bExactMatch) return -1
      if (!aExactMatch && bExactMatch) return 1

      const aStartsWith = a.ticker.toUpperCase().startsWith(query.toUpperCase())
      const bStartsWith = b.ticker.toUpperCase().startsWith(query.toUpperCase())

      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1

      if (a.has_recent_activity && !b.has_recent_activity) return -1
      if (!a.has_recent_activity && b.has_recent_activity) return 1

      return a.ticker.localeCompare(b.ticker)
    })

    return NextResponse.json(
      {
        results,
        meta: {
          query,
          count: results.length,
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
    log.error({ error }, 'Error in search')

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
