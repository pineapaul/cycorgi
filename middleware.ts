import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { USER_STATUS } from "./lib/constants"

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth
    const { pathname } = req.nextUrl

    // Allow access to auth pages
    if (pathname.startsWith('/auth/')) {
      return NextResponse.next()
    }

    // Check if user is authenticated
    if (!token) {
      const url = new URL('/auth/signin', req.url)
      url.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(url)
    }

    // Check if user status is active or pending (allow pending for testing)
    if (token.status === USER_STATUS.INACTIVE) {
      return NextResponse.redirect(new URL('/auth/error?error=AccountInactive', req.url))
    }

    // Additional role-based checks can be added here
    // For example, admin-only routes:
    if (pathname.startsWith('/admin/') && !token.roles?.includes('Admin')) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow unauthenticated access to auth pages and API auth routes
        const { pathname } = req.nextUrl
        if (pathname.startsWith('/auth/') || pathname.startsWith('/api/auth/')) {
          return true
        }
        
        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (public files)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public).*)',
  ],
}
