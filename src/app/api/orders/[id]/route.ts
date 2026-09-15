export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: (await params).id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }

    // Проверяем доступ
    if (order.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении заказа' },
      { status: 500 }
    )
  }
}
