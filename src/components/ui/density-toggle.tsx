'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * DensityToggle - Modernized Bloomberg Design System
 *
 * Segmented control for switching between table density modes.
 *
 * Specifications:
 * - Container: bg-elevated, padding 4px, border-radius 6px
 * - Active: bg-accent-amber, text dark
 * - Inactive: bg-transparent, text-tertiary
 *
 * Density options:
 * - Comfortable: 52px rows, 14px 16px padding, 13px font
 * - Compact: 36px rows, 8px 12px padding, 12px font
 */

export type TableDensity = 'comfortable' | 'compact'

interface DensityToggleProps {
  /** Current density value */
  value: TableDensity
  /** Callback when density changes */
  onChange: (density: TableDensity) => void
  /** Additional CSS classes */
  className?: string
  /** Disabled state */
  disabled?: boolean
}

const DENSITY_OPTIONS: Array<{ value: TableDensity; label: string }> = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
]

export function DensityToggle({
  value,
  onChange,
  className,
  disabled = false,
}: DensityToggleProps) {
  return (
    <div
      className={cn(
        // Container styles
        'inline-flex items-center',
        'rounded-[6px] p-1',
        'bg-[hsl(var(--bg-elevated))]',
        'border border-[hsl(var(--border-default))]',
        className
      )}
      role="radiogroup"
      aria-label="Table density"
    >
      {DENSITY_OPTIONS.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              // Base styles
              'px-3 py-1.5',
              'rounded-[4px]',
              'text-xs font-medium',
              'transition-all duration-150',
              // Focus state
              'focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-amber))]',
              'focus-visible:ring-offset-1',
              // Active state
              isActive && [
                'bg-[hsl(var(--accent-amber))]',
                'text-[hsl(var(--bg-app))]',
                'shadow-sm',
              ],
              // Inactive state
              !isActive && [
                'bg-transparent',
                'text-[hsl(var(--text-tertiary))]',
                'hover:text-[hsl(var(--text-secondary))]',
                'hover:bg-[hsl(var(--bg-hover))]',
              ],
              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Hook for managing density state with localStorage persistence
 */
export function useDensityPreference(
  key: string = 'table-density'
): [TableDensity, (density: TableDensity) => void] {
  const [density, setDensityState] = React.useState<TableDensity>('comfortable')

  // Load from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored === 'comfortable' || stored === 'compact') {
      setDensityState(stored)
    }
  }, [key])

  // Save to localStorage on change
  const setDensity = React.useCallback(
    (newDensity: TableDensity) => {
      setDensityState(newDensity)
      localStorage.setItem(key, newDensity)
    },
    [key]
  )

  return [density, setDensity]
}

/**
 * Density-specific CSS class mappings
 */
export const DENSITY_STYLES = {
  comfortable: {
    row: 'h-[52px]',
    cell: 'px-4 py-3.5',
    text: 'text-[13px]',
  },
  compact: {
    row: 'h-9',
    cell: 'px-3 py-2',
    text: 'text-xs',
  },
} as const

export { DENSITY_OPTIONS }
