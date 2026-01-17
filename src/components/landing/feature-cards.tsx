'use client'

import Link from 'next/link'
import {
  Search,
  Building2,
  Sparkles,
  Bell,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Feature cards section with visual previews and hover effects
 */
export function FeatureCards() {
  return (
    <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
      {/* Feature 1: Insider Transaction Tracking */}
      <FeatureCard
        icon={Search}
        title="Insider Transaction Tracking"
        description="Real-time monitoring of SEC Form 4 filings. See every buy, sell, and option exercise by company insiders."
        linkHref="#pricing"
        linkText="Start tracking"
      >
        <MiniBarChart />
      </FeatureCard>

      {/* Feature 2: Institutional Holdings */}
      <FeatureCard
        icon={Building2}
        title="Institutional Holdings"
        description="Track 13F filings from hedge funds and institutions. Know what the biggest players are buying and selling."
        linkHref="#pricing"
        linkText="View institutions"
      >
        <MiniPieChart />
      </FeatureCard>

      {/* Feature 3: AI-Powered Insights */}
      <FeatureCard
        icon={Sparkles}
        title="AI-Powered Insights"
        description="Our AI analyzes every transaction for significance, context, and historical patterns to surface what matters."
        linkHref="#faq"
        linkText="How it works"
      >
        <AIInsightPreview />
      </FeatureCard>

      {/* Feature 4: Alerts & Watchlists */}
      <FeatureCard
        icon={Bell}
        title="Alerts & Watchlists"
        description="Create custom watchlists and get instant alerts when insiders trade stocks you care about."
        linkHref="#pricing"
        linkText="Set up alerts"
      >
        <AlertsPreview />
      </FeatureCard>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  linkHref: string
  linkText: string
  children: React.ReactNode
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  linkHref,
  linkText,
  children,
}: FeatureCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-primary/50">
      <CardHeader className="pb-4">
        {/* Icon with background circle */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5 transition-all duration-300 group-hover:bg-primary/15 group-hover:ring-primary/10">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{description}</p>

        {/* Visual Preview */}
        <div className="rounded-lg border bg-muted/30 p-4 transition-colors duration-300 group-hover:bg-muted/50">
          {children}
        </div>

        {/* Learn more link */}
        <Link
          href={linkHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {linkText}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardContent>
    </Card>
  )
}

/**
 * Mini bar chart showing buy/sell activity
 */
function MiniBarChart() {
  const data = [
    { buy: 65, sell: 20 },
    { buy: 45, sell: 35 },
    { buy: 80, sell: 15 },
    { buy: 30, sell: 55 },
    { buy: 70, sell: 25 },
    { buy: 55, sell: 40 },
    { buy: 85, sell: 10 },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-1.5 h-16">
        {data.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col gap-0.5">
            {/* Buy bar (green) */}
            <div
              className="w-full rounded-t bg-emerald-500 transition-all duration-500"
              style={{ height: `${day.buy * 0.5}px` }}
            />
            {/* Sell bar (red) */}
            <div
              className="w-full rounded-b bg-red-400 transition-all duration-500"
              style={{ height: `${day.sell * 0.3}px` }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Buys
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          Sells
        </span>
      </div>
    </div>
  )
}

/**
 * Mini pie chart showing institutional holdings distribution
 */
function MiniPieChart() {
  // Simplified visual representation using colored segments
  const segments = [
    { label: 'Vanguard', percent: 35, color: 'bg-blue-500' },
    { label: 'BlackRock', percent: 28, color: 'bg-emerald-500' },
    { label: 'State Street', percent: 20, color: 'bg-purple-500' },
    { label: 'Others', percent: 17, color: 'bg-slate-400' },
  ]

  return (
    <div className="flex items-center gap-4">
      {/* Circular representation */}
      <div className="relative h-16 w-16 flex-shrink-0">
        <svg
          viewBox="0 0 36 36"
          className="h-16 w-16 -rotate-90"
          role="img"
          aria-labelledby="pie-chart-title"
        >
          <title id="pie-chart-title">Institutional holdings distribution: Vanguard 35%, BlackRock 28%, State Street 20%, Others 17%</title>
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="hsl(var(--muted))"
            strokeWidth="3"
          />
          {/* Segments */}
          <circle
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray="35 65"
            strokeDashoffset="0"
          />
          <circle
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray="28 72"
            strokeDashoffset="-35"
          />
          <circle
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeDasharray="20 80"
            strokeDashoffset="-63"
          />
          <circle
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeDasharray="17 83"
            strokeDashoffset="-83"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${seg.color}`} />
            <span className="text-muted-foreground truncate">{seg.label}</span>
            <span className="font-medium">{seg.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * AI insight preview with speech bubble
 */
function AIInsightPreview() {
  return (
    <div className="space-y-2">
      {/* AI Message Bubble */}
      <div className="relative">
        <div className="flex items-start gap-2">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary">
            <Sparkles className="h-3 w-3 text-primary-foreground" />
          </div>
          <div className="flex-1 rounded-lg rounded-tl-none bg-background border p-2.5 shadow-sm">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">High significance:</span>{' '}
              CEO purchased shares worth 3x their annual salary. This is the largest
              insider buy at this company in 2 years, suggesting strong conviction.
            </p>
          </div>
        </div>
      </div>

      {/* Significance indicator */}
      <div className="flex items-center gap-2 pl-8">
        <div className="flex gap-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted" />
        </div>
        <span className="text-[10px] text-muted-foreground">Significance: High</span>
      </div>
    </div>
  )
}

/**
 * Alerts preview with notification badges
 */
function AlertsPreview() {
  const alerts = [
    { ticker: 'AAPL', type: 'buy', message: 'CEO purchased $2.1M', time: '2m' },
    { ticker: 'TSLA', type: 'cluster', message: '3 insiders buying', time: '15m' },
    { ticker: 'NVDA', type: 'sell', message: 'CFO sold $890K', time: '1h' },
  ]

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded border bg-background p-2 transition-colors hover:bg-muted/50"
        >
          {/* Icon */}
          <div
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
              alert.type === 'buy'
                ? 'bg-emerald-100 text-emerald-600'
                : alert.type === 'sell'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-blue-100 text-blue-600'
            }`}
          >
            {alert.type === 'buy' ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : alert.type === 'sell' ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : (
              <Bell className="h-3 w-3" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs">{alert.ticker}</span>
              <span className="text-[10px] text-muted-foreground truncate">
                {alert.message}
              </span>
            </div>
          </div>

          {/* Time */}
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {alert.time}
          </span>
        </div>
      ))}
    </div>
  )
}
