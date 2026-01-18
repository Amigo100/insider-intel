import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Logo Component - Modernized Bloomberg Design System
 *
 * Updated to use amber accent color throughout.
 *
 * Variants:
 * - 'default': Uses CSS variables (adapts to context)
 * - 'light': For dark backgrounds (amber icon container, white text)
 * - 'dark': For light backgrounds (dark container, dark text)
 *
 * Logo icon specifications:
 * - 32x32 icon container
 * - Amber background (#FFA028 / --accent-amber)
 * - Rounded 8px
 */

type LogoVariant = 'default' | 'light' | 'dark'
type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  /**
   * Variant determines color scheme:
   * - 'default': Adapts to context (uses CSS variables)
   * - 'light': For dark backgrounds (amber icon container, white text)
   * - 'dark': For light backgrounds (dark container, dark text)
   */
  variant?: LogoVariant
  /**
   * Size of the logo:
   * - 'sm': Small (24x24 icon container)
   * - 'md': Medium (32x32 icon container) - Default
   * - 'lg': Large (40x40 icon container)
   */
  size?: LogoSize
  /**
   * Whether to show the text alongside the icon
   */
  showText?: boolean
  /**
   * Optional link href. Defaults to "/"
   * Pass null to render without a link wrapper
   */
  href?: string | null
  /**
   * Additional className for the wrapper
   */
  className?: string
}

const sizeConfig = {
  sm: {
    container: 'h-6 w-6 rounded-md',
    icon: 'h-4 w-4',
    text: 'text-lg',
    gap: 'gap-2',
  },
  md: {
    container: 'h-8 w-8 rounded-lg',
    icon: 'h-5 w-5',
    text: 'text-xl',
    gap: 'gap-2.5',
  },
  lg: {
    container: 'h-10 w-10 rounded-lg',
    icon: 'h-6 w-6',
    text: 'text-2xl',
    gap: 'gap-3',
  },
}

/**
 * InsiderIntel Logo Component
 *
 * Standardized logo treatment across the entire application.
 * Uses amber accent color as primary brand color.
 *
 * Use 'light' variant on dark backgrounds (dashboard, sidebar)
 * Use 'dark' variant on light backgrounds (landing page, marketing pages)
 */
export function Logo({
  variant = 'default',
  size = 'md',
  showText = true,
  href = '/',
  className,
}: LogoProps) {
  const config = sizeConfig[size]

  // Determine styles based on variant
  const getIconContainerStyles = () => {
    switch (variant) {
      case 'light':
        // For dark backgrounds - amber container with dark icon
        return 'flex items-center justify-center bg-[hsl(var(--accent-amber))]'
      case 'dark':
        // For light backgrounds - amber at 15% opacity with amber icon
        return 'flex items-center justify-center bg-[rgba(255,160,40,0.15)]'
      default:
        // Default uses CSS variables
        return 'flex items-center justify-center bg-[hsl(var(--accent-amber))]'
    }
  }

  const getIconStyles = () => {
    switch (variant) {
      case 'light':
        // Dark icon on amber background
        return 'text-[hsl(var(--bg-app))]'
      case 'dark':
        // Amber icon on amber-tinted background
        return 'text-[#FFA028]'
      default:
        return 'text-[hsl(var(--bg-app))]'
    }
  }

  const getTextStyles = () => {
    switch (variant) {
      case 'light':
        return 'text-white'
      case 'dark':
        return 'text-[#171717]'
      default:
        return 'text-foreground'
    }
  }

  const content = (
    <div className={cn('flex items-center', config.gap, className)}>
      <div className={cn(getIconContainerStyles(), config.container)}>
        <TrendingUp
          className={cn(config.icon, getIconStyles())}
          aria-hidden="true"
        />
      </div>
      {showText && (
        <span className={cn('font-bold tracking-tight', config.text, getTextStyles())}>
          InsiderIntel
        </span>
      )}
    </div>
  )

  if (href === null) {
    return content
  }

  return (
    <Link
      href={href}
      className={cn(
        'transition-opacity hover:opacity-80',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[hsl(var(--accent-amber))]',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg-app))]',
        'rounded-sm'
      )}
    >
      {content}
    </Link>
  )
}
