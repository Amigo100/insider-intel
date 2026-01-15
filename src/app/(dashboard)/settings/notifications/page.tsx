import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotificationsForm } from './notifications-form'

async function getNotificationPreferences(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('notification_daily_digest, notification_instant_alerts, notification_weekly_summary')
    .eq('id', userId)
    .single()

  return {
    dailyDigest: profile?.notification_daily_digest ?? true,
    instantAlerts: profile?.notification_instant_alerts ?? false,
    weeklySummary: profile?.notification_weekly_summary ?? true,
  }
}

export default async function NotificationsSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const preferences = await getNotificationPreferences(user.id)

  return <NotificationsForm initialData={preferences} />
}
