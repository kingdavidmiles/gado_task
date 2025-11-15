import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login', '/signup', '/_next', '/favicon.ico', '/images']

const isPublicPath = (pathname: string) => {
  return publicPaths.some(publicPath => 
    pathname === publicPath || pathname.startsWith(`${publicPath}/`)
  )
}

const middleware = async (request: NextRequest) => {
  // Skip middleware for public paths, API routes, and static files
  if (
    isPublicPath(request.nextUrl.pathname) ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const { data: { session } } = await supabase.auth.getSession()
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/signup')

  // If user is not signed in and the current path is not an auth page, redirect to login
  if (!session && !isAuthPage) {
    const redirectUrl = new URL('/login', request.url)
    // Only set redirect if it's not an API or _next path
    if (!request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.startsWith('/api')) {
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    }
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and the current path is an auth page, redirect to home
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return res
}

export default middleware

// Only run middleware on relevant paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
    '/',
    '/(api|trpc)(.*)'
  ],
}
