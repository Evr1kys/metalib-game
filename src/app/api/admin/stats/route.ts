export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    // Получаем статистику через raw SQL
    const totalOrdersResult = await query('SELECT COUNT(*) as count FROM orders')
    const totalOrders = parseInt(totalOrdersResult.rows[0].count)

    const totalRevenueResult = await query(
      "SELECT SUM(total) as revenue FROM orders WHERE status = 'completed'"
    )
    const totalRevenue = parseFloat(totalRevenueResult.rows[0].revenue || 0)

    const totalUsersResult = await query('SELECT COUNT(*) as count FROM users')
    const totalUsers = parseInt(totalUsersResult.rows[0].count)

    const totalProductsResult = await query('SELECT COUNT(*) as count FROM products')
    const totalProducts = parseInt(totalProductsResult.rows[0].count)

    // Получаем последние заказы с пользователями
    const recentOrdersResult = await query(
      `SELECT o.id, o.user_id, o.total, o.status,
              DATE_FORMAT(o.created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at,
              u.email, u.name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    )

    const recentOrders = recentOrdersResult.rows.map((order: any) => ({
      id: order.id,
      userId: order.user_id,
      status: order.status,
      totalAmount: parseFloat(order.total),
      createdAt: order.created_at || new Date().toISOString(),
      user: {
        email: order.email,
        name: order.name,
      },
      items: [] // Для простоты пока пустой массив
    }))

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      recentOrders,
    })
  } catch (error) {
    console.error('Get admin stats error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении статистики' },
      { status: 500 }
    )
  }
}
