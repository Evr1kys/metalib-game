export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function GET() {
  try {
    const result = await sendEmail({
      to: 'no-reply@metalib.xyz',
      subject: '🎮 Тест локальной доставки email - MetaLib Shop',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6; 
              color: #1f2937;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 50px 30px;
              text-align: center;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .header h1 {
              color: white;
              font-size: 32px;
              font-weight: 700;
              margin: 0;
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .content { 
              padding: 40px 30px;
              background: white;
            }
            .success-badge {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              margin: 20px 0;
              font-size: 24px;
              font-weight: bold;
            }
            .info-box {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .info-box h3 {
              margin-top: 0;
              color: #667eea;
            }
            .footer { 
              background: #f9fafb;
              text-align: center;
              padding: 30px;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✉️</div>
              <h1>Email Test</h1>
            </div>
            <div class="content">
              <div class="success-badge">
                ✅ Тест успешен!
              </div>
              
              <h2>Привет! 👋</h2>
              <p>Это тестовое письмо с <strong>MetaLib Shop</strong> для проверки работы email через TLS.</p>
              
              <div class="info-box">
                <h3>📋 Параметры подключения:</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li><strong>Хост:</strong> mail.metalib.xyz</li>
                  <li><strong>Порт:</strong> 465</li>
                  <li><strong>Шифрование:</strong> SSL/TLS</li>
                  <li><strong>TLS версия:</strong> ≥ 1.2</li>
                  <li><strong>От:</strong> no-reply@metalib.xyz</li>
                </ul>
              </div>
              
              <p>Если вы получили это письмо — значит настройки email работают корректно! 🎉</p>
              
              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                Время отправки: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} (МСК)
              </p>
            </div>
            <div class="footer">
              <p><strong>© ${new Date().getFullYear()} MetaLib Shop</strong></p>
              <p>Тестовое письмо</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: 'Тест email с TLS - если вы видите это письмо, значит всё работает!'
    })

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email успешно отправлен на no-reply@metalib.xyz (локальная доставка)',
        messageId: result.messageId 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
