'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/**
 * EmptyState Component - Modernized Bloomberg Design System
 *
 * Reusable empty state for when there's no data to display.
 * Used across: Watchlist, Insider Trades, Institutions, Company not found
 *
 * Design specs:
 * - Icon: 64px, text-muted, margin-bottom 16px
 * - Title: 18px, font-weight 600, text-primary
 * - Description: 14px, text-secondary, max-width 400px
 * - Action button: primary style (amber)
 * - Secondary text: 13px, text-muted
 */

interface EmptyStateActionButton {
  label: string
  onClick: () => void
  href?: never
}

interface EmptyStateActionLink {
  label: string
  href: string
  onClick?: never
}

type EmptyStateAction = EmptyStateActionButton | EmptyStateActionLink

interface EmptyStateProps {
  /** Icon to display */
  icon: LucideIcon
  /** Main title text */
  title: string
  /** Description text */
  description: string
  /** Optional action button or link */
  action?: EmptyStateAction
  /** Optional secondary text (e.g., "Popular: AAPL MSFT") */
  secondaryText?: string
  /** Optional className for container */
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryText,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'py-12 px-6',
        'text-center',
        className
      )}
      role="status"
      aria-label={title}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center',
          'h-16 w-16 mb-4',
          'rounded-full',
          'bg-[hsl(var(--bg-elevated))]'
        )}
      >
        <Icon
          className="h-8 w-8 text-[hsl(var(--text-muted))]"
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <h3
        className={cn(
          'text-lg font-semibold',
          'text-[hsl(var(--text-primary))]',
          'mb-2'
        )}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={cn(
          'text-sm',
          'text-[hsl(var(--text-secondary))]',
          'max-w-[400px]',
          'mb-6'
        )}
      >
        {description}
      </p>

      {/* Action Button/Link */}
      {action && (
        <div className="mb-4">
          {action.href ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}

      {/* Secondary Text */}
      {secondaryText && (
        <p
          className={cn(
            'text-[13px]',
            'text-[hsl(var(--text-muted))]'
          )}
        >
          {secondaryText}
        </p>
      )}
    </div>
  )
}

/**
 * EmptyStateCompact - Smaller variant for inline use
 */
interface EmptyStateCompactProps {
  icon: LucideIcon
  message: string
  className?: string
}

export function EmptyStateCompact({
  icon: Icon,
  message,
  className,
}: EmptyStateCompactProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'py-8 px-4',
        'text-center',
        className
      )}
      role="status"
    >
      <Icon
        className="h-6 w-6 text-[hsl(var(--text-muted))] mb-2"
        aria-hidden="true"
      />
      <p className="text-sm text-[hsl(var(--text-muted))]">{message}</p>
    </div>
  )
}
