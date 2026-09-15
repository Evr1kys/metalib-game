export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userResult = await query(
      'SELECT * FROM users WHERE id = ?',
      [session.user.id]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult.rows[0]

    if (user.two_factor_enabled === 1) {
      return NextResponse.json(
        { error: '2FA уже включен' },
        { status: 400 }
      )
    }

    // Генерируем секрет для 2FA
    const secret = speakeasy.generateSecret({
      name: `MetaLib Shop (${user.email})`,
      issuer: 'MetaLib Shop',
      length: 32,
    })

    // Сохраняем секрет (но не включаем 2FA до подтверждения)
    await query(
      'UPDATE users SET two_factor_secret = ? WHERE id = ?',
      [secret.base32, user.id]
    )

    // Генерируем QR код
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { error: 'Ошибка настройки 2FA' },
      { status: 500 }
    )
  }
}
