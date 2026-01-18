'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error)
  }, [error])

  // Check if this is a database-related error
  const isDatabaseError = error.message?.toLowerCase().includes('relation') ||
                          error.message?.toLowerCase().includes('table') ||
                          error.message?.toLowerCase().includes('view') ||
                          error.message?.toLowerCase().includes('column')

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <Card className={cn(
        'max-w-md w-full',
        'bg-[hsl(var(--bg-card))]',
        'border-[hsl(var(--border-default))]'
      )}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full',
              isDatabaseError
                ? 'bg-[hsl(var(--accent-amber)/0.1)]'
                : 'bg-[hsl(var(--signal-negative)/0.1)]'
            )}>
              {isDatabaseError ? (
                <Database className="h-8 w-8 text-[hsl(var(--accent-amber))]" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-[hsl(var(--signal-negative))]" aria-hidden="true" />
              )}
            </div>

            <h1 className={cn(
              'mt-6 text-2xl font-bold',
              'text-[hsl(var(--text-primary))]'
            )}>
              {isDatabaseError ? 'Database Not Set Up' : 'Something went wrong'}
            </h1>

            <p className={cn(
              'mt-2 text-sm',
              'text-[hsl(var(--text-muted))]'
            )}>
              {isDatabaseError ? (
                <>
                  The database schema or data has not been initialized yet.
                  Please set up the database views and populate initial data to get started.
                </>
              ) : (
                <>
                  We encountered an error while loading this page. Please try again
                  or contact support if the problem persists.
                </>
              )}
            </p>

            {error.digest && (
              <p className={cn(
                'mt-2 text-xs',
                'text-[hsl(var(--text-muted))]'
              )}>
                Error ID: {error.digest}
              </p>
            )}

            {isDatabaseError && (
              <div className={cn(
                'mt-4 p-3 rounded-lg',
                'bg-[hsl(var(--bg-elevated)/0.5)]',
                'border border-[hsl(var(--border-default))]',
                'text-left w-full'
              )}>
                <p className={cn(
                  'text-xs font-medium mb-2',
                  'text-[hsl(var(--text-secondary))]'
                )}>
                  Next steps:
                </p>
                <ol className={cn(
                  'text-xs space-y-1',
                  'text-[hsl(var(--text-muted))]',
                  'list-decimal list-inside'
                )}>
                  <li>Run database setup scripts from SETUP.md</li>
                  <li>Create required database views</li>
                  <li>Populate sample data or run data ingestion</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button
                variant="primary"
                onClick={reset}
              >
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
