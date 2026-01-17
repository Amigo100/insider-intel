import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Card Component - Modernized Bloomberg Design System
 *
 * Uses CSS variables for theme-aware styling:
 * - Light mode (landing/auth): Light backgrounds with subtle borders
 * - Dark mode (dashboard): Dark backgrounds (#1A1A1A) with #333333 borders
 *
 * Variants:
 * - Card: Base card with flat design (no shadow)
 * - CardInteractive: Clickable card with hover effects
 * - CardElevated: Card with shadow and lift on hover
 *
 * Design tokens:
 * - Border radius: 8px (rounded-lg)
 * - Border: 1px solid border
 * - Background: bg-card (theme-aware)
 * - Content padding: 20px (p-5)
 * - Header padding: 16px 20px with bottom border
 */

/**
 * Base Card - Theme-aware flat design
 * Works in both light mode (landing) and dark mode (dashboard)
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground',
      'transition-colors duration-150',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

/**
 * CardInteractive - Clickable card with hover effects
 * Use for cards that navigate or trigger actions
 */
const CardInteractive = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground',
      'cursor-pointer',
      'transition-all duration-150',
      'hover:border-[hsl(var(--border-default))]',
      'hover:bg-[hsl(var(--bg-hover))]',
      className
    )}
    {...props}
  />
))
CardInteractive.displayName = 'CardInteractive'

/**
 * CardElevated - Card with shadow and lift on hover
 * Use for prominent cards that need visual emphasis
 */
const CardElevated = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground',
      'shadow-sm',
      'transition-all duration-150',
      'hover:shadow-md',
      'hover:-translate-y-0.5',
      'hover:border-[hsl(var(--accent-amber)/0.3)]',
      className
    )}
    {...props}
  />
))
CardElevated.displayName = 'CardElevated'

/**
 * CardHeader - Header section with bottom border
 * Supports flex layout for title + actions
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Add bottom border separator */
    bordered?: boolean
  }
>(({ className, bordered = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5 px-5 py-4',
      bordered && 'border-b border-[hsl(var(--border-subtle,var(--border)))]',
      className
    )}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

/**
 * CardHeaderRow - Header with inline title and actions
 * Use when you need title + button/icon on same row
 */
const CardHeaderRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    bordered?: boolean
  }
>(({ className, bordered = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-between px-5 py-4',
      bordered && 'border-b border-[hsl(var(--border-subtle,var(--border)))]',
      className
    )}
    {...props}
  />
))
CardHeaderRow.displayName = 'CardHeaderRow'

/**
 * CardTitle - Card heading
 * 16px, semibold, uses foreground color (NOT amber)
 */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-base font-semibold leading-none tracking-tight text-foreground',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

/**
 * CardDescription - Subtitle/description text
 * 14px, muted color
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

/**
 * CardContent - Main content area
 * 20px padding on all sides
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5', className)} {...props} />
))
CardContent.displayName = 'CardContent'

/**
 * CardFooter - Footer area for actions
 * Flex layout with top border option
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    bordered?: boolean
  }
>(({ className, bordered = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center px-5 py-4',
      bordered && 'border-t border-[hsl(var(--border-subtle,var(--border)))]',
      className
    )}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Legacy export for backwards compatibility
const DashboardCard = Card
const cardBaseStyles = 'rounded-lg border bg-card text-card-foreground'

export {
  Card,
  DashboardCard,
  CardInteractive,
  CardElevated,
  CardHeader,
  CardHeaderRow,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardBaseStyles,
}
