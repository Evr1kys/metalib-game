export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { orderSchema } from '@/lib/validations'
import { nsGiftsAPI } from '@/lib/nsgifts'
import { rateLimitWithInfo } from '@/lib/security'
import { validateId } from '@/lib/input-validation'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    // Получаем заказы пользователя с элементами
    const ordersResult = await query(
      `SELECT o.id, o.user_id, o.total, o.status, o.payment_method,
              DATE_FORMAT(o.created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at,
              DATE_FORMAT(o.updated_at, "%Y-%m-%dT%H:%i:%s.000Z") as updated_at
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [session.user.id]
    )

    const orders = []
    for (const order of ordersResult.rows) {
      const itemsResult = await query(
        `SELECT oi.id, oi.product_id, oi.product_name, oi.price, oi.quantity, oi.digital_content,
                p.name, p.slug, p.image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      )
      
      orders.push({
        id: order.id,
        userId: order.user_id,
        totalAmount: parseFloat(order.total),
        status: order.status,
        paymentMethod: order.payment_method,
        createdAt: order.created_at || new Date().toISOString(),
        updatedAt: order.updated_at || new Date().toISOString(),
        items: itemsResult.rows.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
          digitalContent: item.digital_content,
          product: {
            name: item.name || item.product_name,
            slug: item.slug,
            image: item.image,
          }
        }))
      })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении заказов' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    // Rate limiting - максимум 10 заказов в час
    const rateCheck = rateLimitWithInfo(`order-create-${session.user.id}`, 10, 60 * 60 * 1000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Слишком много заказов. Попробуйте через ${Math.ceil(rateCheck.retryAfter! / 1000)} секунд`,
          retryAfter: rateCheck.retryAfter 
        },
        { 
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfter! / 1000)) }
        }
      )
    }

    // Проверяем подтверждение email
    if (!session.user.emailVerified) {
      return NextResponse.json(
        { error: 'Подтвердите ваш email перед совершением покупок' },
        { status: 403 }
      )
    }

    const body = await req.json()
    
    // Валидация суммы
    if (body.depositAmount !== undefined) {
      const amount = parseFloat(body.depositAmount)
      if (isNaN(amount) || amount < 10 || amount > 100000) {
        return NextResponse.json(
          { error: 'Сумма должна быть от 10 до 100,000 ₽' },
          { status: 400 }
        )
      }
    }

    // Валидация items если это покупка товаров
    if (body.items && Array.isArray(body.items)) {
      if (body.items.length === 0 || body.items.length > 50) {
        return NextResponse.json(
          { error: 'Количество товаров должно быть от 1 до 50' },
          { status: 400 }
        )
      }

      // Валидация каждого item
      for (const item of body.items) {
        if (!validateId(String(item.productId))) {
          return NextResponse.json(
            { error: 'Неверный ID товара' },
            { status: 400 }
          )
        }
        
        const quantity = parseInt(item.quantity)
        if (isNaN(quantity) || quantity < 1 || quantity > 100) {
          return NextResponse.json(
            { error: 'Количество товара должно быть от 1 до 100' },
            { status: 400 }
          )
        }
      }
    }
    
    // Проверяем, это пополнение баланса или покупка товаров
    if (body.isBalanceDeposit) {
      const { depositAmount } = body
      
      if (!depositAmount || depositAmount < 10) {
        return NextResponse.json(
          { error: 'Минимальная сумма пополнения: 10 ₽' },
          { status: 400 }
        )
      }

      // Создаем заказ для пополнения баланса
      const { nanoid } = await import('nanoid')
      const orderId = nanoid()
      
      await query(
        `INSERT INTO orders (id, user_id, total, status, payment_method, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [orderId, session.user.id, depositAmount, 'pending', 'platega']
      )

      const orderResult = await query(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      )

      return NextResponse.json({ order: orderResult.rows[0] }, { status: 201 })
    }

    // Обычная покупка товаров
    const validatedData = orderSchema.parse(body)

    // Получаем товары
    const productIds = validatedData.items.map(item => item.productId)
    const placeholders = productIds.map(() => '?').join(',')
    
    const productsResult = await query(
      `SELECT * FROM products WHERE id IN (${placeholders}) AND is_active = ?`,
      [...productIds, true]
    )
    const products = productsResult.rows

    if (products.length !== validatedData.items.length) {
      return NextResponse.json(
        { error: 'Некоторые товары не найдены или недоступны' },
        { status: 400 }
      )
    }

    // Рассчитываем общую стоимость
    const totalAmount = validatedData.items.reduce((sum, item) => {
      const product = products.find((p: any) => p.id === item.productId)
      return sum + (product?.price || 0) * item.quantity
    }, 0)

    // Создаем заказ
    const { nanoid } = await import('nanoid')
    const orderId = nanoid()
    
    await query(
      `INSERT INTO orders (id, user_id, total, status, payment_method, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [orderId, session.user.id, totalAmount, 'pending', 'balance']
    )

    // Создаем элементы заказа
    for (const item of validatedData.items) {
      const product = products.find((p: any) => p.id === item.productId)!
      const itemId = nanoid()
      
      await query(
        `INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, digital_content, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [itemId, orderId, item.productId, product.name, product.price, item.quantity, product.digital_content]
      )
    }

    // Получаем созданный заказ с элементами
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    )
    
    const itemsResult = await query(
      `SELECT oi.*, p.name, p.slug, p.image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    )

    const order = {
      ...orderResult.rows[0],
      items: itemsResult.rows
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании заказа' },
      { status: 500 }
    )
  }
}
