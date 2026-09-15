export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { sendEmail, emailTemplates } from '@/lib/email'
import { nanoid } from 'nanoid'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      )
    }

    // Если email уже подтвержден
    if (session.user.emailVerified) {
      return NextResponse.json(
        { message: 'Email уже подтвержден' },
        { status: 200 }
      )
    }

    // Удаляем старые токены
    await query(
      `DELETE FROM verification_tokens 
       WHERE email = ?`,
      [session.user.email]
    )

    // Создаем новый токен верификации
    const token = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 часа

    await query(
      `INSERT INTO verification_tokens (id, email, token, expires, created_at) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [nanoid(), session.user.email, token, expiresAt]
    )

    // Отправляем письмо верификации
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`
    const emailContent = emailTemplates.verification(session.user.name || 'Пользователь', verificationUrl)
    
    await sendEmail({
      to: session.user.email!,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    return NextResponse.json(
      { message: 'Письмо с подтверждением отправлено' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Ошибка при отправке письма' },
      { status: 500 }
    )
  }
}
