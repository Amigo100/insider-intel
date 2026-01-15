import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const log = logger.stripe

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })
}

function getPriceIds(): Record<string, string> {
  return {
    retail: process.env.STRIPE_RETAIL_PRICE_ID || '',
    pro: process.env.STRIPE_PRO_PRICE_ID || '',
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const PRICE_IDS = getPriceIds()
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId } = body

    if (!planId || !PRICE_IDS[planId]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    const priceId = PRICE_IDS[planId]

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this plan' },
        { status: 500 }
      )
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create Checkout Session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/settings/billing?canceled=true`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan_id: planId,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    log.error({ error }, 'Stripe checkout error')
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
