'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUpRight, ArrowDownRight, Activity, Loader2 } from 'lucide-react'
import type { InsiderTransactionWithDetails } from '@/types/database'

interface LiveActivityFeedProps {
  initialTransactions?: InsiderTransactionWithDetails[]
}

/**
 * Live activity feed showing recent insider transactions.
 * Fetches real data from the API to prove the product is live.
 */
export function LiveActivityFeed({ initialTransactions }: LiveActivityFeedProps) {
  const [transactions, setTransactions] = useState<InsiderTransactionWithDetails[]>(
    initialTransactions || []
  )
  const [isLoading, setIsLoading] = useState(!initialTransactions)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (initialTransactions) return

    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/insider/recent?limit=5&days=7')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setTransactions(data.transactions || [])
      } catch {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [initialTransactions])

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-8"
        role="status"
        aria-label="Loading transactions"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Loading recent transactions...</span>
      </div>
    )
  }

  if (error || transactions.length === 0) {
    // Fallback to static demo data if API fails
    return <StaticActivityFeed />
  }

  return (
    <div className="space-y-3">
      {transactions.slice(0, 5).map((txn, index) => (
        <ActivityItem key={txn.id || index} transaction={txn} index={index} />
      ))}
    </div>
  )
}

function ActivityItem({
  transaction,
  index,
}: {
  transaction: InsiderTransactionWithDetails
  index: number
}) {
  const isBuy = transaction.transaction_type === 'P'
  const timeAgo = transaction.filed_at
    ? formatDistanceToNow(new Date(transaction.filed_at), { addSuffix: true })
    : 'recently'

  const formatValue = (value: number | null) => {
    if (!value) return ''
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: value >= 1_000_000 ? 'compact' : 'standard',
      maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
    }).format(value)
  }

  const insiderRole = transaction.insider_title || (transaction.is_director ? 'Director' : 'Insider')

  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-[#E5E5E5] bg-white p-3 transition-all hover:bg-[#F5F5F5] animate-in fade-in slide-in-from-left-2"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          isBuy
            ? 'bg-[rgba(0,200,83,0.12)] text-[#00C853]'
            : 'bg-[rgba(255,82,82,0.12)] text-[#FF5252]'
        }`}
      >
        {isBuy ? (
          <ArrowUpRight className="h-4 w-4" />
        ) : (
          <ArrowDownRight className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#171717]">
          <span className="font-medium">{insiderRole}</span>
          <span className="text-[#737373]"> at </span>
          <span className="font-bold">{transaction.ticker}</span>
          <span className="text-[#737373]">
            {' '}
            {isBuy ? 'purchased' : 'sold'}{' '}
          </span>
          {transaction.total_value && (
            <span className={isBuy ? 'text-[#00C853] font-medium font-mono' : 'text-[#FF5252] font-medium font-mono'}>
              {formatValue(transaction.total_value)}
            </span>
          )}
        </p>
      </div>

      {/* Time */}
      <span className="flex-shrink-0 text-xs text-[#737373]">
        {timeAgo}
      </span>
    </div>
  )
}

/**
 * Static fallback when API is unavailable
 * Clearly labeled as example data for transparency
 */
function StaticActivityFeed() {
  const staticData = [
    { ticker: 'NVDA', role: 'CFO', type: 'buy', value: '$1.8M', time: 'Example' },
    { ticker: 'AAPL', role: 'Director', type: 'sell', value: '$450K', time: 'Example' },
    { ticker: 'MSFT', role: 'CEO', type: 'buy', value: '$2.1M', time: 'Example' },
    { ticker: 'AMZN', role: 'VP', type: 'buy', value: '$890K', time: 'Example' },
    { ticker: 'GOOGL', role: 'Director', type: 'sell', value: '$1.2M', time: 'Example' },
  ]

  return (
    <div className="space-y-3">
      <p className="text-center text-xs text-[#737373] mb-2">
        Example transactions (sign up to see real data)
      </p>
      {staticData.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg border border-[#E5E5E5] bg-white p-3 transition-all hover:bg-[#F5F5F5] animate-in fade-in slide-in-from-left-2"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
              item.type === 'buy'
                ? 'bg-[rgba(0,200,83,0.12)] text-[#00C853]'
                : 'bg-[rgba(255,82,82,0.12)] text-[#FF5252]'
            }`}
          >
            {item.type === 'buy' ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#171717]">
              <span className="font-medium">{item.role}</span>
              <span className="text-[#737373]"> at </span>
              <span className="font-bold">{item.ticker}</span>
              <span className="text-[#737373]">
                {' '}
                {item.type === 'buy' ? 'purchased' : 'sold'}{' '}
              </span>
              <span className={item.type === 'buy' ? 'text-[#00C853] font-medium font-mono' : 'text-[#FF5252] font-medium font-mono'}>
                {item.value}
              </span>
            </p>
          </div>
          <span className="flex-shrink-0 text-xs text-[#737373]">
            {item.time}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Header component for the Live Activity section
 * Per spec: "Live Insider Activity" with pulsing green dot
 */
export function LiveActivityHeader() {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {/* Pulsing green dot indicator */}
      <div className="relative flex items-center justify-center">
        <span className="h-3 w-3 rounded-full bg-[#00C853]" />
        <span className="absolute h-3 w-3 rounded-full bg-[#00C853] animate-ping opacity-75" />
      </div>
      <h2 className="text-xl font-semibold text-[#171717]">Live Insider Activity</h2>
      <span className="text-sm text-[#737373]">(From SEC filings)</span>
    </div>
  )
}
