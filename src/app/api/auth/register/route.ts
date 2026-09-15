export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/validations'
import { sendEmail, emailTemplates } from '@/lib/email'
import { nanoid } from 'nanoid'
import { validateData, schemas } from '@/lib/input-validation'
import { rateLimitWithInfo, sanitizeInput } from '@/lib/security'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting по IP - максимум 3 регистрации в час
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rateCheck = rateLimitWithInfo(`register-${clientIP}`, 3, 60 * 60 * 1000)
    
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Слишком много попыток регистрации. Попробуйте через ${Math.ceil(rateCheck.retryAfter! / 60000)} минут`,
          retryAfter: rateCheck.retryAfter 
        },
        { 
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfter! / 1000)) }
        }
      )
    }

    const body = await req.json()

    // Валидация с нашей схемой
    const validation = validateData(body, schemas.userRegistration)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.errors },
        { status: 400 }
      )
    }

    const { email, password, name } = validation.sanitized!
    const { referralCode } = body

    // Проверяем, существует ли пользователь
    const existingUserResult = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10)

    // Проверяем реферальный код
    let referrerId = null
    if (referralCode) {
      const sanitizedReferralCode = sanitizeInput(referralCode)
      const referrerResult = await query(
        'SELECT id FROM users WHERE referral_code = ?',
        [sanitizedReferralCode]
      )
      if (referrerResult.rows.length > 0) {
        referrerId = referrerResult.rows[0].id
      }
    }

    // Создаем пользователя
    const userId = nanoid()
    const userReferralCode = nanoid(8)
    
    await query(
      `INSERT INTO users (id, email, name, password, role, referred_by, referral_code, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [userId, email, name, hashedPassword, 'user', referrerId, userReferralCode]
    )

    // Получаем созданного пользователя
    const userResult = await query(
      'SELECT id, email, name FROM users WHERE id = ?',
      [userId]
    )

    const user = userResult.rows[0]

    // Создаем токен верификации
    const token = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 5) // 5 минут

    await query(
      `INSERT INTO verification_tokens (id, email, token, expires, created_at) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [nanoid(), user.email, token, expiresAt]
    )

    // Отправляем письмо верификации
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`
    const emailContent = emailTemplates.verification(user.name || 'Пользователь', verificationUrl)
    
    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    return NextResponse.json(
      {
        message: 'Регистрация успешна! Проверьте ваш email для подтверждения.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    )
  }
}
