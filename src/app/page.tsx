import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronRight,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/ui/logo'
import { DashboardPreview } from '@/components/landing/dashboard-preview'
import { LiveActivityFeed, LiveActivityHeader } from '@/components/landing/live-activity-feed'
import { TrustBadges, StatsBanner } from '@/components/landing/trust-badges'
import { Testimonials } from '@/components/landing/testimonials'
import { FeatureCards } from '@/components/landing/feature-cards'
import { PricingSection } from '@/components/landing/pricing-section'
import { FAQSection } from '@/components/landing/faq-section'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://insiderintel.com'

export const metadata: Metadata = {
  title: 'InsiderIntel - Track Smart Money with AI',
  description:
    'Track insider trading and institutional holdings with AI-powered insights. Get real-time alerts on SEC filings and make better investment decisions.',
  keywords: [
    'insider trading',
    'institutional holdings',
    'SEC filings',
    'Form 4',
    '13F filings',
    'stock alerts',
    'investment research',
    'smart money tracking',
  ],
  authors: [{ name: 'InsiderIntel' }],
  creator: 'InsiderIntel',
  publisher: 'InsiderIntel',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'InsiderIntel',
    title: 'InsiderIntel - Track Smart Money with AI',
    description:
      'Track insider trading and institutional holdings with AI-powered insights. Get real-time alerts on SEC filings.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'InsiderIntel - Track Smart Money with AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InsiderIntel - Track Smart Money with AI',
    description:
      'Track insider trading and institutional holdings with AI-powered insights. Get real-time alerts on SEC filings.',
    images: ['/og-image.svg'],
    creator: '@insiderintel',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo variant="dark" size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-background">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
            <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl" aria-hidden="true">
              <div
                className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-emerald-400/30 opacity-20"
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
              />
            </div>
          </div>

          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-6 gap-1.5 animate-fade-in">
                <Zap className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                AI-powered SEC filing analysis
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-in-up">
                Track Insider & Institutional Trading{' '}
                <span className="text-primary">with AI</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl animate-fade-in-up animate-delay-100">
                Know what the smart money is doing before the market moves. Get
                real-time alerts on SEC filings, AI-powered analysis, and
                actionable insights to make better investment decisions.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up animate-delay-200">
                <Button size="lg" variant="primary" asChild className="w-full sm:w-auto shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  <Link href="/signup">
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="#features">
                    See How It Works
                  </Link>
                </Button>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-16 sm:mt-20 lg:mt-24 animate-fade-in-up animate-delay-300">
              <DashboardPreview />
            </div>

            {/* Stats Banner */}
            <div className="mt-16 sm:mt-20 lg:mt-24">
              <StatsBanner />
            </div>
          </div>
        </section>

        {/* Live Activity Section */}
        <section className="py-12 sm:py-16 border-y bg-muted/20">
          <div className="container mx-auto px-4">
            <LiveActivityHeader />
            <div className="mx-auto max-w-2xl">
              <LiveActivityFeed />
            </div>
            <p className="mt-8 text-center text-xs text-muted-foreground">
              Data sourced directly from SEC EDGAR filings
            </p>
          </div>
        </section>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-24 scroll-mt-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to track smart money
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Comprehensive tools to monitor insider trading, institutional
                holdings, and market movements
              </p>
            </div>

            <div className="mx-auto mt-12 sm:mt-16 max-w-5xl">
              <FeatureCards />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-y bg-muted/30 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Get started in minutes
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Three simple steps to start tracking insider trading activity
              </p>
            </div>

            <div className="mt-12 sm:mt-16 grid gap-8 sm:gap-12 sm:grid-cols-3 max-w-4xl mx-auto">
              {/* Step 1 */}
              <div className="relative text-center group">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground transition-transform group-hover:scale-110">
                  1
                </div>
                <h3 className="mt-6 text-xl font-semibold">Sign up for free</h3>
                <p className="mt-2 text-muted-foreground">
                  Create your account in seconds. No credit card required to get
                  started.
                </p>
                {/* Connector line */}
                <div className="absolute right-0 top-8 hidden h-0.5 w-1/2 bg-border sm:block" />
              </div>

              {/* Step 2 */}
              <div className="relative text-center group">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground transition-transform group-hover:scale-110">
                  2
                </div>
                <h3 className="mt-6 text-xl font-semibold">Add stocks to watch</h3>
                <p className="mt-2 text-muted-foreground">
                  Search for companies and add them to your watchlist to track
                  insider activity.
                </p>
                {/* Connector lines */}
                <div className="absolute left-0 top-8 hidden h-0.5 w-1/2 bg-border sm:block" />
                <div className="absolute right-0 top-8 hidden h-0.5 w-1/2 bg-border sm:block" />
              </div>

              {/* Step 3 */}
              <div className="relative text-center group">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground transition-transform group-hover:scale-110">
                  3
                </div>
                <h3 className="mt-6 text-xl font-semibold">Get notified</h3>
                <p className="mt-2 text-muted-foreground">
                  Receive instant alerts and AI-powered insights when insiders
                  make significant trades.
                </p>
                {/* Connector line */}
                <div className="absolute left-0 top-8 hidden h-0.5 w-1/2 bg-border sm:block" />
              </div>
            </div>

            <div className="mt-12 sm:mt-16 text-center">
              <Button size="lg" variant="primary" asChild className="shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                <Link href="/signup">
                  Get Started Now
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to track the smart money?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start tracking insider trading and institutional holdings today.
                Free forever plan available.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="primary" asChild className="w-full sm:w-auto shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  <Link href="/signup">
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/login">
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Logo variant="dark" size="md" />
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                Track insider trading and institutional holdings with AI-powered
                insights.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold">Product</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="#features"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} InsiderIntel. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground text-center sm:text-right">
              Not financial advice. Past performance does not guarantee future
              results.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
