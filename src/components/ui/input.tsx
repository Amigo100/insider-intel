import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input component with theme-aware styling
 *
 * Works in both light mode (auth pages) and dark mode (dashboard):
 * - Light mode: white bg, slate border, dark text
 * - Dark mode: slate-800 bg, white/10 border, white text
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex h-10 w-full rounded-lg px-4 py-2 text-sm transition-all duration-200',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',

          // Light mode (default)
          'bg-white border border-slate-300 text-slate-900',
          'placeholder:text-slate-400',
          'shadow-sm',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',

          // Dark mode overrides
          'dark:bg-slate-800 dark:border-white/10 dark:text-white',
          'dark:placeholder:text-slate-500',
          'dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]',
          'dark:focus:border-cyan-400/50 dark:focus:ring-cyan-400/20',
          'dark:disabled:bg-slate-900 dark:disabled:text-slate-500',

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
