'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { clientLogger } from '@/lib/client-logger'
import { Loader2, Check, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Check if a name needs to be set (empty or looks like email-derived)
 */
function needsDisplayName(name: string | null | undefined): boolean {
  if (!name || !name.trim()) return true

  const trimmed = name.trim()

  // If it has spaces, it's likely a real name
  if (trimmed.includes(' ')) return false

  // If it looks like an email username pattern (all lowercase, possibly with separators)
  if (/^[a-z0-9._-]+$/.test(trimmed)) return true

  return false
}

interface ProfileFormProps {
  initialData: {
    fullName: string
    email: string
    subscriptionTier: string
    createdAt: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(initialData.fullName)
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
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      setSaveSuccess(true)
      router.refresh()

      // Clear success message after 5 seconds
      setTimeout(() => setSaveSuccess(false), 5000)
    } catch (err) {
      clientLogger.error('Error updating profile', { error: err })
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'Pro'
      case 'retail':
        return 'Retail'
      default:
        return 'Free'
    }
  }

  const getTierVariant = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'default' as const
      case 'retail':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const hasChanges = fullName !== initialData.fullName

  return (
    <div className="bg-slate-800/50 rounded-xl border border-white/[0.08]">
      <div className="p-6 border-b border-white/[0.08]">
        <h2 className="text-lg font-semibold text-white">Profile</h2>
        <p className="text-sm text-slate-400 mt-1">
          Manage your personal information and account details
        </p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name Encouragement Banner */}
          {needsDisplayName(initialData.fullName) && (
            <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-4 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
                <User className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Add your display name
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set your name below so we can personalize your dashboard greeting and make the app feel more like home.
                </p>
              </div>
            </div>
          )}

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-300 text-sm font-medium">
              Display Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name (e.g., Alex Smith)"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-cyan-400/20"
            />
            <p className="text-xs text-slate-500">
              This is how your name will appear across the app
            </p>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={initialData.email}
              disabled
              className="bg-slate-900 border-slate-700 text-slate-500"
            />
            <p className="text-xs text-slate-500">
              Email cannot be changed. Contact support if you need to update it.
            </p>
          </div>

          {/* Current Plan - Not a form control, use semantic markup */}
          <div className="space-y-2">
            <p className="text-slate-300 text-sm font-medium">Current Plan</p>
            <div className="flex items-center gap-3">
              <Badge
                variant={getTierVariant(initialData.subscriptionTier)}
                aria-describedby="plan-description"
              >
                {getTierLabel(initialData.subscriptionTier)}
              </Badge>
              {initialData.subscriptionTier === 'free' && (
                <Button variant="link" className="h-auto p-0 text-sm text-cyan-400 hover:text-cyan-300" asChild>
                  <Link href="/settings/billing">Upgrade your plan</Link>
                </Button>
              )}
            </div>
            <p id="plan-description" className="text-xs text-slate-500">
              {initialData.subscriptionTier === 'free'
                ? 'Free tier with basic features. Upgrade to unlock more.'
                : initialData.subscriptionTier === 'retail'
                ? 'Retail plan with unlimited watchlist and real-time data.'
                : 'Pro plan with API access and institutional data.'}
            </p>
          </div>

          {/* Account Created - Not a form control, use semantic markup */}
          <div className="space-y-2">
            <p className="text-slate-300 text-sm font-medium">Account Created</p>
            <p className="text-sm text-slate-400">
              {formatDate(initialData.createdAt)}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              type="submit"
              disabled={isSaving || !hasChanges}
              className={cn(
                'min-w-[140px] transition-all duration-200',
                hasChanges && !isSaving
                  ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 font-semibold shadow-[0_2px_10px_rgba(34,211,238,0.3)] hover:from-cyan-300 hover:to-cyan-400 hover:shadow-[0_4px_20px_rgba(34,211,238,0.4)]'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed opacity-60'
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
                'Save Changes'
              )}
            </Button>
            {!hasChanges && !saveSuccess && (
              <span className="text-xs text-slate-500 italic">
                Make changes above to enable saving
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
