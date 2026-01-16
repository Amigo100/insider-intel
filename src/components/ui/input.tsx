import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg px-4 py-2 text-sm transition-all duration-200',
          'bg-slate-800 border border-white/10 text-white',
          'placeholder:text-slate-500',
          'shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]',
          'focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20',
          'disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
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
