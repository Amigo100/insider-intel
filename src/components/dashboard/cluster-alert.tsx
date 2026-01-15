'use client'

import Link from 'next/link'
import { Users, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ClusterInsider {
  name: string
  title: string | null
  value: number
  transactionDate: string
}

interface ClusterAlertProps {
  ticker: string
  companyName: string
  insiders: ClusterInsider[]
  totalValue: number
  days?: number
  className?: string
}

/**
 * Formats a number as currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value)
}

/**
 * Eye-catching alert card for cluster buying activity
 *
 * Shows when multiple insiders have purchased shares in a company
 * within a short time period
 */
export function ClusterAlert({
  ticker,
  companyName,
  insiders,
  totalValue,
  days = 30,
  className,
}: ClusterAlertProps) {
  const buyerCount = insiders.length

  return (
    <Link href={`/dashboard/company/${ticker}`}>
      <Card
        className={cn(
          'overflow-hidden border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 transition-all hover:shadow-md hover:border-emerald-300 dark:from-emerald-950/50 dark:to-emerald-900/30 dark:border-emerald-800',
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Main info */}
            <div className="flex-1 min-w-0">
              {/* Header with icon */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500/10">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <Badge variant="success" className="text-xs">
                  Cluster Buying
                </Badge>
              </div>

              {/* Main message */}
              <p className="text-base font-semibold text-foreground">
                <span className="text-emerald-600 dark:text-emerald-400">
                  {buyerCount} insiders
                </span>{' '}
                bought{' '}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalValue)}
                </span>{' '}
                at{' '}
                <span className="font-bold">{ticker}</span>{' '}
                in {days} days
              </p>

              {/* Company name */}
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {companyName}
              </p>

              {/* Insider list */}
              <div className="mt-3 flex flex-wrap gap-2">
                {insiders.slice(0, 3).map((insider, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 text-xs bg-white/50 dark:bg-black/20 rounded-full px-2 py-1"
                  >
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium truncate max-w-[100px]">
                      {insider.name}
                    </span>
                    <span className="text-muted-foreground">
                      ({formatCurrency(insider.value)})
                    </span>
                  </div>
                ))}
                {insiders.length > 3 && (
                  <div className="flex items-center text-xs text-muted-foreground px-2 py-1">
                    +{insiders.length - 3} more
                  </div>
                )}
              </div>
            </div>

            {/* Right: Arrow */}
            <div className="flex items-center self-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

/**
 * Compact version for lists
 */
export function ClusterAlertCompact({
  ticker,
  companyName,
  insiders,
  totalValue,
  days = 30,
  className,
}: ClusterAlertProps) {
  const buyerCount = insiders.length

  return (
    <Link href={`/dashboard/company/${ticker}`}>
      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 transition-colors hover:bg-emerald-100/50 dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30',
          className
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500/10 shrink-0">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">
              <span className="font-bold">{ticker}</span>
              <span className="text-muted-foreground font-normal"> · </span>
              <span className="text-emerald-600">{buyerCount} buyers</span>
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {formatCurrency(totalValue)} in {days} days
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </Link>
  )
}

/**
 * Large featured version for dashboard highlight
 */
export function ClusterAlertFeatured({
  ticker,
  companyName,
  insiders,
  totalValue,
  days = 30,
  className,
}: ClusterAlertProps) {
  const buyerCount = insiders.length

  return (
    <Link href={`/dashboard/company/${ticker}`}>
      <Card
        className={cn(
          'overflow-hidden border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-emerald-100/80 to-emerald-50 transition-all hover:shadow-lg hover:border-emerald-400 dark:from-emerald-950 dark:via-emerald-900/50 dark:to-emerald-950 dark:border-emerald-700',
          className
        )}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-500 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <Badge variant="success" className="mb-1">
                Cluster Buying Alert
              </Badge>
              <p className="text-xs text-muted-foreground">
                Multiple insiders buying
              </p>
            </div>
          </div>

          {/* Main stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-2xl font-bold">{ticker}</p>
              <p className="text-xs text-muted-foreground truncate">
                {companyName}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {buyerCount}
              </p>
              <p className="text-xs text-muted-foreground">Insiders</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalValue)}
              </p>
              <p className="text-xs text-muted-foreground">
                Total in {days}d
              </p>
            </div>
          </div>

          {/* Insider breakdown */}
          <div className="space-y-2">
            {insiders.slice(0, 4).map((insider, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm bg-white/60 dark:bg-black/20 rounded-md px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{insider.name}</span>
                  {insider.title && (
                    <span className="text-xs text-muted-foreground truncate">
                      ({insider.title})
                    </span>
                  )}
                </div>
                <span className="font-mono text-emerald-600 shrink-0">
                  {formatCurrency(insider.value)}
                </span>
              </div>
            ))}
            {insiders.length > 4 && (
              <p className="text-xs text-center text-muted-foreground pt-1">
                +{insiders.length - 4} more insiders
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
