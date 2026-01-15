/**
 * Sentry Utilities
 *
 * Helper functions for Sentry error tracking in API routes and server components.
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Captures an exception with additional context
 *
 * @param error - The error to capture
 * @param context - Additional context to attach to the error
 *
 * @example
 * try {
 *   await riskyOperation()
 * } catch (error) {
 *   captureError(error, { userId: 'user-123', operation: 'checkout' })
 * }
 */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (error instanceof Error) {
    Sentry.captureException(error, {
      extra: context,
    })
  } else {
    Sentry.captureMessage(String(error), {
      level: 'error',
      extra: context,
    })
  }
}

/**
 * Captures a message with additional context
 *
 * @param message - The message to capture
 * @param level - The severity level
 * @param context - Additional context to attach
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: Record<string, unknown>
): void {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  })
}

/**
 * Sets user information for error tracking
 *
 * @param user - User information to associate with errors
 */
export function setUser(user: {
  id: string
  email?: string
  username?: string
} | null): void {
  if (user) {
    Sentry.setUser(user)
  } else {
    Sentry.setUser(null)
  }
}

/**
 * Adds breadcrumb for debugging
 *
 * @param breadcrumb - Breadcrumb data
 */
export function addBreadcrumb(breadcrumb: {
  category?: string
  message: string
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
  data?: Record<string, unknown>
}): void {
  Sentry.addBreadcrumb({
    category: breadcrumb.category || 'custom',
    message: breadcrumb.message,
    level: breadcrumb.level || 'info',
    data: breadcrumb.data,
  })
}

/**
 * Wraps an async function with Sentry error tracking
 *
 * @param fn - The async function to wrap
 * @param context - Additional context to attach to errors
 * @returns The wrapped function
 *
 * @example
 * const safeFunction = withErrorTracking(async () => {
 *   return await riskyOperation()
 * }, { operation: 'checkout' })
 */
export function withErrorTracking<T>(
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): () => Promise<T> {
  return async () => {
    try {
      return await fn()
    } catch (error) {
      captureError(error, context)
      throw error
    }
  }
}

/**
 * Creates a transaction for performance monitoring
 *
 * @param name - The transaction name
 * @param op - The operation type
 * @returns Transaction span
 */
export function startTransaction(
  name: string,
  op: string
): ReturnType<typeof Sentry.startInactiveSpan> {
  return Sentry.startInactiveSpan({
    name,
    op,
  })
}

export { Sentry }
