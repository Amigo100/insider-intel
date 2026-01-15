import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BillingContent } from './billing-content'

async function getSubscriptionData(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, stripe_customer_id')
    .eq('id', userId)
    .single()

  return {
    tier: profile?.subscription_tier || 'free',
    stripeCustomerId: profile?.stripe_customer_id || null,
  }
}

export default async function BillingSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const subscriptionData = await getSubscriptionData(user.id)

  return <BillingContent initialData={subscriptionData} />
}
