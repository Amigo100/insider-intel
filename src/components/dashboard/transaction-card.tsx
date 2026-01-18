'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SignificanceBadge } from './significance-badge'
import { cn } from '@/lib/utils'
import type { InsiderTransactionWithDetails } from '@/types/database'
import { TransactionTypeLabels } from '@/types/database'

interface TransactionCardProps {
  transaction: InsiderTransactionWithDetails
  className?: string
}

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
 * Gets the transaction type display info
 */
function getTransactionTypeInfo(type: string) {
  const isPurchase = type === 'P'
  const isSale = type === 'S'

  return {
    label: isPurchase ? 'BUY' : isSale ? 'SELL' : TransactionTypeLabels[type as keyof typeof TransactionTypeLabels] || type,
    variant: isPurchase ? 'buy' : isSale ? 'sell' : 'secondary',
    showIcon: isPurchase || isSale,
  } as const
}

/**
 * Card displaying a single insider transaction
 *
 * Shows ticker, company name, insider details, transaction type,
 * value, and AI significance indicator
 */
export function TransactionCard({ transaction, className }: TransactionCardProps) {
  const typeInfo = getTransactionTypeInfo(transaction.transaction_type)
  const isPurchaseOrSale = ['P', 'S'].includes(transaction.transaction_type)

  // Format the relative time
  const relativeTime = formatDistanceToNow(new Date(transaction.filed_at), {
    addSuffix: true,
  })

  // Build insider title string
  const insiderTitle = [
    transaction.insider_title,
    transaction.is_director && 'Director',
    transaction.is_ten_percent_owner && '10% Owner',
  ]
    .filter(Boolean)
    .join(' • ') || 'Insider'

  return (
    <Link href={`/company/${transaction.ticker}`}>
      <Card
        className={cn(
          'transition-colors hover:bg-muted/50 cursor-pointer',
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Company and insider info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">
                  {transaction.ticker}
                </span>
                <Badge
                  variant={typeInfo.variant as 'buy' | 'sell' | 'secondary'}
                  showIcon={typeInfo.showIcon}
                  className="shrink-0"
                >
                  {typeInfo.label}
                </Badge>
                <SignificanceBadge
                  score={transaction.ai_significance_score}
                  showLabel
                  className="shrink-0"
                />
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {transaction.company_name}
              </p>
              <p className="mt-2 text-sm font-medium">
                {transaction.insider_name}
              </p>
              <p className="text-xs text-muted-foreground">{insiderTitle}</p>
            </div>

            {/* Right: Value and date */}
            <div className="shrink-0 text-right">
              <p className="font-semibold">
                {formatCurrency(transaction.total_value)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatNumber(transaction.shares)} shares
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{relativeTime}</p>
            </div>
          </div>

          {/* AI Context */}
          {transaction.ai_context && (
            <div className="mt-3 rounded-md bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">
                {transaction.ai_context}
              </p>
            </div>
          )}

          {/* 10b5-1 Plan indicator */}
          {transaction.is_10b5_1_plan && (
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                Pre-planned (10b5-1)
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

/**
 * Compact version for lists
 */
export function TransactionCardCompact({
  transaction,
  className,
}: TransactionCardProps) {
  const typeInfo = getTransactionTypeInfo(transaction.transaction_type)

  const relativeTime = formatDistanceToNow(new Date(transaction.filed_at), {
    addSuffix: true,
  })

  return (
    <Link href={`/company/${transaction.ticker}`}>
      <div
        className={cn(
          'flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50',
          className
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Badge
            variant={typeInfo.variant as 'buy' | 'sell' | 'secondary'}
            showIcon={typeInfo.showIcon}
            className="shrink-0"
          >
            {typeInfo.label}
          </Badge>
          <div className="min-w-0">
            <p className="font-medium truncate">
              <span className="font-bold">{transaction.ticker}</span>
              <span className="text-muted-foreground"> · </span>
              <span>{transaction.insider_name}</span>
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {formatCurrency(transaction.total_value)} · {relativeTime}
            </p>
          </div>
        </div>
        <SignificanceBadge score={transaction.ai_significance_score} />
      </div>
    </Link>
  )
}
