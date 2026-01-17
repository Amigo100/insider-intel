import Link from 'next/link'
import { FileQuestion, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Logo variant="dark" size="md" />
        </div>
      </header>

      {/* 404 Content */}
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="mt-6 text-6xl font-bold text-primary">404</h1>
          <h2 className="mt-2 text-2xl font-semibold">Page Not Found</h2>
          <p className="mt-4 text-muted-foreground">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have been moved, deleted, or never existed in the first place.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                <Search className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
          <div className="mt-12 rounded-lg border bg-muted/30 p-6">
            <h3 className="font-semibold">Looking for something specific?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try searching for a company by ticker symbol or browse our insider
              trading data.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/insider-trades">Insider Trades</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/institutions">Institutions</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/watchlist">Watchlist</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
