import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type LogoVariant = 'default' | 'light' | 'dark'
type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  /**
   * Variant determines color scheme:
   * - 'default': Adapts to context (uses CSS variables)
   * - 'light': For dark backgrounds (cyan icon, white text)
   * - 'dark': For light backgrounds (dark icon container, dark text)
   */
  variant?: LogoVariant
  /**
   * Size of the logo:
   * - 'sm': Small (h-6 icon, text-lg text)
   * - 'md': Medium (h-8 icon, text-xl text)
   * - 'lg': Large (h-10 icon, text-2xl text)
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
    container: 'h-6 w-6',
    icon: 'h-4 w-4',
    text: 'text-lg',
    gap: 'gap-1.5',
  },
  md: {
    container: 'h-8 w-8',
    icon: 'h-5 w-5',
    text: 'text-xl',
    gap: 'gap-2',
  },
  lg: {
    container: 'h-10 w-10',
    icon: 'h-6 w-6',
    text: 'text-2xl',
    gap: 'gap-2.5',
  },
}

/**
 * InsiderIntel Logo Component
 *
 * Standardized logo treatment across the entire application.
 * Use 'light' variant on dark backgrounds (dashboard, auth left panel)
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
        // For dark backgrounds - no container, just cyan icon
        return ''
      case 'dark':
        // For light backgrounds - dark container
        return 'flex items-center justify-center rounded-lg bg-slate-900'
      default:
        // Default uses CSS variables
        return 'flex items-center justify-center rounded-lg bg-primary'
    }
  }

  const getIconStyles = () => {
    switch (variant) {
      case 'light':
        return 'text-cyan-400'
      case 'dark':
        return 'text-white'
      default:
        return 'text-primary-foreground'
    }
  }

  const getTextStyles = () => {
    switch (variant) {
      case 'light':
        return 'text-white'
      case 'dark':
        return 'text-slate-900'
      default:
        return 'text-foreground'
    }
  }

  const iconContainerStyles = getIconContainerStyles()
  const hasContainer = iconContainerStyles !== ''

  const content = (
    <div className={cn('flex items-center', config.gap, className)}>
      {hasContainer ? (
        <div className={cn(iconContainerStyles, config.container)}>
          <TrendingUp
            className={cn(config.icon, getIconStyles())}
            aria-hidden="true"
          />
        </div>
      ) : (
        <TrendingUp
          className={cn(config.icon, getIconStyles())}
          aria-hidden="true"
        />
      )}
      {showText && (
        <span className={cn('font-bold', config.text, getTextStyles())}>
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
      className="transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 rounded-sm"
    >
      {content}
    </Link>
  )
}
