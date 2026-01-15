import { format } from 'date-fns'

interface Transaction {
  ticker: string
  companyName: string
  insiderName: string
  insiderTitle: string | null
  transactionType: 'P' | 'S'
  shares: number
  totalValue: number
  filedAt: string
}

interface DailyDigestProps {
  userName: string
  date: Date
  transactions: Transaction[]
  watchlistCount: number
}

export function generateDailyDigestHtml({
  userName,
  date,
  transactions,
  watchlistCount,
}: DailyDigestProps): string {
  const formattedDate = format(date, 'MMMM d, yyyy')
  const buyTransactions = transactions.filter((t) => t.transactionType === 'P')
  const sellTransactions = transactions.filter((t) => t.transactionType === 'S')

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US').format(value)

  const transactionRow = (t: Transaction) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong style="color: #111827;">${t.ticker}</strong>
        <br>
        <span style="color: #6b7280; font-size: 12px;">${t.companyName}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${t.insiderName}
        ${t.insiderTitle ? `<br><span style="color: #6b7280; font-size: 12px;">${t.insiderTitle}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <span style="color: ${t.transactionType === 'P' ? '#059669' : '#dc2626'}; font-weight: 600;">
          ${t.transactionType === 'P' ? 'Buy' : 'Sell'}
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${formatNumber(t.shares)} shares
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${formatCurrency(t.totalValue)}
      </td>
    </tr>
  `

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Insider Trading Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb;">
    <h1 style="margin: 0; color: #111827; font-size: 24px;">InsiderIntel</h1>
    <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Daily Digest</p>
  </div>

  <!-- Greeting -->
  <div style="padding: 24px 0;">
    <p style="margin: 0;">Hi ${userName},</p>
    <p style="margin: 12px 0 0;">Here's your insider trading summary for <strong>${formattedDate}</strong>.</p>
  </div>

  <!-- Summary Stats -->
  <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <div style="display: flex; justify-content: space-between; text-align: center;">
      <div style="flex: 1;">
        <div style="font-size: 24px; font-weight: 700; color: #111827;">${transactions.length}</div>
        <div style="font-size: 12px; color: #6b7280;">Total Trades</div>
      </div>
      <div style="flex: 1;">
        <div style="font-size: 24px; font-weight: 700; color: #059669;">${buyTransactions.length}</div>
        <div style="font-size: 12px; color: #6b7280;">Buys</div>
      </div>
      <div style="flex: 1;">
        <div style="font-size: 24px; font-weight: 700; color: #dc2626;">${sellTransactions.length}</div>
        <div style="font-size: 12px; color: #6b7280;">Sells</div>
      </div>
      <div style="flex: 1;">
        <div style="font-size: 24px; font-weight: 700; color: #111827;">${watchlistCount}</div>
        <div style="font-size: 12px; color: #6b7280;">Watchlist</div>
      </div>
    </div>
  </div>

  ${transactions.length > 0 ? `
  <!-- Transactions Table -->
  <div style="margin-bottom: 24px;">
    <h2 style="font-size: 18px; color: #111827; margin: 0 0 16px;">Today's Activity</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background: #f9fafb;">
          <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Stock</th>
          <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Insider</th>
          <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Type</th>
          <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Shares</th>
          <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Value</th>
        </tr>
      </thead>
      <tbody>
        ${transactions.map(transactionRow).join('')}
      </tbody>
    </table>
  </div>
  ` : `
  <div style="text-align: center; padding: 40px 20px; background: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
    <p style="margin: 0; color: #6b7280;">No insider trading activity on your watchlist today.</p>
  </div>
  `}

  <!-- CTA -->
  <div style="text-align: center; padding: 24px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com'}/dashboard"
       style="display: inline-block; background: #111827; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
      View Full Dashboard
    </a>
  </div>

  <!-- Footer -->
  <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">You're receiving this because you enabled daily digest emails.</p>
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

export function generateDailyDigestText({
  userName,
  date,
  transactions,
  watchlistCount,
}: DailyDigestProps): string {
  const formattedDate = format(date, 'MMMM d, yyyy')
  const buyTransactions = transactions.filter((t) => t.transactionType === 'P')
  const sellTransactions = transactions.filter((t) => t.transactionType === 'S')

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)

  let text = `InsiderIntel Daily Digest
${formattedDate}

Hi ${userName},

Here's your insider trading summary for today.

SUMMARY
- Total Trades: ${transactions.length}
- Buys: ${buyTransactions.length}
- Sells: ${sellTransactions.length}
- Watchlist Stocks: ${watchlistCount}

`

  if (transactions.length > 0) {
    text += `TODAY'S ACTIVITY
${'='.repeat(50)}
`
    for (const t of transactions) {
      text += `
${t.ticker} - ${t.companyName}
${t.insiderName}${t.insiderTitle ? ` (${t.insiderTitle})` : ''}
${t.transactionType === 'P' ? 'BUY' : 'SELL'}: ${t.shares.toLocaleString()} shares @ ${formatCurrency(t.totalValue)}
`
    }
  } else {
    text += `No insider trading activity on your watchlist today.
`
  }

  text += `
---
View full dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com'}/dashboard
Manage preferences: ${process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com'}/settings/notifications
`

  return text
}
