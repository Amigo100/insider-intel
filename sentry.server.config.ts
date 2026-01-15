/**
 * Sentry Server Configuration
 *
 * This file configures the initialization of Sentry on the server.
 * The config you add here will be used whenever the server handles a request.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Set the environment
  environment: process.env.NODE_ENV || 'development',

  // Enable performance monitoring
  enableTracing: true,

  // Capture unhandled promise rejections
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ['error'],
    }),
  ],

  // Filter out expected errors
  beforeSend(event, hint) {
    const error = hint.originalException

    // Don't send 404 errors
    if (error instanceof Error && error.message.includes('PGRST116')) {
      return null
    }

    // Don't send authentication errors (expected user behavior)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return null
    }

    return event
  },
})
