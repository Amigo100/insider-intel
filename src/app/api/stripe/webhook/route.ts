import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { logger } from '@/lib/logger'

const log = logger.stripe

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })
}

function getWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET!
}

// Use service role client for webhook (no user session)
function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getPriceToTier(): Record<string, string> {
  return {
    [process.env.STRIPE_RETAIL_PRICE_ID || '']: 'retail',
    [process.env.STRIPE_PRO_PRICE_ID || '']: 'pro',
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const webhookSecret = getWebhookSecret()
  const PRICE_TO_TIER = getPriceToTier()
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      log.error({ error: err }, 'Webhook signature verification failed')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const userId = subscription.metadata.supabase_user_id
          const planId = subscription.metadata.plan_id

          if (userId && planId) {
            await supabase
              .from('profiles')
              .update({
                subscription_tier: planId,
                stripe_customer_id: session.customer as string,
              })
              .eq('id', userId)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.supabase_user_id

        if (userId) {
          // Get the price ID from the subscription
          const priceId = subscription.items.data[0]?.price.id
          const tier = priceId ? PRICE_TO_TIER[priceId] : null

          if (tier) {
            await supabase
              .from('profiles')
              .update({ subscription_tier: tier })
              .eq('id', userId)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.supabase_user_id

        if (userId) {
          // Downgrade to free tier
          await supabase
            .from('profiles')
            .update({ subscription_tier: 'free' })
            .eq('id', userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // Handle failed payment - could send notification email
        log.warn({ invoiceId: invoice.id }, 'Payment failed for invoice')
        break
      }

      default:
        // Unhandled event type
        log.debug({ eventType: event.type }, 'Unhandled webhook event type')
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    log.error({ error }, 'Webhook error')
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
