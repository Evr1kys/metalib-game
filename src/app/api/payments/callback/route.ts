export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    console.log('Platega callback received:', JSON.stringify(body, null, 2))

    const { id, status, paymentDetails, payload } = body
    const transactionId = id // Platega использует поле 'id' а не 'transactionId'

    // Парсим metadata
    let metadata: any = {}
    try {
      if (payload) {
        metadata = JSON.parse(payload)
      }
    } catch (e) {
      console.error('Failed to parse payload:', e)
    }

    const orderId = metadata.orderId

    if (!orderId) {
      console.error('No orderId in callback')
      return NextResponse.json({ error: 'No orderId' }, { status: 400 })
    }

    console.log('Looking for order:', orderId)

    // Находим заказ
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    )

    console.log('Order query result:', orderResult.rows.length, 'rows')

    const order = orderResult.rows[0]

    if (!order) {
      console.error('Order not found:', orderId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    console.log('Processing order:', order.id, 'Payment status:', status)

    // Обновляем статус заказа в зависимости от статуса платежа
    // Platega использует статусы: CONFIRMED, FAILED, CANCELLED
    if (status === 'CONFIRMED' || status === 'success' || status === 'completed') {
      // Проверяем, не обработан ли уже этот заказ
      if (order.status === 'completed' || order.status === 'refunded') {
        console.log('Order already processed:', order.id)
        return NextResponse.json({ success: true, message: 'Already processed' })
      }

      console.log('Processing successful payment for order:', order.id)

      // Обновляем заказ
      await query(
        `UPDATE orders 
         SET status = ?, payment_method = ?, updated_at = NOW()
         WHERE id = ?`,
        ['completed', 'platega_' + transactionId, order.id]
      )

      // Создаем транзакцию пополнения баланса
      const { nanoid } = await import('nanoid')
      const transactionId_internal = nanoid()
      
      await query(
        `INSERT INTO transactions (id, user_id, amount, type, status, description, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          transactionId_internal,
          order.user_id,
          order.total,
          'deposit',
          'completed',
          `Пополнение баланса на ${order.total} ₽`
        ]
      )

      // Обновляем баланс пользователя
      await query(
        `UPDATE users 
         SET balance = balance + ?, updated_at = NOW()
         WHERE id = ?`,
        [parseFloat(order.total), order.user_id]
      )

      console.log(`✅ Order ${order.id} marked as PAID, balance updated +${order.total}₽`)
    } else if (status === 'FAILED' || status === 'CANCELLED' || status === 'failed' || status === 'cancelled') {
      await query(
        `UPDATE orders 
         SET status = ?, updated_at = NOW()
         WHERE id = ?`,
        ['cancelled', order.id]
      )

      console.log(`Order ${order.id} marked as CANCELLED`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Callback processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process callback' },
      { status: 500 }
    )
  }
}

// GET для проверки
export async function GET() {
  return NextResponse.json({ 
    message: 'Platega callback endpoint',
    note: 'Configure this URL in Platega dashboard: https://metalib.xyz/api/payments/callback'
  })
}
