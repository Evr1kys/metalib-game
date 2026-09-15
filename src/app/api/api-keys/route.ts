export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createApiKey, getApiKeyStats } from '@/lib/api-auth'
import { query } from '@/lib/db'

// GET /api/api-keys - Получить список API ключей пользователя
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const result = await query(
      `SELECT id, name, CONCAT(SUBSTRING(key_hash, 1, 7), '...', SUBSTRING(key_hash, -4)) as key_preview,
              permissions, is_active, last_used_at, expires_at, created_at
       FROM api_keys
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [session.user.id]
    )

    const keys = []
    for (const row of result.rows) {
      const stats = await getApiKeyStats(row.id, 30)
      
      keys.push({
        id: row.id,
        name: row.name,
        keyPreview: row.key_preview,
        permissions: JSON.parse(row.permissions as string),
        isActive: row.is_active === 1,
        lastUsedAt: row.last_used_at,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        stats
      })
    }

    return NextResponse.json({
      success: true,
      data: keys
    })

  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// POST /api/api-keys - Создать новый API ключ
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, permissions, expiresInDays } = body

    // Валидация
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      return NextResponse.json(
        { error: 'Название должно содержать минимум 3 символа' },
        { status: 400 }
      )
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json(
        { error: 'Необходимо указать хотя бы одно разрешение' },
        { status: 400 }
      )
    }

    // Проверяем количество ключей пользователя
    const countResult = await query(
      'SELECT COUNT(*) as count FROM api_keys WHERE user_id = ? AND is_active = 1',
      [session.user.id]
    )

    if (countResult.rows[0].count >= 10) {
      return NextResponse.json(
        { error: 'Максимум 10 активных API ключей на пользователя' },
        { status: 400 }
      )
    }

    // Создаем ключ
    const result = await createApiKey(
      session.user.id,
      name.trim(),
      permissions,
      expiresInDays || undefined
    )

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })

  } catch (error) {
    console.error('Create API key error:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
