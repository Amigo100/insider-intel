import { format, startOfWeek, endOfWeek } from 'date-fns'

interface TopMover {
  ticker: string
  companyName: string
  buyValue: number
  sellValue: number
  netValue: number
  transactionCount: number
}

interface WeeklyStats {
  totalTransactions: number
  totalBuyValue: number
  totalSellValue: number
  uniqueCompanies: number
  uniqueInsiders: number
}

interface WeeklySummaryProps {
  userName: string
  weekStart: Date
  weekEnd: Date
  stats: WeeklyStats
  topBuys: TopMover[]
  topSells: TopMover[]
  watchlistActivity: {
    ticker: string
    companyName: string
    transactionCount: number
    totalValue: number
  }[]
}

export function generateWeeklySummaryHtml(props: WeeklySummaryProps): string {
  const {
    userName,
    weekStart,
    weekEnd,
    stats,
    topBuys,
    topSells,
    watchlistActivity,
  } = props

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  const formatCompact = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
    return formatCurrency(value)
  }

  const moverRow = (m: TopMover, type: 'buy' | 'sell') => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong style="color: #111827;">${m.ticker}</strong>
        <br>
        <span style="color: #6b7280; font-size: 12px;">${m.companyName}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${m.transactionCount} trades
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <span style="color: ${type === 'buy' ? '#059669' : '#dc2626'}; font-weight: 600;">
          ${formatCompact(type === 'buy' ? m.buyValue : m.sellValue)}
        </span>
      </td>
    </tr>
  `

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Insider Trading Summary</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb;">
    <h1 style="margin: 0; color: #111827; font-size: 24px;">InsiderIntel</h1>
    <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Weekly Summary</p>
  </div>

  <!-- Date Range -->
  <div style="text-align: center; padding: 24px 0;">
    <h2 style="margin: 0; color: #111827; font-size: 20px;">
      ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}
    </h2>
    <p style="margin: 8px 0 0; color: #6b7280;">Hi ${userName}, here's your weekly insider trading roundup.</p>
  </div>

  <!-- Market Overview Stats -->
  <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">
      Market Overview
    </h3>
    <table style="width: 100%;">
      <tr>
        <td style="padding: 8px; text-align: center; width: 33%;">
          <div style="font-size: 28px; font-weight: 700; color: #111827;">${stats.totalTransactions}</div>
          <div style="font-size: 12px; color: #6b7280;">Total Trades</div>
        </td>
        <td style="padding: 8px; text-align: center; width: 33%;">
          <div style="font-size: 28px; font-weight: 700; color: #059669;">${formatCompact(stats.totalBuyValue)}</div>
          <div style="font-size: 12px; color: #6b7280;">Total Buys</div>
        </td>
        <td style="padding: 8px; text-align: center; width: 33%;">
          <div style="font-size: 28px; font-weight: 700; color: #dc2626;">${formatCompact(stats.totalSellValue)}</div>
          <div style="font-size: 12px; color: #6b7280;">Total Sells</div>
        </td>
      </tr>
    </table>
    <div style="border-top: 1px solid #e5e7eb; margin-top: 16px; padding-top: 16px; display: flex; justify-content: space-around; text-align: center;">
      <div>
        <span style="font-weight: 600; color: #111827;">${stats.uniqueCompanies}</span>
        <span style="color: #6b7280; font-size: 14px;"> companies</span>
      </div>
      <div>
        <span style="font-weight: 600; color: #111827;">${stats.uniqueInsiders}</span>
        <span style="color: #6b7280; font-size: 14px;"> insiders</span>
      </div>
    </div>
  </div>

  ${topBuys.length > 0 ? `
  <!-- Top Buys -->
  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 16px; color: #111827; margin: 0 0 12px; display: flex; align-items: center; gap: 8px;">
      <span style="background: #ecfdf5; color: #059669; padding: 4px 8px; border-radius: 4px; font-size: 12px;">TOP BUYS</span>
      Biggest Insider Purchases
    </h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background: #f9fafb;">
          <th style="padding: 10px; text-align: left; font-weight: 600; color: #374151;">Stock</th>
          <th style="padding: 10px; text-align: right; font-weight: 600; color: #374151;">Activity</th>
          <th style="padding: 10px; text-align: right; font-weight: 600; color: #374151;">Value</th>
        </tr>
      </thead>
      <tbody>
        ${topBuys.slice(0, 5).map(m => moverRow(m, 'buy')).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${topSells.length > 0 ? `
  <!-- Top Sells -->
  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 16px; color: #111827; margin: 0 0 12px; display: flex; align-items: center; gap: 8px;">
      <span style="background: #fef2f2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 12px;">TOP SELLS</span>
      Biggest Insider Sales
    </h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background: #f9fafb;">
          <th style="padding: 10px; text-align: left; font-weight: 600; color: #374151;">Stock</th>
          <th style="padding: 10px; text-align: right; font-weight: 600; color: #374151;">Activity</th>
          <th style="padding: 10px; text-align: right; font-weight: 600; color: #374151;">Value</th>
        </tr>
      </thead>
      <tbody>
        ${topSells.slice(0, 5).map(m => moverRow(m, 'sell')).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${watchlistActivity.length > 0 ? `
  <!-- Watchlist Activity -->
  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 16px; color: #111827; margin: 0 0 12px;">
      Your Watchlist Activity
    </h3>
    <div style="background: #eff6ff; border-radius: 8px; padding: 16px;">
      ${watchlistActivity.slice(0, 5).map(w => `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dbeafe;">
          <span style="font-weight: 600; color: #1e40af;">${w.ticker}</span>
          <span style="color: #1e3a8a;">${w.transactionCount} trades (${formatCompact(w.totalValue)})</span>
        </div>
      `).join('')}
    </div>
  </div>
  ` : `
  <div style="background: #f9fafb; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
    <p style="margin: 0; color: #6b7280;">No activity on your watchlist this week.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com'}/watchlist"
       style="color: #2563eb; text-decoration: none; font-size: 14px;">Add stocks to your watchlist &rarr;</a>
  </div>
  `}

  <!-- CTA -->
  <div style="text-align: center; padding: 24px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com'}/insider-trades"
       style="display: inline-block; background: #111827; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
      Explore All Trades
    </a>
  </div>

  <!-- Footer -->
  <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">You're receiving this because you enabled weekly summary emails.</p>
    <p style="margin: 8px 0 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com'}/settings/notifications" style="color: #6b7280;">Manage preferences</a>
      &nbsp;|&nbsp;
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com'}/settings/notifications" style="color: #6b7280;">Unsubscribe</a>
    </p>
    <p style="margin: 16px 0 0;">&copy; ${new Date().getFullYear()} InsiderIntel. All rights reserved.</p>
  </div>

</body>
</html>
  `
}

export function generateWeeklySummaryText(props: WeeklySummaryProps): string {
  const {
    userName,
    weekStart,
    weekEnd,
    stats,
    topBuys,
    topSells,
    watchlistActivity,
  } = props

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)

  let text = `InsiderIntel Weekly Summary
${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}
${'='.repeat(50)}

Hi ${userName},

Here's your weekly insider trading roundup.

MARKET OVERVIEW
---------------
Total Trades: ${stats.totalTransactions}
Total Buy Value: ${formatCurrency(stats.totalBuyValue)}
Total Sell Value: ${formatCurrency(stats.totalSellValue)}
Companies: ${stats.uniqueCompanies}
Insiders: ${stats.uniqueInsiders}

`

  if (topBuys.length > 0) {
    text += `TOP BUYS
--------
`
    topBuys.slice(0, 5).forEach((m, i) => {
      text += `${i + 1}. ${m.ticker} - ${m.companyName}
   ${m.transactionCount} trades, ${formatCurrency(m.buyValue)} total
`
    })
    text += '\n'
  }

  if (topSells.length > 0) {
    text += `TOP SELLS
---------
`
    topSells.slice(0, 5).forEach((m, i) => {
      text += `${i + 1}. ${m.ticker} - ${m.companyName}
   ${m.transactionCount} trades, ${formatCurrency(m.sellValue)} total
`
    })
    text += '\n'
  }

  if (watchlistActivity.length > 0) {
    text += `YOUR WATCHLIST
--------------
`
    watchlistActivity.slice(0, 5).forEach(w => {
      text += `${w.ticker}: ${w.transactionCount} trades (${formatCurrency(w.totalValue)})
`
    })
  } else {
    text += `No activity on your watchlist this week.
`
  }

  text += `
---
Explore all trades: ${process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com'}/insider-trades
Manage preferences: ${process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com'}/settings/notifications
`

  return text
}
