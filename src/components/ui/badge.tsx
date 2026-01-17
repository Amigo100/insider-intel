import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Badge Component - Modernized Bloomberg Design System
 *
 * Semantic variants for financial data:
 * - buy: Green signal for purchase transactions
 * - sell: Red signal for sale transactions
 * - new: Amber accent for new items
 * - premium: Gold for premium features
 *
 * Standard variants:
 * - default: Primary color badge
 * - secondary: Muted background
 * - outline: Border only
 * - destructive: Error/warning states
 */

const badgeVariants = cva(
  // Base styles
  [
    'inline-flex items-center gap-1',
    'rounded-[4px] px-2 py-0.5',
    'text-[11px] font-semibold uppercase tracking-[0.04em]',
    'transition-colors duration-150',
    'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-2',
  ].join(' '),
  {
    variants: {
      variant: {
        // === STANDARD VARIANTS ===

        // Default: Primary color
        default: [
          'border-transparent',
          'bg-primary text-primary-foreground',
          'hover:bg-primary/80',
        ].join(' '),

        // Secondary: Muted background
        secondary: [
          'border-transparent',
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
        ].join(' '),

        // Outline: Border only
        outline: [
          'border border-border',
          'bg-transparent text-foreground',
          'hover:bg-accent',
        ].join(' '),

        // Destructive: Error states
        destructive: [
          'border-transparent',
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/80',
        ].join(' '),

        // === FINANCIAL SEMANTIC VARIANTS ===

        // Buy: Green signal for purchases
        buy: [
          'border-transparent',
          'bg-[hsl(var(--signal-positive)/0.15)]',
          'text-[hsl(var(--signal-positive))]',
        ].join(' '),

        // Sell: Red signal for sales
        sell: [
          'border-transparent',
          'bg-[hsl(var(--signal-negative)/0.15)]',
          'text-[hsl(var(--signal-negative))]',
        ].join(' '),

        // New: Amber accent for new items
        new: [
          'border-transparent',
          'bg-[hsl(var(--accent-amber))]',
          'text-[hsl(var(--bg-app))]',
        ].join(' '),

        // Premium: Gold for premium features
        premium: [
          'border-transparent',
          'bg-[rgba(212,175,55,0.15)]',
          'text-[#D4AF37]',
        ].join(' '),

        // === LEGACY SEMANTIC VARIANTS (for backwards compatibility) ===

        // Success: Alias for buy
        success: [
          'border-transparent',
          'bg-[hsl(var(--signal-positive)/0.15)]',
          'text-[hsl(var(--signal-positive))]',
        ].join(' '),

        // Warning: Amber warning
        warning: [
          'border-transparent',
          'bg-[hsl(var(--accent-amber)/0.15)]',
          'text-[hsl(var(--accent-amber))]',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Show arrow icon for buy/sell variants */
  showIcon?: boolean
}

function Badge({ className, variant, showIcon = false, children, ...props }: BadgeProps) {
  // Determine if we should show an icon based on variant
  const shouldShowIcon = showIcon && (variant === 'buy' || variant === 'sell')

  // Generate aria-label for buy/sell variants
  const getAriaLabel = () => {
    if (variant === 'buy') return 'Purchase transaction'
    if (variant === 'sell') return 'Sale transaction'
    return undefined
  }

  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      role="status"
      aria-label={props['aria-label'] || getAriaLabel()}
      {...props}
    >
      {shouldShowIcon && variant === 'buy' && (
        <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
      )}
      {shouldShowIcon && variant === 'sell' && (
        <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
