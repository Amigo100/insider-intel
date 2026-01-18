/**
 * SEC EDGAR Client
 *
 * Client for fetching and parsing SEC EDGAR filings, specifically Form 4 insider transactions.
 * Respects SEC rate limits (10 requests/second) and includes required User-Agent header.
 */

// =============================================================================
// Types
// =============================================================================

/** SEC EDGAR search API response */
export interface EdgarSearchResponse {
  hits: {
    total: {
      value: number
      relation: string
    }
    hits: EdgarSearchHit[]
  }
}

/** Individual search result hit */
export interface EdgarSearchHit {
  _id: string
  _source: {
    ciks: string[]
    form: string
    file_date: string
    file_num: string[]
    film_num: string[]
    adsh: string // Accession number with dashes
    display_names: string[]
    period_ending?: string
    items?: string[]
  }
}

/** Parsed Form 4 filing metadata from search results */
export interface Form4FilingMetadata {
  accessionNumber: string
  accessionNumberNoDashes: string
  cik: string
  filedAt: string
  formType: string
  displayName: string
}

/** Issuer information from Form 4 XML */
export interface Form4Issuer {
  cik: string
  name: string
  ticker: string
}

/** Owner information from Form 4 XML */
export interface Form4Owner {
  cik: string
  name: string
  isDirector: boolean
  isOfficer: boolean
  isTenPercentOwner: boolean
  officerTitle: string | null
}

/** Individual transaction from Form 4 XML */
export interface Form4Transaction {
  transactionDate: string
  transactionCode: string // P, S, A, D, G, M, etc.
  shares: number | null
  pricePerShare: number | null
  sharesOwnedAfter: number | null
  directOrIndirect: 'D' | 'I'
  is10b51Plan: boolean
}

/** Parsed Form 4 filing data */
export interface ParsedForm4 {
  documentType: string
  periodOfReport: string
  issuer: Form4Issuer
  owner: Form4Owner
  transactions: Form4Transaction[]
  footnotes: string[]
  is10b51Plan: boolean
}

/** Error response from SEC API */
export interface EdgarError {
  status: number
  message: string
  retryable: boolean
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
// Helpers
// =============================================================================

/**
 * Simple promise-based delay helper for rate limiting
 * @param ms - Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
      // Rate limiting delay
      if (attempt > 0) {
        await delay(RETRY_DELAY_MS * attempt)
      }

      const request = createSecRequest(url)
      const response = await fetch(request)

      // Handle rate limiting (429) with exponential backoff
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY_MS * (attempt + 1)
        await delay(waitMs)
        continue
      }

      // Handle server errors with retry
      if (response.status >= 500 && attempt < retries) {
        await delay(RETRY_DELAY_MS * (attempt + 1))
        continue
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Network errors are retryable
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
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : null
}

/**
 * Extracts all text contents from repeated XML elements
 */
function getAllXmlText(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'gi')
  const matches = xml.matchAll(regex)
  return Array.from(matches).map((m) => m[1].trim())
}

/**
 * Extracts a section of XML between opening and closing tags
 */
function getXmlSection(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1] : null
}

/**
 * Extracts all sections of XML for repeated elements
 */
function getAllXmlSections(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'gi')
  const matches = xml.matchAll(regex)
  return Array.from(matches).map((m) => m[1])
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Fetches recent Form 4 filings from SEC EDGAR search API
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param size - Number of results to return (default 100, max 10000)
 * @returns Array of Form 4 filing metadata
 *
 * @example
 * const filings = await fetchRecentForm4Filings('2024-01-01', '2024-01-31')
 */
export async function fetchRecentForm4Filings(
  startDate: string,
  endDate: string,
  size: number = 100
): Promise<Form4FilingMetadata[]> {
  const params = new URLSearchParams({
    q: '*',
    forms: '4',
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

  const data: EdgarSearchResponse = await response.json()

  return data.hits.hits.map((hit) => {
    const accessionNumber = hit._source.adsh
    return {
      accessionNumber,
      accessionNumberNoDashes: accessionNumber.replace(/-/g, ''),
      cik: hit._source.ciks[0] || '',
      filedAt: hit._source.file_date,
      formType: hit._source.form,
      displayName: hit._source.display_names[0] || '',
    }
  })
}

/**
 * Fetches the raw XML content of a Form 4 filing
 *
 * @param cik - Company CIK number (with or without leading zeros)
 * @param accessionNumber - Filing accession number (with or without dashes)
 * @returns Raw XML string of the Form 4 filing
 *
 * @example
 * const xml = await fetchForm4FilingXML('320193', '0000320193-24-000001')
 */
export async function fetchForm4FilingXML(
  cik: string,
  accessionNumber: string
): Promise<string> {
  // Normalize CIK (remove leading zeros for URL path)
  const normalizedCik = cik.replace(/^0+/, '')

  // Normalize accession number
  const accessionNoDashes = accessionNumber.replace(/-/g, '')
  const accessionWithDashes = accessionNumber.includes('-')
    ? accessionNumber
    : `${accessionNumber.slice(0, 10)}-${accessionNumber.slice(10, 12)}-${accessionNumber.slice(12)}`

  // Construct URL: /Archives/edgar/data/{cik}/{accession-no-dashes}/{accession}.xml
  // The filename uses the format with dashes
  const url = `${SEC_ARCHIVES_BASE_URL}/${normalizedCik}/${accessionNoDashes}/${accessionWithDashes}.xml`

  await delay(REQUEST_DELAY_MS)

  const response = await fetchWithRetry(url)

  if (!response.ok) {
    // Try alternative filename format (primary_doc.xml)
    if (response.status === 404) {
      const altUrl = `${SEC_ARCHIVES_BASE_URL}/${normalizedCik}/${accessionNoDashes}/primary_doc.xml`
      await delay(REQUEST_DELAY_MS)
      const altResponse = await fetchWithRetry(altUrl)

      if (altResponse.ok) {
        return await altResponse.text()
      }
    }

    throw new Error(`Failed to fetch Form 4 XML: ${response.status} ${response.statusText}`)
  }

  return await response.text()
}

/**
 * Parses Form 4 XML to extract structured transaction data
 *
 * @param xml - Raw XML string from Form 4 filing
 * @returns Parsed Form 4 data including issuer, owner, and transactions
 *
 * @example
 * const xml = await fetchForm4FilingXML('320193', '0000320193-24-000001')
 * const parsed = parseForm4XML(xml)
 */
export function parseForm4XML(xml: string): ParsedForm4 {
  // Extract document type
  const documentType = getXmlText(xml, 'documentType') || '4'

  // Extract period of report
  const periodOfReport = getXmlText(xml, 'periodOfReport') || ''

  // Extract issuer information
  const issuerSection = getXmlSection(xml, 'issuer') || ''
  const issuer: Form4Issuer = {
    cik: getXmlText(issuerSection, 'issuerCik') || '',
    name: getXmlText(issuerSection, 'issuerName') || '',
    ticker: getXmlText(issuerSection, 'issuerTradingSymbol') || '',
  }

  // Extract owner information
  const ownerSection = getXmlSection(xml, 'reportingOwner') || ''
  const ownerIdSection = getXmlSection(ownerSection, 'reportingOwnerId') || ''
  const ownerRelationship = getXmlSection(ownerSection, 'reportingOwnerRelationship') || ''

  const owner: Form4Owner = {
    cik: getXmlText(ownerIdSection, 'rptOwnerCik') || '',
    name: getXmlText(ownerIdSection, 'rptOwnerName') || '',
    isDirector: getXmlText(ownerRelationship, 'isDirector') === '1' ||
                getXmlText(ownerRelationship, 'isDirector')?.toLowerCase() === 'true',
    isOfficer: getXmlText(ownerRelationship, 'isOfficer') === '1' ||
               getXmlText(ownerRelationship, 'isOfficer')?.toLowerCase() === 'true',
    isTenPercentOwner: getXmlText(ownerRelationship, 'isTenPercentOwner') === '1' ||
                       getXmlText(ownerRelationship, 'isTenPercentOwner')?.toLowerCase() === 'true',
    officerTitle: getXmlText(ownerRelationship, 'officerTitle'),
  }

  // Extract footnotes for 10b5-1 plan detection
  const footnoteSection = getXmlSection(xml, 'footnotes') || ''
  const footnotes = getAllXmlText(footnoteSection, 'footnote')

  // Detect 10b5-1 plan from footnotes
  const is10b51Plan = footnotes.some(
    (footnote) =>
      footnote.toLowerCase().includes('10b5-1') ||
      footnote.toLowerCase().includes('rule 10b5-1') ||
      footnote.toLowerCase().includes('10b-5-1')
  )

  // Extract non-derivative transactions
  const nonDerivativeSection = getXmlSection(xml, 'nonDerivativeTable') || ''
  const nonDerivativeTransactions = getAllXmlSections(nonDerivativeSection, 'nonDerivativeTransaction')

  // Extract derivative transactions
  const derivativeSection = getXmlSection(xml, 'derivativeTable') || ''
  const derivativeTransactions = getAllXmlSections(derivativeSection, 'derivativeTransaction')

  // Parse transactions
  const transactions: Form4Transaction[] = []

  // Parse non-derivative transactions
  for (const txn of nonDerivativeTransactions) {
    const transactionAmounts = getXmlSection(txn, 'transactionAmounts') || ''
    const postTransactionAmounts = getXmlSection(txn, 'postTransactionAmounts') || ''
    const ownershipNature = getXmlSection(txn, 'ownershipNature') || ''
    const transactionCoding = getXmlSection(txn, 'transactionCoding') || ''

    const sharesStr = getXmlText(transactionAmounts, 'transactionShares') ||
                      getXmlText(transactionAmounts, 'value')
    const priceStr = getXmlText(transactionAmounts, 'transactionPricePerShare') ||
                     getXmlText(transactionAmounts, 'value')
    const sharesAfterStr = getXmlText(postTransactionAmounts, 'sharesOwnedFollowingTransaction') ||
                           getXmlText(postTransactionAmounts, 'value')

    transactions.push({
      transactionDate: getXmlText(txn, 'transactionDate')
        ? getXmlText(getXmlSection(txn, 'transactionDate') || '', 'value') || ''
        : '',
      transactionCode: getXmlText(transactionCoding, 'transactionCode') || '',
      shares: sharesStr ? parseFloat(sharesStr) : null,
      pricePerShare: priceStr ? parseFloat(priceStr) : null,
      sharesOwnedAfter: sharesAfterStr ? parseFloat(sharesAfterStr) : null,
      directOrIndirect: (getXmlText(ownershipNature, 'directOrIndirectOwnership') ||
                         getXmlText(getXmlSection(ownershipNature, 'directOrIndirectOwnership') || '', 'value') ||
                         'D') as 'D' | 'I',
      is10b51Plan: is10b51Plan,
    })
  }

  // Parse derivative transactions (options, etc.)
  for (const txn of derivativeTransactions) {
    const transactionAmounts = getXmlSection(txn, 'transactionAmounts') || ''
    const postTransactionAmounts = getXmlSection(txn, 'postTransactionAmounts') || ''
    const ownershipNature = getXmlSection(txn, 'ownershipNature') || ''
    const transactionCoding = getXmlSection(txn, 'transactionCoding') || ''

    const sharesStr = getXmlText(transactionAmounts, 'transactionShares') ||
                      getXmlText(transactionAmounts, 'value')
    const priceStr = getXmlText(transactionAmounts, 'transactionPricePerShare') ||
                     getXmlText(transactionAmounts, 'value')
    const sharesAfterStr = getXmlText(postTransactionAmounts, 'sharesOwnedFollowingTransaction') ||
                           getXmlText(postTransactionAmounts, 'value')

    transactions.push({
      transactionDate: getXmlText(txn, 'transactionDate')
        ? getXmlText(getXmlSection(txn, 'transactionDate') || '', 'value') || ''
        : '',
      transactionCode: getXmlText(transactionCoding, 'transactionCode') || '',
      shares: sharesStr ? parseFloat(sharesStr) : null,
      pricePerShare: priceStr ? parseFloat(priceStr) : null,
      sharesOwnedAfter: sharesAfterStr ? parseFloat(sharesAfterStr) : null,
      directOrIndirect: (getXmlText(ownershipNature, 'directOrIndirectOwnership') ||
                         getXmlText(getXmlSection(ownershipNature, 'directOrIndirectOwnership') || '', 'value') ||
                         'D') as 'D' | 'I',
      is10b51Plan: is10b51Plan,
    })
  }

  return {
    documentType,
    periodOfReport,
    issuer,
    owner,
    transactions,
    footnotes,
    is10b51Plan,
  }
}

/**
 * Fetches and parses a Form 4 filing in one operation
 *
 * @param cik - Company CIK number
 * @param accessionNumber - Filing accession number
 * @returns Parsed Form 4 data
 */
export async function fetchAndParseForm4(
  cik: string,
  accessionNumber: string
): Promise<ParsedForm4> {
  const xml = await fetchForm4FilingXML(cik, accessionNumber)
  return parseForm4XML(xml)
}

/**
 * Builds the SEC EDGAR URL for a filing
 *
 * @param cik - Company CIK number
 * @param accessionNumber - Filing accession number
 * @returns URL to the filing on SEC EDGAR
 */
export function buildFilingUrl(cik: string, accessionNumber: string): string {
  const normalizedCik = cik.replace(/^0+/, '')
  const accessionNoDashes = accessionNumber.replace(/-/g, '')
  return `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${normalizedCik}&type=4&dateb=&owner=include&count=40&search_text=`
}

/**
 * Builds the direct URL to a Form 4 filing document
 *
 * @param cik - Company CIK number
 * @param accessionNumber - Filing accession number
 * @returns Direct URL to the Form 4 XML document
 */
export function buildForm4DocumentUrl(cik: string, accessionNumber: string): string {
  const normalizedCik = cik.replace(/^0+/, '')
  const accessionNoDashes = accessionNumber.replace(/-/g, '')
  const accessionWithDashes = accessionNumber.includes('-')
    ? accessionNumber
    : `${accessionNumber.slice(0, 10)}-${accessionNumber.slice(10, 12)}-${accessionNumber.slice(12)}`

  return `${SEC_ARCHIVES_BASE_URL}/${normalizedCik}/${accessionNoDashes}/${accessionWithDashes}-index.htm`
}

// =============================================================================
// Daily Index File Functions
// =============================================================================

/** Entry from SEC daily index file */
export interface DailyIndexEntry {
  formType: string
  companyName: string
  cik: string
  filedDate: string
  filePath: string
  accessionNumber: string
}

/**
 * Fetches Form 4 filings from SEC daily index file for a specific date
 *
 * Daily index files are available at:
 * https://www.sec.gov/Archives/edgar/daily-index/{year}/QTR{quarter}/form.{YYYYMMDD}.idx
 *
 * @param date - Date to fetch filings for
 * @returns Array of Form 4 filing entries from the daily index
 */
export async function fetchDailyIndexForDate(date: Date): Promise<DailyIndexEntry[]> {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const quarter = Math.ceil(month / 3)

  const dateStr = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`
  const url = `https://www.sec.gov/Archives/edgar/daily-index/${year}/QTR${quarter}/form.${dateStr}.idx`

  await delay(REQUEST_DELAY_MS)

  try {
    const response = await fetchWithRetry(url)

    if (!response.ok) {
      // 404 is expected for weekends/holidays - no filings on those days
      if (response.status === 404) {
        return []
      }
      throw new Error(`Failed to fetch daily index: ${response.status}`)
    }

    const text = await response.text()
    const lines = text.split('\n')

    // Skip header lines (first 11 lines typically)
    const dataLines = lines.slice(11)

    const entries: DailyIndexEntry[] = []

    for (const line of dataLines) {
      if (line.length < 100) continue // Skip short/empty lines

      // Parse fixed-width format:
      // Form Type (12) | Company Name (62) | CIK (12) | Date Filed (12) | File Name
      const formType = line.slice(0, 12).trim()

      // Only include Form 4 filings
      if (formType !== '4') continue

      const companyName = line.slice(12, 74).trim()
      const cik = line.slice(74, 86).trim()
      const filedDate = line.slice(86, 98).trim()
      const filePath = line.slice(98).trim()

      // Extract accession number from file path
      // Path format: edgar/data/{cik}/{accession}/{filename}
      const pathParts = filePath.split('/')
      const accessionNumber = pathParts.length >= 4 ? pathParts[3] : ''

      if (!accessionNumber) continue

      entries.push({
        formType,
        companyName,
        cik,
        filedDate,
        filePath,
        accessionNumber,
      })
    }

    return entries
  } catch (error) {
    // Network errors or parse errors - return empty array
    console.error(`Error fetching daily index for ${dateStr}:`, error)
    return []
  }
}

/**
 * Fetches Form 4 filings from SEC daily index files for a date range
 *
 * @param daysBack - Number of days to look back
 * @param maxEntries - Maximum number of entries to return
 * @returns Array of unique Form 4 filing entries
 */
export async function fetchForm4FilingsFromDailyIndex(
  daysBack: number = 2,
  maxEntries: number = 500
): Promise<Form4FilingMetadata[]> {
  const entries: DailyIndexEntry[] = []
  const seenAccessions = new Set<string>()

  // Fetch each day's index
  for (let i = 0; i < daysBack; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const dayEntries = await fetchDailyIndexForDate(date)

    for (const entry of dayEntries) {
      // Skip duplicates
      if (seenAccessions.has(entry.accessionNumber)) continue
      seenAccessions.add(entry.accessionNumber)

      entries.push(entry)

      // Stop if we've reached the max
      if (entries.length >= maxEntries) break
    }

    if (entries.length >= maxEntries) break
  }

  // Convert to Form4FilingMetadata format
  return entries.map((entry) => ({
    accessionNumber: entry.accessionNumber,
    accessionNumberNoDashes: entry.accessionNumber.replace(/-/g, ''),
    cik: entry.cik,
    filedAt: entry.filedDate,
    formType: '4',
    displayName: entry.companyName,
  }))
}
