'use client'

import * as React from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * DateRangeSelector - Modernized Bloomberg Design System
 *
 * Dropdown selector for filtering by date range.
 * Used in dashboard header and other pages.
 *
 * Options:
 * - Today
 * - 7 days (default)
 * - 30 days
 * - 90 days
 * - Year to date
 * - All time
 */

export type DateRange = '1d' | '7d' | '30d' | '90d' | 'ytd' | 'all'

interface DateRangeOption {
  value: DateRange
  label: string
  shortLabel: string
}

const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { value: '1d', label: 'Today', shortLabel: 'Today' },
  { value: '7d', label: 'Last 7 days', shortLabel: '7D' },
  { value: '30d', label: 'Last 30 days', shortLabel: '30D' },
  { value: '90d', label: 'Last 90 days', shortLabel: '90D' },
  { value: 'ytd', label: 'Year to date', shortLabel: 'YTD' },
  { value: 'all', label: 'All time', shortLabel: 'All' },
]

interface DateRangeSelectorProps {
  /** Current selected range */
  value: DateRange
  /** Callback when range changes */
  onChange: (value: DateRange) => void
  /** Additional className */
  className?: string
}

export function DateRangeSelector({
  value,
  onChange,
  className,
}: DateRangeSelectorProps) {
  const selectedOption = DATE_RANGE_OPTIONS.find((opt) => opt.value === value)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          'w-auto min-w-[140px]',
          'gap-2',
          className
        )}
      >
        <Calendar className="h-4 w-4 text-[hsl(var(--text-muted))]" aria-hidden="true" />
        <SelectValue placeholder="Select range">
          {selectedOption?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {DATE_RANGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * Compact version for tight spaces
 */
export function DateRangeSelectorCompact({
  value,
  onChange,
  className,
}: DateRangeSelectorProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1',
        'rounded-[6px] p-1',
        'bg-[hsl(var(--bg-elevated))]',
        'border border-[hsl(var(--border-default))]',
        className
      )}
      role="radiogroup"
      aria-label="Date range"
    >
      {DATE_RANGE_OPTIONS.slice(0, 4).map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'px-2.5 py-1',
              'rounded-[4px]',
              'text-xs font-medium',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-[hsl(var(--accent-amber))]',
              isActive && [
                'bg-[hsl(var(--accent-amber))]',
                'text-[hsl(var(--bg-app))]',
              ],
              !isActive && [
                'bg-transparent',
                'text-[hsl(var(--text-muted))]',
                'hover:text-[hsl(var(--text-secondary))]',
                'hover:bg-[hsl(var(--bg-hover))]',
              ]
            )}
          >
            {option.shortLabel}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Hook for managing date range state with URL params (optional)
 */
export function useDateRange(
  defaultValue: DateRange = '7d'
): [DateRange, (range: DateRange) => void] {
  const [range, setRange] = React.useState<DateRange>(defaultValue)
  return [range, setRange]
}

/**
 * Calculate date from range value
 */
export function getDateFromRange(range: DateRange): Date {
  const now = new Date()

  switch (range) {
    case '1d':
      return new Date(now.setHours(0, 0, 0, 0))
    case '7d':
      return new Date(now.setDate(now.getDate() - 7))
    case '30d':
      return new Date(now.setDate(now.getDate() - 30))
    case '90d':
      return new Date(now.setDate(now.getDate() - 90))
    case 'ytd':
      return new Date(now.getFullYear(), 0, 1)
    case 'all':
    default:
      return new Date(0) // Beginning of time
  }
}

export { DATE_RANGE_OPTIONS }
