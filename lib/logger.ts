/**
 * Structured Logger using Pino
 *
 * Provides consistent logging across the application with support for:
 * - Log levels (trace, debug, info, warn, error, fatal)
 * - Structured JSON output for production
 * - Request ID tracing
 * - Context enrichment
 *
 * Environment Variables:
 * - LOG_LEVEL: Minimum log level (default: 'info' in production, 'debug' in development)
 */

import pino from 'pino'

// Determine log level from environment or defaults
const getLogLevel = (): string => {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

// Base logger configuration
const baseConfig: pino.LoggerOptions = {
  level: getLogLevel(),
  // Add timestamp
  timestamp: pino.stdTimeFunctions.isoTime,
  // Base context
  base: {
    env: process.env.NODE_ENV || 'development',
  },
  // Format options for development
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino/file',
      options: { destination: 1 }, // stdout
    },
    formatters: {
      level: (label: string) => ({ level: label }),
    },
  }),
}

// Create base logger instance
const baseLogger = pino(baseConfig)

/**
 * Create a child logger with additional context
 *
 * @param context - Additional context to add to all log entries
 * @returns A child logger instance
 *
 * @example
 * const log = createLogger({ module: 'stripe', requestId: '123' })
 * log.info({ customerId: 'cus_xxx' }, 'Processing checkout')
 */
export function createLogger(context: Record<string, unknown> = {}) {
  return baseLogger.child(context)
}

/**
 * Pre-configured loggers for common modules
 */
export const logger: {
  app: pino.Logger
  api: pino.Logger
  db: pino.Logger
  external: pino.Logger
  stripe: pino.Logger
  email: pino.Logger
  cron: pino.Logger
  ai: pino.Logger
  edgar: pino.Logger
  openfigi: pino.Logger
} = {
  // General application logger
  app: createLogger({ module: 'app' }),

  // API route logger
  api: createLogger({ module: 'api' }),

  // Database operations logger
  db: createLogger({ module: 'db' }),

  // External services logger
  external: createLogger({ module: 'external' }),

  // Stripe integration logger
  stripe: createLogger({ module: 'stripe' }),

  // Email service logger
  email: createLogger({ module: 'email' }),

  // Cron jobs logger
  cron: createLogger({ module: 'cron' }),

  // AI/Claude logger
  ai: createLogger({ module: 'ai' }),

  // SEC/EDGAR data logger
  edgar: createLogger({ module: 'edgar' }),

  // OpenFIGI API logger
  openfigi: createLogger({ module: 'openfigi' }),
}

/**
 * Create a request-scoped logger
 *
 * @param requestId - Unique request identifier
 * @param module - Module name for context
 * @returns Logger with request context
 *
 * @example
 * const log = createRequestLogger('req-123', 'api')
 * log.info({ path: '/api/users' }, 'Request received')
 */
export function createRequestLogger(requestId: string, module: string) {
  return createLogger({ requestId, module })
}

/**
 * Log levels for reference:
 * - trace: Very detailed debugging (not recommended for production)
 * - debug: Debugging information
 * - info: General information about application flow
 * - warn: Warning conditions that should be looked at
 * - error: Error conditions that don't stop the application
 * - fatal: Severe errors that may cause the application to stop
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export default logger
