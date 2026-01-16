'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface DashboardShellProps {
  children: React.ReactNode
  user: {
    email?: string | null
    name?: string | null
    avatarUrl?: string | null
  }
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header user={user} onMenuToggle={toggleSidebar} />

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
