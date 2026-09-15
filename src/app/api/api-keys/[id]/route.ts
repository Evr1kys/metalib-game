export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// DELETE /api/api-keys/[id] - Удалить API ключ
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const keyId = params.id

    // Проверяем принадлежность ключа пользователю
    const result = await query(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?',
      [keyId, session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'API ключ не найден' },
        { status: 404 }
      )
    }

    // Удаляем ключ (логи удалятся автоматически благодаря CASCADE)
    await query('DELETE FROM api_keys WHERE id = ?', [keyId])

    return NextResponse.json({
      success: true,
      message: 'API ключ удален'
    })

  } catch (error) {
    console.error('Delete API key error:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
