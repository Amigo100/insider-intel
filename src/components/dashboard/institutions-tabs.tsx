'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Building2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import EmptyState from '@/components/dashboard/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

interface Institution {
  id: string
  cik: string
  name: string
  institution_type: string | null
  aum_estimate: number | null
  holdings_count?: number
}

interface TopHolder {
  institution_id: string
  institution_name: string
  institution_type: string | null
  shares: number
  value: number
  percent_of_portfolio: number | null
  shares_change: number | null
  shares_change_percent: number | null
  is_new_position: boolean
}

interface NewPosition {
  company_id: string
  ticker: string
  company_name: string
  new_buyers: number
  total_value: number
  notable_names: string[]
}

interface TopMovement {
  ticker: string
  company_name: string
  net_change: number
  institution_count: number
}

interface InstitutionsTabsProps {
  institutions: Institution[]
  newPositions: NewPosition[]
  topBought: TopMovement[]
  topSold: TopMovement[]
}

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value)
}

function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value)
}

function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function InstitutionsTabs({
  institutions,
  newPositions,
  topBought,
  topSold,
}: InstitutionsTabsProps) {
  return (
    <Tabs defaultValue="by-stock" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="by-stock">By Stock</TabsTrigger>
        <TabsTrigger value="by-institution">By Institution</TabsTrigger>
      </TabsList>

      {/* Tab 1: By Stock */}
      <TabsContent value="by-stock" className="space-y-6">
        <ByStockTab />
      </TabsContent>

      {/* Tab 2: By Institution */}
      <TabsContent value="by-institution" className="space-y-6">
        <ByInstitutionTab institutions={institutions} />
      </TabsContent>
    </Tabs>
  )
}

function ByStockTab() {
  const [ticker, setTicker] = useState('')
  const [searchedTicker, setSearchedTicker] = useState('')
  const [holders, setHolders] = useState<TopHolder[]>([])
  const [activity, setActivity] = useState<{
    totalBuyers: number
    totalSellers: number
    sentiment: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!ticker.trim()) return

    setLoading(true)
    setError(null)

    try {
      // Fetch holders
      const holdersRes = await fetch(
        `/api/institutional/holders/${ticker.toUpperCase()}`
      )
      if (!holdersRes.ok) {
        if (holdersRes.status === 404) {
          setError('Company not found')
        } else {
          setError('Failed to fetch data')
        }
        setHolders([])
        setActivity(null)
        return
      }
      const holdersData = await holdersRes.json()
      setHolders(holdersData.holders || [])

      // Fetch activity
      const activityRes = await fetch(
        `/api/institutional/activity/${ticker.toUpperCase()}`
      )
      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setActivity(activityData.activity)
      }

      setSearchedTicker(ticker.toUpperCase())
    } catch {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleQuickSearch = (tickerSymbol: string) => {
    setTicker(tickerSymbol)
    // We need to use a callback to search with the new value
    setLoading(true)
    setError(null)

    fetch(`/api/institutional/holders/${tickerSymbol}`)
      .then(async (holdersRes) => {
        if (!holdersRes.ok) {
          if (holdersRes.status === 404) {
            setError('Company not found')
          } else {
            setError('Failed to fetch data')
          }
          setHolders([])
          setActivity(null)
          return
        }
        const holdersData = await holdersRes.json()
        setHolders(holdersData.holders || [])

        const activityRes = await fetch(`/api/institutional/activity/${tickerSymbol}`)
        if (activityRes.ok) {
          const activityData = await activityRes.json()
          setActivity(activityData.activity)
        }

        setSearchedTicker(tickerSymbol)
      })
      .catch(() => {
        setError('Failed to fetch data')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Enter ticker symbol..."
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button variant="cyan" onClick={handleSearch} disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>
          {/* Quick ticker suggestions */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-slate-500">Try:</span>
            {['AAPL', 'MSFT', 'NVDA', 'TSLA'].map((tickerSuggestion) => (
              <button
                key={tickerSuggestion}
                type="button"
                onClick={() => handleQuickSearch(tickerSuggestion)}
                disabled={loading}
                aria-label={`Search for ${tickerSuggestion} institutional holders`}
                className="min-h-[36px] min-w-[52px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 text-slate-300 border border-white/10 hover:bg-cyan-400/10 hover:text-cyan-400 hover:border-cyan-400/30 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                {tickerSuggestion}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-500/30">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {searchedTicker && !error && (
        <>
          {/* Activity Summary */}
          {activity && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-400">Institutions Buying</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {activity.totalBuyers}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-400">Institutions Selling</p>
                  <p className="text-2xl font-bold text-red-400">
                    {activity.totalSellers}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-400">Sentiment</p>
                  <Badge
                    variant={
                      activity.sentiment === 'bullish'
                        ? 'success'
                        : activity.sentiment === 'bearish'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="mt-1"
                  >
                    {activity.sentiment.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Holders Table */}
          <Card>
            <CardHeader className="border-b border-white/[0.06]">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-cyan-400" />
                Top Institutional Holders - {searchedTicker}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {holders.length > 0 ? (
                <div className="rounded-lg border border-white/[0.06] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Institution</TableHead>
                        <TableHead className="text-right">Shares</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holders.slice(0, 20).map((holder) => (
                        <TableRow key={holder.institution_id}>
                          <TableCell>
                            <p className="font-medium text-white">{holder.institution_name}</p>
                            {holder.institution_type && (
                              <p className="text-xs text-slate-400">
                                {holder.institution_type}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono text-slate-200">
                            {formatNumber(holder.shares)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-slate-200">
                            {formatCurrency(holder.value)}
                          </TableCell>
                          <TableCell className="text-right">
                            {holder.is_new_position ? (
                              <Badge variant="success" className="text-xs">
                                NEW
                              </Badge>
                            ) : holder.shares_change_percent !== null ? (
                              <span
                                className={
                                  holder.shares_change_percent > 0
                                    ? 'text-emerald-400'
                                    : holder.shares_change_percent < 0
                                      ? 'text-red-400'
                                      : 'text-slate-400'
                                }
                              >
                                {formatPercent(holder.shares_change_percent)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center py-8 text-slate-500 text-sm">
                  No institutional holders found
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Initial state */}
      {!searchedTicker && !loading && (
        <EmptyState
          icon={Building2}
          title="Search for a stock"
          description="Enter a ticker symbol above to see which hedge funds and institutions hold positions. Try AAPL, MSFT, or NVDA."
        />
      )}
    </div>
  )
}

function ByInstitutionTab({ institutions }: { institutions: Institution[] }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Search institutions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Institutions List */}
      <Card>
        <CardContent className="pt-6">
          {filteredInstitutions.length > 0 ? (
            <div className="rounded-lg border border-white/[0.06] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Est. AUM</TableHead>
                    <TableHead className="text-right">Holdings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstitutions.slice(0, 50).map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell>
                        <Link
                          href={`/institution/${inst.cik}`}
                          className="font-medium text-white hover:text-cyan-400 transition-colors"
                        >
                          {inst.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {inst.institution_type ? (
                          <Badge variant="outline">{inst.institution_type}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-200">
                        {formatCurrency(inst.aum_estimate)}
                      </TableCell>
                      <TableCell className="text-right text-slate-200">
                        {inst.holdings_count || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="Search for an institution"
              description="Enter an institution name to view their complete portfolio holdings and recent position changes."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function NewPositionsSection({
  positions,
}: {
  positions: NewPosition[]
}) {
  const [typeFilter, setTypeFilter] = useState<string>('all')

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/[0.06] p-4">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          New Institutional Positions
        </CardTitle>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="hedge-fund">Hedge Funds</SelectItem>
            <SelectItem value="mutual-fund">Mutual Funds</SelectItem>
            <SelectItem value="pension">Pensions</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        {positions.length > 0 ? (
          <div className="rounded-lg border border-white/[0.06] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right"># New Buyers</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead>Notable Names</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.slice(0, 10).map((pos) => (
                  <TableRow key={pos.company_id}>
                    <TableCell>
                      <Link
                        href={`/company/${pos.ticker}`}
                        className="font-medium text-white hover:text-cyan-400 transition-colors"
                      >
                        {pos.ticker}
                      </Link>
                      <p className="text-xs text-slate-400 truncate max-w-[150px]">
                        {pos.company_name}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="success">{pos.new_buyers}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-slate-200">
                      {formatCurrency(pos.total_value)}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-400 truncate max-w-[200px]">
                        {pos.notable_names.slice(0, 2).join(', ')}
                        {pos.notable_names.length > 2 && '...'}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center py-8 text-slate-500 text-sm">
            No new positions this quarter
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function TopMovementsSection({
  topBought,
  topSold,
}: {
  topBought: TopMovement[]
  topSold: TopMovement[]
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Most Bought */}
      <Card>
        <CardHeader className="border-b border-white/[0.06] p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Most Bought by Institutions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {topBought.length > 0 ? (
            <div className="space-y-3">
              {topBought.slice(0, 5).map((item, index) => (
                <Link
                  key={item.ticker}
                  href={`/company/${item.ticker}`}
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] p-3 hover:bg-white/[0.02] hover:border-white/[0.12] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-400">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">{item.ticker}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[120px]">
                        {item.company_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-emerald-400">
                      +{formatNumber(item.net_change)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.institution_count} institutions
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-slate-500 text-sm">No data</p>
          )}
        </CardContent>
      </Card>

      {/* Most Sold */}
      <Card>
        <CardHeader className="border-b border-white/[0.06] p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-400" />
            Most Sold by Institutions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {topSold.length > 0 ? (
            <div className="space-y-3">
              {topSold.slice(0, 5).map((item, index) => (
                <Link
                  key={item.ticker}
                  href={`/company/${item.ticker}`}
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] p-3 hover:bg-white/[0.02] hover:border-white/[0.12] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-400">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">{item.ticker}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[120px]">
                        {item.company_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-red-400">
                      {formatNumber(item.net_change)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.institution_count} institutions
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-slate-500 text-sm">No data</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
