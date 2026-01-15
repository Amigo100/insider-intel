import { Shield, Database, Lock, FileCheck } from 'lucide-react'

/**
 * Data sources and trust badges section
 * Shows where data comes from to add legitimacy
 */
export function TrustBadges() {
  return (
    <section className="border-y bg-muted/20 py-12">
      <div className="container mx-auto px-4">
        <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
          OFFICIAL DATA SOURCES & SECURITY
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {/* SEC EDGAR */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">SEC EDGAR</p>
              <p className="text-xs">Official SEC filings</p>
            </div>
          </div>

          {/* OpenFIGI */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">OpenFIGI</p>
              <p className="text-xs">Security identifiers</p>
            </div>
          </div>

          {/* SOC 2 placeholder */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">SOC 2</p>
              <p className="text-xs">Enterprise security</p>
            </div>
          </div>

          {/* SSL/TLS */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">256-bit SSL</p>
              <p className="text-xs">Bank-grade encryption</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Stats banner showing key metrics
 */
export function StatsBanner() {
  const stats = [
    { value: '50K+', label: 'Transactions Tracked' },
    { value: '8,000+', label: 'Companies Monitored' },
    { value: '500+', label: 'Institutions Tracked' },
    { value: '99.9%', label: 'Uptime' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <p className="text-3xl font-bold text-primary sm:text-4xl">
            {stat.value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
