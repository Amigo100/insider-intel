'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { clientLogger } from '@/lib/client-logger'
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle2, Info } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { PasswordStrength } from '@/components/auth/password-strength'

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  terms?: string
  general?: string
}

// Error message mappings for more helpful feedback
const ERROR_MESSAGES: Record<string, { message: string; action?: string }> = {
  'already registered': {
    message: 'This email is already registered.',
    action: 'Try signing in instead, or use a different email.',
  },
  'invalid email': {
    message: 'Please enter a valid email address.',
  },
  'weak password': {
    message: 'Password is too weak.',
    action: 'Please choose a stronger password.',
  },
  'rate limit': {
    message: 'Too many signup attempts.',
    action: 'Please wait a few minutes before trying again.',
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

export function SignupForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [errorAction, setErrorAction] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const supabase = createClient()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'Name is required'
    }

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

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

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    setErrorAction(undefined)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        const errorDetails = getErrorDetails(error.message)
        setErrors({ general: errorDetails.message })
        setErrorAction(errorDetails.action)
        return
      }

      // Check if email confirmation is required
      // If user is returned with a session, they're auto-confirmed
      if (data.session) {
        router.push('/dashboard')
        router.refresh()
      } else {
        // Email confirmation required
        setIsSuccess(true)
      }
    } catch (err) {
      clientLogger.error('Signup error', { error: err })
      const errorDetails = getErrorDetails('network error')
      setErrors({ general: errorDetails.message })
      setErrorAction(errorDetails.action)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true)
    setErrors({})
    setErrorAction(undefined)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setErrors({ general: error.message })
        setIsGoogleLoading(false)
      }
    } catch (err) {
      clientLogger.error('Google signup error', { error: err })
      setErrors({ general: 'Failed to sign up with Google. Please try again.' })
      setIsGoogleLoading(false)
    }
  }

  // Success state - email confirmation required
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
              We&apos;ve sent a confirmation link to{' '}
              <span className="font-medium text-foreground">{email}</span>.
              Click the link to activate your account.
            </p>
            <div className="mt-6 space-y-2 text-center">
              <Button
                variant="outline-light"
                onClick={() => router.push('/login')}
              >
                Back to sign in
              </Button>
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg sm:border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Start tracking insider trading activity today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSignup} className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-destructive">{errors.general}</p>
                  {errorAction && (
                    <p className="text-destructive/80">{errorAction}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (errors.fullName)
                    setErrors((prev) => ({ ...prev, fullName: undefined }))
                }}
                className={`pl-10 ${errors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                disabled={isLoading || isGoogleLoading}
                autoComplete="name"
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <Info className="h-3 w-3" />
                {errors.fullName}
              </p>
            )}
          </div>

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
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                className={`pl-10 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                disabled={isLoading || isGoogleLoading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <Info className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }))
                }}
                className={`pl-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                disabled={isLoading || isGoogleLoading}
                autoComplete="new-password"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <Info className="h-3 w-3" />
                {errors.password}
              </p>
            )}
            <PasswordStrength password={password} />
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                }}
                className={`pl-10 ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                disabled={isLoading || isGoogleLoading}
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <Info className="h-3 w-3" />
                {errors.confirmPassword}
              </p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Passwords match
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => {
                  setTermsAccepted(checked === true)
                  if (errors.terms)
                    setErrors((prev) => ({ ...prev, terms: undefined }))
                }}
                disabled={isLoading || isGoogleLoading}
                className={errors.terms ? 'border-destructive' : ''}
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-snug cursor-pointer text-muted-foreground"
              >
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.terms && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <Info className="h-3 w-3" />
                {errors.terms}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign Up */}
        <Button
          type="button"
          variant="outline-light"
          className="w-full"
          size="lg"
          onClick={handleGoogleSignup}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
