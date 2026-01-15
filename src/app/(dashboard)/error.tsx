'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="mt-6 text-2xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-muted-foreground">
              We encountered an error while loading this page. Please try again
              or contact support if the problem persists.
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
            <div className="mt-6 flex gap-4">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button onClick={reset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
