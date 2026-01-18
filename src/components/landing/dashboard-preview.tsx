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
 * Updated to match Bloomberg-inspired design (#0D0D0D background, amber accents).
 */
export function DashboardPreview() {
  return (
    <div
      className="relative mx-auto max-w-5xl"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Floating notification cards - decorative (Bloomberg themed) */}
      <FloatingCard
        className="absolute -left-4 top-20 z-10 hidden lg:block"
        delay={0}
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-[#00C853]/10 flex items-center justify-center border border-[#00C853]/20">
            <ArrowUpRight className="h-3 w-3 text-[#00C853]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#F5F5F5]">CEO at NVDA</p>
            <p className="text-[10px] text-[#8C8C8C]">Bought $1.2M</p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard
        className="absolute -right-4 top-32 z-10 hidden lg:block"
        delay={1}
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-[#FFA028]/10 flex items-center justify-center border border-[#FFA028]/20">
            <Users className="h-3 w-3 text-[#FFA028]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#F5F5F5]">Cluster Alert</p>
            <p className="text-[10px] text-[#8C8C8C]">3 insiders at AAPL</p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard
        className="absolute -left-8 bottom-32 z-10 hidden lg:block"
        delay={2}
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-[#FF5252]/10 flex items-center justify-center border border-[#FF5252]/20">
            <ArrowDownRight className="h-3 w-3 text-[#FF5252]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#F5F5F5]">CFO at META</p>
            <p className="text-[10px] text-[#8C8C8C]">Sold $890K</p>
          </div>
        </div>
      </FloatingCard>
      {/* Main container with 3D transform - Bloomberg themed */}
      <div
        className="rounded-xl border border-[#262626] bg-[#0D0D0D] shadow-2xl overflow-hidden"
        style={{
          transform: 'rotateY(-5deg) rotateX(2deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Browser chrome - Bloomberg themed */}
        <div className="flex items-center gap-2 border-b border-[#262626] bg-[#1A1A1A]/50 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 rounded-md bg-[#1A1A1A] border border-[#262626] px-3 py-1 text-xs text-[#8C8C8C]">
              <Search className="h-3 w-3" />
              <span>app.insiderintel.com/dashboard</span>
            </div>
          </div>
          <div className="w-16" /> {/* Spacer for symmetry */}
        </div>

        {/* Dashboard content - Bloomberg themed */}
        <div className="flex min-h-[400px] sm:min-h-[450px]">
          {/* Sidebar - hidden on mobile */}
          <aside className="hidden w-52 flex-shrink-0 border-r border-[#262626] bg-[#0D0D0D] p-4 md:block">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="h-5 w-5 text-[#FFA028]" />
              <span className="text-sm font-bold text-[#F5F5F5]">InsiderIntel</span>
            </div>

            {/* Nav items */}
            <nav className="space-y-1">
              <NavItem icon={LayoutDashboard} label="Dashboard" active />
              <NavItem icon={LineChart} label="Insider Trades" />
              <NavItem icon={Building2} label="Institutions" />
              <NavItem icon={Star} label="Watchlist" badge="3" />
              <NavItem icon={Bell} label="Alerts" badge="5" />
              <div className="pt-4 mt-4 border-t border-[#333333]">
                <NavItem icon={Settings} label="Settings" />
              </div>
            </nav>
          </aside>

          {/* Main content - Bloomberg themed */}
          <main className="flex-1 bg-[#141414] p-4 sm:p-6 overflow-hidden">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#F5F5F5] sm:text-xl">
                Good morning, Alex
              </h2>
              <p className="text-xs text-[#8C8C8C] sm:text-sm">
                Latest insider trading activity
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

            {/* Cluster Alert Banner - Bloomberg themed */}
            <div className="mb-6 rounded-lg border border-[#00C853]/20 bg-[#00C853]/5 p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00C853]/10 border border-[#00C853]/20">
                  <Users className="h-4 w-4 text-[#00C853]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-[#F5F5F5]">
                    <span className="text-[#00C853]">3 insiders</span> bought{' '}
                    <span className="text-[#00C853]">$2.4M</span> at{' '}
                    <span className="font-bold">NVDA</span> in 7 days
                  </p>
                  <p className="text-xs text-[#8C8C8C] truncate">
                    NVIDIA Corporation - Cluster buying detected
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction table - Bloomberg themed */}
            <div className="rounded-lg border border-[#262626] bg-[#1A1A1A]/50 overflow-hidden">
              <div className="border-b border-[#262626] px-3 sm:px-4 py-2 sm:py-3">
                <h3 className="text-xs sm:text-sm font-semibold text-[#F5F5F5]">
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
          ? 'bg-[#1A1A1A] text-[#F5F5F5]'
          : 'text-[#8C8C8C] hover:bg-[#1A1A1A]/50 hover:text-[#F5F5F5]'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFA028] px-1.5 text-xs font-medium text-[#0D0D0D]">
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
          ? 'border-[#FFA028]/20 bg-[#FFA028]/5'
          : 'border-[#262626] bg-[#1A1A1A]/50'
      }`}
    >
      <p className="text-[10px] sm:text-xs font-medium text-[#8C8C8C] uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-lg sm:text-2xl font-bold text-[#F5F5F5] tabular-nums">
        {value}
      </p>
      <p
        className={`mt-1 text-[10px] sm:text-xs font-medium ${
          trend === 'up' ? 'text-[#00C853]' : 'text-[#FF5252]'
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
    <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 border-b border-[#262626] last:border-b-0 hover:bg-[#1A1A1A]/30 transition-colors">
      {/* Ticker & Company */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#F5F5F5] text-xs sm:text-sm">
            {ticker}
          </span>
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs font-medium ${
              type === 'buy'
                ? 'bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20'
                : 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/20'
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
        <p className="text-[10px] sm:text-xs text-[#8C8C8C] truncate">
          {company}
        </p>
      </div>

      {/* Insider - hidden on small screens */}
      <div className="hidden sm:block min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-[#D9D9D9] truncate">
          {insider}
        </p>
        <p className="text-[10px] sm:text-xs text-[#8C8C8C]">
          {title}
        </p>
      </div>

      {/* Value */}
      <div className="text-right">
        <p className="text-xs sm:text-sm font-semibold text-[#F5F5F5] tabular-nums">
          {value}
        </p>
        <p className="text-[10px] sm:text-xs text-[#8C8C8C]">
          {time}
        </p>
      </div>

      {/* Significance indicator */}
      <div className="hidden sm:flex items-center">
        <div
          className={`h-2 w-2 rounded-full ${
            significance === 'high'
              ? 'bg-[#FFA028]'
              : significance === 'medium'
                ? 'bg-[#FFD666]'
                : 'bg-[#595959]'
          }`}
          title={`${significance} significance`}
        />
      </div>
    </div>
  )
}

/**
 * Floating card component with animation - Bloomberg themed
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
      className={`rounded-lg border border-[#262626] bg-[#1A1A1A] p-3 shadow-lg animate-float ${className}`}
      style={{
        animationDelay: `${delay * 0.5}s`,
      }}
    >
      {children}
    </div>
  )
}
