'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw, Home, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">InsiderIntel</span>
          </Link>
        </div>
      </header>

      {/* Error Content */}
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Something went wrong</h1>
          <p className="mt-4 text-muted-foreground">
            We&apos;re sorry, but something unexpected happened. Our team has
            been notified and is working to fix the issue.
          </p>
          {error.digest && (
            <p className="mt-2 text-sm text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Need help? Email us at{' '}
            <a href="mailto:support@insiderintel.com" className="text-primary hover:underline">
              support@insiderintel.com
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
