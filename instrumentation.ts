/**
 * Next.js Instrumentation
 *
 * This file is used to register instrumentation hooks.
 * It's automatically loaded by Next.js when starting the server.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}
