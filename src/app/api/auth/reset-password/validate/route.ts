export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Токен не предоставлен' },
        { status: 400 }
      )
    }

    // Проверяем токен
    const tokens = await query(
      'SELECT id, email, expires FROM password_reset_tokens WHERE token = ?',
      [token]
    ) as any[]

    if (tokens.length === 0) {
      return NextResponse.json({
        valid: false,
        error: 'Неверный токен'
      })
    }

    const resetToken = tokens[0]
    const now = new Date()
    const expiresAt = new Date(resetToken.expires)

    if (now > expiresAt) {
      // Удаляем истёкший токен
      await query('DELETE FROM password_reset_tokens WHERE id = ?', [resetToken.id])
      
      return NextResponse.json({
        valid: false,
        error: 'Срок действия ссылки истёк. Запросите новую ссылку.'
      })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Ошибка проверки токена' },
      { status: 500 }
    )
  }
}
