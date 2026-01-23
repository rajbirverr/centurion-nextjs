import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes (but allow /admin login page)
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin') {
    // Protect all admin sub-routes (e.g., /admin/dashboard, /admin/products)
    if (!user) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Protect account routes - redirect to login if not authenticated
  // But allow /account/register for signup
  if (request.nextUrl.pathname.startsWith('/account') && request.nextUrl.pathname !== '/account/register') {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      // Preserve return_url if accessing account page
      const returnUrl = request.nextUrl.pathname + request.nextUrl.search
      if (returnUrl !== '/account') {
        loginUrl.searchParams.set('return_url', encodeURIComponent(returnUrl))
      }
      return NextResponse.redirect(loginUrl)
    }
  }

  // Add pathname header for layouts to read
  response.headers.set('x-pathname', request.nextUrl.pathname)

  // Redirect authenticated customers away from login page to account
  // But allow admins to access /login (so they can switch accounts or test)
  if (request.nextUrl.pathname === '/login' && user) {
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Allow admins to access /login - don't redirect them
    // Only redirect regular customers away from /login
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/account', request.url))
    }
    // If admin, let them access /login page - don't redirect
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

