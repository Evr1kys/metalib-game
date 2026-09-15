export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Токен обязателен' }, { status: 400 })
    }

    const tokenResult = await query(
      'SELECT id, email, expires FROM verification_tokens WHERE token = ?',
      [token]
    )

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 400 })
    }

    const verificationToken = tokenResult.rows[0]

    if (new Date(verificationToken.expires) < new Date()) {
      await query('DELETE FROM verification_tokens WHERE token = ?', [token])
      return NextResponse.json({ error: 'Токен истек' }, { status: 400 })
    }

    // Подтверждаем email
    await query(
      'UPDATE users SET email_verified = CURRENT_TIMESTAMP WHERE email = ?',
      [verificationToken.email]
    )

    // Удаляем использованный токен
    await query('DELETE FROM verification_tokens WHERE token = ?', [token])

    return NextResponse.json({ 
      message: 'Email успешно подтвержден! Теперь вы можете войти.' 
    })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json(
      { error: 'Ошибка при подтверждении email' },
      { status: 500 }
    )
  }
}
