'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  UserCheck,
  Building2,
  Star,
  Settings,
  TrendingUp,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navItems = [
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
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-slate-900 border-r border-white/[0.06] text-sidebar-foreground transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-cyan-400" aria-hidden="true" />
            <span className="text-lg font-bold text-white">InsiderIntel</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onToggle}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onToggle()
                  }
                }}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-cyan-400/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-cyan-400 rounded-r" />
                )}
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-colors duration-150',
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
                  )}
                  aria-hidden="true"
                />
                {item.title}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="rounded-lg bg-slate-800/50 p-3">
            <p className="text-xs text-slate-500">
              Data updated hourly from SEC EDGAR filings
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  )
}
