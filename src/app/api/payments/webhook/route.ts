export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-platega-signature')
    const rawBody = await req.text()

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // TODO: Проверка подписи вебхука Platega
    // const crypto = require('crypto')
    // const hash = crypto.createHmac('sha256', process.env.PLATEGA_WEBHOOK_SECRET!)
    //   .update(rawBody)
    //   .digest('hex')
    // if (hash !== signature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const data = JSON.parse(rawBody)
    const { paymentId, status, orderId, amount } = data

    console.log('Webhook received:', { paymentId, status, orderId, amount })

    // Находим заказ
    const order = await prisma.order.findFirst({
      where: { paymentId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    })

    if (!order) {
      console.error('Order not found for payment:', paymentId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Обновляем статус заказа в зависимости от статуса платежа
    switch (status) {
      case 'succeeded':
      case 'completed':
        // Платеж успешен
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        })

        // Создаем транзакцию пополнения баланса
        await prisma.transaction.create({
          data: {
            userId: order.userId,
            amount: order.totalAmount,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            orderId: order.id,
            description: `Оплата заказа #${order.id.slice(0, 8)}`,
          },
        })

        // Обновляем баланс пользователя
        await prisma.user.update({
          where: { id: order.userId },
          data: {
            balance: {
              increment: order.totalAmount,
            },
          },
        })

        console.log(`Order ${order.id} marked as PAID`)
        break

      case 'failed':
      case 'canceled':
        // Платеж отменен или провален
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
          },
        })

        console.log(`Order ${order.id} marked as CANCELLED`)
        break

      case 'refunded':
        // Платеж возвращен
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'REFUNDED',
          },
        })

        // Создаем транзакцию возврата
        await prisma.transaction.create({
          data: {
            userId: order.userId,
            amount: -order.totalAmount,
            type: 'WITHDRAWAL',
            status: 'COMPLETED',
            orderId: order.id,
            description: `Возврат за заказ #${order.id.slice(0, 8)}`,
          },
        })

        // Уменьшаем баланс пользователя
        await prisma.user.update({
          where: { id: order.userId },
          data: {
            balance: {
              decrement: order.totalAmount,
            },
          },
        })

        console.log(`Order ${order.id} marked as REFUNDED`)
        break

      default:
        console.log(`Unhandled payment status: ${status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    )
  }
}
