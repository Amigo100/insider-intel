'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { TrendingUp, Search } from 'lucide-react'
import EmptyState from '@/components/dashboard/empty-state'

export function InsiderTradesEmptyState() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if any filters are active
  const hasActiveFilters = searchParams.get('type') || searchParams.get('ticker') || (searchParams.get('days') && searchParams.get('days') !== '30')

  const handleClearFilters = () => {
    router.push('/insider-trades')
  }

  if (hasActiveFilters) {
    return (
      <EmptyState
        icon={Search}
        title="No matching transactions"
        description="No insider trades match your current filters. Try broadening your search criteria or clearing filters to see all recent activity."
        action={{
          label: 'Clear all filters',
          onClick: handleClearFilters,
        }}
      />
    )
  }

  return (
    <EmptyState
      icon={TrendingUp}
      title="No recent insider trades"
      description="This page shows SEC Form 4 filings when company insiders buy or sell shares. New transactions typically appear within minutes of being filed. Check back soon for the latest activity."
    />
  )
}
