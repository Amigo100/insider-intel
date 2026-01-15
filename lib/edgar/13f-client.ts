/**
 * SEC EDGAR 13F Client
 *
 * Client for fetching and parsing SEC 13F-HR institutional holdings filings.
 * Respects SEC rate limits (10 requests/second) and includes required User-Agent header.
 */

import { delay } from './client'
import { logger } from '@/lib/logger'

const log = logger.edgar

// =============================================================================
// Types
// =============================================================================

/** SEC EDGAR search API response for 13F filings */
export interface Edgar13FSearchResponse {
  hits: {
    total: {
      value: number
      relation: string
    }
    hits: Edgar13FSearchHit[]
  }
}

/** Individual 13F search result hit */
export interface Edgar13FSearchHit {
  _id: string
  _source: {
    ciks: string[]
    form: string
    file_date: string
    file_num: string[]
    adsh: string
    display_names: string[]
    period_ending?: string
  }
}

/** Parsed 13F filing metadata from search results */
export interface Filing13FMetadata {
  accessionNumber: string
  accessionNumberNoDashes: string
  cik: string
  filedAt: string
  formType: string
  filerName: string
  periodOfReport: string | null
}

/** Individual holding from 13F infotable */
export interface Holding13F {
  nameOfIssuer: string
  titleOfClass: string
  cusip: string
  value: number // In dollars (converted from thousands)
  shares: number
  shareType: 'SH' | 'PRN' // Shares or Principal Amount
  investmentDiscretion: 'SOLE' | 'SHARED' | 'DEFINED' | 'OTHER'
  votingAuthoritySole: number
  votingAuthorityShared: number
  votingAuthorityNone: number
  // Enriched fields (when CUSIP mapping available)
  ticker?: string
}

/** Parsed 13F holdings data */
export interface Parsed13FHoldings {
  holdings: Holding13F[]
  totalValue: number
  totalHoldings: number
}

// =============================================================================
// Constants
// =============================================================================

const SEC_USER_AGENT = 'InsiderIntel/1.0 (contact@insiderintel.app)'
const SEC_SEARCH_BASE_URL = 'https://efts.sec.gov/LATEST/search-index'
const SEC_ARCHIVES_BASE_URL = 'https://www.sec.gov/Archives/edgar/data'

// Rate limiting: SEC allows 10 requests/second
const REQUEST_DELAY_MS = 100

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

// =============================================================================
// CUSIP to Ticker Mapping
// Primary lookup uses OpenFIGI API, with hardcoded fallback for common securities
// =============================================================================

import { lookupCUSIP, lookupCUSIPBatch } from '../openfigi/client'

// Hardcoded fallback mapping for common securities (used when OpenFIGI unavailable)
export const CUSIP_TO_TICKER: Record<string, string> = {
  // Technology
  '037833100': 'AAPL',   // Apple Inc
  '594918104': 'MSFT',   // Microsoft Corp
  '02079K305': 'GOOGL',  // Alphabet Inc Class A
  '02079K107': 'GOOG',   // Alphabet Inc Class C
  '023135106': 'AMZN',   // Amazon.com Inc
  '30303M102': 'META',   // Meta Platforms Inc
  '67066G104': 'NVDA',   // NVIDIA Corp
  '88160R101': 'TSLA',   // Tesla Inc
  '79466L302': 'CRM',    // Salesforce Inc
  '00724F101': 'ADBE',   // Adobe Inc
  '22160K105': 'COST',   // Costco Wholesale
  '46625H100': 'JPM',    // JPMorgan Chase
  '0846707109': 'BRK.A', // Berkshire Hathaway A
  '084670702': 'BRK.B',  // Berkshire Hathaway B
  '92826C839': 'V',      // Visa Inc
  '585055106': 'MA',     // Mastercard Inc
  '91324P102': 'UNH',    // UnitedHealth Group
  '478160104': 'JNJ',    // Johnson & Johnson
  '742718109': 'PG',     // Procter & Gamble
  '375558103': 'GILD',   // Gilead Sciences
  '931142103': 'WMT',    // Walmart Inc
  '260543103': 'DIS',    // Walt Disney Co
  '17275R102': 'CSCO',   // Cisco Systems
  '98978V103': 'ZM',     // Zoom Video
  '00206R102': 'T',      // AT&T Inc
  '92343V104': 'VZ',     // Verizon
  '064058100': 'BAC',    // Bank of America
  '172967424': 'C',      // Citigroup
  '38141G104': 'GS',     // Goldman Sachs
  '949746101': 'WFC',    // Wells Fargo
  '58933Y105': 'MRK',    // Merck & Co
  '717081103': 'PFE',    // Pfizer Inc
  '002824100': 'ABBV',   // AbbVie Inc
  '11135F101': 'BMY',    // Bristol-Myers Squibb
  '30231G102': 'XOM',    // Exxon Mobil
  '166764100': 'CVX',    // Chevron Corp
  '20825C104': 'COP',    // ConocoPhillips
  '345370860': 'F',      // Ford Motor
  '37045V100': 'GM',     // General Motors
  '02376R102': 'AAL',    // American Airlines
  '231021106': 'DAL',    // Delta Air Lines
  '92553P201': 'VTI',    // Vanguard Total Stock Market ETF
  '78462F103': 'SPY',    // SPDR S&P 500 ETF
  '464287200': 'IVV',    // iShares Core S&P 500 ETF
  '46090E103': 'INTC',   // Intel Corp
  '00971T101': 'AMAT',   // Applied Materials
  '458140100': 'INTC',   // Intel Corp (duplicate check)
  '29786A106': 'ETN',    // Eaton Corp
  '437076102': 'HD',     // Home Depot
  '536797103': 'LMT',    // Lockheed Martin
  '084423102': 'BKNG',   // Booking Holdings
  '65339F101': 'NKE',    // Nike Inc
  '808513105': 'SCHW',   // Charles Schwab
  '89417E109': 'TXN',    // Texas Instruments
  '00287Y109': 'AXP',    // American Express
}

/**
 * Attempts to find a ticker symbol for a CUSIP using hardcoded fallback
 * For async lookup with OpenFIGI, use cusipToTickerAsync instead
 *
 * @param cusip - 9-character CUSIP identifier
 * @returns Ticker symbol or null if not found in hardcoded map
 */
export function cusipToTicker(cusip: string): string | null {
  return CUSIP_TO_TICKER[cusip] || null
}

/**
 * Looks up a ticker symbol for a CUSIP using OpenFIGI API with fallback
 *
 * @param cusip - 9-character CUSIP identifier
 * @returns Ticker symbol or null if not found
 */
export async function cusipToTickerAsync(cusip: string): Promise<string | null> {
  // First check hardcoded map for fast response
  const hardcoded = CUSIP_TO_TICKER[cusip]
  if (hardcoded) {
    return hardcoded
  }

  // Try OpenFIGI lookup
  try {
    const result = await lookupCUSIP(cusip)
    return result.ticker
  } catch (error) {
    log.error({ cusip, error }, 'CUSIP lookup failed')
    return null
  }
}

/**
 * Looks up ticker symbols for multiple CUSIPs using OpenFIGI API with fallback
 *
 * @param cusips - Array of 9-character CUSIP identifiers
 * @returns Map of CUSIP to ticker symbol (or null if not found)
 */
export async function cusipToTickerBatch(
  cusips: string[]
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>()
  const needsLookup: string[] = []

  // First check hardcoded map
  for (const cusip of cusips) {
    const hardcoded = CUSIP_TO_TICKER[cusip]
    if (hardcoded) {
      results.set(cusip, hardcoded)
    } else {
      needsLookup.push(cusip)
    }
  }

  // If all found in hardcoded map, return early
  if (needsLookup.length === 0) {
    return results
  }

  // Batch lookup remaining CUSIPs via OpenFIGI
  try {
    const lookupResults = await lookupCUSIPBatch(needsLookup)
    for (const [cusip, result] of lookupResults) {
      results.set(cusip, result.ticker)
    }
  } catch (error) {
    log.error({ error }, 'Batch CUSIP lookup failed')
    // Mark all as null on failure
    for (const cusip of needsLookup) {
      results.set(cusip, null)
    }
  }

  return results
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Creates a fetch request with required SEC headers
 */
function createSecRequest(url: string): Request {
  return new Request(url, {
    headers: {
      'User-Agent': SEC_USER_AGENT,
      Accept: 'application/json, text/xml, */*',
    },
  })
}

/**
 * Executes a fetch with retry logic and rate limiting
 */
async function fetchWithRetry(
  url: string,
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        await delay(RETRY_DELAY_MS * attempt)
      }

      const request = createSecRequest(url)
      const response = await fetch(request)

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY_MS * (attempt + 1)
        await delay(waitMs)
        continue
      }

      if (response.status >= 500 && attempt < retries) {
        await delay(RETRY_DELAY_MS * (attempt + 1))
        continue
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < retries) {
        await delay(RETRY_DELAY_MS * (attempt + 1))
        continue
      }
    }
  }

  throw lastError || new Error('Failed to fetch after retries')
}

/**
 * Extracts text content from an XML element
 */
function getXmlText(xml: string, tagName: string): string | null {
  // Handle namespaced tags (e.g., ns1:nameOfIssuer)
  const regex = new RegExp(`<(?:[a-z0-9]+:)?${tagName}[^>]*>([^<]*)</(?:[a-z0-9]+:)?${tagName}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : null
}

/**
 * Extracts all sections of XML for repeated elements
 */
function getAllXmlSections(xml: string, tagName: string): string[] {
  // Handle namespaced tags
  const regex = new RegExp(`<(?:[a-z0-9]+:)?${tagName}[^>]*>([\\s\\S]*?)</(?:[a-z0-9]+:)?${tagName}>`, 'gi')
  const matches = xml.matchAll(regex)
  return Array.from(matches).map((m) => m[1])
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Fetches 13F-HR filings for a specific quarter
 *
 * @param year - Filing year (e.g., 2024)
 * @param quarter - Quarter number (1-4)
 * @param size - Number of results to return (default 100, max 10000)
 * @returns Array of 13F filing metadata
 *
 * @example
 * const filings = await fetch13FFilings(2024, 1)
 */
export async function fetch13FFilings(
  year: number,
  quarter: 1 | 2 | 3 | 4,
  size: number = 100
): Promise<Filing13FMetadata[]> {
  // Calculate quarter date range
  const quarterStartMonth = (quarter - 1) * 3 + 1
  const quarterEndMonth = quarter * 3

  // Filings are due 45 days after quarter end, so search into next quarter
  const startDate = `${year}-${String(quarterStartMonth).padStart(2, '0')}-01`

  // End date: extend into next quarter to catch late filings
  let endYear = year
  let endMonth = quarterEndMonth + 2 // Allow 2 months for late filings
  if (endMonth > 12) {
    endMonth = endMonth - 12
    endYear = year + 1
  }
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-28`

  const params = new URLSearchParams({
    q: '*',
    forms: '13F-HR',
    dateRange: 'custom',
    startdt: startDate,
    enddt: endDate,
    size: size.toString(),
  })

  const url = `${SEC_SEARCH_BASE_URL}?${params.toString()}`

  await delay(REQUEST_DELAY_MS)

  const response = await fetchWithRetry(url)

  if (!response.ok) {
    throw new Error(`SEC search API error: ${response.status} ${response.statusText}`)
  }

  const data: Edgar13FSearchResponse = await response.json()

  return data.hits.hits.map((hit) => {
    const accessionNumber = hit._source.adsh
    return {
      accessionNumber,
      accessionNumberNoDashes: accessionNumber.replace(/-/g, ''),
      cik: hit._source.ciks[0] || '',
      filedAt: hit._source.file_date,
      formType: hit._source.form,
      filerName: hit._source.display_names[0] || '',
      periodOfReport: hit._source.period_ending || null,
    }
  })
}

/**
 * Fetches 13F-HR filings for a specific institution by CIK
 *
 * @param cik - Institution CIK number
 * @param size - Number of results to return (default 10)
 * @returns Array of 13F filing metadata
 */
export async function fetch13FFilingsByCik(
  cik: string,
  size: number = 10
): Promise<Filing13FMetadata[]> {
  const normalizedCik = cik.replace(/^0+/, '')

  const params = new URLSearchParams({
    q: `ciks:${normalizedCik}`,
    forms: '13F-HR',
    size: size.toString(),
  })

  const url = `${SEC_SEARCH_BASE_URL}?${params.toString()}`

  await delay(REQUEST_DELAY_MS)

  const response = await fetchWithRetry(url)

  if (!response.ok) {
    throw new Error(`SEC search API error: ${response.status} ${response.statusText}`)
  }

  const data: Edgar13FSearchResponse = await response.json()

  return data.hits.hits.map((hit) => {
    const accessionNumber = hit._source.adsh
    return {
      accessionNumber,
      accessionNumberNoDashes: accessionNumber.replace(/-/g, ''),
      cik: hit._source.ciks[0] || '',
      filedAt: hit._source.file_date,
      formType: hit._source.form,
      filerName: hit._source.display_names[0] || '',
      periodOfReport: hit._source.period_ending || null,
    }
  })
}

/**
 * Fetches the infotable.xml containing 13F holdings data
 *
 * @param cik - Institution CIK number (with or without leading zeros)
 * @param accessionNumber - Filing accession number (with or without dashes)
 * @returns Raw XML string of the holdings table
 *
 * @example
 * const xml = await fetch13FHoldings('1067983', '0000950123-24-001234')
 */
export async function fetch13FHoldings(
  cik: string,
  accessionNumber: string
): Promise<string> {
  const normalizedCik = cik.replace(/^0+/, '')
  const accessionNoDashes = accessionNumber.replace(/-/g, '')

  // Try common infotable filename patterns
  const filenames = [
    'infotable.xml',
    'InfoTable.xml',
    'INFOTABLE.XML',
    'infotable.html', // Sometimes HTML format
  ]

  let lastError: Error | null = null

  for (const filename of filenames) {
    const url = `${SEC_ARCHIVES_BASE_URL}/${normalizedCik}/${accessionNoDashes}/${filename}`

    await delay(REQUEST_DELAY_MS)

    try {
      const response = await fetchWithRetry(url)

      if (response.ok) {
        return await response.text()
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  // Try fetching the index page to find the correct filename
  const indexUrl = `${SEC_ARCHIVES_BASE_URL}/${normalizedCik}/${accessionNoDashes}/index.json`

  await delay(REQUEST_DELAY_MS)

  try {
    const indexResponse = await fetchWithRetry(indexUrl)

    if (indexResponse.ok) {
      const indexData = await indexResponse.json()
      const infoTableFile = indexData.directory?.item?.find(
        (item: { name: string }) =>
          item.name.toLowerCase().includes('infotable') ||
          item.name.toLowerCase().includes('information_table')
      )

      if (infoTableFile) {
        const url = `${SEC_ARCHIVES_BASE_URL}/${normalizedCik}/${accessionNoDashes}/${infoTableFile.name}`

        await delay(REQUEST_DELAY_MS)

        const response = await fetchWithRetry(url)

        if (response.ok) {
          return await response.text()
        }
      }
    }
  } catch {
    // Ignore index fetch errors
  }

  throw lastError || new Error(`Failed to fetch 13F holdings for CIK ${cik}, accession ${accessionNumber}`)
}

/**
 * Parses 13F infotable XML to extract holdings data (sync version)
 * Uses only hardcoded CUSIP mappings for ticker enrichment.
 * For dynamic OpenFIGI lookup, use parse13FHoldingsXMLAsync instead.
 *
 * @param xml - Raw XML string from infotable.xml
 * @returns Parsed holdings data with total value and count
 *
 * @example
 * const xml = await fetch13FHoldings('1067983', '0000950123-24-001234')
 * const holdings = parse13FHoldingsXML(xml)
 */
export function parse13FHoldingsXML(xml: string): Parsed13FHoldings {
  // Find all infoTable entries (handle various tag names)
  const holdingSections = getAllXmlSections(xml, 'infoTable')

  const holdings: Holding13F[] = []
  let totalValue = 0

  for (const section of holdingSections) {
    const nameOfIssuer = getXmlText(section, 'nameOfIssuer') || ''
    const titleOfClass = getXmlText(section, 'titleOfClass') || ''
    const cusip = getXmlText(section, 'cusip') || ''

    // Value is in thousands, convert to dollars
    const valueStr = getXmlText(section, 'value')
    const valueInThousands = valueStr ? parseInt(valueStr.replace(/,/g, ''), 10) : 0
    const value = valueInThousands * 1000

    // Get share/principal amount section
    const sshPrnamt = getXmlText(section, 'sshPrnamt') || getXmlText(section, 'shrsOrPrnAmt')
    const shares = sshPrnamt ? parseInt(sshPrnamt.replace(/,/g, ''), 10) : 0

    const sshPrnamtType = getXmlText(section, 'sshPrnamtType') || 'SH'

    const investmentDiscretion = (getXmlText(section, 'investmentDiscretion') || 'SOLE') as
      | 'SOLE'
      | 'SHARED'
      | 'DEFINED'
      | 'OTHER'

    // Voting authority
    const votingAuthority = getAllXmlSections(section, 'votingAuthority')[0] || section
    const votingSole = getXmlText(votingAuthority, 'Sole') || getXmlText(section, 'votingAuthoritySole')
    const votingShared = getXmlText(votingAuthority, 'Shared') || getXmlText(section, 'votingAuthorityShared')
    const votingNone = getXmlText(votingAuthority, 'None') || getXmlText(section, 'votingAuthorityNone')

    const holding: Holding13F = {
      nameOfIssuer,
      titleOfClass,
      cusip,
      value,
      shares,
      shareType: sshPrnamtType.toUpperCase() === 'PRN' ? 'PRN' : 'SH',
      investmentDiscretion,
      votingAuthoritySole: votingSole ? parseInt(votingSole.replace(/,/g, ''), 10) : 0,
      votingAuthorityShared: votingShared ? parseInt(votingShared.replace(/,/g, ''), 10) : 0,
      votingAuthorityNone: votingNone ? parseInt(votingNone.replace(/,/g, ''), 10) : 0,
    }

    // Attempt to enrich with ticker (sync/hardcoded only)
    const ticker = cusipToTicker(cusip)
    if (ticker) {
      holding.ticker = ticker
    }

    holdings.push(holding)
    totalValue += value
  }

  return {
    holdings,
    totalValue,
    totalHoldings: holdings.length,
  }
}

/**
 * Parses 13F infotable XML with async OpenFIGI ticker enrichment
 * Uses OpenFIGI API for dynamic CUSIP to ticker mapping with hardcoded fallback.
 *
 * @param xml - Raw XML string from infotable.xml
 * @param enrichTickers - Whether to enrich holdings with ticker symbols (default: true)
 * @returns Parsed holdings data with total value and count
 *
 * @example
 * const xml = await fetch13FHoldings('1067983', '0000950123-24-001234')
 * const holdings = await parse13FHoldingsXMLAsync(xml)
 */
export async function parse13FHoldingsXMLAsync(
  xml: string,
  enrichTickers: boolean = true
): Promise<Parsed13FHoldings> {
  // Find all infoTable entries (handle various tag names)
  const holdingSections = getAllXmlSections(xml, 'infoTable')

  const holdings: Holding13F[] = []
  let totalValue = 0

  // First pass: parse all holdings
  for (const section of holdingSections) {
    const nameOfIssuer = getXmlText(section, 'nameOfIssuer') || ''
    const titleOfClass = getXmlText(section, 'titleOfClass') || ''
    const cusip = getXmlText(section, 'cusip') || ''

    // Value is in thousands, convert to dollars
    const valueStr = getXmlText(section, 'value')
    const valueInThousands = valueStr ? parseInt(valueStr.replace(/,/g, ''), 10) : 0
    const value = valueInThousands * 1000

    // Get share/principal amount section
    const sshPrnamt = getXmlText(section, 'sshPrnamt') || getXmlText(section, 'shrsOrPrnAmt')
    const shares = sshPrnamt ? parseInt(sshPrnamt.replace(/,/g, ''), 10) : 0

    const sshPrnamtType = getXmlText(section, 'sshPrnamtType') || 'SH'

    const investmentDiscretion = (getXmlText(section, 'investmentDiscretion') || 'SOLE') as
      | 'SOLE'
      | 'SHARED'
      | 'DEFINED'
      | 'OTHER'

    // Voting authority
    const votingAuthority = getAllXmlSections(section, 'votingAuthority')[0] || section
    const votingSole = getXmlText(votingAuthority, 'Sole') || getXmlText(section, 'votingAuthoritySole')
    const votingShared = getXmlText(votingAuthority, 'Shared') || getXmlText(section, 'votingAuthorityShared')
    const votingNone = getXmlText(votingAuthority, 'None') || getXmlText(section, 'votingAuthorityNone')

    holdings.push({
      nameOfIssuer,
      titleOfClass,
      cusip,
      value,
      shares,
      shareType: sshPrnamtType.toUpperCase() === 'PRN' ? 'PRN' : 'SH',
      investmentDiscretion,
      votingAuthoritySole: votingSole ? parseInt(votingSole.replace(/,/g, ''), 10) : 0,
      votingAuthorityShared: votingShared ? parseInt(votingShared.replace(/,/g, ''), 10) : 0,
      votingAuthorityNone: votingNone ? parseInt(votingNone.replace(/,/g, ''), 10) : 0,
    })

    totalValue += value
  }

  // Second pass: batch enrich with tickers if requested
  if (enrichTickers && holdings.length > 0) {
    const cusips = holdings.map((h) => h.cusip).filter((c) => c.length > 0)
    const tickerMap = await cusipToTickerBatch(cusips)

    for (const holding of holdings) {
      const ticker = tickerMap.get(holding.cusip)
      if (ticker) {
        holding.ticker = ticker
      }
    }
  }

  return {
    holdings,
    totalValue,
    totalHoldings: holdings.length,
  }
}

/**
 * Fetches and parses 13F holdings in one operation (sync ticker lookup)
 *
 * @param cik - Institution CIK number
 * @param accessionNumber - Filing accession number
 * @returns Parsed holdings data
 */
export async function fetchAndParse13FHoldings(
  cik: string,
  accessionNumber: string
): Promise<Parsed13FHoldings> {
  const xml = await fetch13FHoldings(cik, accessionNumber)
  return parse13FHoldingsXML(xml)
}

/**
 * Fetches and parses 13F holdings with dynamic OpenFIGI ticker enrichment
 *
 * @param cik - Institution CIK number
 * @param accessionNumber - Filing accession number
 * @param enrichTickers - Whether to enrich holdings with ticker symbols (default: true)
 * @returns Parsed holdings data with enriched ticker symbols
 */
export async function fetchAndParse13FHoldingsWithTickers(
  cik: string,
  accessionNumber: string,
  enrichTickers: boolean = true
): Promise<Parsed13FHoldings> {
  const xml = await fetch13FHoldings(cik, accessionNumber)
  return parse13FHoldingsXMLAsync(xml, enrichTickers)
}

/**
 * Builds the SEC EDGAR URL for a 13F filing
 *
 * @param cik - Institution CIK number
 * @param accessionNumber - Filing accession number
 * @returns URL to the filing index on SEC EDGAR
 */
export function build13FFilingUrl(cik: string, accessionNumber: string): string {
  const normalizedCik = cik.replace(/^0+/, '')
  const accessionNoDashes = accessionNumber.replace(/-/g, '')
  const accessionWithDashes = accessionNumber.includes('-')
    ? accessionNumber
    : `${accessionNumber.slice(0, 10)}-${accessionNumber.slice(10, 12)}-${accessionNumber.slice(12)}`

  return `${SEC_ARCHIVES_BASE_URL}/${normalizedCik}/${accessionNoDashes}/${accessionWithDashes}-index.htm`
}
