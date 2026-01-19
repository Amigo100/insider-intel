/**
 * Yahoo Finance Client
 *
 * Client for fetching stock price data using yahoo-finance2.
 * Provides historical price data for trend visualization.
 */

import yahooFinance from 'yahoo-finance2'
import { createLogger } from '@/lib/logger'

const log = createLogger({ module: 'yfinance' })

// =============================================================================
// Types
// =============================================================================

/** Daily stock price data */
export interface StockPrice {
  date: string // ISO date string (YYYY-MM-DD)
  open: number | null
  high: number | null
  low: number | null
  close: number
  volume: number | null
}

/** Stock quote summary */
export interface StockQuote {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number | null
}

/** Historical price response */
export interface HistoricalPricesResponse {
  ticker: string
  prices: StockPrice[]
  startDate: string
  endDate: string
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate date N months ago
 */
function getDateMonthsAgo(months: number): Date {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return date
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Fetch historical stock prices for a given ticker
 *
 * @param ticker - Stock ticker symbol (e.g., 'AAPL')
 * @param months - Number of months of history (default: 6)
 * @returns Historical prices array
 *
 * @example
 * const prices = await getHistoricalPrices('AAPL', 6)
 */
export async function getHistoricalPrices(
  ticker: string,
  months: number = 6
): Promise<HistoricalPricesResponse> {
  const endDate = new Date()
  const startDate = getDateMonthsAgo(months)

  log.info({ ticker, months, startDate: formatDate(startDate) }, 'Fetching historical prices')

  try {
    const result = await yahooFinance.historical(ticker.toUpperCase(), {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    })

    const prices: StockPrice[] = result.map((item) => ({
      date: formatDate(item.date),
      open: item.open ?? null,
      high: item.high ?? null,
      low: item.low ?? null,
      close: item.close,
      volume: item.volume ?? null,
    }))

    log.info({ ticker, priceCount: prices.length }, 'Historical prices fetched')

    return {
      ticker: ticker.toUpperCase(),
      prices,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    }
  } catch (error) {
    log.error({ ticker, error }, 'Failed to fetch historical prices')
    throw new Error(`Failed to fetch prices for ${ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Fetch current stock quote
 *
 * @param ticker - Stock ticker symbol
 * @returns Current quote data
 */
export async function getQuote(ticker: string): Promise<StockQuote | null> {
  log.debug({ ticker }, 'Fetching quote')

  try {
    const result = await yahooFinance.quote(ticker.toUpperCase())

    if (!result || !result.regularMarketPrice) {
      log.warn({ ticker }, 'No quote data available')
      return null
    }

    return {
      ticker: ticker.toUpperCase(),
      name: result.shortName || result.longName || ticker,
      price: result.regularMarketPrice,
      change: result.regularMarketChange || 0,
      changePercent: result.regularMarketChangePercent || 0,
      volume: result.regularMarketVolume || 0,
      marketCap: result.marketCap || null,
    }
  } catch (error) {
    log.error({ ticker, error }, 'Failed to fetch quote')
    return null
  }
}

/**
 * Fetch quotes for multiple tickers
 *
 * @param tickers - Array of ticker symbols
 * @returns Map of ticker to quote
 */
export async function getQuotes(tickers: string[]): Promise<Map<string, StockQuote>> {
  const results = new Map<string, StockQuote>()

  // Yahoo Finance doesn't have a batch quote endpoint in yahoo-finance2,
  // so we fetch them in parallel with rate limiting
  const BATCH_SIZE = 5
  const DELAY_MS = 100

  for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
    const batch = tickers.slice(i, i + BATCH_SIZE)

    const quotes = await Promise.all(
      batch.map(async (ticker) => {
        const quote = await getQuote(ticker)
        return { ticker: ticker.toUpperCase(), quote }
      })
    )

    for (const { ticker, quote } of quotes) {
      if (quote) {
        results.set(ticker, quote)
      }
    }

    // Rate limiting delay between batches
    if (i + BATCH_SIZE < tickers.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
    }
  }

  return results
}

/**
 * Get 6-month price trend data optimized for sparkline display
 *
 * Returns weekly closing prices for the last 6 months (approximately 26 data points).
 *
 * @param ticker - Stock ticker symbol
 * @returns Array of closing prices
 */
export async function get6MonthTrend(ticker: string): Promise<number[]> {
  try {
    const result = await yahooFinance.historical(ticker.toUpperCase(), {
      period1: getDateMonthsAgo(6),
      period2: new Date(),
      interval: '1wk', // Weekly data for cleaner sparkline
    })

    // Extract just the closing prices
    return result.map((item) => item.close).filter((price): price is number => price != null)
  } catch (error) {
    log.error({ ticker, error }, 'Failed to fetch 6-month trend')
    return []
  }
}

/**
 * Validate if a ticker symbol exists and is tradeable
 *
 * @param ticker - Stock ticker symbol to validate
 * @returns True if valid ticker, false otherwise
 */
export async function validateTicker(ticker: string): Promise<boolean> {
  try {
    const quote = await yahooFinance.quote(ticker.toUpperCase())
    return quote?.regularMarketPrice != null
  } catch {
    return false
  }
}

/**
 * Search for stocks by query
 *
 * @param query - Search query (ticker or company name)
 * @param limit - Maximum results (default: 10)
 * @returns Array of matching stocks
 */
export async function searchStocks(
  query: string,
  limit: number = 10
): Promise<Array<{ ticker: string; name: string; exchange: string }>> {
  try {
    const result = await yahooFinance.search(query, {
      newsCount: 0,
      quotesCount: limit,
    })

    return (result.quotes || [])
      .filter((q): q is typeof q & { symbol: string } =>
        q.symbol != null && q.quoteType === 'EQUITY'
      )
      .map((q) => ({
        ticker: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange || '',
      }))
      .slice(0, limit)
  } catch (error) {
    log.error({ query, error }, 'Failed to search stocks')
    return []
  }
}
