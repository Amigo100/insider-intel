'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { clientLogger } from '@/lib/client-logger'
import { Loader2, Check, Mail, Zap, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface NotificationsFormProps {
  initialData: {
    dailyDigest: boolean
    instantAlerts: boolean
    weeklySummary: boolean
  }
}

export function NotificationsForm({ initialData }: NotificationsFormProps) {
  const router = useRouter()
  const [dailyDigest, setDailyDigest] = useState(initialData.dailyDigest)
  const [instantAlerts, setInstantAlerts] = useState(initialData.instantAlerts)
  const [weeklySummary, setWeeklySummary] = useState(initialData.weeklySummary)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          notification_daily_digest: dailyDigest,
          notification_instant_alerts: instantAlerts,
          notification_weekly_summary: weeklySummary,
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      setSaveSuccess(true)
      router.refresh()

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      clientLogger.error('Error updating notification preferences', { error: err })
      setError('Failed to update preferences. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges =
    dailyDigest !== initialData.dailyDigest ||
    instantAlerts !== initialData.instantAlerts ||
    weeklySummary !== initialData.weeklySummary

  const notificationOptions = [
    {
      id: 'dailyDigest',
      label: 'Daily Digest',
      description:
        'Receive a daily email summarizing insider trading activity for your watchlist stocks',
      icon: Mail,
      checked: dailyDigest,
      onChange: setDailyDigest,
    },
    {
      id: 'instantAlerts',
      label: 'Instant Alerts',
      description:
        'Get notified immediately when significant insider trades occur on your watchlist',
      icon: Zap,
      checked: instantAlerts,
      onChange: setInstantAlerts,
    },
    {
      id: 'weeklySummary',
      label: 'Weekly Summary',
      description:
        'Receive a comprehensive weekly report with market insights and top insider moves',
      icon: Calendar,
      checked: weeklySummary,
      onChange: setWeeklySummary,
    },
  ]

  return (
    <div className="bg-slate-800/50 rounded-xl border border-white/[0.08]">
      <div className="p-6 border-b border-white/[0.08]">
        <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
        <p className="text-sm text-slate-400 mt-1">
          Choose how and when you want to be notified about insider trading
          activity
        </p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notification Options */}
          <div className="space-y-4">
            {notificationOptions.map((option) => {
              const Icon = option.icon

              return (
                <div
                  key={option.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-white/[0.08] bg-slate-700/30 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700/50">
                      <Icon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={option.id}
                        className="text-base font-medium cursor-pointer text-slate-200"
                      >
                        {option.label}
                      </Label>
                      <p className="text-sm text-slate-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={option.id}
                    checked={option.checked}
                    onCheckedChange={option.onChange}
                  />
                </div>
              )
            })}
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-cyan-400/5 border border-cyan-400/20 p-4">
            <p className="text-sm text-slate-400">
              <strong className="text-cyan-400">Note:</strong> Instant alerts are only available for Retail
              and Pro subscribers.{' '}
              <a href="/settings/billing" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                Upgrade your plan
              </a>{' '}
              to enable real-time notifications.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400" role="alert">
              {error}
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              type="submit"
              disabled={isSaving || !hasChanges}
              className={cn(
                'min-w-[160px]',
                hasChanges && !isSaving
                  ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 font-semibold shadow-[0_2px_10px_rgba(34,211,238,0.3)] hover:from-cyan-300 hover:to-cyan-400'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
            {!hasChanges && !saveSuccess && (
              <span className="text-sm text-slate-500">
                No changes to save
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
