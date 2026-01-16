'use client'

import {
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  LineChart,
  Star,
  Building2,
  Settings,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Users,
} from 'lucide-react'

/**
 * Realistic dashboard mockup for the landing page hero section.
 * Uses hardcoded dark theme colors to match the actual app appearance.
 */
export function DashboardPreview() {
  return (
    <div
      className="relative mx-auto max-w-5xl"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Floating notification cards - decorative (dark themed) */}
      <FloatingCard
        className="absolute -left-4 top-20 z-10 hidden lg:block"
        delay={0}
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <ArrowUpRight className="h-3 w-3 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-white">CEO at NVDA</p>
            <p className="text-[10px] text-slate-400">Bought $1.2M</p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard
        className="absolute -right-4 top-32 z-10 hidden lg:block"
        delay={1}
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Users className="h-3 w-3 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-white">Cluster Alert</p>
            <p className="text-[10px] text-slate-400">3 insiders at AAPL</p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard
        className="absolute -left-8 bottom-32 z-10 hidden lg:block"
        delay={2}
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <ArrowDownRight className="h-3 w-3 text-red-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-white">CFO at META</p>
            <p className="text-[10px] text-slate-400">Sold $890K</p>
          </div>
        </div>
      </FloatingCard>
      {/* Main container with 3D transform - dark themed */}
      <div
        className="rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl overflow-hidden"
        style={{
          transform: 'rotateY(-5deg) rotateX(2deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Browser chrome - dark themed */}
        <div className="flex items-center gap-2 border-b border-slate-700/50 bg-slate-800/50 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 rounded-md bg-slate-700/50 px-3 py-1 text-xs text-slate-400">
              <Search className="h-3 w-3" />
              <span>app.insiderintel.com/dashboard</span>
            </div>
          </div>
          <div className="w-16" /> {/* Spacer for symmetry */}
        </div>

        {/* Dashboard content - dark themed */}
        <div className="flex min-h-[400px] sm:min-h-[450px]">
          {/* Sidebar - hidden on mobile */}
          <aside className="hidden w-52 flex-shrink-0 border-r border-slate-700/50 bg-slate-900 p-4 md:block">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              <span className="text-sm font-bold text-white">InsiderIntel</span>
            </div>

            {/* Nav items */}
            <nav className="space-y-1">
              <NavItem icon={LayoutDashboard} label="Dashboard" active />
              <NavItem icon={LineChart} label="Insider Trades" />
              <NavItem icon={Building2} label="Institutions" />
              <NavItem icon={Star} label="Watchlist" badge="3" />
              <NavItem icon={Bell} label="Alerts" badge="5" />
              <div className="pt-4 mt-4 border-t border-slate-700">
                <NavItem icon={Settings} label="Settings" />
              </div>
            </nav>
          </aside>

          {/* Main content - dark themed */}
          <main className="flex-1 bg-slate-800/30 p-4 sm:p-6 overflow-hidden">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Good morning, Alex
              </h2>
              <p className="text-xs text-slate-400 sm:text-sm">
                Here&apos;s what&apos;s happening with insider trades today
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
              <StatCard
                label="Today's Trades"
                value="47"
                change="+12"
                trend="up"
              />
              <StatCard
                label="Cluster Alerts"
                value="3"
                change="New"
                trend="up"
                highlight
              />
              <StatCard
                label="Watchlist Activity"
                value="8"
                change="+3"
                trend="up"
              />
              <StatCard
                label="Net Buy Volume"
                value="$24.7M"
                change="+18%"
                trend="up"
              />
            </div>

            {/* Cluster Alert Banner - dark themed */}
            <div className="mb-6 rounded-lg border border-emerald-800 bg-gradient-to-r from-emerald-950/50 to-emerald-900/30 p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                  <Users className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    <span className="text-emerald-400">3 insiders</span> bought{' '}
                    <span className="text-emerald-400">$2.4M</span> at{' '}
                    <span className="font-bold">NVDA</span> in 7 days
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    NVIDIA Corporation - Cluster buying detected
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction table - dark themed */}
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 overflow-hidden">
              <div className="border-b border-slate-700/50 px-3 sm:px-4 py-2 sm:py-3">
                <h3 className="text-xs sm:text-sm font-semibold text-white">
                  Recent Insider Transactions
                </h3>
              </div>
              <div>
                <TransactionRow
                  ticker="AAPL"
                  company="Apple Inc."
                  insider="Tim Cook"
                  title="CEO"
                  type="buy"
                  value="$2.4M"
                  time="2 hours ago"
                  significance="high"
                />
                <TransactionRow
                  ticker="TSLA"
                  company="Tesla, Inc."
                  insider="Robyn Denholm"
                  title="Chair"
                  type="sell"
                  value="$890K"
                  time="4 hours ago"
                  significance="medium"
                />
                <TransactionRow
                  ticker="MSFT"
                  company="Microsoft Corp."
                  insider="Satya Nadella"
                  title="CEO"
                  type="buy"
                  value="$1.2M"
                  time="6 hours ago"
                  significance="high"
                />
                <TransactionRow
                  ticker="GOOGL"
                  company="Alphabet Inc."
                  insider="Ruth Porat"
                  title="CFO"
                  type="sell"
                  value="$3.1M"
                  time="Yesterday"
                  significance="low"
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Decorative shadow/glow underneath */}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-8 rounded-full bg-primary/20 blur-2xl"
        aria-hidden="true"
      />
    </div>
  )
}

function NavItem({
  icon: Icon,
  label,
  active,
  badge,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
  badge?: string
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? 'bg-slate-800 text-white'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
          {badge}
        </span>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  change,
  trend,
  highlight,
}: {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-3 sm:p-4 ${
        highlight
          ? 'border-emerald-800 bg-emerald-950/30'
          : 'border-slate-700/50 bg-slate-800/50'
      }`}
    >
      <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-lg sm:text-2xl font-bold text-white">
        {value}
      </p>
      <p
        className={`mt-1 text-[10px] sm:text-xs font-medium ${
          trend === 'up' ? 'text-emerald-400' : 'text-red-400'
        }`}
      >
        {trend === 'up' ? '↑' : '↓'} {change}
      </p>
    </div>
  )
}

function TransactionRow({
  ticker,
  company,
  insider,
  title,
  type,
  value,
  time,
  significance,
}: {
  ticker: string
  company: string
  insider: string
  title: string
  type: 'buy' | 'sell'
  value: string
  time: string
  significance: 'high' | 'medium' | 'low'
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/20 transition-colors">
      {/* Ticker & Company */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-xs sm:text-sm">
            {ticker}
          </span>
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs font-medium ${
              type === 'buy'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {type === 'buy' ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {type === 'buy' ? 'BUY' : 'SELL'}
          </span>
        </div>
        <p className="text-[10px] sm:text-xs text-slate-400 truncate">
          {company}
        </p>
      </div>

      {/* Insider - hidden on small screens */}
      <div className="hidden sm:block min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-slate-300 truncate">
          {insider}
        </p>
        <p className="text-[10px] sm:text-xs text-slate-400">
          {title}
        </p>
      </div>

      {/* Value */}
      <div className="text-right">
        <p className="text-xs sm:text-sm font-semibold text-white">
          {value}
        </p>
        <p className="text-[10px] sm:text-xs text-slate-400">
          {time}
        </p>
      </div>

      {/* Significance indicator */}
      <div className="hidden sm:flex items-center">
        <div
          className={`h-2 w-2 rounded-full ${
            significance === 'high'
              ? 'bg-orange-500'
              : significance === 'medium'
                ? 'bg-yellow-500'
                : 'bg-slate-500'
          }`}
          title={`${significance} significance`}
        />
      </div>
    </div>
  )
}

/**
 * Floating card component with animation - dark themed
 */
function FloatingCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <div
      className={`rounded-lg border border-slate-700/50 bg-slate-800 p-3 shadow-lg animate-float ${className}`}
      style={{
        animationDelay: `${delay * 0.5}s`,
      }}
    >
      {children}
    </div>
  )
}
