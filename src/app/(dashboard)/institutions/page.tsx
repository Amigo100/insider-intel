import type { Metadata } from 'next'
import { Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  InstitutionsTabs,
  InstitutionalHolding,
  NewPositionsSection,
  TopMovementsSection,
} from '@/components/dashboard/institutions-tabs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Institutional Holdings',
  description:
    'Track 13F filings from hedge funds and institutional investors. See what the biggest players are buying and selling.',
}

async function getInstitutionsData() {
  const supabase = await createClient()

  // Get all institutional holdings for the tabs view
  const { data: holdingsRaw } = await supabase
    .from('v_institutional_holdings')
    .select('*')
    .order('value', { ascending: false })
    .limit(500)

  // Transform to InstitutionalHolding format
  const holdings: InstitutionalHolding[] = (holdingsRaw || [])
    .filter(
      (h) =>
        h.id &&
        h.institution_id &&
        h.institution_name &&
        h.company_id &&
        h.ticker &&
        h.company_name
    )
    .map((h) => ({
      id: h.id,
      institution_id: h.institution_id,
      institution_name: h.institution_name,
      institution_type: h.institution_type,
      company_id: h.company_id,
      ticker: h.ticker,
      company_name: h.company_name,
      shares: h.shares || 0,
      value: h.value || 0,
      shares_change: h.shares_change,
      shares_change_percent: h.shares_change
        ? ((h.shares_change / ((h.shares || 1) - (h.shares_change || 0))) * 100)
        : null,
      is_new_position: h.is_new_position || false,
      is_closed_position: h.is_closed_position || false,
      report_date: h.report_date || '',
    }))

  // Get new positions for the summary section (grouped by company)
  const newPositionsMap = new Map<
    string,
    {
      company_id: string
      ticker: string
      company_name: string
      new_buyers: number
      total_value: number
      notable_names: string[]
    }
  >()

  for (const h of holdings.filter((h) => h.is_new_position)) {
    const existing = newPositionsMap.get(h.company_id)
    if (existing) {
      existing.new_buyers++
      existing.total_value += h.value
      if (existing.notable_names.length < 5) {
        existing.notable_names.push(h.institution_name)
      }
    } else {
      newPositionsMap.set(h.company_id, {
        company_id: h.company_id,
        ticker: h.ticker,
        company_name: h.company_name,
        new_buyers: 1,
        total_value: h.value,
        notable_names: [h.institution_name],
      })
    }
  }

  const newPositions = Array.from(newPositionsMap.values())
    .sort((a, b) => b.new_buyers - a.new_buyers)
    .slice(0, 20)

  // Aggregate by company for top bought
  const boughtMap = new Map<
    string,
    {
      ticker: string
      company_name: string
      net_change: number
      institution_count: number
    }
  >()

  const soldMap = new Map<
    string,
    {
      ticker: string
      company_name: string
      net_change: number
      institution_count: number
    }
  >()

  for (const h of holdings) {
    const change = h.shares_change || 0

    if (change > 0 && !h.is_new_position) {
      const existing = boughtMap.get(h.company_id)
      if (existing) {
        existing.net_change += change
        existing.institution_count++
      } else {
        boughtMap.set(h.company_id, {
          ticker: h.ticker,
          company_name: h.company_name,
          net_change: change,
          institution_count: 1,
        })
      }
    } else if (change < 0 && !h.is_closed_position) {
      const existing = soldMap.get(h.company_id)
      if (existing) {
        existing.net_change += change
        existing.institution_count++
      } else {
        soldMap.set(h.company_id, {
          ticker: h.ticker,
          company_name: h.company_name,
          net_change: change,
          institution_count: 1,
        })
      }
    }
  }

  const topBought = Array.from(boughtMap.values())
    .sort((a, b) => b.net_change - a.net_change)
    .slice(0, 10)

  const topSold = Array.from(soldMap.values())
    .sort((a, b) => a.net_change - b.net_change)
    .slice(0, 10)

  return {
    holdings,
    newPositions,
    topBought,
    topSold,
  }
}

export default async function InstitutionsPage() {
  const data = await getInstitutionsData()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className={cn(
              'text-2xl font-bold tracking-tight',
              'text-[hsl(var(--text-primary))]'
            )}
          >
            Institutional Holdings
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--text-muted))]">
            Track 13F filings and institutional ownership changes
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-2',
            'border-[hsl(var(--border-default))]',
            'text-[hsl(var(--text-secondary))]',
            'hover:bg-[hsl(var(--bg-hover))]',
            'hover:text-[hsl(var(--text-primary))]'
          )}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      {/* Tabs with filter bar and table */}
      <InstitutionsTabs holdings={data.holdings} />

      {/* New Positions Section */}
      <NewPositionsSection positions={data.newPositions} />

      {/* Top Bought/Sold Section */}
      <TopMovementsSection topBought={data.topBought} topSold={data.topSold} />
    </div>
  )
}
