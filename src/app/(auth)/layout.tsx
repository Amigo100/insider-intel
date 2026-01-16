import { Quote, TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Testimonial/Stats (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
          {/* Gradient orbs */}
          <div className="absolute top-1/4 -left-20 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute bottom-1/4 right-0 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[80px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <Logo variant="light" size="lg" />

          {/* Main Content */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <StatCard
                icon={DollarSign}
                value="$2.4B+"
                label="Insider transactions tracked"
              />
              <StatCard
                icon={Users}
                value="10,000+"
                label="Active investors"
              />
              <StatCard
                icon={TrendingUp}
                value="50,000+"
                label="Transactions this month"
              />
              <StatCard
                icon={TrendingDown}
                value="99.9%"
                label="Data accuracy"
              />
            </div>

            {/* Testimonial */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
              <Quote className="h-8 w-8 text-primary/60 mb-4" />
              <blockquote className="text-lg leading-relaxed text-white/90">
                &ldquo;InsiderIntel completely changed how I research stocks. Seeing what
                executives are doing with their own money gives me an edge I didn&apos;t
                have before. The cluster buying alerts alone have been worth the subscription.&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-lg font-semibold">
                  MR
                </div>
                <div>
                  <p className="font-semibold">Michael R.</p>
                  <p className="text-sm text-white/60">Portfolio Manager</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/40">
            <p>Trusted by professional and retail investors worldwide</p>
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
          <div className="w-full max-w-md">{children}</div>
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
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4">
      <Icon className="h-5 w-5 text-primary mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-white/60">{label}</p>
    </div>
  )
}
