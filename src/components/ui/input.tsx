import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input Component - Modernized Bloomberg Design System
 *
 * Theme-aware styling using CSS variables:
 * - Light mode: white bg, border color from theme
 * - Dark mode: bg-app (#0D0D0D), border-default (#333333)
 *
 * Accessibility:
 * - 44px height for better touch targets
 * - Visible focus state with amber ring
 * - High contrast placeholder text
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles - 44px height for touch targets
          'flex h-11 w-full rounded-[6px] px-3 py-2 text-sm',
          'bg-background border border-input text-foreground',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',

          // Placeholder
          'placeholder:text-muted-foreground',

          // Transition
          'transition-all duration-150',

          // Focus state - amber accent
          'focus:outline-none',
          'focus:border-[hsl(var(--accent-amber))]',
          'focus:shadow-[0_0_0_3px_hsl(var(--accent-amber)/0.15)]',

          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50',
          'disabled:bg-muted',

          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
