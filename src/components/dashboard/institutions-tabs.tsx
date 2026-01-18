'use client'

import { useState, useId } from 'react'
import Link from 'next/link'
import {
  Search,
  Building2,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  X as CloseIcon,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * InstitutionsTabs - Modernized Bloomberg Design System
 *
 * Tab navigation with proper ARIA pattern:
 * - role="tablist" on container
 * - role="tab" on each tab
 * - aria-selected for active state
 * - aria-controls linking to panels
 * - role="tabpanel" on content panels
 *
 * Tabs: New Positions, Increased, Decreased, Closed, All
 * Active state: amber underline (not background)
 * Each tab can show count badge
 */

// Types
export interface InstitutionalHolding {
  id: string
  institution_id: string
  institution_name: string
  institution_type: string | null
  company_id: string
  ticker: string
  company_name: string
  shares: number
  value: number
  shares_change: number | null
  shares_change_percent: number | null
  is_new_position: boolean
  is_closed_position: boolean
  report_date: string
}

export interface InstitutionsTabsProps {
  holdings: InstitutionalHolding[]
  loading?: boolean
  className?: string
}

type TabId = 'new' | 'increased' | 'decreased' | 'closed' | 'all'

interface TabConfig {
  id: TabId
  label: string
  filter: (h: InstitutionalHolding) => boolean
  emptyIcon: typeof TrendingUp
  emptyTitle: string
  emptyDescription: string
}

const TAB_CONFIG: TabConfig[] = [
  {
    id: 'new',
    label: 'New Positions',
    filter: (h) => h.is_new_position,
    emptyIcon: Plus,
    emptyTitle: 'No new positions found',
    emptyDescription: 'No institutions initiated new positions this quarter.',
  },
  {
    id: 'increased',
    label: 'Increased',
    filter: (h) => !h.is_new_position && !h.is_closed_position && (h.shares_change || 0) > 0,
    emptyIcon: TrendingUp,
    emptyTitle: 'No increased positions',
    emptyDescription: 'No institutions increased their holdings this quarter.',
  },
  {
    id: 'decreased',
    label: 'Decreased',
    filter: (h) => !h.is_new_position && !h.is_closed_position && (h.shares_change || 0) < 0,
    emptyIcon: TrendingDown,
    emptyTitle: 'No decreased positions',
    emptyDescription: 'No institutions decreased their holdings this quarter.',
  },
  {
    id: 'closed',
    label: 'Closed',
    filter: (h) => h.is_closed_position,
    emptyIcon: CloseIcon,
    emptyTitle: 'No closed positions',
    emptyDescription: 'No institutions fully exited positions this quarter.',
  },
  {
    id: 'all',
    label: 'All',
    filter: () => true,
    emptyIcon: Building2,
    emptyTitle: 'No holdings data',
    emptyDescription: 'No institutional holdings data available for this period.',
  },
]

// Utility functions
function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value)
}

function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value)
}

function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return '-'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Tab button component
 */
function TabButton({
  tab,
  count,
  isActive,
  onClick,
  panelId,
}: {
  tab: TabConfig
  count: number
  isActive: boolean
  onClick: () => void
  panelId: string
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${tab.id}`}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      className={cn(
        // Base styles
        'relative px-4 py-3',
        'text-sm font-medium',
        'whitespace-nowrap',
        'transition-colors duration-150',
        // Focus styles
        'focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-amber))]',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg-card))]',
        // Active/inactive styles
        isActive
          ? 'text-[hsl(var(--accent-amber))]'
          : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))]'
      )}
    >
      <span className="flex items-center gap-2">
        {tab.label}
        {count > 0 && (
          <span
            className={cn(
              'inline-flex items-center justify-center',
              'min-w-[20px] h-5 px-1.5',
              'text-xs font-semibold rounded-full',
              isActive
                ? 'bg-[hsl(var(--accent-amber)/0.2)] text-[hsl(var(--accent-amber))]'
                : 'bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-muted))]'
            )}
          >
            {count}
          </span>
        )}
      </span>
      {/* Amber underline for active tab */}
      {isActive && (
        <span
          className={cn(
            'absolute bottom-0 left-0 right-0 h-0.5',
            'bg-[hsl(var(--accent-amber))]'
          )}
          aria-hidden="true"
        />
      )}
    </button>
  )
}

/**
 * Position status badge
 */
function PositionStatusBadge({
  holding,
}: {
  holding: InstitutionalHolding
}) {
  if (holding.is_new_position) {
    return (
      <Badge
        className={cn(
          'bg-[hsl(var(--signal-positive)/0.15)]',
          'text-[hsl(var(--signal-positive))]',
          'border border-[hsl(var(--signal-positive)/0.3)]'
        )}
      >
        NEW
      </Badge>
    )
  }

  if (holding.is_closed_position) {
    return (
      <Badge
        className={cn(
          'bg-[hsl(var(--signal-negative)/0.15)]',
          'text-[hsl(var(--signal-negative))]',
          'border border-[hsl(var(--signal-negative)/0.3)]'
        )}
      >
        CLOSED
      </Badge>
    )
  }

  const changePercent = holding.shares_change_percent
  if (changePercent === null) {
    return <span className="text-[hsl(var(--text-muted))]">-</span>
  }

  const isPositive = changePercent > 0
  const isNegative = changePercent < 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        'text-sm font-medium',
        isPositive && 'text-[hsl(var(--signal-positive))]',
        isNegative && 'text-[hsl(var(--signal-negative))]',
        !isPositive && !isNegative && 'text-[hsl(var(--text-muted))]'
      )}
    >
      {isPositive && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
      {isNegative && <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />}
      {formatPercent(changePercent)}
    </span>
  )
}

/**
 * Holdings table component
 */
function HoldingsTable({
  holdings,
  emptyState,
}: {
  holdings: InstitutionalHolding[]
  emptyState: { icon: typeof TrendingUp; title: string; description: string }
}) {
  if (holdings.length === 0) {
    const EmptyIcon = emptyState.icon
    return (
      <div
        className="flex flex-col items-center justify-center py-12 px-6 text-center"
        role="status"
        aria-label={emptyState.title}
      >
        {/* Icon Container - 64px with amber accent background */}
        <div
          className={cn(
            'flex items-center justify-center',
            'h-16 w-16 mb-4',
            'rounded-full',
            'bg-[hsl(var(--accent-amber)/0.15)]'
          )}
        >
          <EmptyIcon
            className="h-8 w-8 text-[hsl(var(--accent-amber))]"
            aria-hidden="true"
          />
        </div>
        {/* Title - 18px, 600 weight */}
        <h3
          className={cn(
            'text-lg font-semibold',
            'text-[hsl(var(--text-primary))]',
            'mb-2'
          )}
        >
          {emptyState.title}
        </h3>
        {/* Description - 14px, max-width 400px */}
        <p
          className={cn(
            'text-sm',
            'text-[hsl(var(--text-secondary))]',
            'max-w-[400px]'
          )}
        >
          {emptyState.description}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[hsl(var(--border-subtle))]">
            <th
              scope="col"
              className={cn(
                'px-5 py-3 text-left',
                'text-[11px] font-semibold uppercase tracking-[0.05em]',
                'text-[hsl(var(--text-muted))]'
              )}
            >
              Institution
            </th>
            <th
              scope="col"
              className={cn(
                'px-5 py-3 text-left',
                'text-[11px] font-semibold uppercase tracking-[0.05em]',
                'text-[hsl(var(--text-muted))]'
              )}
            >
              Ticker
            </th>
            <th
              scope="col"
              className={cn(
                'px-5 py-3 text-left',
                'text-[11px] font-semibold uppercase tracking-[0.05em]',
                'text-[hsl(var(--text-muted))]'
              )}
            >
              Status
            </th>
            <th
              scope="col"
              className={cn(
                'px-5 py-3 text-right',
                'text-[11px] font-semibold uppercase tracking-[0.05em]',
                'text-[hsl(var(--text-muted))]'
              )}
            >
              Value
            </th>
            <th
              scope="col"
              className={cn(
                'px-5 py-3 text-right',
                'text-[11px] font-semibold uppercase tracking-[0.05em]',
                'text-[hsl(var(--text-muted))]'
              )}
            >
              Change
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border-subtle))]">
          {holdings.map((holding) => {
            const valueChange = holding.shares_change
              ? (holding.shares_change * (holding.value / (holding.shares || 1)))
              : null

            return (
              <tr
                key={holding.id}
                className={cn(
                  'transition-colors duration-150',
                  'hover:bg-[hsl(var(--bg-hover))]'
                )}
              >
                <td className="px-5 py-3.5">
                  <p
                    className={cn(
                      'font-medium truncate max-w-[200px]',
                      'text-[hsl(var(--text-primary))]'
                    )}
                    title={holding.institution_name}
                  >
                    {holding.institution_name}
                  </p>
                  {holding.institution_type && (
                    <p className="text-xs text-[hsl(var(--text-muted))]">
                      {holding.institution_type}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <Link
                    href={`/company/${holding.ticker}`}
                    className={cn(
                      'font-semibold',
                      'text-[hsl(var(--text-primary))]',
                      'hover:text-[hsl(var(--accent-amber))]',
                      'transition-colors duration-150'
                    )}
                  >
                    {holding.ticker}
                  </Link>
                  <p
                    className="text-xs text-[hsl(var(--text-muted))] truncate max-w-[150px]"
                    title={holding.company_name}
                  >
                    {holding.company_name}
                  </p>
                </td>
                <td className="px-5 py-3.5">
                  <PositionStatusBadge holding={holding} />
                </td>
                <td
                  className={cn(
                    'px-5 py-3.5 text-right',
                    'font-mono tabular-nums',
                    'text-[hsl(var(--text-secondary))]'
                  )}
                >
                  {formatCurrency(holding.value)}
                </td>
                <td
                  className={cn(
                    'px-5 py-3.5 text-right',
                    'font-mono tabular-nums',
                    valueChange !== null && valueChange > 0 && 'text-[hsl(var(--signal-positive))]',
                    valueChange !== null && valueChange < 0 && 'text-[hsl(var(--signal-negative))]',
                    (valueChange === null || valueChange === 0) && 'text-[hsl(var(--text-muted))]'
                  )}
                >
                  {valueChange !== null ? (
                    <>
                      {valueChange > 0 ? '+' : ''}
                      {formatCurrency(valueChange)}
                    </>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Filter bar component
 */
export interface InstitutionsFilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  quarterValue: string
  onQuarterChange: (value: string) => void
  minValueFilter: string
  onMinValueChange: (value: string) => void
  className?: string
}

export function InstitutionsFilterBar({
  searchValue,
  onSearchChange,
  quarterValue,
  onQuarterChange,
  minValueFilter,
  onMinValueChange,
  className,
}: InstitutionsFilterBarProps) {
  // Generate quarter options (current and past 4 quarters)
  const generateQuarters = () => {
    const quarters: { value: string; label: string }[] = []
    const now = new Date()
    let year = now.getFullYear()
    let quarter = Math.ceil((now.getMonth() + 1) / 3)

    for (let i = 0; i < 5; i++) {
      quarters.push({
        value: `${year}-Q${quarter}`,
        label: `Q${quarter} ${year}`,
      })
      quarter--
      if (quarter === 0) {
        quarter = 4
        year--
      }
    }
    return quarters
  }

  const quarters = generateQuarters()

  return (
    <div
      role="group"
      aria-label="Holdings filters"
      className={cn(
        'rounded-lg p-4',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2',
              'h-4 w-4',
              'text-[hsl(var(--text-muted))]'
            )}
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Search institution or ticker..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search by institution or ticker"
            className={cn(
              'h-9 pl-9 pr-9',
              'bg-[hsl(var(--bg-app))]',
              'border-[hsl(var(--border-default))]',
              'text-[hsl(var(--text-primary))]',
              'placeholder:text-[hsl(var(--text-muted))]',
              'focus-visible:ring-[hsl(var(--accent-amber))]'
            )}
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2',
                'flex h-6 w-6 items-center justify-center rounded',
                'text-[hsl(var(--text-muted))]',
                'hover:text-[hsl(var(--text-primary))]',
                'hover:bg-[hsl(var(--bg-hover))]',
                'focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-amber))]',
                'transition-colors duration-150'
              )}
            >
              <CloseIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Quarter dropdown */}
        <Select value={quarterValue} onValueChange={onQuarterChange}>
          <SelectTrigger
            className={cn(
              'h-9 w-[130px]',
              'bg-[hsl(var(--bg-app))]',
              'border-[hsl(var(--border-default))]',
              'text-[hsl(var(--text-primary))]',
              'focus:ring-[hsl(var(--accent-amber))]'
            )}
            aria-label="Filter by quarter"
          >
            <SelectValue placeholder="Quarter" />
          </SelectTrigger>
          <SelectContent>
            {quarters.map((q) => (
              <SelectItem key={q.value} value={q.value}>
                {q.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Minimum value dropdown */}
        <Select value={minValueFilter} onValueChange={onMinValueChange}>
          <SelectTrigger
            className={cn(
              'h-9 w-[120px]',
              'bg-[hsl(var(--bg-app))]',
              'border-[hsl(var(--border-default))]',
              'text-[hsl(var(--text-primary))]',
              'focus:ring-[hsl(var(--accent-amber))]'
            )}
            aria-label="Minimum value filter"
          >
            <SelectValue placeholder="Min Value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Values</SelectItem>
            <SelectItem value="1m">$1M+</SelectItem>
            <SelectItem value="10m">$10M+</SelectItem>
            <SelectItem value="100m">$100M+</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

/**
 * Main InstitutionsTabs component
 */
export function InstitutionsTabs({
  holdings,
  loading = false,
  className,
}: InstitutionsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('new')
  const [searchValue, setSearchValue] = useState('')
  const [quarterValue, setQuarterValue] = useState('')
  const [minValueFilter, setMinValueFilter] = useState('all')

  const instanceId = useId()

  // Filter holdings based on search and min value
  const filteredHoldings = holdings.filter((h) => {
    // Search filter
    if (searchValue) {
      const search = searchValue.toLowerCase()
      const matchesInstitution = h.institution_name.toLowerCase().includes(search)
      const matchesTicker = h.ticker.toLowerCase().includes(search)
      if (!matchesInstitution && !matchesTicker) return false
    }

    // Min value filter
    if (minValueFilter !== 'all') {
      const minValue =
        minValueFilter === '1m' ? 1_000_000 :
        minValueFilter === '10m' ? 10_000_000 :
        minValueFilter === '100m' ? 100_000_000 : 0
      if (h.value < minValue) return false
    }

    return true
  })

  // Get counts for each tab
  const tabCounts = TAB_CONFIG.reduce((acc, tab) => {
    acc[tab.id] = filteredHoldings.filter(tab.filter).length
    return acc
  }, {} as Record<TabId, number>)

  // Get current tab config and filtered data
  const currentTabConfig = TAB_CONFIG.find((t) => t.id === activeTab) || TAB_CONFIG[0]
  const currentHoldings = filteredHoldings.filter(currentTabConfig.filter)

  // Handle keyboard navigation between tabs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = TAB_CONFIG.findIndex((t) => t.id === activeTab)
    let newIndex = currentIndex

    if (e.key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % TAB_CONFIG.length
    } else if (e.key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + TAB_CONFIG.length) % TAB_CONFIG.length
    } else if (e.key === 'Home') {
      newIndex = 0
    } else if (e.key === 'End') {
      newIndex = TAB_CONFIG.length - 1
    } else {
      return
    }

    e.preventDefault()
    setActiveTab(TAB_CONFIG[newIndex].id)

    // Focus the new tab button
    const newTabButton = document.getElementById(`tab-${TAB_CONFIG[newIndex].id}`)
    newTabButton?.focus()
  }

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Tabs skeleton */}
        <div className="flex gap-2 border-b border-[hsl(var(--border-default))]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 bg-[hsl(var(--bg-elevated))]" />
          ))}
        </div>
        {/* Filter bar skeleton */}
        <Skeleton className="h-16 w-full bg-[hsl(var(--bg-elevated))]" />
        {/* Table skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full bg-[hsl(var(--bg-elevated))]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tab navigation */}
      <div
        role="tablist"
        aria-label="Holdings categories"
        onKeyDown={handleKeyDown}
        className={cn(
          'flex overflow-x-auto',
          'border-b border-[hsl(var(--border-default))]',
          '-mx-1 px-1'
        )}
      >
        {TAB_CONFIG.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            count={tabCounts[tab.id]}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            panelId={`panel-${tab.id}-${instanceId}`}
          />
        ))}
      </div>

      {/* Filter bar */}
      <InstitutionsFilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        quarterValue={quarterValue}
        onQuarterChange={setQuarterValue}
        minValueFilter={minValueFilter}
        onMinValueChange={setMinValueFilter}
      />

      {/* Tab panels */}
      {TAB_CONFIG.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}-${instanceId}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
          className={cn(
            'rounded-lg overflow-hidden',
            'bg-[hsl(var(--bg-card))]',
            'border border-[hsl(var(--border-default))]',
            activeTab !== tab.id && 'hidden'
          )}
        >
          {activeTab === tab.id && (
            <HoldingsTable
              holdings={currentHoldings.slice(0, 50)}
              emptyState={{
                icon: tab.emptyIcon,
                title: tab.emptyTitle,
                description: tab.emptyDescription,
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// Legacy exports for backwards compatibility (can be removed later)
export interface Institution {
  id: string
  cik: string
  name: string
  institution_type: string | null
  aum_estimate: number | null
  holdings_count?: number
}

export interface NewPosition {
  company_id: string
  ticker: string
  company_name: string
  new_buyers: number
  total_value: number
  notable_names: string[]
}

export interface TopMovement {
  ticker: string
  company_name: string
  net_change: number
  institution_count: number
}

export function NewPositionsSection({ positions }: { positions: NewPosition[] }) {
  if (positions.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg',
          'bg-[hsl(var(--bg-card))]',
          'border border-[hsl(var(--border-default))]'
        )}
      >
        <div
          className="flex flex-col items-center justify-center py-12 px-6 text-center"
          role="status"
          aria-label="No new positions"
        >
          {/* Icon Container - 64px with amber accent */}
          <div
            className={cn(
              'flex items-center justify-center',
              'h-16 w-16 mb-4',
              'rounded-full',
              'bg-[hsl(var(--accent-amber)/0.15)]'
            )}
          >
            <Plus
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
            No new positions
          </h3>
          <p
            className={cn(
              'text-sm',
              'text-[hsl(var(--text-secondary))]',
              'max-w-[400px]'
            )}
          >
            No institutions initiated new positions this quarter.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-5 py-4',
          'border-b border-[hsl(var(--border-subtle))]'
        )}
      >
        <TrendingUp className="h-4 w-4 text-[hsl(var(--signal-positive))]" aria-hidden="true" />
        <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">
          New Institutional Positions
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border-subtle))]">
              <th
                scope="col"
                className={cn(
                  'px-5 py-3 text-left',
                  'text-[11px] font-semibold uppercase tracking-[0.05em]',
                  'text-[hsl(var(--text-muted))]'
                )}
              >
                Stock
              </th>
              <th
                scope="col"
                className={cn(
                  'px-5 py-3 text-right',
                  'text-[11px] font-semibold uppercase tracking-[0.05em]',
                  'text-[hsl(var(--text-muted))]'
                )}
              >
                New Buyers
              </th>
              <th
                scope="col"
                className={cn(
                  'px-5 py-3 text-right',
                  'text-[11px] font-semibold uppercase tracking-[0.05em]',
                  'text-[hsl(var(--text-muted))]'
                )}
              >
                Total Value
              </th>
              <th
                scope="col"
                className={cn(
                  'px-5 py-3 text-left',
                  'text-[11px] font-semibold uppercase tracking-[0.05em]',
                  'text-[hsl(var(--text-muted))]'
                )}
              >
                Notable Names
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border-subtle))]">
            {positions.slice(0, 10).map((pos) => (
              <tr
                key={pos.company_id}
                className="hover:bg-[hsl(var(--bg-hover))] transition-colors"
              >
                <td className="px-5 py-3.5">
                  <Link
                    href={`/company/${pos.ticker}`}
                    className={cn(
                      'font-semibold',
                      'text-[hsl(var(--text-primary))]',
                      'hover:text-[hsl(var(--accent-amber))]',
                      'transition-colors'
                    )}
                  >
                    {pos.ticker}
                  </Link>
                  <p className="text-xs text-[hsl(var(--text-muted))] truncate max-w-[150px]">
                    {pos.company_name}
                  </p>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Badge
                    className={cn(
                      'bg-[hsl(var(--signal-positive)/0.15)]',
                      'text-[hsl(var(--signal-positive))]',
                      'border border-[hsl(var(--signal-positive)/0.3)]'
                    )}
                  >
                    {pos.new_buyers}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right font-mono tabular-nums text-[hsl(var(--text-secondary))]">
                  {formatCurrency(pos.total_value)}
                </td>
                <td className="px-5 py-3.5">
                  <p className="text-sm text-[hsl(var(--text-muted))] truncate max-w-[200px]">
                    {pos.notable_names.slice(0, 2).join(', ')}
                    {pos.notable_names.length > 2 && '...'}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TopMovementsSection({
  topBought,
  topSold,
}: {
  topBought: TopMovement[]
  topSold: TopMovement[]
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Most Bought */}
      <div
        className={cn(
          'rounded-lg overflow-hidden',
          'bg-[hsl(var(--bg-card))]',
          'border border-[hsl(var(--border-default))]'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2 px-5 py-4',
            'border-b border-[hsl(var(--border-subtle))]'
          )}
        >
          <TrendingUp className="h-4 w-4 text-[hsl(var(--signal-positive))]" aria-hidden="true" />
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">
            Most Bought by Institutions
          </h2>
        </div>
        {topBought.length > 0 ? (
          <div className="p-4 space-y-2">
            {topBought.slice(0, 5).map((item, index) => (
              <Link
                key={item.ticker}
                href={`/company/${item.ticker}`}
                className={cn(
                  'flex items-center justify-between',
                  'rounded-lg p-3',
                  'border border-[hsl(var(--border-default))]',
                  'hover:bg-[hsl(var(--bg-hover))]',
                  'hover:border-[hsl(var(--border-strong))]',
                  'transition-colors'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-[hsl(var(--text-muted))] w-6">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[hsl(var(--text-primary))]">
                      {item.ticker}
                    </p>
                    <p className="text-xs text-[hsl(var(--text-muted))] truncate max-w-[120px]">
                      {item.company_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[hsl(var(--signal-positive))]">
                    +{formatNumber(item.net_change)}
                  </p>
                  <p className="text-xs text-[hsl(var(--text-muted))]">
                    {item.institution_count} institutions
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center" role="status">
            <div className={cn('flex items-center justify-center', 'h-12 w-12 mb-3', 'rounded-full', 'bg-[hsl(var(--accent-amber)/0.15)]')}>
              <TrendingUp className="h-6 w-6 text-[hsl(var(--accent-amber))]" aria-hidden="true" />
            </div>
            <p className="text-sm text-[hsl(var(--text-muted))]">No data available</p>
          </div>
        )}
      </div>

      {/* Most Sold */}
      <div
        className={cn(
          'rounded-lg overflow-hidden',
          'bg-[hsl(var(--bg-card))]',
          'border border-[hsl(var(--border-default))]'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2 px-5 py-4',
            'border-b border-[hsl(var(--border-subtle))]'
          )}
        >
          <TrendingDown className="h-4 w-4 text-[hsl(var(--signal-negative))]" aria-hidden="true" />
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">
            Most Sold by Institutions
          </h2>
        </div>
        {topSold.length > 0 ? (
          <div className="p-4 space-y-2">
            {topSold.slice(0, 5).map((item, index) => (
              <Link
                key={item.ticker}
                href={`/company/${item.ticker}`}
                className={cn(
                  'flex items-center justify-between',
                  'rounded-lg p-3',
                  'border border-[hsl(var(--border-default))]',
                  'hover:bg-[hsl(var(--bg-hover))]',
                  'hover:border-[hsl(var(--border-strong))]',
                  'transition-colors'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-[hsl(var(--text-muted))] w-6">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[hsl(var(--text-primary))]">
                      {item.ticker}
                    </p>
                    <p className="text-xs text-[hsl(var(--text-muted))] truncate max-w-[120px]">
                      {item.company_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[hsl(var(--signal-negative))]">
                    {formatNumber(item.net_change)}
                  </p>
                  <p className="text-xs text-[hsl(var(--text-muted))]">
                    {item.institution_count} institutions
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center" role="status">
            <div className={cn('flex items-center justify-center', 'h-12 w-12 mb-3', 'rounded-full', 'bg-[hsl(var(--accent-amber)/0.15)]')}>
              <TrendingDown className="h-6 w-6 text-[hsl(var(--accent-amber))]" aria-hidden="true" />
            </div>
            <p className="text-sm text-[hsl(var(--text-muted))]">No data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
