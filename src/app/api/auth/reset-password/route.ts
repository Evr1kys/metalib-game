export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Токен и пароль обязательны' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    // Проверяем токен
    const tokens = await query(
      'SELECT id, email, expires FROM password_reset_tokens WHERE token = ?',
      [token]
    ) as any[]

    if (tokens.length === 0) {
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 400 }
      )
    }

    const resetToken = tokens[0]
    const now = new Date()
    const expiresAt = new Date(resetToken.expires)

    if (now > expiresAt) {
      // Удаляем истёкший токен
      await query('DELETE FROM password_reset_tokens WHERE id = ?', [resetToken.id])
      
      return NextResponse.json(
        { error: 'Срок действия ссылки истёк' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли пользователь
    const users = await query(
      'SELECT id FROM users WHERE email = ?',
      [resetToken.email]
    ) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(password, 10)

    // Обновляем пароль
    await query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
      [hashedPassword, resetToken.email]
    )

    // Удаляем использованный токен
    await query('DELETE FROM password_reset_tokens WHERE id = ?', [resetToken.id])

    // Удаляем все остальные токены для этого email
    await query('DELETE FROM password_reset_tokens WHERE email = ?', [resetToken.email])

    return NextResponse.json({ 
      success: true,
      message: 'Пароль успешно изменён'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Ошибка при сбросе пароля' },
      { status: 500 }
    )
  }
}
