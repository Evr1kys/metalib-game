export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { 
  rateLimitWithInfo, 
  sanitizeInput, 
  isSpam, 
  hasSQLInjection,
  checkSuspiciousActivity,
  getClientIP 
} from '@/lib/security'
import { validateData, schemas } from '@/lib/input-validation'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    // Получаем тикеты из MySQL
    let ticketsQuery = `
      SELECT t.*, u.id as user_id, u.name as user_name, u.email as user_email
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
    `
    
    const params: any[] = []
    
    if (session.user.role !== 'admin') {
      ticketsQuery += ' WHERE t.user_id = ?'
      params.push(session.user.id)
    }
    
    ticketsQuery += ' ORDER BY t.created_at DESC'

    const result = await query(ticketsQuery, params)
    
    const tickets = result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      subject: row.subject,
      status: row.status?.toUpperCase() || 'OPEN',
      isArchived: false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
      },
      messages: [],
      _count: {
        messages: 0
      }
    }))

    console.log('Returning tickets:', tickets.length)
    console.log('First ticket:', tickets[0])

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении тикетов' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    // Rate limiting - максимум 3 тикета в час
    const rateLimitKey = `ticket_create_${session.user.id}`
    const rateCheck = rateLimitWithInfo(rateLimitKey, 3, 60 * 60 * 1000) // 3 запроса в час

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Слишком много запросов. Попробуйте через ${rateCheck.retryAfter} секунд`,
          retryAfter: rateCheck.retryAfter 
        },
        { status: 429 }
      )
    }

    // Проверка подозрительной активности
    if (checkSuspiciousActivity(session.user.id, 5, 60000)) {
      return NextResponse.json(
        { error: 'Обнаружена подозрительная активность. Пожалуйста, подождите.' },
        { status: 429 }
      )
    }

    const body = await req.json()

    // Валидация с использованием схемы
    const validation = validateData(
      { subject: body.subject, message: body.description || body.message },
      schemas.ticket
    )

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.errors },
        { status: 400 }
      )
    }

    const { subject, message } = validation.sanitized!
    const description = message

    // Проверка на спам (пропускаем для админов)
    if (session.user.role !== 'admin') {
      if (isSpam(subject) || isSpam(description)) {
        console.warn(`Spam attempt from user ${session.user.id}`, { subject: subject.substring(0, 50) })
        return NextResponse.json(
          { error: 'Описание выглядит как спам. Пожалуйста, проверьте содержимое.' },
          { status: 400 }
        )
      }
    }

    // Создаём тикет через MySQL (id автоинкремент)
    const insertResult = await query(
      `INSERT INTO tickets (user_id, subject, description, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [session.user.id, subject, description, 'OPEN']
    )

    // Получаем созданный тикет
    const ticketResult = await query(
      `SELECT t.*, u.id as user_id, u.name as user_name, u.email as user_email
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [insertResult.insertId]
    )

    const ticket = {
      id: ticketResult.rows[0].id,
      userId: ticketResult.rows[0].user_id,
      subject: ticketResult.rows[0].subject,
      description: ticketResult.rows[0].description,
      status: ticketResult.rows[0].status?.toUpperCase() || 'OPEN',
      createdAt: ticketResult.rows[0].created_at,
      user: {
        id: ticketResult.rows[0].user_id,
        name: ticketResult.rows[0].user_name,
        email: ticketResult.rows[0].user_email,
      }
    }

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании тикета' },
      { status: 500 }
    )
  }
}
