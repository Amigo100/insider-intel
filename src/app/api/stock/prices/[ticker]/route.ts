/**
 * API Route: Stock Price History
 *
 * GET /api/stock/prices/:ticker
 *
 * Returns historical stock prices for trend visualization.
 * First checks database cache, then falls back to Yahoo Finance.
 *
 * Query params:
 * - months: Number of months of history (default: 6, max: 12)
 * - format: 'full' for all OHLCV data, 'sparkline' for just closing prices (default: 'sparkline')
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getHistoricalPrices, get6MonthTrend } from '@/lib/yfinance/client'
import { logger } from '@/lib/logger'
import type { Database } from '@/types/supabase'

const log = logger.api

// Cache duration: consider prices fresh if updated within last 24 hours
const CACHE_DURATION_HOURS = 24

/**
 * Create Supabase client with service role for caching
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })
}

/**
 * Check if cached data is fresh enough
 */
function isCacheFresh(latestDate: string): boolean {
  const latest = new Date(latestDate)
  const now = new Date()
  const hoursDiff = (now.getTime() - latest.getTime()) / (1000 * 60 * 60)

  // For weekends/holidays, allow older data
  const dayOfWeek = now.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return hoursDiff < CACHE_DURATION_HOURS * 3 // 72 hours for weekends
  }

  return hoursDiff < CACHE_DURATION_HOURS
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await context.params
    const searchParams = request.nextUrl.searchParams

    const monthsParam = searchParams.get('months')
    const format = searchParams.get('format') || 'sparkline'

    // Validate months parameter
    let months = monthsParam ? parseInt(monthsParam, 10) : 6
    if (isNaN(months) || months < 1) months = 6
    if (months > 12) months = 12

    const upperTicker = ticker.toUpperCase()
    const supabase = getSupabaseClient()

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    const startDateStr = startDate.toISOString().split('T')[0]

    // Check database cache first
    const { data: cachedPrices, error: cacheError } = await supabase
      .from('stock_prices')
      .select('*')
      .eq('ticker', upperTicker)
      .gte('price_date', startDateStr)
      .order('price_date', { ascending: true })

    let prices = cachedPrices || []
    let fromCache = prices.length > 0

    // Check if cache is fresh enough
    if (prices.length > 0) {
      const latestCached = prices[prices.length - 1].price_date
      if (!isCacheFresh(latestCached)) {
        fromCache = false
        log.info({ ticker: upperTicker, latestCached }, 'Cache stale, fetching fresh data')
      }
    }

    // Fetch from Yahoo Finance if cache miss or stale
    if (!fromCache || prices.length < 5) {
      log.info({ ticker: upperTicker, months }, 'Fetching prices from Yahoo Finance')

      try {
        if (format === 'sparkline') {
          // Quick path for sparkline - just get weekly closes
          const trend = await get6MonthTrend(upperTicker)

          if (trend.length === 0) {
            return NextResponse.json(
              { error: 'No price data available for this ticker' },
              { status: 404 }
            )
          }

          return NextResponse.json(
            {
              ticker: upperTicker,
              prices: trend,
              dataPoints: trend.length,
              format: 'sparkline',
              fromCache: false,
            },
            {
              headers: {
                'Cache-Control': 's-maxage=3600, stale-while-revalidate=1800',
              },
            }
          )
        }

        // Full price data
        const result = await getHistoricalPrices(upperTicker, months)

        if (result.prices.length === 0) {
          return NextResponse.json(
            { error: 'No price data available for this ticker' },
            { status: 404 }
          )
        }

        // Get company_id if available
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('ticker', upperTicker)
          .single()

        // Cache the prices in database (upsert to handle duplicates)
        const pricesToInsert = result.prices.map((p) => ({
          company_id: company?.id || null,
          ticker: upperTicker,
          price_date: p.date,
          open: p.open,
          high: p.high,
          low: p.low,
          close: p.close,
          volume: p.volume,
        }))

        // Insert in batches to avoid request size limits
        const BATCH_SIZE = 50
        for (let i = 0; i < pricesToInsert.length; i += BATCH_SIZE) {
          const batch = pricesToInsert.slice(i, i + BATCH_SIZE)

          await supabase
            .from('stock_prices')
            .upsert(batch, {
              onConflict: 'ticker,price_date',
              ignoreDuplicates: false,
            })
        }

        prices = pricesToInsert.map((p) => ({
          ...p,
          id: '',
          created_at: null,
        }))
        fromCache = false

        log.info({ ticker: upperTicker, priceCount: prices.length }, 'Prices cached')
      } catch (fetchError) {
        log.error({ ticker: upperTicker, error: fetchError }, 'Yahoo Finance fetch failed')

        // If we have cached data, return it even if stale
        if (cachedPrices && cachedPrices.length > 0) {
          prices = cachedPrices
          fromCache = true
          log.info({ ticker: upperTicker }, 'Falling back to stale cache')
        } else {
          return NextResponse.json(
            { error: 'Failed to fetch price data' },
            { status: 503 }
          )
        }
      }
    }

    // Format response based on request
    if (format === 'sparkline') {
      // Return just closing prices for sparkline
      const closingPrices = prices
        .map((p) => p.close)
        .filter((c): c is number => c != null)

      return NextResponse.json(
        {
          ticker: upperTicker,
          prices: closingPrices,
          dataPoints: closingPrices.length,
          format: 'sparkline',
          fromCache,
        },
        {
          headers: {
            'Cache-Control': fromCache
              ? 's-maxage=300, stale-while-revalidate=60'
              : 's-maxage=3600, stale-while-revalidate=1800',
          },
        }
      )
    }

    // Return full price data
    return NextResponse.json(
      {
        ticker: upperTicker,
        prices: prices.map((p) => ({
          date: p.price_date,
          open: p.open,
          high: p.high,
          low: p.low,
          close: p.close,
          volume: p.volume,
        })),
        dataPoints: prices.length,
        startDate: startDateStr,
        endDate: endDate.toISOString().split('T')[0],
        format: 'full',
        fromCache,
      },
      {
        headers: {
          'Cache-Control': fromCache
            ? 's-maxage=300, stale-while-revalidate=60'
            : 's-maxage=3600, stale-while-revalidate=1800',
        },
      }
    )
  } catch (error) {
    log.error({ error }, 'Error fetching stock prices')

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
