'use client'

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
import { Badge } from '@/components/ui/badge'
import { InsiderActivityChart } from '@/components/charts/insider-activity-chart'
import { HoldingsPieChart } from '@/components/charts/holdings-pie-chart'
import { SignificanceIndicator } from '@/components/dashboard/significance-badge'
import { StatCard } from '@/components/dashboard/stat-card'
import { format, formatDistanceToNow } from 'date-fns'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { InsiderTransactionWithDetails } from '@/types/database'

interface ActivityDataPoint {
  date: string
  buys: number
  sells: number
  [key: string]: string | number
}

interface HolderData {
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

interface CompanyTabsProps {
  transactions: InsiderTransactionWithDetails[]
  holders: HolderData[]
  activityData: ActivityDataPoint[]
  stats: {
    ytdBuys: number
    ytdSells: number
    ytdBuyValue: number
    ytdSellValue: number
  }
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

export function CompanyTabs({
  transactions,
  holders,
  activityData,
  stats,
}: CompanyTabsProps) {
  const netChange = stats.ytdBuyValue - stats.ytdSellValue

  // Prepare holder data for pie chart
  const pieChartData = holders.slice(0, 10).map((h) => ({
    name: h.institution_name,
    value: h.value,
    percent: h.percent_of_portfolio || 0,
  }))

  // Get transactions with AI context
  const transactionsWithContext = transactions.filter((t) => t.ai_context)

  return (
    <Tabs defaultValue="insider" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="insider">Insider Activity</TabsTrigger>
        <TabsTrigger value="institutional">Institutional</TabsTrigger>
        <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
      </TabsList>

      {/* Tab 1: Insider Activity */}
      <TabsContent value="insider" className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="YTD Buys"
            value={formatCurrency(stats.ytdBuyValue)}
            icon={TrendingUp}
            iconColor="text-buy"
            change={{
              value: stats.ytdBuys,
              label: 'transactions',
            }}
          />
          <StatCard
            title="YTD Sells"
            value={formatCurrency(stats.ytdSellValue)}
            icon={TrendingDown}
            iconColor="text-sell"
            change={{
              value: stats.ytdSells,
              label: 'transactions',
            }}
          />
          <StatCard
            title="Net Change"
            value={formatCurrency(Math.abs(netChange))}
            icon={netChange >= 0 ? TrendingUp : TrendingDown}
            iconColor={netChange >= 0 ? 'text-buy' : 'text-sell'}
          />
        </div>

        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Insider Activity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <InsiderActivityChart data={activityData} height={250} />
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Insider</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(txn.filed_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{txn.insider_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {txn.insider_title || 'Insider'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              txn.transaction_type === 'P'
                                ? 'success'
                                : txn.transaction_type === 'S'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {txn.transaction_type === 'P' && (
                              <ArrowUpRight className="mr-1 h-3 w-3" />
                            )}
                            {txn.transaction_type === 'S' && (
                              <ArrowDownRight className="mr-1 h-3 w-3" />
                            )}
                            {txn.transaction_type === 'P'
                              ? 'BUY'
                              : txn.transaction_type === 'S'
                                ? 'SELL'
                                : txn.transaction_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(txn.shares)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(txn.total_value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No insider transactions found
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab 2: Institutional Holders */}
      <TabsContent value="institutional" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Institutional Holders</CardTitle>
            </CardHeader>
            <CardContent>
              {pieChartData.length > 0 ? (
                <HoldingsPieChart data={pieChartData} height={300} />
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No institutional holdings data
                </p>
              )}
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Holdings Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Institutions</span>
                <span className="font-medium">{holders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-medium">
                  {formatCurrency(holders.reduce((sum, h) => sum + h.value, 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Positions</span>
                <span className="font-medium text-buy">
                  {holders.filter((h) => h.is_new_position).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Increased</span>
                <span className="font-medium text-buy">
                  {holders.filter((h) => (h.shares_change || 0) > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Decreased</span>
                <span className="font-medium text-sell">
                  {holders.filter((h) => (h.shares_change || 0) < 0).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Institutional Holders</CardTitle>
          </CardHeader>
          <CardContent>
            {holders.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">% Portfolio</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holders.map((holder) => (
                      <TableRow key={holder.institution_id}>
                        <TableCell>
                          <p className="font-medium">{holder.institution_name}</p>
                          {holder.institution_type && (
                            <p className="text-xs text-muted-foreground">
                              {holder.institution_type}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(holder.shares)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(holder.value)}
                        </TableCell>
                        <TableCell className="text-right">
                          {holder.percent_of_portfolio
                            ? `${holder.percent_of_portfolio.toFixed(2)}%`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {holder.is_new_position ? (
                            <Badge variant="success" className="text-xs">
                              NEW
                            </Badge>
                          ) : holder.shares_change !== null ? (
                            <span
                              className={
                                holder.shares_change > 0
                                  ? 'text-buy'
                                  : holder.shares_change < 0
                                    ? 'text-sell'
                                    : 'text-muted-foreground'
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
              <p className="text-center py-8 text-muted-foreground">
                No institutional holdings data available
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab 3: AI Analysis */}
      <TabsContent value="analysis" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI-Generated Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsWithContext.length > 0 ? (
              <div className="space-y-4">
                {transactionsWithContext.map((txn) => (
                  <div key={txn.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              txn.transaction_type === 'P'
                                ? 'success'
                                : txn.transaction_type === 'S'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {txn.transaction_type === 'P' ? 'BUY' : 'SELL'}
                          </Badge>
                          <span className="font-medium">{txn.insider_name}</span>
                          <span className="text-sm text-muted-foreground">
                            {txn.insider_title}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(txn.total_value)} ·{' '}
                          {formatDistanceToNow(new Date(txn.filed_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <SignificanceIndicator score={txn.ai_significance_score} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {txn.ai_context}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg font-medium">No AI analysis available</p>
                <p className="text-sm text-muted-foreground">
                  AI context is generated for recent transactions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
