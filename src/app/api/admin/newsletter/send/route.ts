export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { getPromoEmail, replaceVariables } from '@/lib/email-templates'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const body = await req.json()
    const { subject, message, target, isAdvertising } = body

    if (!subject || !message || !target) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })
    }

    // Получаем пользователей в зависимости от таргета
    let result
    
    if (target === 'ALL') {
      result = await query(
        `SELECT email, name FROM users WHERE email != ''`,
        []
      )
    } else if (target === 'WITH_ORDERS') {
      result = await query(
        `SELECT DISTINCT u.email, u.name 
         FROM users u 
         INNER JOIN orders o ON u.id = o.user_id 
         WHERE u.email != '' AND o.status = 'COMPLETED'`,
        []
      )
    } else if (target === 'ACTIVE') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      result = await query(
        `SELECT DISTINCT u.email, u.name 
         FROM users u 
         LEFT JOIN orders o ON u.id = o.user_id 
         WHERE u.email != '' 
         AND (o.created_at >= ? OR u.created_at >= ?)`,
        [sevenDaysAgo, sevenDaysAgo]
      )
    } else {
      return NextResponse.json({ error: 'Неверный таргет' }, { status: 400 })
    }

    const users = result.rows

    let sent = 0
    let failed = 0

    // Отправляем письма
    for (const user of users) {
      if (!user.email) continue

      try {
        // Заменяем переменные в тексте
        const personalizedMessage = replaceVariables(message, {
          name: user.name || 'Пользователь',
          email: user.email
        })

        // Генерируем красивый HTML шаблон
        const htmlContent = getPromoEmail(
          user.name || 'Пользователь',
          user.email,
          subject,
          personalizedMessage
        )

        await sendEmail({
          to: user.email,
          subject: subject,
          text: personalizedMessage,
          html: htmlContent
        })

        sent++
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error)
        failed++
      }

      // Небольшая задержка между письмами
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return NextResponse.json({
      sent,
      failed,
      total: users.length
    })
  } catch (error: any) {
    console.error('Newsletter send error:', error)
    return NextResponse.json(
      { error: 'Ошибка отправки рассылки', message: error.message },
      { status: 500 }
    )
  }
}
