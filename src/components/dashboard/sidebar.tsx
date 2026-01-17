'use client'

import { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  UserCheck,
  Building2,
  Star,
  Settings,
  Menu,
  X,
  Search,
  User,
  CreditCard,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { useCommandPalette } from '@/components/ui/command-palette'

/**
 * Sidebar - Modernized Bloomberg Design System
 *
 * Specifications:
 * - Width: 256px (desktop), 64px (collapsed/tablet), hidden (mobile)
 * - Background: var(--bg-card) #1A1A1A
 * - Border-right: 1px solid var(--border-default)
 *
 * Sections:
 * - Logo section (20px padding, border-bottom)
 * - Search trigger (Command Palette)
 * - MAIN navigation items
 * - ACCOUNT navigation items
 *
 * Navigation item states:
 * - Default: text-secondary, bg-transparent
 * - Hover: text-primary, bg-hover
 * - Active: amber background muted, amber text, 3px left border
 */

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

// Main navigation items
const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Insider Trades',
    href: '/insider-trades',
    icon: UserCheck,
  },
  {
    title: 'Institutions',
    href: '/institutions',
    icon: Building2,
  },
  {
    title: 'Watchlist',
    href: '/watchlist',
    icon: Star,
  },
]

// Account navigation items
const accountNavItems = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

/**
 * Section label component
 */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'px-3 mb-2 mt-6 first:mt-0',
        'text-[11px] font-semibold uppercase tracking-[0.05em]',
        'text-[hsl(var(--text-muted))]'
      )}
    >
      {children}
    </div>
  )
}

/**
 * Navigation item component
 */
function NavItem({
  item,
  isActive,
  onClick,
}: {
  item: { title: string; href: string; icon: React.ComponentType<{ className?: string }> }
  isActive: boolean
  onClick?: () => void
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        // Base styles
        'group relative flex items-center gap-3',
        'rounded-[6px] px-3 py-2.5',
        'text-sm font-medium',
        'transition-all duration-150',
        // Focus state
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[hsl(var(--accent-amber))]',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg-card))]',
        // Conditional states
        isActive
          ? [
              // Active state
              'bg-[hsl(var(--accent-amber)/0.15)]',
              'text-[hsl(var(--accent-amber))]',
            ]
          : [
              // Default state
              'text-[hsl(var(--text-secondary))]',
              'hover:text-[hsl(var(--text-primary))]',
              'hover:bg-[hsl(var(--bg-hover))]',
            ]
      )}
    >
      {/* Active indicator - left border */}
      {isActive && (
        <span
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2',
            'w-[3px] h-5 rounded-r',
            'bg-[hsl(var(--accent-amber))]'
          )}
        />
      )}

      {/* Icon */}
      <Icon
        className={cn(
          'h-5 w-5 shrink-0 transition-colors duration-150',
          isActive
            ? 'text-[hsl(var(--accent-amber))] opacity-100'
            : 'opacity-70 group-hover:opacity-100'
        )}
        aria-hidden="true"
      />

      {/* Title */}
      <span>{item.title}</span>
    </Link>
  )
}

/**
 * Search trigger component (for Command Palette)
 */
function SearchTrigger({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Base styles
        'w-full flex items-center gap-3',
        'rounded-[6px] px-3 py-2.5',
        'text-sm',
        // Background and border
        'bg-[hsl(var(--bg-app))]',
        'border border-[hsl(var(--border-default))]',
        // Text color
        'text-[hsl(var(--text-muted))]',
        // Hover state
        'hover:border-[hsl(var(--border-strong))]',
        'hover:text-[hsl(var(--text-secondary))]',
        // Transition
        'transition-colors duration-150',
        // Focus state
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[hsl(var(--accent-amber))]',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg-card))]'
      )}
    >
      <Search className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
      <span className="flex-1 text-left">Search...</span>
      <kbd
        className={cn(
          'hidden sm:inline-flex items-center gap-0.5',
          'px-1.5 py-0.5 rounded',
          'bg-[hsl(var(--bg-elevated))]',
          'text-[10px] font-medium',
          'text-[hsl(var(--text-muted))]',
          'border border-[hsl(var(--border-default))]'
        )}
      >
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  )
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { open: openCommandPalette } = useCommandPalette()
  const sidebarRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Check if a nav item is active
  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (href === '/settings') {
      // Settings is only active if we're on /settings exactly
      return pathname === '/settings'
    }
    return pathname.startsWith(href)
  }

  // Handle mobile nav click
  const handleMobileClick = () => {
    if (window.innerWidth < 1024) {
      onToggle()
    }
  }

  // Handle search trigger click (Command Palette)
  const handleSearchClick = () => {
    openCommandPalette()
  }

  // Focus trap for mobile sidebar
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle when sidebar is open on mobile
      if (!isOpen || window.innerWidth >= 1024) return

      // Close on Escape
      if (e.key === 'Escape') {
        e.preventDefault()
        onToggle()
        return
      }

      // Focus trap on Tab
      if (e.key === 'Tab' && sidebarRef.current) {
        const focusableElements = sidebarRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    },
    [isOpen, onToggle]
  )

  // Set up focus trap and escape handler
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      // Focus the close button when sidebar opens
      closeButtonRef.current?.focus()

      // Add keyboard event listener
      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, handleKeyDown])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        role={isOpen && typeof window !== 'undefined' && window.innerWidth < 1024 ? 'dialog' : undefined}
        aria-modal={isOpen && typeof window !== 'undefined' && window.innerWidth < 1024 ? true : undefined}
        aria-label="Navigation menu"
        className={cn(
          // Positioning
          'fixed left-0 top-0 z-50',
          'flex h-full flex-col',
          // Width
          'w-64',
          // Background
          'bg-[hsl(var(--bg-card))]',
          // Border
          'border-r border-[hsl(var(--border-default))]',
          // Transition
          'transition-transform duration-300 ease-in-out',
          // Desktop: always visible
          'lg:translate-x-0',
          // Mobile: controlled by isOpen
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo section */}
        <div
          className={cn(
            'flex items-center justify-between',
            'px-5 py-5',
            'border-b border-[hsl(var(--border-subtle))]'
          )}
        >
          <Logo variant="light" size="md" href="/dashboard" />
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            className={cn(
              'lg:hidden',
              'text-[hsl(var(--text-secondary))]',
              'hover:bg-[hsl(var(--bg-hover))]'
            )}
            onClick={onToggle}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Search trigger */}
        <div className="px-3 py-4">
          <SearchTrigger onClick={handleSearchClick} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {/* Main section */}
          <SectionLabel>Main</SectionLabel>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={isItemActive(item.href)}
                onClick={handleMobileClick}
              />
            ))}
          </div>

          {/* Account section */}
          <SectionLabel>Account</SectionLabel>
          <div className="space-y-1">
            {accountNavItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={isItemActive(item.href)}
                onClick={handleMobileClick}
              />
            ))}
          </div>
        </nav>
      </aside>
    </>
  )
}

/**
 * Mobile menu button for header
 */
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'lg:hidden',
        'text-[hsl(var(--text-secondary))]',
        'hover:bg-[hsl(var(--bg-hover))]',
        'focus-visible:ring-[hsl(var(--accent-amber))]'
      )}
      onClick={onClick}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" aria-hidden="true" />
    </Button>
  )
}
