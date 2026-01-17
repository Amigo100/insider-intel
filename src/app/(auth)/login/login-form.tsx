'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { clientLogger } from '@/lib/client-logger'
import { Loader2, Mail, Lock, AlertCircle, Info, Eye, EyeOff } from 'lucide-react'
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

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

// Error message mappings for more helpful feedback
const ERROR_MESSAGES: Record<string, { message: string; action?: string }> = {
  'Invalid login credentials': {
    message: 'The email or password you entered is incorrect.',
    action: 'Please check your credentials and try again.',
  },
  'Email not confirmed': {
    message: 'Your email address has not been verified.',
    action: 'Please check your inbox for a verification email.',
  },
  'Too many requests': {
    message: 'Too many login attempts.',
    action: 'Please wait a few minutes before trying again.',
  },
  'User not found': {
    message: 'No account found with this email address.',
    action: 'Would you like to create a new account?',
  },
  'Invalid email': {
    message: 'Please enter a valid email address.',
  },
  'Network error': {
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

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [errorAction, setErrorAction] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const supabase = createClient()

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('insiderintel_remembered_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    setErrorAction(undefined)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const errorDetails = getErrorDetails(error.message)
        setErrors({ general: errorDetails.message })
        setErrorAction(errorDetails.action)
        return
      }

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('insiderintel_remembered_email', email)
      } else {
        localStorage.removeItem('insiderintel_remembered_email')
      }

      // Redirect to the original destination or dashboard
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      clientLogger.error('Login error', { error: err })
      const errorDetails = getErrorDetails('Network error')
      setErrors({ general: errorDetails.message })
      setErrorAction(errorDetails.action)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setErrors({})
    setErrorAction(undefined)

    try {
      // Include redirectTo in the callback URL so we can redirect after OAuth
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      if (redirectTo !== '/dashboard') {
        callbackUrl.searchParams.set('redirectTo', redirectTo)
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      })

      if (error) {
        setErrors({ general: error.message })
        setIsGoogleLoading(false)
      }
      // Don't set loading to false on success - user will be redirected
    } catch (err) {
      clientLogger.error('Google login error', { error: err })
      setErrors({ general: 'Failed to sign in with Google. Please try again.' })
      setIsGoogleLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-lg sm:border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailLogin} className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <div
              className="rounded-lg bg-destructive/10 p-4 text-sm"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-medium text-destructive">{errors.general}</p>
                  {errorAction && (
                    <p className="text-destructive/80">{errorAction}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                className={`pl-10 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                disabled={isLoading || isGoogleLoading}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                <Info className="h-3 w-3" aria-hidden="true" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                }}
                className={`pl-10 pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                disabled={isLoading || isGoogleLoading}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading || isGoogleLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                <Info className="h-3 w-3" aria-hidden="true" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              disabled={isLoading || isGoogleLoading}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal cursor-pointer text-muted-foreground"
            >
              Remember my email
            </Label>
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
                Signing in...
              </>
            ) : (
              'Sign in'
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

        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          size="lg"
          onClick={handleGoogleLogin}
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

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up for free
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
