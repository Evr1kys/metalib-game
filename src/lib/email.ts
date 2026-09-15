import nodemailer from 'nodemailer'

// Создаем транспортер для отправки email
const smtpPort = parseInt(process.env.SMTP_PORT || '465')
const isSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.metalib.xyz',
  port: smtpPort,
  secure: isSecure, // true для порта 465 (SSL/TLS), false для 587 (STARTTLS)
  requireTLS: !isSecure, // Требуем STARTTLS только для незащищенных портов
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Игнорируем самоподписанные сертификаты в dev окружении
    minVersion: 'TLSv1.2', // Минимум TLS 1.2
  },
  debug: process.env.NODE_ENV === 'development', // Отладка только в dev
  logger: process.env.NODE_ENV === 'development', // Логи только в dev
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'MetaLib Shop <no-reply@metalib.xyz>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}

// Шаблоны писем
export const emailTemplates = {
  verification: (name: string, verificationUrl: string) => ({
    subject: '✅ Подтверждение email - MetaLib Shop',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
          .content h2 {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content p {
            color: #4b5563;
            margin-bottom: 15px;
            font-size: 16px;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .button { 
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
          }
          .link-box {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            word-break: break-all;
            font-size: 13px;
            color: #667eea;
            margin: 20px 0;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .warning strong {
            color: #92400e;
          }
          .footer { 
            background: #f9fafb;
            text-align: center;
            padding: 30px;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            color: #6b7280;
            font-size: 14px;
            margin: 5px 0;
          }
          .social-links {
            margin-top: 20px;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎮</div>
            <h1>MetaLib Shop</h1>
          </div>
          <div class="content">
            <h2>Привет, ${name}! 👋</h2>
            <p>Добро пожаловать в <strong>MetaLib Shop</strong> — твой магазин цифровых товаров!</p>
            <p>Для завершения регистрации и активации аккаунта подтверди свой email адрес, нажав на кнопку ниже:</p>
            
            <div class="button-container">
              <a href="${verificationUrl}" class="button">✅ Подтвердить Email</a>
            </div>
            
            <p>Если кнопка не работает, скопируй и вставь эту ссылку в браузер:</p>
            <div class="link-box">${verificationUrl}</div>
            
            <div class="warning">
              <strong>⏰ Важно:</strong> Ссылка действительна только <strong>5 минут</strong>. После истечения времени потребуется повторная регистрация.
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Если вы не регистрировались на MetaLib Shop, просто проигнорируйте это письмо.
            </p>
          </div>
          <div class="footer">
            <p><strong>© ${new Date().getFullYear()} MetaLib Shop</strong></p>
            <p>Все права защищены</p>
            <div class="social-links">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}">Главная</a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/support">Поддержка</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  orderConfirmation: (name: string, orderId: string, totalAmount: number, items: any[]) => ({
    subject: `Заказ #${orderId.slice(0, 8)} подтвержден - MetaLib Shop`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .order-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          .total { background: #667eea; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 10px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Заказ Подтвержден!</h1>
          </div>
          <div class="content">
            <h2>Привет, ${name}!</h2>
            <p>Ваш заказ <strong>#${orderId.slice(0, 8)}</strong> успешно оформлен и обрабатывается.</p>
            <h3>Детали заказа:</h3>
            ${items.map(item => `
              <div class="order-item">
                <strong>${item.product.name}</strong><br>
                Количество: ${item.quantity} × ${item.price} ₽
              </div>
            `).join('')}
            <div class="total">
              Итого: ${totalAmount} ₽
            </div>
            <p>Цифровые товары будут доставлены на ваш email в течение нескольких минут.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MetaLib Shop. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  ticketReply: (name: string, ticketId: string, message: string) => ({
    subject: `Новый ответ на тикет #${ticketId.slice(0, 8)} - MetaLib Shop`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .message { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 Новый ответ</h1>
          </div>
          <div class="content">
            <h2>Привет, ${name}!</h2>
            <p>Получен новый ответ на ваш тикет <strong>#${ticketId.slice(0, 8)}</strong>:</p>
            <div class="message">${message}</div>
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/tickets/${ticketId}" class="button">Просмотреть тикет</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MetaLib Shop. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  referralBonus: (name: string, amount: number, referralName: string) => ({
    subject: `🎉 Вы получили реферальный бонус - MetaLib Shop`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .bonus { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; font-size: 32px; font-weight: bold; border-radius: 10px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Поздравляем!</h1>
          </div>
          <div class="content">
            <h2>Привет, ${name}!</h2>
            <p>Отличные новости! Вы получили реферальный бонус!</p>
            <div class="bonus">+${amount} ₽</div>
            <p><strong>${referralName}</strong> совершил покупку по вашей реферальной ссылке.</p>
            <p>Бонус был начислен на ваш баланс и доступен для использования.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MetaLib Shop. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
}
