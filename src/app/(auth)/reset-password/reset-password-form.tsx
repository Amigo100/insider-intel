'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Lock, AlertCircle, CheckCircle2, ArrowLeft, Clock } from 'lucide-react'
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
import { PasswordStrength } from '@/components/auth/password-strength'

interface FormErrors {
  password?: string
  confirmPassword?: string
  general?: string
}

type SessionState = 'loading' | 'valid' | 'expired' | 'invalid' | 'timeout'

// Session timeout warning threshold (show warning 2 minutes before expiry)
const SESSION_WARNING_THRESHOLD_MS = 2 * 60 * 1000
// Supabase recovery links typically expire after 1 hour
const RECOVERY_SESSION_DURATION_MS = 60 * 60 * 1000

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [sessionState, setSessionState] = useState<SessionState>('loading')
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const supabase = createClient()

  // Clean up timers
  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
      warningTimerRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }, [])

  // Start session timeout monitoring
  const startSessionMonitoring = useCallback(() => {
    // Set warning timer for 2 minutes before expiry
    const warningTime = RECOVERY_SESSION_DURATION_MS - SESSION_WARNING_THRESHOLD_MS

    warningTimerRef.current = setTimeout(() => {
      setShowTimeoutWarning(true)
      setTimeRemaining(SESSION_WARNING_THRESHOLD_MS / 1000)

      // Start countdown
      countdownRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearTimers()
            setSessionState('timeout')
            return null
          }
          return prev - 1
        })
      }, 1000)
    }, warningTime)
  }, [clearTimers])

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        // Check for specific error types
        if (error.message.toLowerCase().includes('expired')) {
          setSessionState('expired')
        } else {
          setSessionState('invalid')
        }
        return
      }

      // User should have a session from the recovery link
      if (session) {
        setSessionState('valid')
        startSessionMonitoring()
      } else {
        setSessionState('invalid')
      }
    }

    checkSession()

    // Listen for auth state changes (recovery link sets session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setSessionState('valid')
          startSessionMonitoring()
        } else if (event === 'SIGNED_OUT') {
          // Session was invalidated
          if (sessionState === 'valid') {
            setSessionState('expired')
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimers()
    }
  }, [supabase.auth, startSessionMonitoring, clearTimers, sessionState])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password =
        'Password must contain uppercase, lowercase, and a number'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Error message mappings for better UX
  const ERROR_MESSAGES: Record<string, { message: string; action?: string }> = {
    'expired': {
      message: 'Your password reset session has expired.',
      action: 'Please request a new reset link.',
    },
    'invalid': {
      message: 'Your password reset link is invalid.',
      action: 'Please request a new reset link.',
    },
    'same password': {
      message: 'New password must be different from your current password.',
      action: 'Please choose a different password.',
    },
    'different': {
      message: 'New password must be different from your current password.',
      action: 'Please choose a different password.',
    },
    'weak': {
      message: 'Password is too weak.',
      action: 'Please choose a stronger password with more characters or complexity.',
    },
    'strength': {
      message: 'Password does not meet strength requirements.',
      action: 'Include uppercase, lowercase, numbers, and special characters.',
    },
    'rate limit': {
      message: 'Too many attempts.',
      action: 'Please wait a few minutes before trying again.',
    },
  }

  // Parse Supabase error messages into user-friendly messages
  const parseErrorMessage = (errorMessage: string): { message: string; action?: string } => {
    const lowerMessage = errorMessage.toLowerCase()

    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      if (lowerMessage.includes(key)) {
        return value
      }
    }

    return { message: errorMessage }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        // Check if session expired during form fill
        if (error.message.toLowerCase().includes('expired') ||
            error.message.toLowerCase().includes('invalid') ||
            error.message.toLowerCase().includes('not authenticated')) {
          setSessionState('expired')
          return
        }
        const parsed = parseErrorMessage(error.message)
        setErrors({ general: parsed.action ? `${parsed.message} ${parsed.action}` : parsed.message })
        return
      }

      // Clear timers on success
      clearTimers()
      setIsSuccess(true)

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Format time remaining for display
  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Loading state while checking session
  if (sessionState === 'loading') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Verifying your reset link...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Session timed out while on page
  if (sessionState === 'timeout') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Session timed out</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your password reset session has timed out for security reasons.
              Please request a new reset link to continue.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/forgot-password">Request new link</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Expired link (detected from URL or API)
  if (sessionState === 'expired') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Clock className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Link expired</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This password reset link has expired. Reset links are valid for
              1 hour after being sent. Please request a new one.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/forgot-password">Request new link</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Invalid link (bad format, already used, etc.)
  if (sessionState === 'invalid') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Invalid link</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This password reset link is invalid. It may have already been used
              or the link was incomplete. Please request a new one.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/forgot-password">Request new link</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Password updated</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your password has been successfully reset.
              You&apos;ll be redirected to sign in shortly.
            </p>
            <Button variant="outline-light" className="mt-6" asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Sign in now
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Set new password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Timeout Warning Banner */}
        {showTimeoutWarning && timeRemaining !== null && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              Session expires in <strong>{formatTimeRemaining(timeRemaining)}</strong>.
              Please complete your password reset soon.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }))
                }}
                className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
            {password && <PasswordStrength password={password} />}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                }}
                className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Passwords match
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              'Reset password'
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
