'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Star, StarOff, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { clientLogger } from '@/lib/client-logger'
import { Button } from '@/components/ui/button'

interface WatchlistButtonProps {
  companyId: string
  watchlistItemId: string | null
}

export function WatchlistButton({
  companyId,
  watchlistItemId,
}: WatchlistButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isInWatchlist, setIsInWatchlist] = useState(!!watchlistItemId)
  const [itemId, setItemId] = useState(watchlistItemId)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleToggle = async () => {
    startTransition(async () => {
      try {
        if (isInWatchlist && itemId) {
          // Remove from watchlist
          const { error } = await supabase
            .from('watchlist_items')
            .delete()
            .eq('id', itemId)

          if (error) throw error

          setIsInWatchlist(false)
          setItemId(null)
        } else {
          // Add to watchlist
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            router.push('/login')
            return
          }

          const { data, error } = await supabase
            .from('watchlist_items')
            .insert({
              company_id: companyId,
              user_id: user.id,
            })
            .select('id')
            .single()

          if (error) throw error

          setIsInWatchlist(true)
          setItemId(data.id)
        }

        router.refresh()
      } catch (error) {
        clientLogger.error('Error toggling watchlist', { error })
      }
    })
  }

  return (
    <Button
      variant={isInWatchlist ? 'secondary' : 'primary'}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isInWatchlist ? (
        <StarOff className="mr-2 h-4 w-4" />
      ) : (
        <Star className="mr-2 h-4 w-4" />
      )}
      {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </Button>
  )
}
