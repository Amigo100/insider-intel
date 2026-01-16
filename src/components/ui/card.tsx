import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Standardized Card Design System
 *
 * Two styling approaches:
 *
 * 1. Theme-aware (Card) - Uses CSS variables for light/dark mode support
 *    - Use on: landing page, auth pages, marketing pages
 *    - Inherits colors from theme context
 *
 * 2. Dashboard-specific (CardInteractive, CardElevated) - Hardcoded dark theme
 *    - Use on: dashboard pages (wrapped in `dark` class)
 *    - Features: gradient background, cyan glow effects, lift animations
 *
 * Design tokens (dashboard variants):
 * - Border radius: 12px (rounded-xl)
 * - Border: 1px solid white/[0.08]
 * - Background: gradient from slate-800/80 to slate-900/90
 * - Padding: 24px (p-6) for content areas
 */

// Dashboard-specific base styles (dark theme with effects)
const cardBaseStyles = [
  'rounded-xl',
  'border border-white/[0.08]',
  'bg-gradient-to-br from-slate-800/80 to-slate-900/90',
  'backdrop-blur-sm',
  'text-white',
  'transition-all duration-200',
].join(' ')

/**
 * Base Card - Theme-aware using CSS variables
 * Works in both light mode (landing) and dark mode (dashboard)
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border bg-card text-card-foreground shadow-sm transition-colors',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

/**
 * DashboardCard - Static container for dashboard sections
 * Uses hardcoded dark theme styling with subtle hover
 */
const DashboardCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      cardBaseStyles,
      'hover:border-white/[0.12]',
      className
    )}
    {...props}
  />
))
DashboardCard.displayName = 'DashboardCard'

const CardInteractive = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      cardBaseStyles,
      'cursor-pointer',
      'hover:border-cyan-400/30',
      'hover:shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_20px_rgba(34,211,238,0.08)]',
      className
    )}
    {...props}
  />
))
CardInteractive.displayName = 'CardInteractive'

const CardElevated = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      cardBaseStyles,
      'shadow-lg shadow-black/20',
      'hover:border-cyan-400/30',
      'hover:shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_25px_rgba(34,211,238,0.1)]',
      'hover:-translate-y-0.5',
      className
    )}
    {...props}
  />
))
CardElevated.displayName = 'CardElevated'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-foreground',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

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

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export {
  Card,
  DashboardCard,
  CardInteractive,
  CardElevated,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardBaseStyles,
}
