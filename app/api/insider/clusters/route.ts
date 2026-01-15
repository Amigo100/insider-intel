/**
 * API Route: Insider Buying Clusters
 *
 * GET /api/insider/clusters
 *
 * Returns companies with multiple insider purchases in the last 30 days.
 * Cluster buying is often a bullish signal.
 *
 * Query params:
 * - days: Number of days to look back (default: 30)
 * - minBuyers: Minimum number of unique buyers (default: 2)
 * - limit: Maximum companies to return (default: 20, max: 50)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRecentTransactions } from '@/lib/db/insider-transactions'

interface ClusterData {
  companyId: string
  ticker: string
  companyName: string
  buyerCount: number
  totalValue: number
  insiders: {
    name: string
    title: string | null
    value: number
    transactionDate: string
  }[]
  latestTransaction: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const daysParam = searchParams.get('days')
    const minBuyersParam = searchParams.get('minBuyers')
    const limitParam = searchParams.get('limit')

    // Validate and parse days
    const days = daysParam ? parseInt(daysParam, 10) : 30
    if (isNaN(days) || days < 1 || days > 90) {
      return NextResponse.json(
        { error: 'Invalid days parameter. Must be between 1 and 90.' },
        { status: 400 }
      )
    }

    // Validate and parse minBuyers
    const minBuyers = minBuyersParam ? parseInt(minBuyersParam, 10) : 2
    if (isNaN(minBuyers) || minBuyers < 2 || minBuyers > 10) {
      return NextResponse.json(
        { error: 'Invalid minBuyers parameter. Must be between 2 and 10.' },
        { status: 400 }
      )
    }

    // Validate and parse limit
    let limit = limitParam ? parseInt(limitParam, 10) : 20
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be a positive integer.' },
        { status: 400 }
      )
    }
    limit = Math.min(limit, 50) // Cap at 50

    // Fetch all purchases in the time period
    // Get more than we need to ensure we have enough data
    const transactions = await getRecentTransactions({
      type: 'P', // Purchases only
      days,
      limit: 500, // Fetch more to aggregate
    })

    // Group by company
    const companyMap = new Map<string, ClusterData>()

    for (const txn of transactions) {
      const existing = companyMap.get(txn.company_id)

      if (existing) {
        // Check if this is a new insider (not already in the list)
        const existingInsider = existing.insiders.find(
          (i) => i.name === txn.insider_name
        )

        if (!existingInsider) {
          existing.insiders.push({
            name: txn.insider_name,
            title: txn.insider_title,
            value: txn.total_value || 0,
            transactionDate: txn.transaction_date,
          })
          existing.buyerCount = existing.insiders.length
        } else {
          // Same insider, add to their value
          existingInsider.value += txn.total_value || 0
        }

        existing.totalValue += txn.total_value || 0

        // Update latest transaction date
        if (txn.filed_at > existing.latestTransaction) {
          existing.latestTransaction = txn.filed_at
        }
      } else {
        // New company
        companyMap.set(txn.company_id, {
          companyId: txn.company_id,
          ticker: txn.ticker,
          companyName: txn.company_name,
          buyerCount: 1,
          totalValue: txn.total_value || 0,
          insiders: [
            {
              name: txn.insider_name,
              title: txn.insider_title,
              value: txn.total_value || 0,
              transactionDate: txn.transaction_date,
            },
          ],
          latestTransaction: txn.filed_at,
        })
      }
    }

    // Filter to companies with minimum buyers and sort by buyer count then value
    const clusters = Array.from(companyMap.values())
      .filter((c) => c.buyerCount >= minBuyers)
      .sort((a, b) => {
        // Primary sort: buyer count (descending)
        if (b.buyerCount !== a.buyerCount) {
          return b.buyerCount - a.buyerCount
        }
        // Secondary sort: total value (descending)
        return b.totalValue - a.totalValue
      })
      .slice(0, limit)

    // Sort insiders within each cluster by value
    for (const cluster of clusters) {
      cluster.insiders.sort((a, b) => b.value - a.value)
    }

    // Return response with cache headers
    return NextResponse.json(
      {
        clusters,
        meta: {
          count: clusters.length,
          filters: {
            days,
            minBuyers,
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
    console.error('Error fetching insider clusters:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
