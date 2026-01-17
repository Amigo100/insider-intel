'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

/**
 * Switch Component - Modernized Bloomberg Design System
 *
 * Styling:
 * - Track off: muted background
 * - Track on: amber accent (consistent with primary button)
 * - Thumb: white with shadow
 *
 * Accessibility:
 * - Visible focus ring with amber accent
 * - Adequate size for touch targets
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Base styles
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center',
      'rounded-full border-2 border-transparent',

      // Transition
      'transition-all duration-150',

      // Unchecked state - muted background
      'data-[state=unchecked]:bg-muted',

      // Checked state - amber accent
      'data-[state=checked]:bg-[hsl(var(--accent-amber))]',

      // Focus state - amber ring
      'focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-amber))]',
      'focus-visible:ring-offset-2 focus-visible:ring-offset-background',

      // Disabled state
      'disabled:cursor-not-allowed disabled:opacity-50',

      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // Base styles
        'pointer-events-none block h-5 w-5 rounded-full',
        'bg-white shadow-lg ring-0',

        // Transition
        'transition-transform duration-150',

        // Position based on state
        'data-[state=checked]:translate-x-5',
        'data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
