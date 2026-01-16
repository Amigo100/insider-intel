'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Star,
  Zap,
  Clock,
  Bell,
  Sparkles,
  Database,
  Users,
  Shield,
  HelpCircle,
  Building2,
  LineChart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * Enhanced pricing section with annual toggle, tooltips, and visual hierarchy
 */
export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  const monthlyPrices = { free: 0, retail: 29, pro: 79 }
  const annualPrices = { free: 0, retail: 23, pro: 63 } // ~20% discount

  const prices = isAnnual ? annualPrices : monthlyPrices

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-muted/20 scroll-mt-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free and upgrade as you grow. No hidden fees.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span
              className={`text-sm font-medium transition-colors ${
                !isAnnual ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative h-7 w-12 rounded-full transition-colors flex-shrink-0 ${
                isAnnual ? 'bg-primary' : 'bg-muted'
              }`}
              aria-label={isAnnual ? 'Switch to monthly billing' : 'Switch to annual billing'}
              role="switch"
              aria-checked={isAnnual}
            >
              <span
                className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${
                isAnnual ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Annual
            </span>
            <Badge variant="secondary" className={`bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 transition-opacity ${isAnnual ? 'opacity-100' : 'opacity-0'}`}>
              Save 20%
            </Badge>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:items-start">
          {/* Free Plan */}
          <Card className="relative border-muted bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">${prices.free}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Perfect for exploring insider data
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <FeatureItem icon={Star} tooltip="Track up to 5 companies in your personal watchlist">
                  5 stocks in watchlist
                </FeatureItem>
                <FeatureItem icon={Clock} tooltip="Data is delayed by 24 hours from SEC filing time">
                  Delayed transaction data
                </FeatureItem>
                <FeatureItem icon={Database} tooltip="Access to the last 7 days of insider transactions">
                  7-day history
                </FeatureItem>
                <FeatureItem icon={Bell} tooltip="Receive a daily summary email of insider activity">
                  Daily email digest
                </FeatureItem>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Retail Plan - Most Popular */}
          <Card className="relative border-primary shadow-xl scale-[1.02] bg-gradient-to-b from-primary/5 to-transparent lg:-mt-4 lg:mb-4">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground shadow-lg px-4 py-1">
                <Zap className="mr-1 h-3 w-3" />
                Most Popular
              </Badge>
            </div>

            <CardHeader className="pb-4 pt-8">
              <CardTitle className="text-xl">Retail</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">${prices.retail}</span>
                <span className="text-muted-foreground">/month</span>
                {isAnnual && (
                  <span className="ml-2 text-sm text-muted-foreground line-through">
                    $29
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                For serious individual investors
              </p>
              <p className="mt-1 text-xs text-emerald-600 font-medium">
                Join 500+ investors on this plan
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <FeatureItem icon={Star} highlight tooltip="Add unlimited companies to track insider activity">
                  <strong>Unlimited</strong> watchlist
                </FeatureItem>
                <FeatureItem icon={Zap} highlight tooltip="Get data within minutes of SEC filing">
                  <strong>Real-time</strong> data
                </FeatureItem>
                <FeatureItem icon={Database} tooltip="Access complete historical transaction records">
                  Full historical data
                </FeatureItem>
                <FeatureItem icon={Sparkles} highlight tooltip="AI analyzes every transaction for significance and context">
                  <strong>AI-powered</strong> insights
                </FeatureItem>
                <FeatureItem icon={Bell} tooltip="Get notified immediately when insiders trade your watchlist stocks">
                  Instant email alerts
                </FeatureItem>
                <FeatureItem icon={Users} highlight tooltip="Detect when multiple insiders buy the same stock">
                  <strong>Cluster buying</strong> detection
                </FeatureItem>
              </ul>
              <Button className="w-full" size="lg" asChild>
                <Link href="/signup">
                  Start 14-day free trial
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                No credit card required
              </p>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative">
            {/* For Teams Badge */}
            <div className="absolute -top-3 right-4">
              <Badge variant="secondary" className="text-xs">
                <Building2 className="mr-1 h-3 w-3" />
                For Teams
              </Badge>
            </div>

            <CardHeader className="pb-4 pt-6">
              <CardTitle className="text-xl">Pro</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">${prices.pro}</span>
                <span className="text-muted-foreground">/month</span>
                {isAnnual && (
                  <span className="ml-2 text-sm text-muted-foreground line-through">
                    $79
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                For professionals & institutions
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <FeatureItem icon={Check} tooltip="All features from the Retail plan included">
                  Everything in Retail
                </FeatureItem>
                <FeatureItem icon={Database} highlight tooltip="Programmatic access to all data via REST API">
                  <strong>API access</strong>
                </FeatureItem>
                <FeatureItem icon={Sparkles} tooltip="More detailed AI analysis with sentiment scoring">
                  Advanced AI analysis
                </FeatureItem>
                <FeatureItem icon={Building2} highlight tooltip="Track 13F filings from hedge funds and institutions">
                  <strong>Institutional holdings</strong>
                </FeatureItem>
                <FeatureItem icon={LineChart} tooltip="Set up complex alert rules based on multiple criteria">
                  Custom alerts & filters
                </FeatureItem>
                <FeatureItem icon={Users} tooltip="Dedicated support with faster response times">
                  Priority support
                </FeatureItem>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/signup">Contact Sales</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Money-back Guarantee */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border bg-card px-6 py-3 shadow-sm">
            <Shield className="h-5 w-5 text-emerald-500" />
            <p className="text-sm">
              <span className="font-semibold">14-day money-back guarantee.</span>{' '}
              <span className="text-muted-foreground">
                Not satisfied? Get a full refund, no questions asked.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

interface FeatureItemProps {
  icon: React.ElementType
  children: React.ReactNode
  tooltip?: string
  highlight?: boolean
}

function FeatureItem({ icon: Icon, children, tooltip, highlight }: FeatureItemProps) {
  return (
    <li className="flex items-start gap-3 group">
      <div
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
          highlight
            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <Icon className="h-3 w-3" />
      </div>
      <span className="text-sm flex-1">{children}</span>
      {tooltip && (
        <div className="relative">
          <HelpCircle className="h-4 w-4 text-muted-foreground/50 cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-50">
            <div className="w-48 rounded-lg border bg-popover p-2 text-xs text-popover-foreground shadow-lg">
              {tooltip}
            </div>
          </div>
        </div>
      )}
    </li>
  )
}
