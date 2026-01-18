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
    <section className="bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {/* SEC EDGAR - TRUE: We fetch data from SEC */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
              <FileCheck className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">SEC EDGAR</p>
              <p className="text-xs text-slate-500">Official SEC filings</p>
            </div>
          </div>

          {/* OpenFIGI - TRUE: Used for CUSIP lookups */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
              <Database className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">OpenFIGI</p>
              <p className="text-xs text-slate-500">Security identifiers</p>
            </div>
          </div>

          {/* AI Powered - TRUE: Uses Claude for context generation */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
              <Cpu className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">AI-Powered</p>
              <p className="text-xs text-slate-500">Claude analysis</p>
            </div>
          </div>

          {/* SSL/TLS - TRUE: Vercel provides this by default */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">256-bit SSL</p>
              <p className="text-xs text-slate-500">Encrypted connection</p>
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
