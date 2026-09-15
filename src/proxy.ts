import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getSecurityHeaders, rateLimit, getClientIP } from './lib/security'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apply security headers to all responses
  const response = NextResponse.next()
  const securityHeaders = getSecurityHeaders()
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip = getClientIP(request)
    const identifier = `${ip}:${pathname}`
    
    // Different limits for different endpoints
    let limit = 100
    let window = 60000 // 1 minute
    
    if (pathname.includes('/auth/')) {
      limit = 5 // 5 requests per minute for auth
      window = 60000
    } else if (pathname.includes('/payments/')) {
      limit = 10 // 10 requests per minute for payments
      window = 60000
    } else if (pathname.startsWith('/api/admin/')) {
      limit = 50 // 50 requests per minute for admin
      window = 60000
    }
    
    if (!rateLimit(identifier, limit, window)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            ...securityHeaders
          }
        }
      )
    }
  }

  // Protected routes - require authentication
  const protectedPaths = ['/admin', '/profile', '/orders', '/balance', '/tickets', '/referrals']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath) {
    // Try both cookie names (non-secure and secure)
    let token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: false,
      cookieName: 'next-auth.session-token'
    })
    
    if (!token) {
      token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: true,
        cookieName: '__Secure-next-auth.session-token'
      })
    }
    
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/balance/:path*',
    '/tickets/:path*',
    '/referrals/:path*',
    '/api/:path*',
  ],
}
