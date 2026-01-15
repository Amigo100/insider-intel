import type { Metadata } from 'next'
import Link from 'next/link'
import {
  TrendingUp,
  Building2,
  Sparkles,
  Bell,
  Search,
  Check,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'InsiderIntel - Track Smart Money with AI',
  description:
    'Track insider trading and institutional holdings with AI-powered insights. Get real-time alerts on SEC filings and make better investment decisions.',
  alternates: {
    canonical: '/',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">InsiderIntel</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
            <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl" aria-hidden="true">
              <div
                className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-primary/30 opacity-20"
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
              />
            </div>
          </div>

          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-4">
                Trusted by 10,000+ investors
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Track Insider & Institutional Trading{' '}
                <span className="text-primary">with AI</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                Know what the smart money is doing before the market moves. Get
                real-time alerts on SEC filings, AI-powered analysis, and
                actionable insights to make better investment decisions.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">See How It Works</Link>
                </Button>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-16 sm:mt-20">
              <div className="relative mx-auto max-w-5xl">
                <div className="rounded-xl border bg-card p-2 shadow-2xl">
                  <div className="rounded-lg bg-muted/50 p-8">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                      </div>
                      <div className="h-4 w-48 rounded bg-muted" />
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-lg bg-background p-4 shadow-sm">
                        <div className="h-3 w-20 rounded bg-muted" />
                        <div className="mt-2 h-8 w-24 rounded bg-primary/20" />
                        <div className="mt-2 h-3 w-16 rounded bg-green-500/30" />
                      </div>
                      <div className="rounded-lg bg-background p-4 shadow-sm">
                        <div className="h-3 w-24 rounded bg-muted" />
                        <div className="mt-2 h-8 w-20 rounded bg-primary/20" />
                        <div className="mt-2 h-3 w-14 rounded bg-red-500/30" />
                      </div>
                      <div className="rounded-lg bg-background p-4 shadow-sm">
                        <div className="h-3 w-16 rounded bg-muted" />
                        <div className="mt-2 h-8 w-28 rounded bg-primary/20" />
                        <div className="mt-2 h-3 w-20 rounded bg-muted" />
                      </div>
                    </div>
                    <div className="mt-6 rounded-lg bg-background p-4 shadow-sm">
                      <div className="h-32 w-full rounded bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-32">
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

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Insider Transaction Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Real-time monitoring of SEC Form 4 filings. See every buy,
                    sell, and option exercise by company insiders.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Institutional Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Track 13F filings from hedge funds and institutions. Know
                    what the biggest players are buying and selling.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">AI-Powered Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our AI analyzes every transaction for significance, context,
                    and historical patterns to surface what matters.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 4 */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Alerts & Watchlists</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create custom watchlists and get instant alerts when
                    insiders trade stocks you care about.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-y bg-muted/30 py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Get started in minutes
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Three simple steps to start tracking insider trading activity
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              {/* Step 1 */}
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
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
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
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
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
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

            <div className="mt-12 text-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started Now
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start free and upgrade as you grow. No hidden fees.
              </p>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {/* Free Plan */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Perfect for getting started
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">5 stocks in watchlist</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Delayed transaction data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">7-day history</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Daily email digest</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Retail Plan */}
              <Card className="relative border-primary shadow-lg">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge>Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle>Retail</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$29</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    For serious individual investors
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Unlimited watchlist</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Real-time data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Full historical data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">AI-powered insights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Instant email alerts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Cluster buying detection</span>
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$79</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    For professionals & institutions
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Everything in Retail</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">API access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Advanced AI analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Institutional holdings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Custom alerts & filters</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Priority support</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/signup">Contact Sales</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="border-t bg-muted/30 py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to know about InsiderIntel
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-3xl">
              <div className="space-y-8">
                {/* FAQ 1 */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-lg font-semibold">
                    What is insider trading data?
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    When company executives, directors, or major shareholders buy
                    or sell stock in their own company, they must report it to the
                    SEC. We track these Form 4 filings in real-time and provide
                    AI-powered analysis to help you understand the significance of
                    each transaction.
                  </p>
                </div>

                {/* FAQ 2 */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-lg font-semibold">
                    How quickly do you get the data?
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    We pull data directly from the SEC EDGAR database. Free users
                    receive data with a slight delay, while paid subscribers get
                    real-time updates within minutes of filings being published.
                  </p>
                </div>

                {/* FAQ 3 */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-lg font-semibold">
                    What makes your AI analysis different?
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Our AI doesn&apos;t just report the numbers. It analyzes the
                    context: Is this a routine sale or something unusual? How does
                    it compare to historical patterns? Is there cluster buying
                    happening? We surface the insights that matter.
                  </p>
                </div>

                {/* FAQ 4 */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-lg font-semibold">
                    Can I cancel my subscription anytime?
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Yes, you can cancel your subscription at any time with no
                    questions asked. You&apos;ll continue to have access until the
                    end of your billing period.
                  </p>
                </div>

                {/* FAQ 5 */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-lg font-semibold">
                    Do you offer refunds?
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    We offer a 14-day money-back guarantee on all paid plans. If
                    you&apos;re not satisfied, contact us within 14 days of your
                    purchase for a full refund.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to track the smart money?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of investors using InsiderIntel to make better
                decisions. Start free today.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">InsiderIntel</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Track insider trading and institutional holdings with AI-powered
                insights.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold">Product</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="#features"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="text-sm text-muted-foreground hover:text-foreground"
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
            <p className="text-xs text-muted-foreground">
              Not financial advice. Past performance does not guarantee future
              results.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
