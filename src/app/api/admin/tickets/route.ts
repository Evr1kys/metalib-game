export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    // Получаем тикеты из MySQL
    const ticketsResult = await query(
      `SELECT t.*, u.id as user_id, u.name as user_name, u.email as user_email
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
    )

    // Получаем количество сообщений для каждого тикета
    const messagesCountResult = await query(
      `SELECT ticket_id, COUNT(*) as count
       FROM ticket_messages
       GROUP BY ticket_id`
    )

    const messageCountMap = new Map()
    messagesCountResult.rows.forEach((row: any) => {
      messageCountMap.set(row.ticket_id, parseInt(row.count))
    })

    const tickets = ticketsResult.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      subject: row.subject,
      description: row.description,
      status: row.status?.toUpperCase() || 'OPEN',
      isArchived: row.is_archived === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      closedAt: row.closed_at,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
      },
      _count: {
        messages: messageCountMap.get(row.id) || 0
      }
    }))

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении тикетов' },
      { status: 500 }
    )
  }
}
