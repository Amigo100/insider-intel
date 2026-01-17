'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

/**
 * Tabs Component - Modernized Bloomberg Design System
 *
 * Theme-aware styling using CSS variables:
 * - Works in both light and dark modes
 * - Uses amber accent for active indicator
 *
 * Accessibility (fixes UI_AUDIT #34, #35):
 * - Supports aria-label on TabsList
 * - Proper focus management with visible rings
 * - Keyboard navigation built-in via Radix
 *
 * Fixes UI_AUDIT #14, #15 - removes hardcoded slate colors
 */

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    /** Accessible label for the tab list */
    'aria-label'?: string
  }
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Base styles
      'inline-flex items-center justify-center',
      'rounded-[6px] p-1',
      'bg-muted',
      'border border-border',

      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles
      'relative inline-flex items-center justify-center',
      'whitespace-nowrap rounded-[4px] px-4 py-2',
      'text-sm font-medium',

      // Transition
      'transition-all duration-150',

      // Default state (inactive)
      'text-muted-foreground',
      'bg-transparent',

      // Hover state (inactive)
      'hover:text-foreground',
      'hover:bg-accent/50',

      // Active state
      'data-[state=active]:bg-background',
      'data-[state=active]:text-foreground',
      'data-[state=active]:shadow-sm',

      // Active indicator - amber bottom border
      'data-[state=active]:after:absolute',
      'data-[state=active]:after:bottom-0',
      'data-[state=active]:after:left-2',
      'data-[state=active]:after:right-2',
      'data-[state=active]:after:h-0.5',
      'data-[state=active]:after:rounded-full',
      'data-[state=active]:after:bg-[hsl(var(--accent-amber))]',

      // Focus state - amber ring
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-[hsl(var(--accent-amber))]',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-background',

      // Disabled state
      'disabled:pointer-events-none',
      'disabled:opacity-50',

      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      // Base styles
      'mt-3',

      // Focus state
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-[hsl(var(--accent-amber)/0.3)]',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-background',

      // Animation
      'data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0',
      'data-[state=active]:animate-in data-[state=active]:fade-in-0',

      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
