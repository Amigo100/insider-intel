'use client'

import { useState } from 'react'
import { Check, Sparkles, Building2, User, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface BillingContentProps {
  initialData: {
    tier: string
    stripeCustomerId: string | null
  }
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with basic insider trading insights',
    icon: User,
    features: [
      '5 stocks in watchlist',
      'Basic transaction data',
      'Daily market summary',
      '7-day transaction history',
    ],
    limitations: [
      'No AI analysis',
      'No real-time alerts',
      'Limited historical data',
    ],
  },
  {
    id: 'retail',
    name: 'Retail',
    price: '$29',
    period: 'per month',
    description: 'Perfect for active individual investors',
    icon: Sparkles,
    popular: true,
    features: [
      '25 stocks in watchlist',
      'AI-powered transaction analysis',
      'Instant email alerts',
      '1-year transaction history',
      'Cluster buying detection',
      'Weekly digest emails',
    ],
    limitations: [],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    period: 'per month',
    description: 'For professionals who need comprehensive data',
    icon: Building2,
    features: [
      '100 stocks in watchlist',
      'Advanced AI insights & scoring',
      'Real-time push notifications',
      'Full historical data access',
      'Institutional holdings analysis',
      'API access',
      'Priority support',
      'Custom alerts & filters',
    ],
    limitations: [],
  },
]

export function BillingContent({ initialData }: BillingContentProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currentPlan = plans.find((p) => p.id === initialData.tier)

  const handleUpgrade = async (planId: string) => {
    setIsLoading(planId)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(null)
    }
  }

  const handleManageBilling = async () => {
    setIsLoading('portal')
    setError(null)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="bg-slate-800/50 rounded-xl border border-white/[0.08]">
        <div className="p-6 border-b border-white/[0.08]">
          <h2 className="text-lg font-semibold text-white">Current Plan</h2>
          <p className="text-sm text-slate-400 mt-1">
            You are currently on the{' '}
            <span className="font-semibold text-white">{currentPlan?.name}</span> plan
          </p>
        </div>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentPlan && (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/10">
                    <currentPlan.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{currentPlan.name}</p>
                    <p className="text-sm text-slate-400">
                      {currentPlan.price}{' '}
                      <span className="text-xs">{currentPlan.period}</span>
                    </p>
                  </div>
                </>
              )}
            </div>
            {initialData.stripeCustomerId && (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={isLoading === 'portal'}
                className="border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                {isLoading === 'portal' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                Manage Billing
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="bg-slate-800/50 rounded-xl border border-white/[0.08]">
        <div className="p-6 border-b border-white/[0.08]">
          <h2 className="text-lg font-semibold text-white">Available Plans</h2>
          <p className="text-sm text-slate-400 mt-1">
            Choose the plan that best fits your investing needs
          </p>
        </div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrentPlan = plan.id === initialData.tier
              const Icon = plan.icon

              return (
                <div
                  key={plan.id}
                  className={cn(
                    'relative rounded-xl border p-6 transition-all',
                    plan.popular
                      ? 'border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                      : 'border-white/[0.08]',
                    isCurrentPlan && 'bg-slate-700/30'
                  )}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 font-semibold">
                      Most Popular
                    </Badge>
                  )}

                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        plan.popular
                          ? 'bg-cyan-400/20 text-cyan-400'
                          : 'bg-slate-700/50 text-slate-400'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{plan.name}</h3>
                      <p className="text-sm text-slate-400">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-slate-400">
                      {' '}
                      {plan.period}
                    </span>
                  </div>

                  <ul className="mb-6 space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, index) => (
                      <li
                        key={`limit-${index}`}
                        className="flex items-start gap-2 text-sm text-slate-500"
                      >
                        <span className="mt-0.5 h-4 w-4 flex-shrink-0 text-center">
                          -
                        </span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button
                      className="w-full min-h-10 bg-slate-700 text-slate-400 cursor-not-allowed"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : plan.id === 'free' ? (
                    <Button
                      variant="outline"
                      className="w-full min-h-10 border-slate-700 text-slate-500 cursor-not-allowed"
                      disabled
                    >
                      Downgrade
                    </Button>
                  ) : (
                    <Button
                      className={cn(
                        'w-full min-h-10',
                        plan.popular
                          ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 font-semibold shadow-[0_2px_10px_rgba(34,211,238,0.3)] hover:from-cyan-300 hover:to-cyan-400'
                          : 'border-slate-700 bg-transparent text-slate-300 hover:bg-slate-700 hover:text-white border'
                      )}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isLoading === plan.id}
                    >
                      {isLoading === plan.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {initialData.tier === 'free' ? 'Upgrade' : 'Switch'} to{' '}
                      {plan.name}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Billing FAQ */}
      <div className="bg-slate-800/50 rounded-xl border border-white/[0.08]">
        <div className="p-6 border-b border-white/[0.08]">
          <h2 className="text-lg font-semibold text-white">Billing FAQ</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-medium text-white">Can I cancel anytime?</h4>
            <p className="text-sm text-slate-400 mt-1">
              Yes, you can cancel your subscription at any time. You will
              continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white">What payment methods do you accept?</h4>
            <p className="text-sm text-slate-400 mt-1">
              We accept all major credit cards, debit cards, and various digital
              payment methods through Stripe.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white">
              What happens to my data if I downgrade?
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              Your data is preserved, but you may lose access to premium
              features. Watchlist items beyond the free tier limit will be
              retained but hidden until you upgrade again.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
