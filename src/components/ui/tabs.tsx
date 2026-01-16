'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-lg bg-slate-800/70 p-1.5 text-slate-400 border border-white/[0.06]',
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
      'relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
      'disabled:pointer-events-none disabled:opacity-50',
      // Active state: cyan bottom border, bright text, subtle background
      'data-[state=active]:bg-slate-700/80 data-[state=active]:text-white data-[state=active]:shadow-sm',
      'data-[state=active]:border-b-[3px] data-[state=active]:border-b-cyan-400',
      // Inactive state: muted text with hover
      'data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-slate-200 data-[state=inactive]:hover:bg-white/5',
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
      'mt-2 ring-offset-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/20 focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
