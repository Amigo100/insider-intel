import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/disclaimer',
]

// Protected route prefixes that require authentication
// These match the (dashboard) route group pages
const protectedPrefixes = [
  '/dashboard',
  '/insider-trades',
  '/institutions',
  '/watchlist',
  '/company/',
  '/settings',
]

// Routes that should bypass auth checks entirely
const bypassRoutes = ['/api/cron/', '/api/stripe/webhook']

// Check if a pathname matches a protected route
function isProtectedRoute(pathname: string): boolean {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route should bypass auth entirely
  if (bypassRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not add logic between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute = publicRoutes.includes(pathname)
  const isAuthRoute = pathname === '/login' || pathname === '/signup'
  const isPasswordRoute = pathname === '/forgot-password' || pathname === '/reset-password'

  // Redirect authenticated users away from login/signup pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from password recovery pages
  // (they can change their password from account settings instead)
  if (user && isPasswordRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/settings'
    return NextResponse.redirect(url)
  }

  // Protect dashboard routes - redirect to login if not authenticated
  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Preserve the original URL to redirect back after login
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
