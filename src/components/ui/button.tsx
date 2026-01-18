import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Button Component - Modernized Bloomberg Design System
 *
 * Variants:
 * - primary (default): Amber accent button - use sparingly for main CTAs
 * - secondary: Transparent with border - for secondary actions
 * - ghost: Minimal styling - for tertiary actions
 * - destructive: Red signal color - for dangerous actions
 * - outline: Border-only variant for light backgrounds
 * - link: Text-only with underline on hover
 *
 * Sizes:
 * - sm: 28px height - compact UI elements
 * - default (md): 36px height - standard buttons
 * - lg: 44px height - prominent CTAs
 * - icon: Square button for icon-only actions
 */
const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-[6px] text-sm font-semibold',
    'transition-all duration-150 ease-out',
    // Focus ring using amber accent
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[hsl(var(--accent-amber))]',
    'focus-visible:ring-offset-[hsl(var(--background))]',
    // Disabled state
    'disabled:pointer-events-none disabled:opacity-50',
    // Active press effect
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary: Amber accent - the ONLY prominent use of amber
        // Use sparingly for main CTAs
        primary: [
          'bg-[hsl(var(--accent-amber))] text-[hsl(var(--bg-app))]',
          'hover:bg-[hsl(var(--accent-amber-hover))]',
          'shadow-sm hover:shadow-md',
        ].join(' '),

        // Secondary: Transparent with border
        // For secondary actions alongside primary
        secondary: [
          'bg-transparent',
          'border border-[hsl(var(--border-default))]',
          'text-[hsl(var(--text-primary))]',
          'hover:border-[hsl(var(--accent-amber))] hover:text-[hsl(var(--accent-amber))]',
        ].join(' '),

        // Ghost: Minimal styling
        // For tertiary actions, toolbars, less prominent UI
        ghost: [
          'bg-transparent',
          'text-[hsl(var(--muted-foreground))]',
          'hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
        ].join(' '),

        // Destructive: Red signal color
        // For dangerous/irreversible actions
        destructive: [
          'bg-[hsl(var(--signal-negative))] text-white',
          'hover:bg-[hsl(var(--signal-negative-muted))]',
          'shadow-sm',
        ].join(' '),

        // Outline: Border-only for light backgrounds
        // Use on landing pages, marketing, light contexts
        outline: [
          'bg-transparent',
          'border-2 border-[hsl(var(--border))]',
          'text-[hsl(var(--foreground))]',
          'hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
        ].join(' '),

        // Link: Text-only with underline
        // For inline text actions
        link: [
          'bg-transparent',
          'text-[hsl(var(--accent-amber))]',
          'underline-offset-4 hover:underline',
          'h-auto p-0',
        ].join(' '),
      },
      size: {
        sm: 'h-7 px-3 text-xs', // 28px
        default: 'h-9 px-4', // 36px
        lg: 'h-11 px-6 text-base', // 44px
        icon: 'h-9 w-9 p-0', // 36px square
        'icon-sm': 'h-7 w-7 p-0', // 28px square
        'icon-lg': 'h-11 w-11 p-0', // 44px square
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
