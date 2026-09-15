export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { nsGiftsAPI } from '@/lib/nsgifts'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    // Получаем заказ
    const order = await prisma.order.findUnique({
      where: { id: (await params).id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            balance: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Заказ уже обработан' }, { status: 400 })
    }

    // Проверяем баланс
    if (order.user.balance < order.totalAmount) {
      return NextResponse.json(
        { error: 'Недостаточно средств на балансе' },
        { status: 400 }
      )
    }

    // Списываем средства с баланса
    await prisma.user.update({
      where: { id: order.userId },
      data: {
        balance: {
          decrement: order.totalAmount
        }
      }
    })

    // Создаем транзакцию
    await prisma.transaction.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        amount: -order.totalAmount,
        type: 'PURCHASE',
        status: 'COMPLETED',
        description: `Покупка заказа #${order.id}`
      }
    })

    // Обновляем статус заказа
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paymentMethod: 'BALANCE',
        paidAt: new Date()
      }
    })

    // Отправляем заказ в NS.Gifts для доставки на Steam аккаунт
    const deliveryData: any = {
      steamProfileUrl: order.steamProfileUrl,
      deliveredAt: new Date().toISOString(),
      items: []
    }

    let hasNsGiftsItems = false

    try {
      for (const item of order.items) {
        console.log(`Processing item ${item.id}: ${item.product.name}, nsGiftsId: ${item.product.nsGiftsId}`)
        
        if (item.product.nsGiftsId) {
          hasNsGiftsItems = true
          
          console.log(`Sending order to NS.Gifts for product ${item.product.nsGiftsId}...`)
          
          const nsOrder = await nsGiftsAPI.createOrder({
            productId: item.product.nsGiftsId,
            quantity: item.quantity,
            email: order.deliveryEmail || session.user.email,
            steamProfileUrl: order.steamProfileUrl || undefined,
            customData: { orderId: order.id, itemId: item.id }
          })

          console.log(`✅ Order item ${item.id} processed with NS.Gifts:`, JSON.stringify(nsOrder, null, 2))
          
          // Сохраняем данные о доставке
          deliveryData.items.push({
            productId: item.product.id,
            productName: item.product.name,
            nsGiftsOrderId: nsOrder.id || nsOrder.order_id,
            status: nsOrder.status || 'DELIVERED',
            deliveryMethod: 'STEAM_GIFT',
            processedAt: new Date().toISOString()
          })
        } else {
          console.log(`⚠️ Item ${item.id} (${item.product.name}) does not have nsGiftsId - manual processing required`)
          
          // Товар без интеграции с NS.Gifts
          deliveryData.items.push({
            productId: item.product.id,
            productName: item.product.name,
            status: 'PENDING_MANUAL',
            deliveryMethod: 'MANUAL',
            note: 'Требуется ручная обработка администратором'
          })
        }
      }

      // Обновляем заказ с данными доставки и статусом COMPLETED
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: hasNsGiftsItems ? 'COMPLETED' : 'PAID',
          deliveryData: JSON.stringify(deliveryData),
          completedAt: hasNsGiftsItems ? new Date() : null
        }
      })
      
      console.log(`✅ Order ${order.id} updated. Status: ${hasNsGiftsItems ? 'COMPLETED' : 'PAID (manual processing required)'}`)
    } catch (nsError: any) {
      console.error('❌ NS.Gifts order error:', nsError)
      console.error('Error details:', nsError.response?.data || nsError.message)
      
      // Обновляем заказ со статусом PAID (ключи нужно выдать вручную)
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          deliveryData: JSON.stringify({
            error: 'Ошибка получения ключей от поставщика',
            message: 'Обратитесь в поддержку',
            errorDetails: nsError.message,
            steamProfileUrl: order.steamProfileUrl
          })
        }
      })
      
      console.log(`⚠️ Order ${order.id} marked as PAID - manual delivery required`)
    }

    return NextResponse.json({
      success: true,
      message: 'Заказ успешно оплачен!',
      order: {
        id: order.id,
        status: 'PAID'
      }
    })
  } catch (error: any) {
    console.error('Pay with balance error:', error)
    return NextResponse.json(
      { error: 'Ошибка при оплате заказа' },
      { status: 500 }
    )
  }
}
