export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    // Total users
    const totalResult = await query('SELECT COUNT(*) as total FROM users', [])
    const total = totalResult.rows[0].total
    
    // Users with completed orders
    const withOrdersResult = await query(
      `SELECT COUNT(DISTINCT u.id) as total 
       FROM users u 
       INNER JOIN orders o ON u.id = o.user_id 
       WHERE o.status = 'COMPLETED'`,
      []
    )
    const withOrders = withOrdersResult.rows[0].total

    // Active users (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const activeResult = await query(
      `SELECT COUNT(DISTINCT u.id) as total 
       FROM users u 
       LEFT JOIN orders o ON u.id = o.user_id 
       WHERE o.created_at >= ? OR u.created_at >= ?`,
      [sevenDaysAgo, sevenDaysAgo]
    )
    const active = activeResult.rows[0].total

    return NextResponse.json({
      total,
      withOrders,
      active
    })
  } catch (error: any) {
    console.error('Newsletter stats error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения статистики' },
      { status: 500 }
    )
  }
}
