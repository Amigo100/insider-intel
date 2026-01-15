import { format } from 'date-fns'

interface InstantAlertProps {
  userName: string
  ticker: string
  companyName: string
  insiderName: string
  insiderTitle: string | null
  transactionType: 'P' | 'S'
  shares: number
  pricePerShare: number
  totalValue: number
  isDirector: boolean
  isOfficer: boolean
  isTenPercentOwner: boolean
  filedAt: Date
  aiContext?: string | null
  significanceScore?: number | null
}

export function generateInstantAlertHtml(props: InstantAlertProps): string {
  const {
    userName,
    ticker,
    companyName,
    insiderName,
    insiderTitle,
    transactionType,
    shares,
    pricePerShare,
    totalValue,
    isDirector,
    isOfficer,
    isTenPercentOwner,
    filedAt,
    aiContext,
    significanceScore,
  } = props

  const isBuy = transactionType === 'P'
  const actionColor = isBuy ? '#059669' : '#dc2626'
  const actionBg = isBuy ? '#ecfdf5' : '#fef2f2'
  const actionText = isBuy ? 'BUY' : 'SELL'

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US').format(value)

  const roles: string[] = []
  if (isOfficer) roles.push('Officer')
  if (isDirector) roles.push('Director')
  if (isTenPercentOwner) roles.push('10%+ Owner')
  const rolesText = roles.length > 0 ? roles.join(', ') : 'Insider'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Insider Trading Alert - ${ticker}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb;">
    <h1 style="margin: 0; color: #111827; font-size: 24px;">InsiderIntel</h1>
    <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Instant Alert</p>
  </div>

  <!-- Alert Banner -->
  <div style="background: ${actionBg}; border-left: 4px solid ${actionColor}; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="background: ${actionColor}; color: white; padding: 4px 12px; border-radius: 4px; font-weight: 700; font-size: 14px;">
        ${actionText}
      </span>
      <span style="font-size: 20px; font-weight: 700; color: #111827;">
        ${ticker}
      </span>
      ${significanceScore && significanceScore >= 7 ? `
      <span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
        High Significance
      </span>
      ` : ''}
    </div>
  </div>

  <!-- Greeting -->
  <p style="margin: 0 0 24px;">Hi ${userName}, a significant insider transaction was just filed:</p>

  <!-- Transaction Details -->
  <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 16px; font-size: 18px; color: #111827;">${companyName}</h2>

    <table style="width: 100%; font-size: 14px;">
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Insider</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">
          ${insiderName}
          ${insiderTitle ? `<br><span style="font-weight: normal; color: #6b7280;">${insiderTitle}</span>` : ''}
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Role</td>
        <td style="padding: 8px 0; text-align: right; color: #111827;">${rolesText}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Transaction</td>
        <td style="padding: 8px 0; text-align: right;">
          <span style="color: ${actionColor}; font-weight: 600;">${actionText}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Shares</td>
        <td style="padding: 8px 0; text-align: right; color: #111827;">${formatNumber(shares)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Price per Share</td>
        <td style="padding: 8px 0; text-align: right; color: #111827;">${formatCurrency(pricePerShare)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280; border-top: 1px solid #e5e7eb;">Total Value</td>
        <td style="padding: 8px 0; text-align: right; font-size: 18px; font-weight: 700; color: #111827; border-top: 1px solid #e5e7eb;">
          ${formatCurrency(totalValue)}
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Filed</td>
        <td style="padding: 8px 0; text-align: right; color: #111827;">${format(filedAt, 'MMM d, yyyy h:mm a')}</td>
      </tr>
    </table>
  </div>

  ${aiContext ? `
  <!-- AI Analysis -->
  <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 12px; font-size: 14px; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em;">
      AI Analysis
    </h3>
    <p style="margin: 0; color: #1e3a8a; font-size: 14px;">${aiContext}</p>
  </div>
  ` : ''}

  <!-- CTA -->
  <div style="text-align: center; padding: 24px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com'}/company/${ticker}"
       style="display: inline-block; background: #111827; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
      View ${ticker} Details
    </a>
  </div>

  <!-- Footer -->
  <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">You're receiving this because you enabled instant alerts for your watchlist.</p>
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

export function generateInstantAlertText(props: InstantAlertProps): string {
  const {
    userName,
    ticker,
    companyName,
    insiderName,
    insiderTitle,
    transactionType,
    shares,
    pricePerShare,
    totalValue,
    isDirector,
    isOfficer,
    isTenPercentOwner,
    filedAt,
    aiContext,
  } = props

  const actionText = transactionType === 'P' ? 'BUY' : 'SELL'

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)

  const roles: string[] = []
  if (isOfficer) roles.push('Officer')
  if (isDirector) roles.push('Director')
  if (isTenPercentOwner) roles.push('10%+ Owner')
  const rolesText = roles.length > 0 ? roles.join(', ') : 'Insider'

  let text = `InsiderIntel Instant Alert
${'='.repeat(50)}

${actionText} ALERT: ${ticker}

Hi ${userName},

A significant insider transaction was just filed:

TRANSACTION DETAILS
-------------------
Company: ${companyName} (${ticker})
Insider: ${insiderName}${insiderTitle ? ` - ${insiderTitle}` : ''}
Role: ${rolesText}
Transaction: ${actionText}
Shares: ${shares.toLocaleString()}
Price per Share: ${formatCurrency(pricePerShare)}
Total Value: ${formatCurrency(totalValue)}
Filed: ${format(filedAt, 'MMM d, yyyy h:mm a')}
`

  if (aiContext) {
    text += `
AI ANALYSIS
-----------
${aiContext}
`
  }

  text += `
---
View details: ${process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com'}/company/${ticker}
Manage preferences: ${process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com'}/settings/notifications
`

  return text
}
