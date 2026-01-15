/**
 * Cron Job Authentication
 *
 * Utility for verifying cron job requests are authorized.
 * In production, CRON_SECRET is required. In development, it's optional.
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

const log = logger.cron

export interface CronAuthResult {
  authorized: boolean
  response?: NextResponse
}

/**
 * Verify that a cron request is authorized
 *
 * Vercel automatically sends the CRON_SECRET in the Authorization header
 * when triggering cron jobs. This function validates that header.
 *
 * In production (NODE_ENV === 'production'), CRON_SECRET is REQUIRED.
 * In development, the check is skipped if CRON_SECRET is not set.
 *
 * @param request - The incoming request
 * @returns Object with authorized boolean and optional error response
 */
export function verifyCronAuth(request: Request): CronAuthResult {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const isProduction = process.env.NODE_ENV === 'production'

  // In production, CRON_SECRET must be configured
  if (isProduction && !cronSecret) {
    log.error('CRON_SECRET is not configured in production environment')
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      ),
    }
  }

  // In development without CRON_SECRET, allow the request (for testing)
  if (!isProduction && !cronSecret) {
    log.debug('Cron auth skipped - CRON_SECRET not set in development')
    return { authorized: true }
  }

  // Validate the authorization header
  if (authHeader !== `Bearer ${cronSecret}`) {
    log.warn(
      { hasAuthHeader: !!authHeader },
      'Unauthorized cron request attempt'
    )
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { authorized: true }
}

/**
 * Helper to check cron auth and return early if unauthorized
 *
 * Usage in route handlers:
 * ```
 * const authError = requireCronAuth(request)
 * if (authError) return authError
 * ```
 *
 * @param request - The incoming request
 * @returns NextResponse if unauthorized, null if authorized
 */
export function requireCronAuth(request: Request): NextResponse | null {
  const result = verifyCronAuth(request)
  return result.authorized ? null : result.response!
}
