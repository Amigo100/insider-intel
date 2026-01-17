'use client'

import { useState, useId } from 'react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  User,
  Building2,
  PieChart,
  BarChart3,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InsiderActivityChart } from '@/components/charts/insider-activity-chart'
import { HoldingsPieChart } from '@/components/charts/holdings-pie-chart'
import { SignificanceIndicator } from '@/components/dashboard/significance-badge'
import type { InsiderTransactionWithDetails } from '@/types/database'

/**
 * CompanyTabs - Modernized Bloomberg Design System
 *
 * Tab navigation with proper ARIA pattern:
 * - Overview: 2-column layout with chart + key insiders
 * - Insider Activity: Full transaction table with filters
 * - Institutional Holdings: Pie chart + holders table
 *
 * Uses DashboardCard pattern for consistent styling (UI_AUDIT #149)
 */

interface ActivityDataPoint {
  date: string
  buys: number
  sells: number
  [key: string]: string | number
}

interface HolderData {
  institution_id: string
  institution_name: string
  institution_type: string | null
  shares: number
  value: number
  percent_of_portfolio: number | null
  shares_change: number | null
  shares_change_percent: number | null
  is_new_position: boolean
  is_closed_position?: boolean
}

interface KeyInsider {
  name: string
  title: string | null
  lastActivity: string
  type: string
}

interface Stats {
  buyCount: number
  sellCount: number
  buyValue: number
  sellValue: number
  netValue: number
  institutionalHolders: number
  institutionalValue: number
  newPositions: number
  increasedPositions: number
}

interface CompanyTabsProps {
  transactions: InsiderTransactionWithDetails[]
  holders: HolderData[]
  activityData: ActivityDataPoint[]
  keyInsiders: KeyInsider[]
  stats: Stats
}

type TabId = 'overview' | 'insider' | 'institutional'

interface TabConfig {
  id: TabId
  label: string
  icon: typeof BarChart3
}

const TAB_CONFIG: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'insider', label: 'Insider Activity', icon: TrendingUp },
  { id: 'institutional', label: 'Institutional Holdings', icon: Building2 },
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
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

function formatRelativeDate(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

// Tab Button component
function TabButton({
  tab,
  isActive,
  onClick,
  panelId,
}: {
  tab: TabConfig
  isActive: boolean
  onClick: () => void
  panelId: string
}) {
  const Icon = tab.icon

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
        'relative flex items-center gap-2 px-4 py-3',
        'text-sm font-medium',
        'whitespace-nowrap',
        'transition-colors duration-150',
        'focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-amber))]',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg-card))]',
        isActive
          ? 'text-[hsl(var(--accent-amber))]'
          : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))]'
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {tab.label}
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

// Card wrapper for dashboard styling (fixes UI_AUDIT #149)
function DashboardCard({
  children,
  className,
  title,
  icon: Icon,
}: {
  children: React.ReactNode
  className?: string
  title?: string
  icon?: typeof TrendingUp
}) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        'bg-[hsl(var(--bg-card))]',
        'border border-[hsl(var(--border-default))]',
        className
      )}
    >
      {title && (
        <div
          className={cn(
            'flex items-center gap-2 px-5 py-4',
            'border-b border-[hsl(var(--border-subtle))]'
          )}
        >
          {Icon && (
            <Icon
              className="h-4 w-4 text-[hsl(var(--accent-amber))]"
              aria-hidden="true"
            />
          )}
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  )
}

// Transaction Badge
function TransactionBadge({ type }: { type: string }) {
  const isBuy = type === 'P'

  return (
    <Badge
      className={cn(
        'gap-1',
        isBuy
          ? 'bg-[hsl(var(--signal-positive)/0.15)] text-[hsl(var(--signal-positive))] border-[hsl(var(--signal-positive)/0.3)]'
          : 'bg-[hsl(var(--signal-negative)/0.15)] text-[hsl(var(--signal-negative))] border-[hsl(var(--signal-negative)/0.3)]'
      )}
    >
      {isBuy ? (
        <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
      ) : (
        <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
      )}
      {isBuy ? 'BUY' : 'SELL'}
    </Badge>
  )
}

// Overview Tab Content
function OverviewTab({
  transactions,
  activityData,
  keyInsiders,
}: {
  transactions: InsiderTransactionWithDetails[]
  activityData: ActivityDataPoint[]
  keyInsiders: KeyInsider[]
}) {
  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* 2-column layout: Chart + Key Insiders */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Chart - 2/3 width */}
        <DashboardCard
          title="Insider Activity (12 Months)"
          icon={BarChart3}
          className="lg:col-span-2"
        >
          <div className="p-5">
            {activityData.length > 0 ? (
              <InsiderActivityChart data={activityData} height={250} />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-[hsl(var(--text-muted))]">
                No activity data available
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Key Insiders - 1/3 width */}
        <DashboardCard title="Key Insiders" icon={User}>
          <div className="p-4">
            {keyInsiders.length > 0 ? (
              <div className="space-y-3">
                {keyInsiders.map((insider, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center justify-between',
                      'rounded-md p-3',
                      'bg-[hsl(var(--bg-elevated)/0.5)]'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[hsl(var(--text-primary))] truncate">
                        {insider.name}
                      </p>
                      <p className="text-xs text-[hsl(var(--text-muted))] truncate">
                        {insider.title || 'Insider'}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <TransactionBadge type={insider.type} />
                      <p className="mt-1 text-xs text-[hsl(var(--text-muted))]">
                        {formatRelativeDate(insider.lastActivity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[hsl(var(--text-muted))]">
                No insider data available
              </p>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Recent Transactions with AI Context */}
      <DashboardCard title="Recent Transactions" icon={Sparkles}>
        <div className="p-4">
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className={cn(
                    'rounded-lg p-4',
                    'border border-[hsl(var(--border-subtle))]',
                    'bg-[hsl(var(--bg-elevated)/0.3)]'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TransactionBadge type={txn.transaction_type} />
                        <span className="font-medium text-[hsl(var(--text-primary))]">
                          {txn.insider_name}
                        </span>
                        {txn.insider_title && (
                          <span className="text-sm text-[hsl(var(--text-muted))]">
                            · {txn.insider_title}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[hsl(var(--text-muted))]">
                        {formatCurrency(txn.total_value)} ·{' '}
                        {format(new Date(txn.filed_at), 'MMM d, yyyy')}
                      </p>
                      {txn.ai_context && (
                        <div className="mt-3 flex items-start gap-2">
                          <Sparkles
                            className="h-4 w-4 shrink-0 mt-0.5 text-[hsl(var(--accent-amber))]"
                            aria-hidden="true"
                          />
                          <p className="text-sm text-[hsl(var(--text-secondary))]">
                            {txn.ai_context}
                          </p>
                        </div>
                      )}
                    </div>
                    {txn.ai_significance_score !== null && (
                      <SignificanceIndicator score={txn.ai_significance_score} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[hsl(var(--text-muted))]">
              No recent transactions
            </p>
          )}
        </div>
      </DashboardCard>
    </div>
  )
}

// Insider Activity Tab Content
function InsiderActivityTab({
  transactions,
}: {
  transactions: InsiderTransactionWithDetails[]
}) {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Filter transactions
  let filtered = [...transactions]

  if (typeFilter !== 'all') {
    filtered = filtered.filter((t) => t.transaction_type === typeFilter)
  }

  if (dateFilter !== 'all') {
    const now = new Date()
    const days =
      dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : dateFilter === '90d' ? 90 : 365
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    filtered = filtered.filter((t) => new Date(t.filed_at) >= cutoff)
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <DashboardCard>
        <div className="p-4">
          <div
            role="group"
            aria-label="Transaction filters"
            className="flex flex-wrap items-center gap-3"
          >
            <Filter
              className="h-4 w-4 text-[hsl(var(--text-muted))]"
              aria-hidden="true"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger
                className={cn(
                  'h-9 w-[120px]',
                  'bg-[hsl(var(--bg-app))]',
                  'border-[hsl(var(--border-default))]',
                  'text-[hsl(var(--text-primary))]'
                )}
                aria-label="Filter by type"
              >
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="P">Buys Only</SelectItem>
                <SelectItem value="S">Sells Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger
                className={cn(
                  'h-9 w-[120px]',
                  'bg-[hsl(var(--bg-app))]',
                  'border-[hsl(var(--border-default))]',
                  'text-[hsl(var(--text-primary))]'
                )}
                aria-label="Filter by date"
              >
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <span className="ml-auto text-sm text-[hsl(var(--text-muted))]">
              {filtered.length} transactions
            </span>
          </div>
        </div>
      </DashboardCard>

      {/* Transactions Table */}
      <DashboardCard>
        {filtered.length > 0 ? (
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
                    Date
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      'px-5 py-3 text-left',
                      'text-[11px] font-semibold uppercase tracking-[0.05em]',
                      'text-[hsl(var(--text-muted))]'
                    )}
                  >
                    Insider
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      'px-5 py-3 text-left',
                      'text-[11px] font-semibold uppercase tracking-[0.05em]',
                      'text-[hsl(var(--text-muted))]'
                    )}
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      'px-5 py-3 text-right',
                      'text-[11px] font-semibold uppercase tracking-[0.05em]',
                      'text-[hsl(var(--text-muted))]'
                    )}
                  >
                    Shares
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
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border-subtle))]">
                {filtered.map((txn) => (
                  <tr
                    key={txn.id}
                    className="hover:bg-[hsl(var(--bg-hover))] transition-colors"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-[hsl(var(--text-secondary))]">
                      {format(new Date(txn.filed_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[hsl(var(--text-primary))]">
                        {txn.insider_name}
                      </p>
                      <p className="text-xs text-[hsl(var(--text-muted))]">
                        {txn.insider_title || 'Insider'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <TransactionBadge type={txn.transaction_type} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-[hsl(var(--text-secondary))]">
                      {formatNumber(txn.shares)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-[hsl(var(--text-secondary))]">
                      {formatCurrency(txn.total_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-[hsl(var(--text-muted))]">
            No transactions found
          </div>
        )}
      </DashboardCard>
    </div>
  )
}

// Institutional Holdings Tab Content
function InstitutionalHoldingsTab({ holders }: { holders: HolderData[] }) {
  const activeHolders = holders.filter((h) => !h.is_closed_position)

  // Pie chart data
  const pieChartData = activeHolders.slice(0, 10).map((h) => ({
    name: h.institution_name,
    value: h.value,
    percent: h.percent_of_portfolio || 0,
  }))

  // Recent changes
  const recentChanges = activeHolders
    .filter((h) => h.is_new_position || h.shares_change !== null)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* 2-column layout: Pie chart + Recent Changes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <DashboardCard title="Top Holders" icon={PieChart}>
          <div className="p-5">
            {pieChartData.length > 0 ? (
              <HoldingsPieChart data={pieChartData} height={300} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-[hsl(var(--text-muted))]">
                No holdings data available
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Recent Changes */}
        <DashboardCard title="Recent Changes" icon={TrendingUp}>
          <div className="p-4">
            {recentChanges.length > 0 ? (
              <div className="space-y-3">
                {recentChanges.map((holder) => (
                  <div
                    key={holder.institution_id}
                    className={cn(
                      'flex items-center justify-between',
                      'rounded-md p-3',
                      'bg-[hsl(var(--bg-elevated)/0.5)]'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[hsl(var(--text-primary))] truncate">
                        {holder.institution_name}
                      </p>
                      <p className="text-xs text-[hsl(var(--text-muted))]">
                        {formatCurrency(holder.value)}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      {holder.is_new_position ? (
                        <Badge
                          className={cn(
                            'bg-[hsl(var(--signal-positive)/0.15)]',
                            'text-[hsl(var(--signal-positive))]',
                            'border-[hsl(var(--signal-positive)/0.3)]'
                          )}
                        >
                          NEW
                        </Badge>
                      ) : holder.shares_change !== null ? (
                        <span
                          className={cn(
                            'text-sm font-medium',
                            holder.shares_change > 0
                              ? 'text-[hsl(var(--signal-positive))]'
                              : 'text-[hsl(var(--signal-negative))]'
                          )}
                        >
                          {formatPercent(holder.shares_change_percent)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[hsl(var(--text-muted))]">
                No recent changes
              </p>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Full Holders Table */}
      <DashboardCard title="All Institutional Holders" icon={Building2}>
        {activeHolders.length > 0 ? (
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
                      'px-5 py-3 text-right',
                      'text-[11px] font-semibold uppercase tracking-[0.05em]',
                      'text-[hsl(var(--text-muted))]'
                    )}
                  >
                    Shares
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
                    % Portfolio
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
                {activeHolders.map((holder) => (
                  <tr
                    key={holder.institution_id}
                    className="hover:bg-[hsl(var(--bg-hover))] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[hsl(var(--text-primary))]">
                        {holder.institution_name}
                      </p>
                      {holder.institution_type && (
                        <p className="text-xs text-[hsl(var(--text-muted))]">
                          {holder.institution_type}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-[hsl(var(--text-secondary))]">
                      {formatNumber(holder.shares)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-[hsl(var(--text-secondary))]">
                      {formatCurrency(holder.value)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-[hsl(var(--text-secondary))]">
                      {holder.percent_of_portfolio
                        ? `${holder.percent_of_portfolio.toFixed(2)}%`
                        : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {holder.is_new_position ? (
                        <Badge
                          className={cn(
                            'bg-[hsl(var(--signal-positive)/0.15)]',
                            'text-[hsl(var(--signal-positive))]',
                            'border-[hsl(var(--signal-positive)/0.3)]'
                          )}
                        >
                          NEW
                        </Badge>
                      ) : holder.shares_change !== null ? (
                        <span
                          className={cn(
                            'font-mono tabular-nums',
                            holder.shares_change > 0
                              ? 'text-[hsl(var(--signal-positive))]'
                              : holder.shares_change < 0
                                ? 'text-[hsl(var(--signal-negative))]'
                                : 'text-[hsl(var(--text-muted))]'
                          )}
                        >
                          {formatPercent(holder.shares_change_percent)}
                        </span>
                      ) : (
                        <span className="text-[hsl(var(--text-muted))]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-[hsl(var(--text-muted))]">
            No institutional holdings data available
          </div>
        )}
      </DashboardCard>
    </div>
  )
}

// Main CompanyTabs component
export function CompanyTabs({
  transactions,
  holders,
  activityData,
  keyInsiders,
  stats,
}: CompanyTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const instanceId = useId()

  // Keyboard navigation
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

    const newTabButton = document.getElementById(`tab-${TAB_CONFIG[newIndex].id}`)
    newTabButton?.focus()
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div
        role="tablist"
        aria-label="Company information"
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
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            panelId={`panel-${tab.id}-${instanceId}`}
          />
        ))}
      </div>

      {/* Tab Panels */}
      <div
        role="tabpanel"
        id={`panel-overview-${instanceId}`}
        aria-labelledby="tab-overview"
        hidden={activeTab !== 'overview'}
        tabIndex={0}
      >
        {activeTab === 'overview' && (
          <OverviewTab
            transactions={transactions}
            activityData={activityData}
            keyInsiders={keyInsiders}
          />
        )}
      </div>

      <div
        role="tabpanel"
        id={`panel-insider-${instanceId}`}
        aria-labelledby="tab-insider"
        hidden={activeTab !== 'insider'}
        tabIndex={0}
      >
        {activeTab === 'insider' && (
          <InsiderActivityTab transactions={transactions} />
        )}
      </div>

      <div
        role="tabpanel"
        id={`panel-institutional-${instanceId}`}
        aria-labelledby="tab-institutional"
        hidden={activeTab !== 'institutional'}
        tabIndex={0}
      >
        {activeTab === 'institutional' && (
          <InstitutionalHoldingsTab holders={holders} />
        )}
      </div>
    </div>
  )
}
