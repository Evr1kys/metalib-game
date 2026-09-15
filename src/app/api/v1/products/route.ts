export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, hasPermission, logApiRequest } from '@/lib/api-auth'
import { query } from '@/lib/db'

/**
 * GET /api/v1/products - Получить список товаров для реселла
 * 
 * Query параметры:
 * - category: фильтр по категории (slug)
 * - limit: количество товаров (по умолчанию 50, макс 100)
 * - offset: смещение для пагинации
 * - active: только активные товары (true/false)
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Валидация API ключа
    const apiKey = await validateApiKey(req)
    
    if (!apiKey) {
      await logApiRequest('unknown', '/api/v1/products', 'GET', 401, Date.now() - startTime)
      return NextResponse.json(
        { error: 'Неверный или отсутствующий API ключ' },
        { status: 401 }
      )
    }

    // Проверка прав
    if (!hasPermission(apiKey, 'products:read')) {
      await logApiRequest(apiKey.id, '/api/v1/products', 'GET', 403, Date.now() - startTime)
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра товаров' },
        { status: 403 }
      )
    }

    // Параметры запроса
    const searchParams = req.nextUrl.searchParams
    const category = searchParams.get('category')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const activeOnly = searchParams.get('active') !== 'false'

    // Строим запрос
    let sql = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image,
        p.stock,
        p.is_active,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `
    const params: any[] = []

    if (activeOnly) {
      sql += ' AND p.is_active = 1'
    }

    if (category) {
      sql += ' AND c.slug = ?'
      params.push(category)
    }

    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const result = await query(sql, params)

    const products = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      image: row.image,
      stock: row.stock,
      isActive: row.is_active === 1,
      category: row.category_id ? {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug
      } : null
    }))

    // Получаем общее количество для пагинации
    let countSql = 'SELECT COUNT(*) as total FROM products p'
    const countParams: any[] = []
    
    if (category) {
      countSql += ' LEFT JOIN categories c ON p.category_id = c.id WHERE c.slug = ?'
      countParams.push(category)
      if (activeOnly) {
        countSql += ' AND p.is_active = 1'
      }
    } else if (activeOnly) {
      countSql += ' WHERE p.is_active = 1'
    }

    const countResult = await query(countSql, countParams)
    const total = countResult.rows[0].total

    const responseTime = Date.now() - startTime
    await logApiRequest(apiKey.id, '/api/v1/products', 'GET', 200, responseTime)

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('API v1 products error:', error)
    const responseTime = Date.now() - startTime
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
