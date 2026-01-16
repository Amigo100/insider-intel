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
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-sidebar-background text-sidebar-foreground transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            <span className="text-lg font-bold">InsiderIntel</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onToggle}
          >
            <X className="h-5 w-5" />
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
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs text-sidebar-muted-foreground">
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
