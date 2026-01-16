'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { clientLogger } from '@/lib/client-logger'
import { Loader2, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

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

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
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
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage your personal information and account details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Display Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
            />
            <p className="text-xs text-muted-foreground">
              This is how your name will appear across the app
            </p>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={initialData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if you need to update it.
            </p>
          </div>

          {/* Current Plan */}
          <div className="space-y-2">
            <Label>Current Plan</Label>
            <div className="flex items-center gap-3">
              <Badge variant={getTierVariant(initialData.subscriptionTier)}>
                {getTierLabel(initialData.subscriptionTier)}
              </Badge>
              {initialData.subscriptionTier === 'free' && (
                <Button variant="link" className="h-auto p-0 text-sm" asChild>
                  <Link href="/settings/billing">Upgrade your plan</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Account Created */}
          <div className="space-y-2">
            <Label>Account Created</Label>
            <p className="text-sm text-muted-foreground">
              {formatDate(initialData.createdAt)}
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
                'Save Changes'
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
