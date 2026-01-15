import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile for additional info
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const userInfo = {
    email: user.email,
    name: profile?.full_name || user.user_metadata?.full_name || null,
    avatarUrl: user.user_metadata?.avatar_url || null,
  }

  return <DashboardShell user={userInfo}>{children}</DashboardShell>
}
