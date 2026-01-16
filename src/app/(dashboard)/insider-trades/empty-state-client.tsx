'use client'

import { useRouter } from 'next/navigation'
import { TrendingUp } from 'lucide-react'
import EmptyState from '@/components/dashboard/empty-state'

export function InsiderTradesEmptyState() {
  const router = useRouter()

  const handleClearFilters = () => {
    router.push('/insider-trades')
  }

  return (
    <EmptyState
      icon={TrendingUp}
      title="No transactions found"
      description="Try adjusting your filters or expanding the date range. Insider transactions are sourced hourly from SEC EDGAR filings."
      action={{
        label: 'Clear filters',
        onClick: handleClearFilters,
      }}
    />
  )
}
