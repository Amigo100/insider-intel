import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronRight,
  ArrowRight,
  Sparkles,
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
import { TickerTape } from '@/components/landing/ticker-tape'

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
      {/* Navigation - Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E5E5E5] bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo variant="dark" size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-[#737373] transition-colors hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2 rounded-sm"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-[#737373] transition-colors hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2 rounded-sm"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-[#737373] transition-colors hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2 rounded-sm"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-[#737373] hover:text-[#171717]">
              <Link href="/login">Sign In</Link>
            </Button>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-[#FFA028] px-4 py-2 text-sm font-semibold text-[#171717] shadow-[0_4px_14px_rgba(255,160,40,0.4)] transition-all duration-200 hover:bg-[#FFB04D] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,160,40,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-grid-bg relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
          {/* Gradient overlay for visual interest */}
          <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl pointer-events-none" aria-hidden="true">
            <div
              className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#FFA028]/20 to-[#00C853]/10 opacity-30"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>

          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge - neutral colors, NOT amber (badge is not an action) */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-[#F5F5F5] px-4 py-1.5 text-sm text-[#525252]">
                <Sparkles className="h-4 w-4 text-[#525252]" />
                <span>Real SEC Data • AI Insights</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-[#171717] sm:text-5xl lg:text-6xl">
                Track Insider Trading Activity Before the Market Moves
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg text-[#525252] sm:text-xl">
                Real-time Form 4 filings and institutional holdings with AI-powered context.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {/* Primary CTA - Amber */}
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#FFA028] px-6 py-3 text-base font-semibold text-[#171717] shadow-[0_4px_14px_rgba(255,160,40,0.4)] transition-all duration-200 hover:bg-[#FFB04D] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,160,40,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2 sm:w-auto"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                {/* Secondary CTA */}
                <Link
                  href="#features"
                  className="inline-flex w-full items-center justify-center rounded-lg border-2 border-[#E5E5E5] bg-transparent px-6 py-3 text-base font-medium text-[#525252] transition-all duration-200 hover:border-[#171717] hover:bg-[#171717] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2 sm:w-auto"
                >
                  See How It Works
                </Link>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-12 sm:mt-16 lg:mt-20">
              <DashboardPreview />
            </div>

            {/* Stats Banner */}
            <div className="mt-12 sm:mt-14 lg:mt-16">
              <StatsBanner />
            </div>
          </div>
        </section>

        {/* Ticker Tape - Scrolling transactions */}
        <TickerTape />

        {/* Live Activity Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <LiveActivityHeader />
            <div className="mx-auto max-w-2xl">
              <LiveActivityFeed />
            </div>
            <p className="mt-8 text-center text-xs text-[#737373]">
              Data sourced directly from SEC EDGAR filings
            </p>
          </div>
        </section>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-24 scroll-mt-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">
                Everything you need to track insider activity
              </h2>
              <p className="mt-4 text-lg text-[#525252]">
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
        <section className="bg-[#F5F5F5] py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">
                Get started in minutes
              </h2>
              <p className="mt-4 text-lg text-[#525252]">
                Three simple steps to start tracking insider trading activity
              </p>
            </div>

            <div className="mt-12 sm:mt-16 grid gap-8 sm:gap-12 sm:grid-cols-3 max-w-4xl mx-auto">
              {/* Step 1 */}
              <div className="relative text-center group">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#171717] text-xl font-bold text-white transition-transform group-hover:scale-110">
                  1
                </div>
                <h3 className="mt-6 text-lg font-semibold text-[#171717]">Create Account</h3>
                <p className="mt-2 text-sm text-[#525252]">
                  Sign up in 30 seconds. No credit card required.
                </p>
                {/* Connector line - dashed */}
                <div className="absolute right-0 top-6 hidden h-[2px] w-1/2 border-t-2 border-dashed border-[#E5E5E5] sm:block" />
              </div>

              {/* Step 2 */}
              <div className="relative text-center group">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#171717] text-xl font-bold text-white transition-transform group-hover:scale-110">
                  2
                </div>
                <h3 className="mt-6 text-lg font-semibold text-[#171717]">Track Insiders</h3>
                <p className="mt-2 text-sm text-[#525252]">
                  Add companies to your watchlist and track insider activity.
                </p>
                {/* Connector lines - dashed */}
                <div className="absolute left-0 top-6 hidden h-[2px] w-1/2 border-t-2 border-dashed border-[#E5E5E5] sm:block" />
                <div className="absolute right-0 top-6 hidden h-[2px] w-1/2 border-t-2 border-dashed border-[#E5E5E5] sm:block" />
              </div>

              {/* Step 3 */}
              <div className="relative text-center group">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#171717] text-xl font-bold text-white transition-transform group-hover:scale-110">
                  3
                </div>
                <h3 className="mt-6 text-lg font-semibold text-[#171717]">Act on Insights</h3>
                <p className="mt-2 text-sm text-[#525252]">
                  Get AI-powered analysis and instant alerts when insiders trade.
                </p>
                {/* Connector line - dashed */}
                <div className="absolute left-0 top-6 hidden h-[2px] w-1/2 border-t-2 border-dashed border-[#E5E5E5] sm:block" />
              </div>
            </div>

            <div className="mt-12 sm:mt-16 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-[#FFA028] px-6 py-3 text-base font-semibold text-[#171717] shadow-[0_4px_14px_rgba(255,160,40,0.4)] transition-all duration-200 hover:bg-[#FFB04D] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,160,40,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2"
              >
                Get Started Now
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section - Dark Gradient with Rounded Corners */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A] px-8 py-16 text-center sm:px-16 sm:py-20">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to track the smart money?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-[#D4D4D4]">
                Join thousands of investors using InsiderIntel. Start free today.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#FFA028] px-6 py-3 text-base font-semibold text-[#171717] shadow-[0_4px_14px_rgba(255,160,40,0.4)] transition-all duration-200 hover:bg-[#FFB04D] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,160,40,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D] sm:w-auto"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-[#333333] bg-transparent px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA028] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D] sm:w-auto"
                >
                  Sign In
                </Link>
              </div>
              <p className="mt-6 text-sm text-[#737373]">
                No credit card required
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#F5F5F5] border-t border-[#E5E5E5]">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Logo variant="dark" size="md" />
              <p className="mt-4 text-sm text-[#737373] max-w-xs">
                Track insider trading and institutional holdings with AI-powered
                insights.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">Product</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="#features"
                    className="text-sm text-[#737373] transition-colors hover:text-[#171717]"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-sm text-[#737373] transition-colors hover:text-[#171717]"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="text-sm text-[#737373] transition-colors hover:text-[#171717]"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">Company</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-[#737373] transition-colors hover:text-[#171717]"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-[#737373] transition-colors hover:text-[#171717]"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-[#737373] transition-colors hover:text-[#171717]"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-[#737373] transition-colors hover:text-[#171717]"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="text-sm text-[#737373] transition-colors hover:text-[#171717]"
                  >
                    Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E5E5E5] pt-8 sm:flex-row">
            <p className="text-sm text-[#737373]">
              &copy; {new Date().getFullYear()} InsiderIntel. All rights reserved.
            </p>
            <p className="text-xs text-[#737373] text-center sm:text-right">
              Not financial advice. Past performance does not guarantee future
              results.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
