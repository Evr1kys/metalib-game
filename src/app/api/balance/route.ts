export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    // Получаем транзакции пользователя
    const transactionsResult = await query(
      `SELECT id, user_id, amount, type, status, description,
              DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at,
              DATE_FORMAT(updated_at, "%Y-%m-%dT%H:%i:%s.000Z") as updated_at
       FROM transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [session.user.id]
    )

    // Получаем баланс пользователя
    const userResult = await query(
      'SELECT balance FROM users WHERE id = ?',
      [session.user.id]
    )

    const user = userResult.rows[0]

    // Преобразуем числовые поля в транзакциях
    const transactions = transactionsResult.rows.map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      amount: parseFloat(t.amount),
      type: t.type,
      status: t.status,
      description: t.description,
      createdAt: t.created_at || new Date().toISOString(),
      updatedAt: t.updated_at || new Date().toISOString(),
    }))

    return NextResponse.json({ 
      transactions,
      balance: parseFloat(user?.balance || 0),
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении транзакций' },
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

    const { type, amount, description } = await req.json()

    if (!type || !amount) {
      return NextResponse.json(
        { error: 'Тип и сумма обязательны' },
        { status: 400 }
      )
    }

    // Только админы могут создавать транзакции вручную
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    // Создаём транзакцию
    const { nanoid } = await import('nanoid')
    const transactionId = nanoid()
    
    await query(
      `INSERT INTO transactions (id, user_id, amount, type, status, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [transactionId, session.user.id, amount, type.toLowerCase(), 'completed', description]
    )

    // Обновляем баланс
    if (type === 'deposit' || type === 'refund' || type === 'referral_bonus') {
      await query(
        `UPDATE users 
         SET balance = balance + ?, updated_at = NOW()
         WHERE id = ?`,
        [amount, session.user.id]
      )
    } else if (type === 'withdrawal' || type === 'purchase') {
      await query(
        `UPDATE users 
         SET balance = balance - ?, updated_at = NOW()
         WHERE id = ?`,
        [amount, session.user.id]
      )
    }

    // Получаем созданную транзакцию
    const transactionResult = await query(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    )

    return NextResponse.json({ transaction: transactionResult.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании транзакции' },
      { status: 500 }
    )
  }
}
