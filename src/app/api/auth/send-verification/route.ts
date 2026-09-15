export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendEmail, emailTemplates } from '@/lib/email'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email обязателен' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email уже подтвержден' }, { status: 400 })
    }

    // Удаляем старые токены
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
      },
    })

    // Создаем новый токен
    const token = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 часа

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: 'EMAIL_VERIFICATION',
        expiresAt,
      },
    })

    // Отправляем email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`
    const emailContent = emailTemplates.verification(user.name || 'Пользователь', verificationUrl)
    
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    return NextResponse.json({ 
      message: 'Письмо с подтверждением отправлено на ваш email' 
    })
  } catch (error) {
    console.error('Send verification email error:', error)
    return NextResponse.json(
      { error: 'Ошибка при отправке письма' },
      { status: 500 }
    )
  }
}
