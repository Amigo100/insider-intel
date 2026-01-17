'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Checkbox Component - Modernized Bloomberg Design System
 *
 * Accessibility improvements (fixes UI_AUDIT issue #17):
 * - 20x20px size (h-5 w-5) for WCAG touch target compliance
 * - Visible focus ring with amber accent
 * - High contrast checked state
 *
 * Styling:
 * - Unchecked: border with transparent/muted background
 * - Checked: amber accent background
 * - Focus: amber ring with offset
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Base styles - 20x20px for touch targets
      'peer h-5 w-5 shrink-0 rounded-[4px]',
      'border border-input bg-background',

      // Transition
      'transition-all duration-150',

      // Hover state
      'hover:border-[hsl(var(--accent-amber)/0.5)]',

      // Focus state - amber accent
      'focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-amber))]',
      'focus-visible:ring-offset-2 focus-visible:ring-offset-background',

      // Checked state - amber background
      'data-[state=checked]:bg-[hsl(var(--accent-amber))]',
      'data-[state=checked]:border-[hsl(var(--accent-amber))]',
      'data-[state=checked]:text-[hsl(var(--bg-app))]',

      // Disabled state
      'disabled:cursor-not-allowed disabled:opacity-50',

      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <Check className="h-3.5 w-3.5 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
