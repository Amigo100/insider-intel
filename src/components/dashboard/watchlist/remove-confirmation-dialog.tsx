'use client'

import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { WatchlistItem } from './use-watchlist'

/**
 * RemoveConfirmationDialog - Confirmation dialog for removing from watchlist
 *
 * Addresses UI_AUDIT #151 - adds confirmation before removing
 */

interface RemoveConfirmationDialogProps {
  item: WatchlistItem | null
  onConfirm: () => void
  onCancel: () => void
}

export function RemoveConfirmationDialog({
  item,
  onConfirm,
  onCancel,
}: RemoveConfirmationDialogProps) {
  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative z-10 w-full max-w-sm mx-4',
          'rounded-lg p-6',
          'bg-[hsl(var(--bg-card))]',
          'border border-[hsl(var(--border-default))]',
          'shadow-xl'
        )}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className={cn(
            'absolute right-3 top-3',
            'flex h-8 w-8 items-center justify-center',
            'rounded-md',
            'text-[hsl(var(--text-muted))]',
            'hover:text-[hsl(var(--text-primary))]',
            'hover:bg-[hsl(var(--bg-hover))]',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-[hsl(var(--accent-amber))]'
          )}
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Icon */}
        <div
          className={cn(
            'mx-auto flex h-12 w-12 items-center justify-center',
            'rounded-full',
            'bg-[hsl(var(--signal-negative)/0.15)]'
          )}
        >
          <AlertTriangle
            className="h-6 w-6 text-[hsl(var(--signal-negative))]"
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <h3
          id="remove-dialog-title"
          className={cn(
            'mt-4 text-center text-lg font-semibold',
            'text-[hsl(var(--text-primary))]'
          )}
        >
          Remove from watchlist?
        </h3>
        <p
          className={cn(
            'mt-2 text-center text-sm',
            'text-[hsl(var(--text-muted))]'
          )}
        >
          Are you sure you want to remove{' '}
          <span className="font-semibold text-[hsl(var(--text-primary))]">
            {item.company.ticker}
          </span>{' '}
          from your watchlist? You won&apos;t receive activity alerts for this stock anymore.
        </p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className={cn(
              'flex-1',
              'border-[hsl(var(--border-default))]',
              'text-[hsl(var(--text-secondary))]',
              'hover:bg-[hsl(var(--bg-hover))]'
            )}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className={cn(
              'flex-1',
              'bg-[hsl(var(--signal-negative))]',
              'text-white',
              'hover:bg-[hsl(var(--signal-negative)/0.9)]'
            )}
            onClick={onConfirm}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RemoveConfirmationDialog
