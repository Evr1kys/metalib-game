// Rate Limiting Store (in-memory)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

// CSRF Token generation
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// XSS Protection
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// SQL Injection Prevention (используем Prisma, но дополнительная проверка)
export function validateInput(input: string): boolean {
  const sqlKeywords = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi
  return !sqlKeywords.test(input)
}

// IP Extraction
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Security Headers
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.ns.gifts https://app.platega.io"
  }
}

// Password Strength Validation
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Пароль должен содержать минимум 8 символов' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать строчные буквы' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать заглавные буквы' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать цифры' }
  }
  
  return { valid: true }
}

// Email Validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Clean old rate limit entries (cleanup every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

// Проверка на спам (повторяющиеся символы, подозрительные паттерны)
export function isSpam(text: string): boolean {
  // Проверка на слишком много повторяющихся символов
  const repeatingChars = /(.)\1{9,}/g
  if (repeatingChars.test(text)) {
    return true
  }

  // Проверка на слишком много ссылок
  const urlPattern = /(https?:\/\/[^\s]+)/g
  const urls = text.match(urlPattern) || []
  if (urls.length > 3) {
    return true
  }

  // Проверка на подозрительные слова
  const spamWords = [
    'viagra',
    'casino',
    'lottery',
    'winner',
    'click here',
    'buy now',
    'limited time',
    'act now',
    'free money',
    'casino',
    'porn',
    'xxx',
  ]
  const lowerText = text.toLowerCase()
  const spamWordCount = spamWords.filter(word => lowerText.includes(word)).length
  if (spamWordCount >= 2) {
    return true
  }

  // Проверка на слишком короткие или слишком длинные сообщения
  if (text.length < 3 || text.length > 5000) {
    return true
  }

  return false
}

// Расширенная проверка на SQL injection
export function hasSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(UNION\s+SELECT)/gi,
    /(--|\#|\/\*|\*\/)/g,
    /(\bOR\b\s+\d+\s*=\s*\d+)/gi,
    /(\bAND\b\s+\d+\s*=\s*\d+)/gi,
  ]

  return sqlPatterns.some(pattern => pattern.test(input))
}

// Проверка на подозрительную активность (слишком быстрые запросы)
const activityMap = new Map<string, number[]>()

export function checkSuspiciousActivity(
  userId: string,
  maxActions: number = 10,
  timeWindowMs: number = 60000
): boolean {
  const now = Date.now()
  const timestamps = activityMap.get(userId) || []

  // Удаляем старые timestamp'ы
  const recentTimestamps = timestamps.filter(ts => now - ts < timeWindowMs)

  // Добавляем текущий timestamp
  recentTimestamps.push(now)
  activityMap.set(userId, recentTimestamps)

  // Проверяем превышение лимита
  return recentTimestamps.length > maxActions
}

// Очистка карты активности
setInterval(() => {
  const now = Date.now()
  for (const [userId, timestamps] of activityMap.entries()) {
    const recent = timestamps.filter(ts => now - ts < 60000)
    if (recent.length === 0) {
      activityMap.delete(userId)
    } else {
      activityMap.set(userId, recent)
    }
  }
}, 5 * 60 * 1000)

// Улучшенный rate limiting с информацией о времени ожидания
export function rateLimitWithInfo(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60000
): { allowed: boolean; retryAfter?: number; remaining?: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return { allowed: false, retryAfter, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}
