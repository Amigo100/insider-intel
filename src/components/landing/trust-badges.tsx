import { Database, Lock, FileCheck, Cpu } from 'lucide-react'

/**
 * Data sources and trust badges section
 * Shows where data comes from to add legitimacy
 *
 * IMPORTANT: Only display claims that are verifiably true
 * - SEC EDGAR: TRUE - data is fetched from SEC
 * - OpenFIGI: TRUE - used for CUSIP lookups
 * - AI-Powered: TRUE - uses Claude for analysis
 * - SSL: TRUE - Vercel provides HTTPS
 */
export function TrustBadges() {
  return (
    <section className="border-y bg-muted/20 py-12">
      <div className="container mx-auto px-4">
        <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
          OFFICIAL DATA SOURCES & TECHNOLOGY
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {/* SEC EDGAR - TRUE: We fetch data from SEC */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">SEC EDGAR</p>
              <p className="text-xs">Official SEC filings</p>
            </div>
          </div>

          {/* OpenFIGI - TRUE: Used for CUSIP lookups */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">OpenFIGI</p>
              <p className="text-xs">Security identifiers</p>
            </div>
          </div>

          {/* AI Powered - TRUE: Uses Claude for context generation */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">AI-Powered</p>
              <p className="text-xs">Claude analysis</p>
            </div>
          </div>

          {/* SSL/TLS - TRUE: Vercel provides this by default */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">256-bit SSL</p>
              <p className="text-xs">Encrypted connection</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Stats banner showing key metrics
 *
 * NOTE: These should ideally be fetched from the database for accuracy.
 * For now, these are conservative estimates based on SEC filing volumes.
 * Form 4 filings: ~150,000/year from SEC
 * Public companies: ~8,000 on major exchanges
 * 13F filers: ~5,000+ institutions file quarterly
 */
export function StatsBanner() {
  const stats = [
    { value: 'Form 4', label: 'Insider Filings' },
    { value: '13F', label: 'Institutional Filings' },
    { value: 'Daily', label: 'SEC Data Updates' },
    { value: 'AI', label: 'Powered Analysis' },
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
