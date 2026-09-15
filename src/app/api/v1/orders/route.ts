export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, hasPermission, logApiRequest } from '@/lib/api-auth'
import { query } from '@/lib/db'
import { nanoid } from 'nanoid'

/**
 * POST /api/v1/orders - Создать заказ
 * 
 * Body:
 * {
 *   "items": [{ "productId": "123", "quantity": 1 }],
 *   "customerEmail": "customer@example.com" (опционально)
 * }
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Валидация API ключа
    const apiKey = await validateApiKey(req)
    
    if (!apiKey) {
      await logApiRequest('unknown', '/api/v1/orders', 'POST', 401, Date.now() - startTime)
      return NextResponse.json(
        { error: 'Неверный или отсутствующий API ключ' },
        { status: 401 }
      )
    }

    // Проверка прав
    if (!hasPermission(apiKey, 'orders:create')) {
      await logApiRequest(apiKey.id, '/api/v1/orders', 'POST', 403, Date.now() - startTime)
      return NextResponse.json(
        { error: 'Недостаточно прав для создания заказов' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { items, customerEmail } = body

    // Валидация
    if (!items || !Array.isArray(items) || items.length === 0) {
      await logApiRequest(apiKey.id, '/api/v1/orders', 'POST', 400, Date.now() - startTime)
      return NextResponse.json(
        { error: 'Необходимо указать хотя бы один товар' },
        { status: 400 }
      )
    }

    if (items.length > 50) {
      await logApiRequest(apiKey.id, '/api/v1/orders', 'POST', 400, Date.now() - startTime)
      return NextResponse.json(
        { error: 'Максимум 50 товаров в одном заказе' },
        { status: 400 }
      )
    }

    // Проверяем наличие товаров и рассчитываем сумму
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const productResult = await query(
        'SELECT id, name, price, stock, is_active FROM products WHERE id = ?',
        [item.productId]
      )

      if (productResult.rows.length === 0) {
        await logApiRequest(apiKey.id, '/api/v1/orders', 'POST', 400, Date.now() - startTime)
        return NextResponse.json(
          { error: `Товар с ID ${item.productId} не найден` },
          { status: 400 }
        )
      }

      const product = productResult.rows[0]

      if (product.is_active !== 1) {
        await logApiRequest(apiKey.id, '/api/v1/orders', 'POST', 400, Date.now() - startTime)
        return NextResponse.json(
          { error: `Товар "${product.name}" недоступен` },
          { status: 400 }
        )
      }

      const quantity = parseInt(item.quantity) || 1
      if (quantity < 1 || quantity > 100) {
        await logApiRequest(apiKey.id, '/api/v1/orders', 'POST', 400, Date.now() - startTime)
        return NextResponse.json(
          { error: 'Количество должно быть от 1 до 100' },
          { status: 400 }
        )
      }

      const itemTotal = parseFloat(product.price) * quantity
      totalAmount += itemTotal

      orderItems.push({
        productId: product.id,
        productName: product.name,
        price: parseFloat(product.price),
        quantity
      })
    }

    // Создаем заказ
    const orderId = nanoid()
    await query(
      `INSERT INTO orders (id, user_id, total, status, payment_method, created_at, updated_at)
       VALUES (?, ?, ?, 'PENDING_API', 'API', NOW(), NOW())`,
      [orderId, apiKey.userId, totalAmount]
    )

    // Добавляем товары в заказ
    for (const item of orderItems) {
      await query(
        `INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [nanoid(), orderId, item.productId, item.productName, item.price, item.quantity]
      )
    }

    const responseTime = Date.now() - startTime
    await logApiRequest(apiKey.id, '/api/v1/orders', 'POST', 201, responseTime)

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        totalAmount,
        status: 'PENDING_API',
        items: orderItems,
        message: 'Заказ создан. Свяжитесь с поддержкой для оплаты и получения товаров.'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('API v1 create order error:', error)
    const responseTime = Date.now() - startTime
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
