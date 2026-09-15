import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSecurityHeaders, rateLimit, getClientIP } from '@/lib/security'

// Пути которые нужно защитить от rate limiting
const rateLimitedPaths = [
  '/api/auth',
  '/api/tickets',
  '/api/orders',
  '/api/payments',
  '/api/favorites',
]

// Пути которые требуют строгого rate limiting
const strictRateLimitPaths = [
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/tickets',
]

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Добавляем security headers ко всем ответам
  const securityHeaders = getSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Rate limiting для API endpoints
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/api/')) {
    const clientIP = getClientIP(request)
    
    // Строгий rate limiting для критичных endpoints
    if (strictRateLimitPaths.some(path => pathname.startsWith(path))) {
      const allowed = rateLimit(`strict_${clientIP}_${pathname}`, 5, 60000) // 5 запросов в минуту
      
      if (!allowed) {
        return NextResponse.json(
          { error: 'Слишком много запросов. Попробуйте позже.' },
          { status: 429 }
        )
      }
    }
    // Обычный rate limiting для остальных API
    else if (rateLimitedPaths.some(path => pathname.startsWith(path))) {
      const allowed = rateLimit(`api_${clientIP}_${pathname}`, 30, 60000) // 30 запросов в минуту
      
      if (!allowed) {
        return NextResponse.json(
          { error: 'Слишком много запросов. Попробуйте позже.' },
          { status: 429 }
        )
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
