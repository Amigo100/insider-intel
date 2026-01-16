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
  }: {
    field: SortField
    children: React.ReactNode
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
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

  // Empty state
  if (transactions.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-md border py-12',
          className
        )}
      >
        <p className="text-lg font-medium">No transactions found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or check back later
        </p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="filed_at">Date</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="ticker">Company</SortButton>
            </TableHead>
            <TableHead>Insider</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">
              <SortButton field="total_value">Value</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="ai_significance_score">Significance</SortButton>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(transaction.filed_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <Link
                  href={`/company/${transaction.ticker}`}
                  className="font-medium hover:underline"
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
              <TableCell className="text-right font-mono">
                {formatCurrency(transaction.total_value)}
              </TableCell>
              <TableCell>
                <SignificanceBadge
                  score={transaction.ai_significance_score}
                  showLabel
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TransactionTypeBadge({ type }: { type: string }) {
  const isPurchase = type === 'P'
  const isSale = type === 'S'

  const config = {
    P: { label: 'BUY', variant: 'success' as const, Icon: ArrowUpRight },
    S: { label: 'SELL', variant: 'destructive' as const, Icon: ArrowDownRight },
    A: { label: 'Award', variant: 'secondary' as const, Icon: null },
    D: { label: 'Disposition', variant: 'secondary' as const, Icon: null },
    G: { label: 'Gift', variant: 'secondary' as const, Icon: null },
    M: { label: 'Exercise', variant: 'secondary' as const, Icon: null },
  }[type] || { label: type, variant: 'secondary' as const, Icon: null }

  return (
    <Badge variant={config.variant}>
      {config.Icon && <config.Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  )
}
