export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import speakeasy from 'speakeasy'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Код обязателен' },
        { status: 400 }
      )
    }

    const userResult = await query(
      'SELECT * FROM users WHERE id = ?',
      [session.user.id]
    )

    if (userResult.rows.length === 0 || userResult.rows[0].two_factor_enabled !== 1 || !userResult.rows[0].two_factor_secret) {
      return NextResponse.json(
        { error: '2FA не включен' },
        { status: 400 }
      )
    }

    const user = userResult.rows[0]

    // Проверяем код
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: token,
      window: 2,
    })

    if (!verified) {
      return NextResponse.json(
        { error: 'Неверный код' },
        { status: 400 }
      )
    }

    // Отключаем 2FA
    await query(
      'UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?',
      [user.id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { error: 'Ошибка отключения 2FA' },
      { status: 500 }
    )
  }
}
