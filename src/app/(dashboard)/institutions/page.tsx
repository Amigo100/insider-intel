import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  InstitutionsTabs,
  NewPositionsSection,
  TopMovementsSection,
} from '@/components/dashboard/institutions-tabs'

export const metadata: Metadata = {
  title: 'Institutional Holdings',
  description: 'Track 13F filings from hedge funds and institutional investors. See what the biggest players are buying and selling.',
}

async function getInstitutionsData() {
  const supabase = await createClient()

  // Get institutions with holdings count
  const { data: institutions } = await supabase
    .from('institutions')
    .select('id, cik, name, institution_type, aum_estimate')
    .order('aum_estimate', { ascending: false, nullsFirst: false })
    .limit(100)

  // Get new positions this quarter
  const { data: newPositionsRaw } = await supabase
    .from('v_institutional_holdings')
    .select('*')
    .eq('is_new_position', true)
    .order('value', { ascending: false })
    .limit(100)

  // Group new positions by company
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

  for (const pos of newPositionsRaw || []) {
    const existing = newPositionsMap.get(pos.company_id)
    if (existing) {
      existing.new_buyers++
      existing.total_value += pos.value
      if (existing.notable_names.length < 5) {
        existing.notable_names.push(pos.institution_name)
      }
    } else {
      newPositionsMap.set(pos.company_id, {
        company_id: pos.company_id,
        ticker: pos.ticker,
        company_name: pos.company_name,
        new_buyers: 1,
        total_value: pos.value,
        notable_names: [pos.institution_name],
      })
    }
  }

  const newPositions = Array.from(newPositionsMap.values())
    .sort((a, b) => b.new_buyers - a.new_buyers)
    .slice(0, 20)

  // Get top bought/sold
  const { data: holdingsWithChanges } = await supabase
    .from('v_institutional_holdings')
    .select('*')
    .not('shares_change', 'is', null)
    .order('shares_change', { ascending: false })
    .limit(500)

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

  for (const holding of holdingsWithChanges || []) {
    const change = holding.shares_change || 0

    if (change > 0) {
      const existing = boughtMap.get(holding.company_id)
      if (existing) {
        existing.net_change += change
        existing.institution_count++
      } else {
        boughtMap.set(holding.company_id, {
          ticker: holding.ticker,
          company_name: holding.company_name,
          net_change: change,
          institution_count: 1,
        })
      }
    } else if (change < 0) {
      const existing = soldMap.get(holding.company_id)
      if (existing) {
        existing.net_change += change
        existing.institution_count++
      } else {
        soldMap.set(holding.company_id, {
          ticker: holding.ticker,
          company_name: holding.company_name,
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
    institutions: institutions || [],
    newPositions,
    topBought,
    topSold,
  }
}

export default async function InstitutionsPage() {
  const data = await getInstitutionsData()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Institutional Holdings
        </h1>
        <p className="text-muted-foreground">
          Track 13F filings and institutional ownership changes
        </p>
      </div>

      {/* Tabs */}
      <InstitutionsTabs
        institutions={data.institutions}
        newPositions={data.newPositions}
        topBought={data.topBought}
        topSold={data.topSold}
      />

      {/* New Positions Section */}
      <NewPositionsSection positions={data.newPositions} />

      {/* Top Bought/Sold Section */}
      <TopMovementsSection
        topBought={data.topBought}
        topSold={data.topSold}
      />
    </div>
  )
}
