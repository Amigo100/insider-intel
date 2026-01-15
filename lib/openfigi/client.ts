/**
 * OpenFIGI API Client
 *
 * Client for looking up financial instrument identifiers using the OpenFIGI API.
 * OpenFIGI provides mapping between different identifier types (CUSIP, ISIN, SEDOL, etc.)
 * and ticker symbols.
 *
 * API Documentation: https://www.openfigi.com/api
 *
 * Rate Limits:
 * - Without API key: 25 requests/minute, 5 jobs per request
 * - With API key: 250 requests/minute, 100 jobs per request
 */

import { logger } from '@/lib/logger'

const log = logger.openfigi

// =============================================================================
// Types
// =============================================================================

export interface OpenFIGIJob {
  idType: 'ID_CUSIP' | 'ID_ISIN' | 'ID_SEDOL' | 'ID_BB_UNIQUE' | 'TICKER'
  idValue: string
  exchCode?: string
  micCode?: string
  currency?: string
  marketSecDes?: string
}

export interface OpenFIGIResult {
  figi: string
  securityType: string
  marketSector: string
  ticker: string
  name: string
  exchCode: string
  shareClassFIGI?: string
  compositeFIGI?: string
  securityType2?: string
  securityDescription?: string
}

export interface OpenFIGIResponse {
  data?: OpenFIGIResult[]
  error?: string
  warning?: string
}

export interface CUSIPLookupResult {
  cusip: string
  ticker: string | null
  name: string | null
  securityType: string | null
  error?: string
}

// =============================================================================
// Cache
// =============================================================================

// In-memory cache for CUSIP lookups
// Key: CUSIP, Value: { ticker, name, timestamp }
const cusipCache = new Map<
  string,
  {
    ticker: string | null
    name: string | null
    securityType: string | null
    timestamp: number
  }
>()

// Cache TTL: 7 days (CUSIPs don't change often)
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Gets a cached CUSIP lookup result if valid
 */
function getCachedResult(cusip: string): CUSIPLookupResult | null {
  const cached = cusipCache.get(cusip)
  if (!cached) return null

  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    cusipCache.delete(cusip)
    return null
  }

  return {
    cusip,
    ticker: cached.ticker,
    name: cached.name,
    securityType: cached.securityType,
  }
}

/**
 * Sets a CUSIP lookup result in cache
 */
function setCacheResult(
  cusip: string,
  ticker: string | null,
  name: string | null,
  securityType: string | null
): void {
  cusipCache.set(cusip, {
    ticker,
    name,
    securityType,
    timestamp: Date.now(),
  })
}

/**
 * Clears the entire CUSIP cache
 */
export function clearCUSIPCache(): void {
  cusipCache.clear()
}

/**
 * Gets cache statistics
 */
export function getCacheStats(): { size: number; oldestEntry: number | null } {
  let oldestTimestamp: number | null = null

  for (const entry of cusipCache.values()) {
    if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
      oldestTimestamp = entry.timestamp
    }
  }

  return {
    size: cusipCache.size,
    oldestEntry: oldestTimestamp,
  }
}

// =============================================================================
// API Client
// =============================================================================

const OPENFIGI_API_URL = 'https://api.openfigi.com/v3/mapping'

// Rate limiting
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL_MS = 250 // 4 requests per second max (with API key)

/**
 * Looks up a single CUSIP to find its ticker symbol
 *
 * @param cusip - 9-character CUSIP identifier
 * @returns Lookup result with ticker or null if not found
 *
 * @example
 * const result = await lookupCUSIP('037833100')
 * // { cusip: '037833100', ticker: 'AAPL', name: 'APPLE INC', securityType: 'Common Stock' }
 */
export async function lookupCUSIP(cusip: string): Promise<CUSIPLookupResult> {
  // Check cache first
  const cached = getCachedResult(cusip)
  if (cached) {
    return cached
  }

  // Rate limiting
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest)
    )
  }
  lastRequestTime = Date.now()

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add API key if available (increases rate limits)
    const apiKey = process.env.OPENFIGI_API_KEY
    if (apiKey) {
      headers['X-OPENFIGI-APIKEY'] = apiKey
    }

    const jobs: OpenFIGIJob[] = [
      {
        idType: 'ID_CUSIP',
        idValue: cusip,
      },
    ]

    const response = await fetch(OPENFIGI_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(jobs),
    })

    if (!response.ok) {
      const errorText = await response.text()
      log.error({ status: response.status, errorText }, 'OpenFIGI API error')

      // Cache the failure to avoid repeated requests
      setCacheResult(cusip, null, null, null)

      return {
        cusip,
        ticker: null,
        name: null,
        securityType: null,
        error: `API error: ${response.status}`,
      }
    }

    const results: OpenFIGIResponse[] = await response.json()
    const result = results[0]

    if (result?.error) {
      // Cache the failure
      setCacheResult(cusip, null, null, null)

      return {
        cusip,
        ticker: null,
        name: null,
        securityType: null,
        error: result.error,
      }
    }

    if (!result?.data || result.data.length === 0) {
      // Cache the miss
      setCacheResult(cusip, null, null, null)

      return {
        cusip,
        ticker: null,
        name: null,
        securityType: null,
      }
    }

    // Find the best match - prefer US exchanges and common stock
    const usExchanges = ['US', 'UN', 'UW', 'UQ', 'UA', 'UR']
    let bestMatch = result.data[0]

    for (const match of result.data) {
      // Prefer US exchange
      if (usExchanges.includes(match.exchCode) && !usExchanges.includes(bestMatch.exchCode)) {
        bestMatch = match
      }
      // Prefer common stock over other types
      if (
        match.securityType === 'Common Stock' &&
        bestMatch.securityType !== 'Common Stock'
      ) {
        bestMatch = match
      }
    }

    // Cache the result
    setCacheResult(cusip, bestMatch.ticker, bestMatch.name, bestMatch.securityType)

    return {
      cusip,
      ticker: bestMatch.ticker,
      name: bestMatch.name,
      securityType: bestMatch.securityType,
    }
  } catch (error) {
    log.error({ cusip, error }, 'OpenFIGI lookup error')

    return {
      cusip,
      ticker: null,
      name: null,
      securityType: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Looks up multiple CUSIPs in a batch
 *
 * @param cusips - Array of 9-character CUSIP identifiers
 * @returns Map of CUSIP to lookup results
 *
 * @example
 * const results = await lookupCUSIPBatch(['037833100', '594918104'])
 */
export async function lookupCUSIPBatch(
  cusips: string[]
): Promise<Map<string, CUSIPLookupResult>> {
  const results = new Map<string, CUSIPLookupResult>()
  const uncachedCusips: string[] = []

  // Check cache for each CUSIP
  for (const cusip of cusips) {
    const cached = getCachedResult(cusip)
    if (cached) {
      results.set(cusip, cached)
    } else {
      uncachedCusips.push(cusip)
    }
  }

  // If all CUSIPs were cached, return early
  if (uncachedCusips.length === 0) {
    return results
  }

  // Rate limiting
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest)
    )
  }
  lastRequestTime = Date.now()

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    const apiKey = process.env.OPENFIGI_API_KEY
    if (apiKey) {
      headers['X-OPENFIGI-APIKEY'] = apiKey
    }

    // OpenFIGI allows up to 100 jobs per request with API key, 5 without
    const maxJobsPerRequest = apiKey ? 100 : 5
    const batches: string[][] = []

    for (let i = 0; i < uncachedCusips.length; i += maxJobsPerRequest) {
      batches.push(uncachedCusips.slice(i, i + maxJobsPerRequest))
    }

    for (const batch of batches) {
      const jobs: OpenFIGIJob[] = batch.map((cusip) => ({
        idType: 'ID_CUSIP' as const,
        idValue: cusip,
      }))

      const response = await fetch(OPENFIGI_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(jobs),
      })

      if (!response.ok) {
        log.error({ status: response.status }, 'OpenFIGI batch API error')
        // Mark all as failed
        for (const cusip of batch) {
          setCacheResult(cusip, null, null, null)
          results.set(cusip, {
            cusip,
            ticker: null,
            name: null,
            securityType: null,
            error: `API error: ${response.status}`,
          })
        }
        continue
      }

      const batchResults: OpenFIGIResponse[] = await response.json()

      for (let i = 0; i < batch.length; i++) {
        const cusip = batch[i]
        const result = batchResults[i]

        if (result?.error || !result?.data || result.data.length === 0) {
          setCacheResult(cusip, null, null, null)
          results.set(cusip, {
            cusip,
            ticker: null,
            name: null,
            securityType: null,
            error: result?.error,
          })
          continue
        }

        // Find best match
        const usExchanges = ['US', 'UN', 'UW', 'UQ', 'UA', 'UR']
        let bestMatch = result.data[0]

        for (const match of result.data) {
          if (usExchanges.includes(match.exchCode) && !usExchanges.includes(bestMatch.exchCode)) {
            bestMatch = match
          }
          if (match.securityType === 'Common Stock' && bestMatch.securityType !== 'Common Stock') {
            bestMatch = match
          }
        }

        setCacheResult(cusip, bestMatch.ticker, bestMatch.name, bestMatch.securityType)
        results.set(cusip, {
          cusip,
          ticker: bestMatch.ticker,
          name: bestMatch.name,
          securityType: bestMatch.securityType,
        })
      }

      // Add delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS))
        lastRequestTime = Date.now()
      }
    }
  } catch (error) {
    log.error({ error }, 'OpenFIGI batch lookup error')

    // Mark all uncached as failed
    for (const cusip of uncachedCusips) {
      if (!results.has(cusip)) {
        setCacheResult(cusip, null, null, null)
        results.set(cusip, {
          cusip,
          ticker: null,
          name: null,
          securityType: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  return results
}
