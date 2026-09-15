export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email обязателен' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли пользователь
    const result = await query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    )

    if (!result.rows || result.rows.length === 0) {
      // Не раскрываем, что пользователь не найден (безопасность)
      return NextResponse.json({ 
        success: true,
        message: 'Если аккаунт с таким email существует, письмо будет отправлено'
      })
    }

    const user = result.rows[0]

    // Удаляем старые токены сброса пароля для этого пользователя
    await query(
      'DELETE FROM password_reset_tokens WHERE email = ?',
      [email]
    )

    // Создаём новый токен
    const token = nanoid(64)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 час

    await query(
      `INSERT INTO password_reset_tokens (id, email, token, expires, created_at) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [nanoid(), email, token, expiresAt]
    )

    // Отправляем email
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Восстановление пароля</h1>
          </div>
          <div class="content">
            <p>Здравствуйте, <strong>${user.name}</strong>!</p>
            
            <p>Мы получили запрос на восстановление пароля для вашего аккаунта на <strong>MetaLib Shop</strong>.</p>
            
            <p>Чтобы создать новый пароль, нажмите на кнопку ниже:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Восстановить пароль</a>
            </div>
            
            <p>Или скопируйте эту ссылку в браузер:</p>
            <p style="background: white; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 12px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Важно:</strong>
              <ul>
                <li>Ссылка действительна в течение <strong>1 часа</strong></li>
                <li>Если вы не запрашивали восстановление пароля, просто игнорируйте это письмо</li>
                <li>Никому не передавайте эту ссылку</li>
              </ul>
            </div>
            
            <p>С уважением,<br><strong>Команда MetaLib Shop</strong></p>
          </div>
          <div class="footer">
            <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
            <p>&copy; 2025 MetaLib Shop. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `

    await sendEmail({
      to: email,
      subject: '🔐 Восстановление пароля - MetaLib Shop',
      html: emailHtml,
    })

    return NextResponse.json({ 
      success: true,
      message: 'Письмо с инструкциями отправлено на ваш email'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Ошибка при отправке письма' },
      { status: 500 }
    )
  }
}
