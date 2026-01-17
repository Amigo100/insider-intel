'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  LayoutDashboard,
  UserCheck,
  Building2,
  Star,
  Settings,
  TrendingUp,
  Clock,
  FileDown,
  Plus,
  ArrowRight,
  User,
  CreditCard,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * CommandPalette - Modernized Bloomberg Design System
 *
 * Global search and navigation interface triggered by:
 * - ⌘K (Mac) or Ctrl+K (Windows)
 * - "/" when not in an input
 * - Click on sidebar search trigger
 *
 * Features:
 * - Search tickers, navigation, actions
 * - Keyboard navigation (↑/↓/Enter/Escape)
 * - Recent searches
 * - Category filtering
 *
 * Visual specifications:
 * - max-width: 560px
 * - margin-top: 15vh
 * - 12px border-radius
 * - Glassmorphic backdrop
 */

type CommandItem = {
  id: string
  label: string
  description?: string
  href?: string
  action?: string
  icon: React.ComponentType<{ className?: string }>
  category: 'navigation' | 'ticker' | 'action' | 'recent'
  shortcut?: string
}

// Navigation items
const navigationItems: CommandItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, category: 'navigation' },
  { id: 'insider-trades', label: 'Insider Trades', href: '/insider-trades', icon: UserCheck, category: 'navigation' },
  { id: 'institutions', label: 'Institutions', href: '/institutions', icon: Building2, category: 'navigation' },
  { id: 'watchlist', label: 'Watchlist', href: '/watchlist', icon: Star, category: 'navigation' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings, category: 'navigation' },
  { id: 'profile', label: 'Profile', href: '/settings/profile', icon: User, category: 'navigation' },
  { id: 'billing', label: 'Billing', href: '/settings/billing', icon: CreditCard, category: 'navigation' },
  { id: 'notifications', label: 'Notifications', href: '/settings/notifications', icon: Bell, category: 'navigation' },
]

// Action items
const actionItems: CommandItem[] = [
  { id: 'add-watchlist', label: 'Add to Watchlist', action: 'add-to-watchlist', icon: Plus, category: 'action', shortcut: '⌘⇧W' },
  { id: 'export-csv', label: 'Export to CSV', action: 'export-csv', icon: FileDown, category: 'action', shortcut: '⌘⇧E' },
]

// Sample tickers for demo (in production, this would be fetched)
const sampleTickers: CommandItem[] = [
  { id: 'AAPL', label: 'AAPL', description: 'Apple Inc.', href: '/company/AAPL', icon: TrendingUp, category: 'ticker' },
  { id: 'MSFT', label: 'MSFT', description: 'Microsoft Corporation', href: '/company/MSFT', icon: TrendingUp, category: 'ticker' },
  { id: 'GOOGL', label: 'GOOGL', description: 'Alphabet Inc.', href: '/company/GOOGL', icon: TrendingUp, category: 'ticker' },
  { id: 'AMZN', label: 'AMZN', description: 'Amazon.com Inc.', href: '/company/AMZN', icon: TrendingUp, category: 'ticker' },
  { id: 'NVDA', label: 'NVDA', description: 'NVIDIA Corporation', href: '/company/NVDA', icon: TrendingUp, category: 'ticker' },
  { id: 'TSLA', label: 'TSLA', description: 'Tesla, Inc.', href: '/company/TSLA', icon: TrendingUp, category: 'ticker' },
]

interface CommandPaletteContextType {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const CommandPaletteContext = React.createContext<CommandPaletteContextType | null>(null)

export function useCommandPalette() {
  const context = React.useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  }
  return context
}

interface CommandPaletteProviderProps {
  children: React.ReactNode
}

export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const open = React.useCallback(() => setIsOpen(true), [])
  const close = React.useCallback(() => setIsOpen(false), [])
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), [])

  // Global keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
        return
      }

      // "/" when not in an input
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) &&
        !(e.target as HTMLElement).isContentEditable
      ) {
        e.preventDefault()
        open()
        return
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        close()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, open, close, toggle])

  return (
    <CommandPaletteContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
      {isOpen && <CommandPaletteModal onClose={close} />}
    </CommandPaletteContext.Provider>
  )
}

interface CommandPaletteModalProps {
  onClose: () => void
}

function CommandPaletteModal({ onClose }: CommandPaletteModalProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [recentItems, setRecentItems] = React.useState<CommandItem[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const modalRef = React.useRef<HTMLDivElement>(null)

  // Load recent items from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('command-palette-recent')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Reconstruct items with icons
        const items = parsed.map((item: { id: string; category: string }) => {
          if (item.category === 'navigation') {
            return navigationItems.find((n) => n.id === item.id)
          }
          if (item.category === 'ticker') {
            return sampleTickers.find((t) => t.id === item.id)
          }
          return null
        }).filter(Boolean).slice(0, 3)
        setRecentItems(items)
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Focus input on mount
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Focus trap for the modal
  React.useEffect(() => {
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"]), a[href]'
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

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [])

  // Filter items based on query
  const filteredItems = React.useMemo(() => {
    const lowerQuery = query.toLowerCase().trim()

    if (!lowerQuery) {
      // Show recent items first, then navigation
      const items: CommandItem[] = []

      if (recentItems.length > 0) {
        items.push(...recentItems.map((item) => ({ ...item, category: 'recent' as const })))
      }

      items.push(...navigationItems.slice(0, 5))
      return items
    }

    const results: CommandItem[] = []

    // Search tickers (exact prefix match prioritized)
    const tickerMatches = sampleTickers.filter(
      (item) =>
        item.id.toLowerCase().startsWith(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery)
    )
    results.push(...tickerMatches)

    // Search navigation
    const navMatches = navigationItems.filter(
      (item) => item.label.toLowerCase().includes(lowerQuery)
    )
    results.push(...navMatches)

    // Search actions
    const actionMatches = actionItems.filter(
      (item) => item.label.toLowerCase().includes(lowerQuery)
    )
    results.push(...actionMatches)

    return results
  }, [query, recentItems])

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  React.useEffect(() => {
    const list = listRef.current
    if (!list) return

    const selectedElement = list.querySelector(`[data-index="${selectedIndex}"]`)
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Handle item selection
  const handleSelect = React.useCallback(
    (item: CommandItem) => {
      // Save to recent
      const recentData = [
        { id: item.id, category: item.category === 'recent' ? 'navigation' : item.category },
        ...recentItems
          .filter((r) => r.id !== item.id)
          .map((r) => ({ id: r.id, category: r.category })),
      ].slice(0, 3)
      localStorage.setItem('command-palette-recent', JSON.stringify(recentData))

      if (item.href) {
        router.push(item.href)
        onClose()
      } else if (item.action) {
        // Handle actions
        switch (item.action) {
          case 'add-to-watchlist':
            // TODO: Implement add to watchlist action
            console.log('Add to watchlist')
            break
          case 'export-csv':
            // TODO: Implement export CSV action
            console.log('Export CSV')
            break
        }
        onClose()
      }
    },
    [router, onClose, recentItems]
  )

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'recent':
        return 'Recent'
      case 'navigation':
        return 'Pages'
      case 'ticker':
        return 'Tickers'
      case 'action':
        return 'Actions'
      default:
        return category
    }
  }

  // Group items by category
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    let index = 0

    filteredItems.forEach((item) => {
      const category = item.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push({ ...item, id: `${item.id}-${index++}` })
    })

    return groups
  }, [filteredItems])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[1100]',
          'bg-black/60 backdrop-blur-[4px]',
          'animate-in fade-in duration-150'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'fixed left-1/2 top-[15vh] z-[1101]',
          '-translate-x-1/2',
          'w-full max-w-[560px]',
          'bg-[hsl(var(--bg-card))]',
          'border border-[hsl(var(--border-default))]',
          'rounded-xl',
          'shadow-[0_24px_48px_rgba(0,0,0,0.4)]',
          'overflow-hidden',
          'animate-in fade-in slide-in-from-top-4 duration-150'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(var(--border-default))]">
          <Search
            className="h-5 w-5 shrink-0 text-[hsl(var(--text-muted))]"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tickers, views, or actions..."
            className={cn(
              'flex-1 bg-transparent',
              'text-lg text-[hsl(var(--text-primary))]',
              'placeholder:text-[hsl(var(--text-muted))]',
              'outline-none border-none'
            )}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <kbd
            className={cn(
              'hidden sm:inline-flex items-center',
              'px-2 py-1 rounded-md',
              'bg-[hsl(var(--bg-elevated))]',
              'text-xs font-medium',
              'text-[hsl(var(--text-muted))]',
              'border border-[hsl(var(--border-default))]'
            )}
          >
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div
          ref={listRef}
          className="max-h-[360px] overflow-y-auto p-2"
          role="listbox"
        >
          {filteredItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-[hsl(var(--text-muted))]">
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for a ticker symbol or page name</p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-2 last:mb-0">
                {/* Category label */}
                <div
                  className={cn(
                    'px-3 py-1.5',
                    'text-[11px] font-semibold uppercase tracking-[0.05em]',
                    'text-[hsl(var(--text-muted))]'
                  )}
                >
                  {getCategoryLabel(category)}
                </div>

                {/* Items */}
                {items.map((item, idx) => {
                  const globalIndex = filteredItems.findIndex((f) => f.id === item.id.split('-')[0])
                  const isSelected = globalIndex === selectedIndex

                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-index={globalIndex}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={cn(
                        'w-full flex items-center gap-3',
                        'px-3 py-2.5',
                        'rounded-[6px]',
                        'text-left',
                        'transition-colors duration-75',
                        isSelected
                          ? 'bg-[hsl(var(--accent-amber)/0.15)]'
                          : 'hover:bg-[hsl(var(--bg-hover))]'
                      )}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {/* Icon */}
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          isSelected
                            ? 'text-[hsl(var(--accent-amber))]'
                            : 'text-[hsl(var(--text-muted))]'
                        )}
                        aria-hidden="true"
                      />

                      {/* Label and description */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            isSelected
                              ? 'text-[hsl(var(--accent-amber))]'
                              : 'text-[hsl(var(--text-primary))]'
                          )}
                        >
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-[hsl(var(--text-muted))] truncate">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Shortcut or arrow */}
                      {item.shortcut ? (
                        <kbd
                          className={cn(
                            'px-1.5 py-0.5 rounded',
                            'bg-[hsl(var(--bg-elevated))]',
                            'text-[10px] font-medium',
                            'text-[hsl(var(--text-muted))]',
                            'border border-[hsl(var(--border-default))]'
                          )}
                        >
                          {item.shortcut}
                        </kbd>
                      ) : (
                        <ArrowRight
                          className={cn(
                            'h-4 w-4 shrink-0',
                            'text-[hsl(var(--text-muted))]',
                            'opacity-0 group-hover:opacity-100',
                            isSelected && 'opacity-100'
                          )}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div
          className={cn(
            'flex items-center justify-between gap-4',
            'px-4 py-2.5',
            'border-t border-[hsl(var(--border-default))]',
            'bg-[hsl(var(--bg-elevated))]'
          )}
        >
          <div className="flex items-center gap-4 text-xs text-[hsl(var(--text-muted))]">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--bg-card))] border border-[hsl(var(--border-default))]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--bg-card))] border border-[hsl(var(--border-default))]">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--bg-card))] border border-[hsl(var(--border-default))]">↵</kbd>
              <span>select</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-muted))]">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>Recent searches saved</span>
          </div>
        </div>
      </div>
    </>
  )
}

// Export a hook to open the palette programmatically
export { CommandPaletteContext }
