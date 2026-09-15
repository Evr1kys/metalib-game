export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { getPlatega } from '@/lib/platega'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    console.log('[Payment Create] Looking for order:', orderId)

    // Получаем заказ
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    )

    console.log('[Payment Create] Query result:', orderResult.rows.length, 'rows')
    console.log('[Payment Create] Order data:', orderResult.rows[0])

    const order = orderResult.rows[0]

    if (!order) {
      console.error('[Payment Create] Order not found:', orderId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Проверяем, что заказ принадлежит пользователю
    if (order.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Проверяем, что заказ еще не оплачен
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order already processed' }, { status: 400 })
    }

    // Создаем платеж в Platega
    const platega = getPlatega()
    const payment = await platega.createPayment({
      amount: order.total,
      description: `Пополнение баланса на ${order.total} ₽`,
      successUrl: `${process.env.NEXTAUTH_URL}/balance?success=true`,
      failUrl: `${process.env.NEXTAUTH_URL}/balance?success=false`,
      metadata: {
        orderId: order.id,
        userId: order.user_id,
      },
    })

    // Обновляем заказ с ID платежа
    await query(
      `UPDATE orders 
       SET payment_method = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      ['platega_' + payment.transactionId, 'pending', orderId]
    )

    return NextResponse.json({
      success: true,
      paymentUrl: payment.redirect,
      paymentId: payment.transactionId,
    })
  } catch (error: any) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}
