export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещён' },
        { status: 403 }
      )
    }

    // Всего ключей
    const keysResult = await query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
       FROM api_keys`
    )

    // Всего запросов
    const requestsResult = await query(
      `SELECT 
        COUNT(*) as total,
        AVG(response_time) as avg_time,
        SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) as success
       FROM api_requests`
    )

    // Запросы сегодня
    const todayResult = await query(
      `SELECT COUNT(*) as count
       FROM api_requests
       WHERE DATE(created_at) = CURDATE()`
    )

    // Топ эндпоинтов
    const endpointsResult = await query(
      `SELECT 
        endpoint,
        COUNT(*) as count,
        AVG(response_time) as avg_time
       FROM api_requests
       GROUP BY endpoint
       ORDER BY count DESC
       LIMIT 10`
    )

    // Последние запросы
    const recentResult = await query(
      `SELECT 
        r.endpoint,
        r.method,
        r.status_code,
        r.response_time,
        r.created_at,
        k.name as key_name
       FROM api_requests r
       LEFT JOIN api_keys k ON k.id = r.api_key_id
       ORDER BY r.created_at DESC
       LIMIT 20`
    )

    const totalRequests = parseInt(requestsResult.rows[0]?.total || '0')
    const successCount = parseInt(requestsResult.rows[0]?.success || '0')
    const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0

    const stats = {
      totalKeys: parseInt(keysResult.rows[0]?.total || '0'),
      activeKeys: parseInt(keysResult.rows[0]?.active || '0'),
      totalRequests,
      requestsToday: parseInt(todayResult.rows[0]?.count || '0'),
      avgResponseTime: Math.round(parseFloat(requestsResult.rows[0]?.avg_time || '0')),
      successRate,
      topEndpoints: endpointsResult.rows.map((row: any) => ({
        endpoint: row.endpoint,
        count: parseInt(row.count),
        avgTime: Math.round(parseFloat(row.avg_time))
      })),
      recentRequests: recentResult.rows.map((row: any) => ({
        endpoint: row.endpoint,
        method: row.method,
        status: row.status_code,
        responseTime: row.response_time,
        createdAt: row.created_at,
        keyName: row.key_name || 'Unknown'
      }))
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('API stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
