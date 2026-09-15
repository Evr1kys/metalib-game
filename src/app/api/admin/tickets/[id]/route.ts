export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const body = await req.json()
    const { status, isArchived } = body

    // Валидация
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

    const updateFields: string[] = []
    const updateValues: any[] = []

    if (status && validStatuses.includes(status)) {
      updateFields.push('status = ?')
      updateValues.push(status.toLowerCase())
      
      if (status === 'CLOSED') {
        updateFields.push('closed_at = NOW()')
        // Автоматически переносим в архив при закрытии
        updateFields.push('is_archived = 1')
      }
    }

    if (typeof isArchived === 'boolean') {
      updateFields.push('is_archived = ?')
      updateValues.push(isArchived ? 1 : 0)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 })
    }

    updateFields.push('updated_at = NOW()')

    // Обновляем тикет
    await query(
      `UPDATE tickets SET ${updateFields.join(', ')} WHERE id = ?`,
      [...updateValues, (await params).id]
    )

    // Получаем обновленный тикет
    const ticketResult = await query(
      `SELECT t.*, u.id as user_id, u.name as user_name, u.email as user_email
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [(await params).id]
    )

    if (ticketResult.rows.length === 0) {
      return NextResponse.json({ error: 'Тикет не найден' }, { status: 404 })
    }

    // Получаем количество сообщений
    const countResult = await query(
      `SELECT COUNT(*) as count FROM ticket_messages WHERE ticket_id = ?`,
      [(await params).id]
    )

    const row = ticketResult.rows[0]
    const ticket = {
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
        messages: parseInt(countResult.rows[0].count)
      }
    }

    return NextResponse.json(ticket)
  } catch (error: any) {
    console.error('Update ticket error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления тикета', message: error.message },
      { status: 500 }
    )
  }
}
