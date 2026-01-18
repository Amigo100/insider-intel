import { Quote, TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Skip to form link for keyboard navigation */}
      <a
        href="#auth-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[hsl(var(--accent-amber))] focus:text-[hsl(var(--bg-app))] focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-amber))] focus:ring-offset-2"
      >
        Skip to form
      </a>

      {/* Left Panel - Testimonial/Stats (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" aria-hidden="true">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D]">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
          {/* Gradient orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[rgba(255,160,40,0.15)] blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[rgba(0,200,83,0.08)] blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <Logo variant="light" size="lg" />

          {/* Main Content */}
          <div className="space-y-8">
            {/* Feature highlights - honest, verifiable claims */}
            <div className="grid grid-cols-2 gap-6">
              <StatCard
                icon={DollarSign}
                value="Form 4"
                label="Insider transaction filings"
              />
              <StatCard
                icon={Users}
                value="13F"
                label="Institutional holdings"
              />
              <StatCard
                icon={TrendingUp}
                value="SEC"
                label="Official data source"
              />
              <StatCard
                icon={TrendingDown}
                value="AI"
                label="Powered analysis"
              />
            </div>

            {/* Value proposition - honest description, no fake testimonial */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] backdrop-blur-sm p-6">
              <Quote className="h-8 w-8 text-[rgba(255,160,40,0.6)] mb-4" />
              <blockquote className="text-lg font-medium leading-relaxed text-[rgba(255,255,255,0.9)] mb-4">
                Track what company insiders are doing with their own money.
                When executives and directors buy or sell shares, it can signal
                their confidence in the company&apos;s future.
              </blockquote>
              <p className="text-sm text-[rgba(255,255,255,0.6)] leading-relaxed">
                InsiderIntel aggregates SEC Form 4 and 13F filings to help you
                spot trends in insider and institutional trading activity.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/40">
            <p>Data sourced from official SEC EDGAR filings</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Background Pattern (visible on both mobile and desktop) */}
        <div className="fixed inset-0 -z-10 lg:left-1/2">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[310px] w-[310px] rounded-full bg-primary/10 opacity-30 blur-[100px]" />
        </div>

        {/* Mobile Header (shown only on mobile) */}
        <header className="p-6 lg:hidden">
          <Logo variant="dark" size="md" />
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div id="auth-form" className="w-full max-w-md animate-fade-in-up">{children}</div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} InsiderIntel. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  value: string
  label: string
}

function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] backdrop-blur-sm p-5 hover:bg-[rgba(255,255,255,0.08)] transition-colors">
      <div className="w-10 h-10 rounded-lg bg-[rgba(255,160,40,0.15)] flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-[#FFA028]" />
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-sm text-[rgba(255,255,255,0.6)]">{label}</p>
    </div>
  )
}
