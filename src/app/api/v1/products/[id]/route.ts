export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, hasPermission, logApiRequest } from '@/lib/api-auth'
import { query } from '@/lib/db'
import { validateId } from '@/lib/input-validation'

/**
 * GET /api/v1/products/[id] - Получить товар по ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()
  
  try {
    // Валидация API ключа
    const apiKey = await validateApiKey(req)
    
    if (!apiKey) {
      await logApiRequest('unknown', `/api/v1/products/${params.id}`, 'GET', 401, Date.now() - startTime)
      return NextResponse.json(
        { error: 'Неверный или отсутствующий API ключ' },
        { status: 401 }
      )
    }

    // Проверка прав
    if (!hasPermission(apiKey, 'products:read')) {
      await logApiRequest(apiKey.id, `/api/v1/products/${params.id}`, 'GET', 403, Date.now() - startTime)
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра товаров' },
        { status: 403 }
      )
    }

    // Валидация ID
    if (!validateId(params.id)) {
      await logApiRequest(apiKey.id, `/api/v1/products/${params.id}`, 'GET', 400, Date.now() - startTime)
      return NextResponse.json(
        { error: 'Неверный ID товара' },
        { status: 400 }
      )
    }

    const result = await query(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image,
        p.stock,
        p.is_active,
        p.created_at,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [params.id]
    )

    if (result.rows.length === 0) {
      const responseTime = Date.now() - startTime
      await logApiRequest(apiKey.id, `/api/v1/products/${params.id}`, 'GET', 404, responseTime)
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    const row = result.rows[0]
    const product = {
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      image: row.image,
      stock: row.stock,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      category: row.category_id ? {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug
      } : null
    }

    const responseTime = Date.now() - startTime
    await logApiRequest(apiKey.id, `/api/v1/products/${params.id}`, 'GET', 200, responseTime)

    return NextResponse.json({
      success: true,
      data: product
    })

  } catch (error) {
    console.error('API v1 product detail error:', error)
    const responseTime = Date.now() - startTime
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
