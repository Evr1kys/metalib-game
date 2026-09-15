export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, hasPermission, logApiRequest } from '@/lib/api-auth'
import { query } from '@/lib/db'

/**
 * GET /api/v1/categories - Получить список категорий
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Валидация API ключа
    const apiKey = await validateApiKey(req)
    
    if (!apiKey) {
      await logApiRequest('unknown', '/api/v1/categories', 'GET', 401, Date.now() - startTime)
      return NextResponse.json(
        { error: 'Неверный или отсутствующий API ключ' },
        { status: 401 }
      )
    }

    // Проверка прав
    if (!hasPermission(apiKey, 'products:read')) {
      await logApiRequest(apiKey.id, '/api/v1/categories', 'GET', 403, Date.now() - startTime)
      return NextResponse.json(
        { error: 'Недостаточно прав для чтения каталога' },
        { status: 403 }
      )
    }

    // Получаем категории с количеством активных товаров
    const result = await query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.icon,
        c.is_active as isActive,
        COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id, c.name, c.slug, c.description, c.icon, c.is_active
      ORDER BY c.name ASC
    `)

    const categories = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      icon: row.icon,
      isActive: row.isActive === 1,
      productCount: parseInt(row.productCount) || 0
    }))

    const responseTime = Date.now() - startTime
    await logApiRequest(apiKey.id, '/api/v1/categories', 'GET', 200, responseTime)

    return NextResponse.json({
      success: true,
      data: categories
    })

  } catch (error) {
    console.error('API v1 categories error:', error)
    const responseTime = Date.now() - startTime
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
