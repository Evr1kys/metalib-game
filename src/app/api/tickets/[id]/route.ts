export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { sendEmail, emailTemplates } from '@/lib/email'
import { 
  rateLimitWithInfo, 
  sanitizeInput, 
  isSpam, 
  hasSQLInjection,
  checkSuspiciousActivity 
} from '@/lib/security'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    // Получаем тикет из MySQL
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

    const ticketRow = ticketResult.rows[0]

    // Проверяем доступ
    if (ticketRow.user_id !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    // Получаем сообщения
    const messagesResult = await query(
      `SELECT tm.*, u.id as sender_id, u.name as sender_name
       FROM ticket_messages tm
       LEFT JOIN users u ON tm.user_id = u.id
       WHERE tm.ticket_id = ?
       ORDER BY tm.created_at ASC`,
      [(await params).id]
    )

    const ticket = {
      id: ticketRow.id,
      userId: ticketRow.user_id,
      subject: ticketRow.subject,
      description: ticketRow.description,
      status: ticketRow.status?.toUpperCase() || 'OPEN',
      priority: ticketRow.priority?.toUpperCase() || 'MEDIUM',
      createdAt: ticketRow.created_at,
      updatedAt: ticketRow.updated_at,
      closedAt: ticketRow.closed_at,
      user: {
        id: ticketRow.user_id,
        name: ticketRow.user_name,
        email: ticketRow.user_email,
      },
      messages: messagesResult.rows.map((msg: any) => ({
        id: msg.id,
        ticketId: msg.ticket_id,
        userId: msg.user_id,
        message: msg.message,
        attachments: msg.attachments,
        isStaff: msg.is_admin === 1,
        createdAt: msg.created_at,
        user: {
          id: msg.sender_id,
          name: msg.sender_name,
        }
      }))
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Get ticket error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении тикета' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    // Rate limiting - максимум 10 сообщений в 5 минут
    const rateLimitKey = `ticket_message_${session.user.id}`
    const rateCheck = rateLimitWithInfo(rateLimitKey, 10, 5 * 60 * 1000)

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Слишком много сообщений. Подождите ${rateCheck.retryAfter} секунд`,
          retryAfter: rateCheck.retryAfter 
        },
        { status: 429 }
      )
    }

    // Проверка подозрительной активности
    if (checkSuspiciousActivity(session.user.id, 15, 60000)) {
      return NextResponse.json(
        { error: 'Обнаружена подозрительная активность. Пожалуйста, подождите.' },
        { status: 429 }
      )
    }

    const { message, attachments } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Сообщение обязательно' }, { status: 400 })
    }

    // Sanitize входные данные
    const sanitizedMessage = sanitizeInput(message)

    // Проверка на SQL injection
    if (hasSQLInjection(sanitizedMessage)) {
      console.warn(`SQL Injection attempt in ticket message from user ${session.user.id}`)
      return NextResponse.json(
        { error: 'Обнаружены недопустимые символы' },
        { status: 400 }
      )
    }

    // Проверка на спам (пропускаем для админов)
    if (session.user.role !== 'admin' && isSpam(sanitizedMessage)) {
      console.warn(`Spam attempt in ticket message from user ${session.user.id}`)
      return NextResponse.json(
        { error: 'Сообщение выглядит как спам. Пожалуйста, проверьте содержимое.' },
        { status: 400 }
      )
    }

    // Валидация длины
    if (sanitizedMessage.length < 1 || sanitizedMessage.length > 5000) {
      return NextResponse.json(
        { error: 'Сообщение должно быть от 1 до 5000 символов' },
        { status: 400 }
      )
    }

    // Получаем тикет
    const ticketResult = await query(
      `SELECT t.*, u.email as user_email, u.name as user_name
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [(await params).id]
    )

    if (ticketResult.rows.length === 0) {
      return NextResponse.json({ error: 'Тикет не найден' }, { status: 404 })
    }

    const ticket = ticketResult.rows[0]

    // Проверяем доступ
    if (ticket.user_id !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const isStaff = session.user.role === 'admin'

    // Prepare attachments JSON
    let attachmentsJson = null
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      attachmentsJson = JSON.stringify(attachments)
    }

    // Создаем сообщение
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    await query(
      `INSERT INTO ticket_messages (id, ticket_id, user_id, message, attachments, is_admin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [messageId, (await params).id, session.user.id, sanitizedMessage, attachmentsJson, isStaff ? 1 : 0]
    )

    // Обновляем статус тикета
    await query(
      `UPDATE tickets 
       SET status = ?, updated_at = NOW()
       WHERE id = ?`,
      ['in_progress', (await params).id]
    )

    // Получаем созданное сообщение
    const messageResult = await query(
      `SELECT tm.*, u.name as sender_name
       FROM ticket_messages tm
       LEFT JOIN users u ON tm.user_id = u.id
       WHERE tm.id = ?`,
      [messageId]
    )

    const ticketMessage = {
      id: messageResult.rows[0].id,
      ticketId: messageResult.rows[0].ticket_id,
      userId: messageResult.rows[0].user_id,
      message: messageResult.rows[0].message,
      attachments: messageResult.rows[0].attachments,
      isStaff: messageResult.rows[0].is_admin === 1,
      createdAt: messageResult.rows[0].created_at,
      user: {
        name: messageResult.rows[0].sender_name
      }
    }

    // Отправляем email уведомление
    if (isStaff && ticket.user_email) {
      const emailContent = emailTemplates.ticketReply(
        ticket.user_name || 'Пользователь',
        ticket.id,
        sanitizedMessage
      )
      await sendEmail({
        to: ticket.user_email,
        subject: emailContent.subject,
        html: emailContent.html,
      })
    }

    return NextResponse.json({ message: ticketMessage })
  } catch (error) {
    console.error('Add ticket message error:', error)
    return NextResponse.json(
      { error: 'Ошибка при добавлении сообщения' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const { status } = await req.json()

    await query(
      `UPDATE tickets 
       SET status = ?, closed_at = ?, updated_at = NOW()
       WHERE id = ?`,
      [status.toLowerCase(), status === 'CLOSED' ? new Date() : null, (await params).id]
    )

    const ticketResult = await query(
      `SELECT * FROM tickets WHERE id = ?`,
      [(await params).id]
    )

    const ticket = {
      id: ticketResult.rows[0].id,
      userId: ticketResult.rows[0].user_id,
      subject: ticketResult.rows[0].subject,
      status: ticketResult.rows[0].status?.toUpperCase(),
      priority: ticketResult.rows[0].priority?.toUpperCase(),
      createdAt: ticketResult.rows[0].created_at,
      updatedAt: ticketResult.rows[0].updated_at,
      closedAt: ticketResult.rows[0].closed_at,
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Update ticket error:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении тикета' },
      { status: 500 }
    )
  }
}
