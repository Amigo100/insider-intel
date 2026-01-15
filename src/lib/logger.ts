/**
 * Logger re-export from main lib/logger
 *
 * This file re-exports the main logger for compatibility with
 * the @/lib/logger path alias used throughout the application.
 */

export { logger, createLogger, createRequestLogger } from '../../lib/logger'
export type { LogLevel } from '../../lib/logger'
export { default } from '../../lib/logger'
