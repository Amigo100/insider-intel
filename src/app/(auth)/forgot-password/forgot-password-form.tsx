'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { clientLogger } from '@/lib/client-logger'
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowLeft, Info } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Error message mappings for more helpful feedback
const ERROR_MESSAGES: Record<string, { message: string; action?: string }> = {
  'rate limit': {
    message: 'Too many password reset requests.',
    action: 'Please wait a few minutes before trying again.',
  },
  'user not found': {
    message: 'No account found with this email address.',
    action: 'Please check the email or create a new account.',
  },
  'network error': {
    message: 'Unable to connect to the server.',
    action: 'Please check your internet connection and try again.',
  },
}

function getErrorDetails(errorMessage: string): { message: string; action?: string } {
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  return { message: errorMessage }
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<{ message: string; action?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError({ message: 'Email is required' })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError({ message: 'Please enter a valid email address' })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(getErrorDetails(error.message))
        return
      }

      setIsSuccess(true)
    } catch (err) {
      clientLogger.error('Password reset error', { error: err })
      setError(getErrorDetails('network error'))
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <Card className="border-0 shadow-lg sm:border">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to{' '}
              <span className="font-medium text-foreground">{email}</span>.
              Click the link to reset your password.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              The link will expire in 1 hour. Didn&apos;t receive it? Check your spam folder.
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg sm:border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-destructive">{error.message}</p>
                  {error.action && (
                    <p className="text-destructive/80">{error.action}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError(null)
                }}
                className={`pl-10 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {error && !error.action && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <Info className="h-3 w-3" />
                {error.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>

        {/* Back to Sign In */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
