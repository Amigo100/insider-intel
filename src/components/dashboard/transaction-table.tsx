'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Star,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DensityToggle,
  useDensityPreference,
  DENSITY_STYLES,
  type TableDensity,
} from '@/components/ui/density-toggle'
import { SignificanceBadge } from './significance-badge'
import { TableSparkline } from '@/components/charts/trend-sparkline'
import { cn } from '@/lib/utils'
import type { InsiderTransactionWithDetails } from '@/types/database'

/**
 * TransactionTable - Modernized Bloomberg Design System
 *
 * Features:
 * - Sticky header with glassmorphism effect
 * - Sticky first column (Insider name)
 * - Sortable columns
 * - Tabular numbers for financial data
 * - 6M Trend sparkline column
 * - Row hover states
 * - Expandable rows with AI context
 * - Loading skeleton
 * - Density toggle (Comfortable / Compact)
 *
 * Expanded Row:
 * - AI Context paragraph with sparkle icon
 * - Significance indicator (dots)
 * - Actions: "View Company", "Add to Watchlist"
 *
 * Accessibility:
 * - scope="col" on all header cells
 * - aria-label on sort buttons
 * - aria-sort on sortable columns
 * - aria-expanded on expandable rows
 */

interface TransactionTableProps {
  transactions: InsiderTransactionWithDetails[]
  loading?: boolean
  className?: string
  /** Maximum height of scrollable area */
  maxHeight?: string
  /** Optional price history data keyed by ticker */
  priceHistory?: Record<string, number[]>
  /** Show the trend sparkline column */
  showTrendColumn?: boolean
  /** Total count for pagination display (defaults to transactions.length) */
  totalCount?: number
  /** Current page start index (1-indexed, for display) */
  pageStart?: number
  /** Current page end index (for display) */
  pageEnd?: number
  /** Show the results summary bar */
  showResultsSummary?: boolean
  /** External density control (if not provided, uses internal state with localStorage) */
  density?: TableDensity
  /** Callback when density changes (only used if density prop is provided) */
  onDensityChange?: (density: TableDensity) => void
  /** Enable expandable rows with AI context */
  expandable?: boolean
}

type SortField = 'filed_at' | 'ticker' | 'total_value' | 'ai_significance_score'
type SortDirection = 'asc' | 'desc'

/**
 * Formats a number as currency
 */
function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '-'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value)
}

/**
 * Formats a number with commas
 */
function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return '-'

  return new Intl.NumberFormat('en-US', {
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value)
}

/**
 * Format price per share
 */
function formatPrice(value: number | null): string {
  if (value === null || value === undefined) return '-'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Decode HTML entities in strings (e.g., &amp; -> &)
 */
function decodeHtmlEntities(text: string): string {
  if (!text) return text
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  }
  return text.replace(/&(?:amp|lt|gt|quot|#39|apos);/g, (match) => entities[match] || match)
}

// Shared styles
const headerCellStyles = cn(
  // Sticky positioning
  'sticky top-0 z-20',
  // Glassmorphism background
  'bg-[rgba(26,26,26,0.75)] backdrop-blur-[12px]',
  // Typography
  'text-[11px] font-semibold uppercase tracking-[0.05em]',
  'text-[hsl(var(--text-tertiary))]',
  // Border
  'border-b border-[hsl(var(--border-default))]',
  // Padding
  'px-4 py-3',
  // Prevent text wrap
  'whitespace-nowrap'
)

const stickyColumnStyles = cn(
  // Sticky positioning
  'sticky left-0 z-10',
  // Opaque background (not glass) for better readability
  'bg-card',
  // Border
  'border-r border-[hsl(var(--border-default))]'
)

const cornerCellStyles = cn(
  headerCellStyles,
  stickyColumnStyles,
  // Higher z-index for corner
  'z-30'
)

const dataCellStyles = cn(
  'px-4 py-3',
  'text-sm',
  'border-b border-[hsl(var(--border-subtle,var(--border)))]'
)

const numericCellStyles = cn(
  dataCellStyles,
  'text-right',
  'font-mono tabular-nums'
)

export function TransactionTable({
  transactions,
  loading = false,
  className,
  maxHeight = 'calc(100vh - 200px)',
  priceHistory = {},
  showTrendColumn = true,
  totalCount,
  pageStart = 1,
  pageEnd,
  showResultsSummary = true,
  density: externalDensity,
  onDensityChange,
  expandable = false,
}: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>('filed_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Use external density if provided, otherwise use internal state with localStorage
  const [internalDensity, setInternalDensity] = useDensityPreference('transaction-table-density')
  const density = externalDensity ?? internalDensity
  const handleDensityChange = onDensityChange ?? setInternalDensity

  // Get density-specific styles
  const densityStyles = DENSITY_STYLES[density]

  // Calculate display values for results summary
  const total = totalCount ?? transactions.length
  const displayStart = pageStart
  const displayEnd = pageEnd ?? transactions.length

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case 'filed_at':
        comparison = new Date(a.filed_at).getTime() - new Date(b.filed_at).getTime()
        break
      case 'ticker':
        comparison = a.ticker.localeCompare(b.ticker)
        break
      case 'total_value':
        comparison = (a.total_value || 0) - (b.total_value || 0)
        break
      case 'ai_significance_score':
        comparison = (a.ai_significance_score || 0) - (b.ai_significance_score || 0)
        break
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  const SortButton = ({
    field,
    children,
    label,
  }: {
    field: SortField
    children: React.ReactNode
    label: string
  }) => {
    const isActive = sortField === field
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          '-ml-2 h-6 px-2',
          'text-[11px] font-semibold uppercase tracking-[0.05em]',
          'text-[hsl(var(--text-tertiary))]',
          'hover:text-foreground hover:bg-transparent',
          isActive && 'text-[hsl(var(--accent-amber))]'
        )}
        onClick={() => handleSort(field)}
        aria-label={`Sort by ${label}, currently ${isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'unsorted'}`}
      >
        {children}
        <ArrowUpDown className="ml-1.5 h-3 w-3" aria-hidden="true" />
      </Button>
    )
  }

  // Column count for skeleton (includes expand column if enabled)
  const columnCount = (showTrendColumn ? 9 : 8) + (expandable ? 1 : 0)

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn('space-y-0', className)}>
        {/* Results summary skeleton */}
        {showResultsSummary && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border-default))]">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-[180px]" />
          </div>
        )}
        <div
          className="rounded-lg border border-[hsl(var(--border-default))] overflow-hidden"
        >
          <div className="overflow-auto" style={{ maxHeight }}>
            <table className="w-full">
              <thead>
                <tr>
                  {expandable && <th scope="col" className={headerCellStyles} style={{ width: 40 }} />}
                  <th scope="col" className={cornerCellStyles}>Insider</th>
                  <th scope="col" className={headerCellStyles}>Company</th>
                  <th scope="col" className={headerCellStyles}>Type</th>
                  <th scope="col" className={cn(headerCellStyles, 'text-right')}>Value</th>
                  {showTrendColumn && (
                    <th scope="col" className={cn(headerCellStyles, 'hidden md:table-cell')}>6M Trend</th>
                  )}
                  <th scope="col" className={cn(headerCellStyles, 'text-right')}>Shares</th>
                  <th scope="col" className={cn(headerCellStyles, 'text-right')}>Price/Share</th>
                  <th scope="col" className={headerCellStyles}>Date</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className={densityStyles.row}>
                    {Array.from({ length: columnCount }).map((_, j) => (
                      <td key={j} className={dataCellStyles}>
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Empty state with compact EmptyState design (UI_AUDIT #152)
  if (transactions.length === 0) {
    return (
      <div className={cn('space-y-0', className)}>
        {showResultsSummary && (
          <div className="flex items-center justify-between px-4 py-3 bg-[hsl(var(--bg-surface))] border-b border-[hsl(var(--border-default))]">
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              Showing <span className="font-medium text-foreground tabular-nums">0</span> transactions
            </p>
            <DensityToggle value={density} onChange={handleDensityChange} />
          </div>
        )}
        <div className="rounded-lg border border-[hsl(var(--border-default))] overflow-hidden">
          <div
            className="flex flex-col items-center justify-center py-12 px-6 text-center"
            role="status"
            aria-label="No transactions"
          >
            {/* Icon Container - amber accent */}
            <div
              className={cn(
                'flex items-center justify-center',
                'h-16 w-16 mb-4',
                'rounded-full',
                'bg-[hsl(var(--accent-amber)/0.15)]'
              )}
            >
              <TrendingUp
                className="h-8 w-8 text-[hsl(var(--accent-amber))]"
                aria-hidden="true"
              />
            </div>
            <h3
              className={cn(
                'text-lg font-semibold',
                'text-[hsl(var(--text-primary))]',
                'mb-2'
              )}
            >
              No transactions found
            </h3>
            <p
              className={cn(
                'text-sm',
                'text-[hsl(var(--text-secondary))]',
                'max-w-[400px]'
              )}
            >
              There are no insider transactions to display. Try adjusting your filters or check back later for new activity.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Generate density-aware cell styles
  const getDensityCellStyles = (base: string) =>
    cn(base, densityStyles.cell, densityStyles.text)

  const getDensityNumericCellStyles = () =>
    cn(
      densityStyles.cell,
      densityStyles.text,
      'text-right',
      'font-mono tabular-nums',
      'border-b border-[hsl(var(--border-subtle,var(--border)))]'
    )

  return (
    <div className={cn('space-y-0', className)}>
      {/* Results summary bar with density toggle */}
      {showResultsSummary && (
        <div className="flex items-center justify-between px-4 py-3 bg-[hsl(var(--bg-surface))] border-b border-[hsl(var(--border-default))]">
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Showing{' '}
            <span className="font-medium text-foreground tabular-nums">
              {displayStart.toLocaleString()}-{displayEnd.toLocaleString()}
            </span>{' '}
            of{' '}
            <span className="font-medium text-foreground tabular-nums">
              {total.toLocaleString()}
            </span>{' '}
            transactions
          </p>
          <DensityToggle
            value={density}
            onChange={handleDensityChange}
          />
        </div>
      )}

      <div
        className="rounded-lg border border-[hsl(var(--border-default))] overflow-hidden"
      >
        <div className="overflow-auto" style={{ maxHeight }}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {/* Expand column */}
                {expandable && (
                  <th scope="col" className={cn(headerCellStyles, 'w-10 px-2')} />
                )}
                {/* Corner cell - sticky both ways */}
                <th scope="col" className={cornerCellStyles}>
                  Insider
                </th>
                <th
                  scope="col"
                  className={headerCellStyles}
                  aria-sort={sortField === 'ticker' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <SortButton field="ticker" label="company">Company</SortButton>
                </th>
                <th scope="col" className={headerCellStyles}>
                  Type
                </th>
                <th
                  scope="col"
                  className={cn(headerCellStyles, 'text-right')}
                  aria-sort={sortField === 'total_value' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <SortButton field="total_value" label="value">Value</SortButton>
                </th>
                {/* Trend column - hidden on mobile */}
                {showTrendColumn && (
                  <th scope="col" className={cn(headerCellStyles, 'hidden md:table-cell')}>
                    6M Trend
                  </th>
                )}
                <th scope="col" className={cn(headerCellStyles, 'text-right')}>
                  Shares
                </th>
                <th scope="col" className={cn(headerCellStyles, 'text-right')}>
                  Price/Share
                </th>
                <th
                  scope="col"
                  className={headerCellStyles}
                  aria-sort={sortField === 'filed_at' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <SortButton field="filed_at" label="date">Date</SortButton>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((transaction) => {
                const isBuy = transaction.transaction_type === 'P'
                const isSell = transaction.transaction_type === 'S'
                const isExpanded = expandedRows.has(transaction.id)

                // Get price history for this ticker, or empty array if not available
                const tickerHistory = priceHistory[transaction.ticker] || []

                // Density-aware cell base style
                const cellBase = cn(
                  densityStyles.cell,
                  densityStyles.text,
                  'border-b border-[hsl(var(--border-subtle,var(--border)))]'
                )

                return (
                  <>
                    <tr
                      key={transaction.id}
                      className={cn(
                        'group transition-colors',
                        expandable && 'cursor-pointer',
                        isExpanded
                          ? 'bg-[hsl(var(--bg-elevated))]'
                          : 'hover:bg-[hsl(var(--bg-hover))]',
                        densityStyles.row
                      )}
                      onClick={expandable ? () => toggleRow(transaction.id) : undefined}
                      aria-expanded={expandable ? isExpanded : undefined}
                    >
                      {/* Expand toggle */}
                      {expandable && (
                        <td className={cn(cellBase, 'w-10 px-2')}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleRow(transaction.id)
                            }}
                            className={cn(
                              'flex h-6 w-6 items-center justify-center rounded',
                              'text-[hsl(var(--text-muted))]',
                              'hover:text-[hsl(var(--text-primary))]',
                              'hover:bg-[hsl(var(--bg-hover))]',
                              'transition-colors duration-150'
                            )}
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </td>
                      )}

                      {/* Sticky first column */}
                      <td className={cn(cellBase, stickyColumnStyles, isExpanded ? 'bg-[hsl(var(--bg-elevated))]' : 'group-hover:bg-[hsl(var(--bg-hover))]')}>
                        <p
                          className={cn(
                            'font-medium truncate max-w-[180px]',
                            'text-[hsl(var(--text-primary))]',
                            density === 'compact' && 'text-xs'
                          )}
                          title={transaction.insider_name}
                        >
                          {transaction.insider_name}
                        </p>
                        {/* Hide subtitle in compact mode */}
                        {density === 'comfortable' && (
                          <p
                            className="text-xs text-[hsl(var(--text-secondary))] truncate max-w-[180px]"
                            title={transaction.insider_title || 'Insider'}
                          >
                            {transaction.insider_title || 'Insider'}
                          </p>
                        )}
                      </td>
                      <td className={cellBase}>
                        <Link
                          href={`/company/${transaction.ticker}`}
                          className={cn(
                            'font-semibold text-[hsl(var(--text-primary))] hover:text-[hsl(var(--accent-amber))] transition-colors',
                            density === 'compact' && 'text-xs'
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {transaction.ticker}
                        </Link>
                        {/* Hide company name in compact mode */}
                        {density === 'comfortable' && (
                          <p
                            className="text-xs text-[hsl(var(--text-secondary))] truncate max-w-[150px]"
                            title={decodeHtmlEntities(transaction.company_name)}
                          >
                            {decodeHtmlEntities(transaction.company_name)}
                          </p>
                        )}
                      </td>
                      <td className={cellBase}>
                        <Badge
                          variant={isBuy ? 'buy' : isSell ? 'sell' : 'secondary'}
                          showIcon={density === 'comfortable' && (isBuy || isSell)}
                        >
                          {isBuy ? 'BUY' : isSell ? 'SELL' : getTransactionLabel(transaction.transaction_type)}
                        </Badge>
                      </td>
                      <td
                        className={cn(
                          getDensityNumericCellStyles(),
                          'font-semibold',
                          isBuy && 'text-[hsl(var(--signal-positive))]',
                          isSell && 'text-[hsl(var(--signal-negative))]'
                        )}
                      >
                        {formatCurrency(transaction.total_value)}
                      </td>
                      {/* Trend sparkline - hidden on mobile */}
                      {showTrendColumn && (
                        <td className={cn(cellBase, 'hidden md:table-cell')}>
                          <TableSparkline data={tickerHistory} />
                        </td>
                      )}
                      <td className={getDensityNumericCellStyles()}>
                        {formatNumber(transaction.shares)}
                      </td>
                      <td className={getDensityNumericCellStyles()}>
                        {formatPrice(transaction.price_per_share)}
                      </td>
                      <td className={cn(cellBase, 'whitespace-nowrap')}>
                        {format(new Date(transaction.filed_at), density === 'compact' ? 'MM/dd/yy' : 'MMM d, yyyy')}
                      </td>
                    </tr>

                    {/* Expanded row content */}
                    {expandable && isExpanded && (
                      <tr key={`${transaction.id}-expanded`}>
                        <td
                          colSpan={columnCount}
                          className={cn(
                            'px-5 py-4',
                            'bg-[hsl(var(--bg-elevated))]',
                            'border-b border-[hsl(var(--border-default))]'
                          )}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
                            {/* AI Context */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles
                                  className="h-4 w-4 text-[hsl(var(--accent-amber))]"
                                  aria-hidden="true"
                                />
                                <span
                                  className={cn(
                                    'text-xs font-semibold uppercase tracking-wide',
                                    'text-[hsl(var(--text-muted))]'
                                  )}
                                >
                                  AI Analysis
                                </span>
                              </div>
                              {transaction.ai_context ? (
                                <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                                  {transaction.ai_context}
                                </p>
                              ) : (
                                <p className="text-sm text-[hsl(var(--text-muted))] italic">
                                  No AI analysis available for this transaction.
                                </p>
                              )}
                            </div>

                            {/* Significance & Actions */}
                            <div className="flex flex-col gap-3 lg:items-end">
                              {/* Significance indicator */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[hsl(var(--text-muted))]">
                                  Signal:
                                </span>
                                <SignificanceBadge
                                  score={transaction.ai_significance_score}
                                  showLabel
                                />
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className={cn(
                                    'h-8',
                                    'border-[hsl(var(--border-default))]',
                                    'hover:bg-[hsl(var(--bg-hover))]'
                                  )}
                                >
                                  <Link
                                    href={`/company/${transaction.ticker}`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                    View Company
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    'h-8',
                                    'text-[hsl(var(--text-muted))]',
                                    'hover:text-[hsl(var(--accent-amber))]',
                                    'hover:bg-[hsl(var(--bg-hover))]'
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // TODO: Implement add to watchlist
                                  }}
                                >
                                  <Star className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                  Add to Watchlist
                                </Button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/**
 * Get display label for transaction type
 */
function getTransactionLabel(type: string): string {
  const labelMap: Record<string, string> = {
    A: 'Award',
    D: 'Dispose',
    G: 'Gift',
    M: 'Exercise',
    P: 'Buy',
    S: 'Sell',
  }
  return labelMap[type] || type
}

// Re-export density types and hooks for convenience
export { type TableDensity, useDensityPreference, DENSITY_STYLES } from '@/components/ui/density-toggle'
