'use client'

/**
 * Global Error Boundary
 *
 * This component handles unhandled errors at the root level.
 * It captures errors with Sentry and displays a user-friendly error page.
 */

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md">
              We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Go home
              </a>
            </div>
            {error.digest && (
              <p className="mt-8 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
