/**
 * Claude AI Client for Insider Transaction Analysis
 *
 * Generates contextual analysis and significance scores for insider transactions
 * using the Anthropic Claude API.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { InsiderTransactionWithDetails } from '@/types/database'
import { TransactionTypeLabels } from '@/types/database'
import { logger } from '@/lib/logger'

const log = logger.ai

// =============================================================================
// Types
// =============================================================================

/** AI-generated context response */
export interface AIContextResponse {
  context: string
  significanceScore: number
}

/** Result for batch processing */
export interface BatchContextResult {
  transactionId: string
  context: string | null
  significanceScore: number | null
  error?: string
}

// =============================================================================
// Client Initialization
// =============================================================================

let anthropicClient: Anthropic | null = null

/**
 * Get or create Anthropic client instance
 */
function getClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }

    anthropicClient = new Anthropic({
      apiKey,
    })
  }

  return anthropicClient
}

// =============================================================================
// Prompt Construction
// =============================================================================

/**
 * Build the analysis prompt for a transaction
 */
function buildPrompt(transaction: InsiderTransactionWithDetails): string {
  const transactionType = TransactionTypeLabels[transaction.transaction_type] || transaction.transaction_type

  const roles: string[] = []
  if (transaction.is_officer) roles.push('Officer')
  if (transaction.is_director) roles.push('Director')
  if (transaction.is_ten_percent_owner) roles.push('10% Owner')

  const roleString = roles.length > 0 ? roles.join(', ') : 'Unknown'
  const titleString = transaction.insider_title || 'Unknown Title'

  const valueFormatted = transaction.total_value
    ? `$${transaction.total_value.toLocaleString()}`
    : 'Unknown'

  const sharesFormatted = transaction.shares
    ? transaction.shares.toLocaleString()
    : 'Unknown'

  const priceFormatted = transaction.price_per_share
    ? `$${transaction.price_per_share.toFixed(2)}`
    : 'Unknown'

  return `Analyze this SEC Form 4 insider transaction and provide context on its significance:

Company: ${transaction.company_name} (${transaction.ticker})
Insider: ${transaction.insider_name}
Title: ${titleString}
Roles: ${roleString}
Transaction Type: ${transactionType}
Shares: ${sharesFormatted}
Price per Share: ${priceFormatted}
Total Value: ${valueFormatted}
Transaction Date: ${transaction.transaction_date}
10b5-1 Plan: ${transaction.is_10b5_1_plan ? 'Yes' : 'No'}

Provide your analysis as JSON with these fields:
- "context": A 2-3 sentence explanation of why this transaction matters (or doesn't) for investors. Be specific about what makes this noteworthy or routine.
- "significanceScore": A number from 0.0 to 1.0 indicating how significant this transaction is.

Scoring guidance:
- 0.0-0.2: Routine transactions (small amounts, 10b5-1 plans, regular compensation)
- 0.2-0.4: Minor significance (moderate sales, expected exercises)
- 0.4-0.6: Moderate significance (notable purchases, large but explainable sales)
- 0.6-0.8: High significance (large CEO/CFO purchases, unusual patterns)
- 0.8-1.0: Very high significance (massive insider buying, cluster buying by multiple insiders)

Key factors to consider:
- 10b5-1 pre-planned trades are generally routine (lower score)
- Open market purchases, especially by CEOs/CFOs, are more significant
- Sales can be for personal reasons (diversification, taxes) so usually less notable
- Transaction size relative to typical compensation matters
- Multiple insiders buying simultaneously is very significant

Respond ONLY with valid JSON, no other text:`
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Generate AI context for a single insider transaction
 *
 * @param transaction - Transaction with company and insider details
 * @returns AI context and significance score, or null on error
 *
 * @example
 * const result = await generateInsiderContext(transaction)
 * if (result) {
 *   console.log(result.context, result.significanceScore)
 * }
 */
export async function generateInsiderContext(
  transaction: InsiderTransactionWithDetails
): Promise<AIContextResponse | null> {
  try {
    const client = getClient()
    const prompt = buildPrompt(transaction)

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract text content from response
    const textContent = message.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      log.error('No text content in Claude response')
      return null
    }

    const responseText = textContent.text.trim()

    // Parse JSON response safely
    try {
      // Handle potential markdown code blocks
      let jsonText = responseText
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7)
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3)
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3)
      }
      jsonText = jsonText.trim()

      const parsed = JSON.parse(jsonText) as {
        context?: string
        significanceScore?: number
      }

      if (!parsed.context || typeof parsed.significanceScore !== 'number') {
        log.error({ parsed }, 'Invalid response structure')
        return null
      }

      // Clamp score to valid range
      const score = Math.max(0, Math.min(1, parsed.significanceScore))

      return {
        context: parsed.context,
        significanceScore: score,
      }
    } catch (parseError) {
      log.error({ responseText }, 'Failed to parse Claude response as JSON')
      return null
    }
  } catch (error) {
    log.error({ error }, 'Error calling Claude API')
    return null
  }
}

/**
 * Process a batch of transactions with limited concurrency
 *
 * @param transactions - Array of transactions to process
 * @param concurrency - Maximum concurrent API calls (default 5)
 * @returns Array of results with transaction IDs and context
 *
 * @example
 * const results = await generateBatchContext(transactions, 5)
 * for (const result of results) {
 *   if (result.context) {
 *     await updateTransactionAIContext(result.transactionId, result.context, result.significanceScore!)
 *   }
 * }
 */
export async function generateBatchContext(
  transactions: InsiderTransactionWithDetails[],
  concurrency: number = 5
): Promise<BatchContextResult[]> {
  const results: BatchContextResult[] = []

  // Process in chunks to limit concurrency
  for (let i = 0; i < transactions.length; i += concurrency) {
    const chunk = transactions.slice(i, i + concurrency)

    const chunkPromises = chunk.map(async (transaction): Promise<BatchContextResult> => {
      try {
        const response = await generateInsiderContext(transaction)

        if (response) {
          return {
            transactionId: transaction.id,
            context: response.context,
            significanceScore: response.significanceScore,
          }
        } else {
          return {
            transactionId: transaction.id,
            context: null,
            significanceScore: null,
            error: 'Failed to generate context',
          }
        }
      } catch (error) {
        return {
          transactionId: transaction.id,
          context: null,
          significanceScore: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    })

    const chunkResults = await Promise.all(chunkPromises)
    results.push(...chunkResults)

    // Small delay between chunks to avoid rate limiting
    if (i + concurrency < transactions.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return results
}

/**
 * Generate a summary of multiple transactions for a company
 *
 * Useful for generating aggregate insights when multiple insiders are trading.
 *
 * @param transactions - Array of recent transactions for a company
 * @returns Summary context or null on error
 */
export async function generateCompanySummary(
  transactions: InsiderTransactionWithDetails[]
): Promise<string | null> {
  if (transactions.length === 0) {
    return null
  }

  try {
    const client = getClient()

    const ticker = transactions[0].ticker
    const companyName = transactions[0].company_name

    const transactionSummaries = transactions.slice(0, 10).map((t) => {
      const type = TransactionTypeLabels[t.transaction_type] || t.transaction_type
      const value = t.total_value ? `$${t.total_value.toLocaleString()}` : 'Unknown'
      return `- ${t.insider_name} (${t.insider_title || 'Unknown'}): ${type} ${value} on ${t.transaction_date}`
    })

    const prompt = `Summarize the recent insider trading activity for ${companyName} (${ticker}):

Recent Transactions:
${transactionSummaries.join('\n')}

Provide a 2-3 sentence summary of the overall insider sentiment and any notable patterns. Focus on what this activity might signal to investors.`

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const textContent = message.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return null
    }

    return textContent.text.trim()
  } catch (error) {
    log.error({ error }, 'Error generating company summary')
    return null
  }
}
