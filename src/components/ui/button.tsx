import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        // Default: dark button for light backgrounds
        default:
          'bg-slate-800 text-white hover:bg-slate-700 border border-white/10',
        // Cyan gradient CTA button
        cyan: 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 font-semibold shadow-[0_2px_10px_rgba(34,211,238,0.3)] hover:shadow-[0_4px_20px_rgba(34,211,238,0.4)] hover:-translate-y-0.5 transition-all duration-200 border-0',
        // Destructive action
        destructive:
          'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
        // Outline for dark backgrounds (dashboard)
        outline:
          'border-2 border-white/30 bg-transparent text-white hover:bg-cyan-400/10 hover:border-cyan-400/50 hover:text-cyan-400 transition-all duration-200',
        // Outline for light backgrounds (landing page, marketing)
        'outline-light':
          'border-2 border-slate-300 bg-transparent text-slate-700 font-medium hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-200',
        // Secondary for dark backgrounds
        secondary:
          'bg-slate-700 text-white hover:bg-slate-600 border border-white/10',
        // Ghost for dark backgrounds (dashboard)
        ghost: 'text-slate-300 hover:bg-white/5 hover:text-white transition-colors duration-200',
        // Ghost for light backgrounds
        'ghost-light': 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200',
        // Link style
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
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
