import { getResendClient, getFromEmail } from './resend-client'
import {
  generateDailyDigestHtml,
  generateDailyDigestText,
  generateInstantAlertHtml,
  generateInstantAlertText,
  generateWeeklySummaryHtml,
  generateWeeklySummaryText,
} from './templates'

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

interface DailyDigestParams {
  to: string
  userName: string
  date: Date
  transactions: {
    ticker: string
    companyName: string
    insiderName: string
    insiderTitle: string | null
    transactionType: 'P' | 'S'
    shares: number
    totalValue: number
    filedAt: string
  }[]
  watchlistCount: number
}

export async function sendDailyDigestEmail(
  params: DailyDigestParams
): Promise<SendEmailResult> {
  try {
    const resend = getResendClient()

    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: params.to,
      subject: `Daily Insider Trading Digest - ${params.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      html: generateDailyDigestHtml({
        userName: params.userName,
        date: params.date,
        transactions: params.transactions,
        watchlistCount: params.watchlistCount,
      }),
      text: generateDailyDigestText({
        userName: params.userName,
        date: params.date,
        transactions: params.transactions,
        watchlistCount: params.watchlistCount,
      }),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

interface InstantAlertParams {
  to: string
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

export async function sendInstantAlertEmail(
  params: InstantAlertParams
): Promise<SendEmailResult> {
  try {
    const resend = getResendClient()
    const actionType = params.transactionType === 'P' ? 'BUY' : 'SELL'

    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: params.to,
      subject: `${actionType} Alert: ${params.ticker} - ${params.insiderName}`,
      html: generateInstantAlertHtml(params),
      text: generateInstantAlertText(params),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

interface WeeklySummaryParams {
  to: string
  userName: string
  weekStart: Date
  weekEnd: Date
  stats: {
    totalTransactions: number
    totalBuyValue: number
    totalSellValue: number
    uniqueCompanies: number
    uniqueInsiders: number
  }
  topBuys: {
    ticker: string
    companyName: string
    buyValue: number
    sellValue: number
    netValue: number
    transactionCount: number
  }[]
  topSells: {
    ticker: string
    companyName: string
    buyValue: number
    sellValue: number
    netValue: number
    transactionCount: number
  }[]
  watchlistActivity: {
    ticker: string
    companyName: string
    transactionCount: number
    totalValue: number
  }[]
}

export async function sendWeeklySummaryEmail(
  params: WeeklySummaryParams
): Promise<SendEmailResult> {
  try {
    const resend = getResendClient()

    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: params.to,
      subject: `Weekly Insider Trading Summary - Week of ${params.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      html: generateWeeklySummaryHtml(params),
      text: generateWeeklySummaryText(params),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
