'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2, Check, Mail, Zap, Calendar } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

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
      console.error('Error updating notification preferences:', err)
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
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how and when you want to be notified about insider trading
          activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notification Options */}
          <div className="space-y-4">
            {notificationOptions.map((option) => {
              const Icon = option.icon

              return (
                <div
                  key={option.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={option.id}
                        className="text-base font-medium cursor-pointer"
                      >
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
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
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Instant alerts are only available for Retail
              and Pro subscribers. Upgrade your plan to enable real-time
              notifications.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isSaving || !hasChanges}>
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
              <span className="text-sm text-muted-foreground">
                No changes to save
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
