'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowUpDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SignificanceBadge } from './significance-badge'
import { cn } from '@/lib/utils'
import type { InsiderTransactionWithDetails } from '@/types/database'

interface TransactionTableProps {
  transactions: InsiderTransactionWithDetails[]
  loading?: boolean
  className?: string
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
 * Table component for displaying insider transactions
 *
 * Features:
 * - Sortable columns
 * - Loading skeleton
 * - Empty state
 * - Responsive design
 */
export function TransactionTable({
  transactions,
  loading = false,
  className,
}: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>('filed_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
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
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => handleSort(field)}
      aria-label={`Sort by ${label}, currently ${sortField === field ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'unsorted'}`}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" aria-hidden="true" />
    </Button>
  )

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn('rounded-md border', className)}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Insider</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Significance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-4 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Empty state - let parent component handle empty states for better UX
  if (transactions.length === 0) {
    return null
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="filed_at" label="date">Date</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="ticker" label="company">Company</SortButton>
            </TableHead>
            <TableHead>Insider</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">
              <SortButton field="total_value" label="value">Value</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="ai_significance_score" label="significance">Significance</SortButton>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.map((transaction) => {
            const isBuy = transaction.transaction_type === 'P'
            const isSell = transaction.transaction_type === 'S'

            return (
              <TableRow
                key={transaction.id}
                className="hover:bg-slate-800/50 transition-colors"
              >
                <TableCell className="whitespace-nowrap">
                  {format(new Date(transaction.filed_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/company/${transaction.ticker}`}
                    className="font-semibold text-white hover:underline"
                  >
                    {transaction.ticker}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {transaction.company_name}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium truncate max-w-[150px]">
                    {transaction.insider_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {transaction.insider_title || 'Insider'}
                  </p>
                </TableCell>
                <TableCell>
                  <TransactionTypeBadge type={transaction.transaction_type} />
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(transaction.shares)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-mono font-semibold',
                    isBuy && 'text-emerald-400',
                    isSell && 'text-red-400'
                  )}
                >
                  {formatCurrency(transaction.total_value)}
                </TableCell>
                <TableCell>
                  <SignificanceBadge
                    score={transaction.ai_significance_score}
                    showLabel
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function TransactionTypeBadge({ type }: { type: string }) {
  // Custom styled badges for BUY and SELL
  if (type === 'P') {
    return (
      <Badge
        className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium"
        role="status"
        aria-label="Purchase transaction"
      >
        <ArrowUpRight className="mr-1 h-3 w-3" aria-hidden="true" />
        BUY
      </Badge>
    )
  }

  if (type === 'S') {
    return (
      <Badge
        className="bg-red-500/20 text-red-400 border border-red-500/30 font-medium"
        role="status"
        aria-label="Sale transaction"
      >
        <ArrowDownRight className="mr-1 h-3 w-3" aria-hidden="true" />
        SELL
      </Badge>
    )
  }

  // Secondary badges for other transaction types
  const labelMap: Record<string, string> = {
    A: 'Award',
    D: 'Disposition',
    G: 'Gift',
    M: 'Exercise',
  }

  const label = labelMap[type] || type

  return (
    <Badge variant="secondary" role="status" aria-label={`${label} transaction`}>
      {label}
    </Badge>
  )
}
