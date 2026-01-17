'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { WatchlistClient } from './watchlist-client'
import type { WatchlistData } from '@/components/dashboard/watchlist'

/**
 * WatchlistPageClient - Client wrapper for watchlist page
 *
 * Includes the page header with "+ Add Ticker" button that focuses search input
 */

interface WatchlistPageClientProps {
  initialData: WatchlistData
}

export function WatchlistPageClient({ initialData }: WatchlistPageClientProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleAddTicker = () => {
    // Focus the search input in the Add Stock card
    const searchInput = document.querySelector(
      'input[aria-label="Search for stocks to add"]'
    ) as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className={cn(
              'text-2xl font-bold tracking-tight',
              'text-[hsl(var(--text-primary))]'
            )}
          >
            Your Watchlist
            {initialData.meta.count > 0 && (
              <span className="ml-2 text-[hsl(var(--text-muted))]">
                ({initialData.meta.count} stocks)
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--text-muted))]">
            {initialData.meta.count} of {initialData.meta.limit} stocks tracked
            {initialData.meta.tier === 'free' && !initialData.meta.isAtLimit && (
              <span className="ml-1">
                ·{' '}
                <Link
                  href="/settings/billing"
                  className={cn(
                    'text-[hsl(var(--accent-amber))]',
                    'hover:underline'
                  )}
                >
                  Upgrade for more
                </Link>
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={handleAddTicker}
          className={cn(
            'gap-2',
            'bg-[hsl(var(--accent-amber))]',
            'text-[hsl(var(--bg-app))]',
            'hover:bg-[hsl(var(--accent-amber)/0.9)]'
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Ticker
        </Button>
      </div>

      {/* Watchlist Content */}
      <WatchlistClient initialData={initialData} />
    </div>
  )
}
