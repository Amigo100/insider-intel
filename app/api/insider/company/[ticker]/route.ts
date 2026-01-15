/**
 * API Route: Company Insider Transactions
 *
 * GET /api/insider/company/[ticker]
 *
 * Dynamic route for fetching all insider transactions for a specific company.
 *
 * Query params:
 * - days: Number of days to look back (optional, default: all time)
 * - limit: Maximum results (default: 100, max: 500)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRecentTransactions, getCompanyByTicker } from '@/lib/db/insider-transactions'

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
    const daysParam = searchParams.get('days')
    const limitParam = searchParams.get('limit')

    // Validate and parse days (optional)
    let days: number | undefined
    if (daysParam) {
      days = parseInt(daysParam, 10)
      if (isNaN(days) || days < 1 || days > 365) {
        return NextResponse.json(
          { error: 'Invalid days parameter. Must be between 1 and 365.' },
          { status: 400 }
        )
      }
    }

    // Validate and parse limit
    let limit = limitParam ? parseInt(limitParam, 10) : 100
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be a positive integer.' },
        { status: 400 }
      )
    }
    limit = Math.min(limit, 500) // Cap at 500

    // Check if company exists
    const company = await getCompanyByTicker(normalizedTicker)

    if (!company) {
      return NextResponse.json(
        { error: `Company not found: ${normalizedTicker}` },
        { status: 404 }
      )
    }

    // Fetch transactions
    const transactions = await getRecentTransactions({
      ticker: normalizedTicker,
      days,
      limit,
    })

    // Calculate summary statistics
    const purchases = transactions.filter((t) => t.transaction_type === 'P')
    const sales = transactions.filter((t) => t.transaction_type === 'S')

    const totalPurchaseValue = purchases.reduce(
      (sum, t) => sum + (t.total_value || 0),
      0
    )
    const totalSaleValue = sales.reduce(
      (sum, t) => sum + (t.total_value || 0),
      0
    )

    // Get unique insiders
    const uniqueInsiders = new Set(transactions.map((t) => t.insider_id))

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
        transactions,
        summary: {
          totalTransactions: transactions.length,
          uniqueInsiders: uniqueInsiders.size,
          purchases: {
            count: purchases.length,
            totalValue: totalPurchaseValue,
          },
          sales: {
            count: sales.length,
            totalValue: totalSaleValue,
          },
          netValue: totalPurchaseValue - totalSaleValue,
        },
        meta: {
          filters: {
            days: days || 'all',
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
    console.error('Error fetching company transactions:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
