import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js 16 Proxy - handles routing only (redirects, rewrites, headers)
 * Authentication logic has been moved to Server Layout Guards
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Early return for static assets to avoid unnecessary processing
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // Create response with pathname header for layouts to read
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)

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
