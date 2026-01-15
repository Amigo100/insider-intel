import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './profile-form'

async function getProfile(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return profile
}

export default async function ProfileSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getProfile(user.id)

  return (
    <ProfileForm
      initialData={{
        fullName: profile?.full_name || '',
        email: user.email || '',
        subscriptionTier: profile?.subscription_tier || 'free',
        createdAt: profile?.created_at || user.created_at,
      }}
    />
  )
}
