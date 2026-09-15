/**
 * HTML Email Templates
 */

interface EmailTemplateParams {
  subject: string
  preheader?: string
  content: string
  userName?: string
  userEmail?: string
  isAdvertising?: boolean
  unsubscribeUrl?: string
}

/**
 * Базовый HTML шаблон для email рассылки
 */
export function getEmailTemplate(params: EmailTemplateParams): string {
  const {
    subject,
    preheader = '',
    content,
    userName = 'Пользователь',
    isAdvertising = false,
    unsubscribeUrl = '#'
  } = params

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${subject}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f3f4f6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            font-size: 32px;
            font-weight: 700;
            color: #ffffff;
            text-decoration: none;
            display: inline-block;
            margin-bottom: 10px;
        }
        
        .header-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            line-height: 1.8;
            color: #4b5563;
            margin-bottom: 30px;
        }
        
        .message p {
            margin-bottom: 15px;
        }
        
        .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        
        .button:hover {
            transform: translateY(-2px);
        }
        
        .info-box {
            background-color: #f3f4f6;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        
        .info-box-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 15px;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
        }
        
        .unsubscribe {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 20px;
        }
        
        .unsubscribe a {
            color: #667eea;
            text-decoration: underline;
        }
        
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 30px 0;
        }
        
        @media only screen and (max-width: 600px) {
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .greeting {
                font-size: 20px;
            }
            
            .message {
                font-size: 15px;
            }
            
            .button {
                display: block;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    ${preheader ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
    
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 20px 0;">
        <tr>
            <td align="center">
                <div class="email-container">
                    <!-- Header -->
                    <div class="header">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://metalib.shop'}" class="logo">
                            💎 MetaLib Shop
                        </a>
                        <div class="header-subtitle">Ваш надежный магазин цифровых товаров</div>
                    </div>
                    
                    <!-- Content -->
                    <div class="content">
                        <div class="greeting">Здравствуйте, ${userName}!</div>
                        
                        <div class="message">
                            ${content}
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <div class="footer-text">
                            <strong>MetaLib Shop</strong><br>
                            Цифровые товары и услуги
                        </div>
                        
                        <div class="social-links">
                            <a href="#">Telegram</a> •
                            <a href="#">Discord</a> •
                            <a href="#">Support</a>
                        </div>
                        
                        <div class="footer-text" style="margin-top: 20px;">
                            Это письмо отправлено автоматически, пожалуйста, не отвечайте на него.<br>
                            По всем вопросам обращайтесь в службу поддержки.
                        </div>
                        
                        ${isAdvertising ? `
                        <div class="unsubscribe">
                            Вы получили это письмо, так как зарегистрированы на MetaLib Shop.<br>
                            <a href="${unsubscribeUrl}">Отписаться от рассылки</a>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
  `.trim()
}

/**
 * Шаблон приветственного письма
 */
export function getWelcomeEmail(userName: string, userEmail: string): string {
  const content = `
    <p>Добро пожаловать в <strong>MetaLib Shop</strong>! 🎉</p>
    
    <p>Мы рады видеть вас в нашем магазине цифровых товаров. Теперь вы можете:</p>
    
    <div class="info-box">
        <div class="info-box-title">✨ Ваши возможности:</div>
        <ul style="margin-left: 20px; color: #4b5563;">
            <li>Покупать игры и цифровые товары</li>
            <li>Пополнять Steam кошелек</li>
            <li>Получать бонусы по реферальной программе</li>
            <li>Пользоваться круглосуточной поддержкой</li>
        </ul>
    </div>
    
    <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://metalib.shop'}/products" class="button">
            Перейти в каталог
        </a>
    </p>
    
    <p>Если у вас возникнут вопросы, наша команда поддержки всегда готова помочь!</p>
  `

  return getEmailTemplate({
    subject: 'Добро пожаловать в MetaLib Shop!',
    preheader: 'Начните покупки прямо сейчас',
    content,
    userName,
    userEmail
  })
}

/**
 * Шаблон для подтверждения заказа
 */
export function getOrderConfirmationEmail(
  userName: string,
  orderNumber: string,
  orderTotal: number,
  orderItems: string[]
): string {
  const itemsList = orderItems.map(item => `<li>${item}</li>`).join('')
  
  const content = `
    <p>Ваш заказ <strong>#${orderNumber}</strong> успешно оформлен и оплачен! ✅</p>
    
    <div class="info-box">
        <div class="info-box-title">📦 Детали заказа:</div>
        <ul style="margin-left: 20px; color: #4b5563; margin-top: 10px;">
            ${itemsList}
        </ul>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <strong>Итого: ${orderTotal.toFixed(2)} ₽</strong>
        </div>
    </div>
    
    <p>Товары будут доставлены на вашу почту в течение 5-10 минут.</p>
    
    <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://metalib.shop'}/profile" class="button">
            Мои заказы
        </a>
    </p>
    
    <p style="color: #6b7280; font-size: 14px;">
        Если у вас возникли вопросы по заказу, свяжитесь с нашей службой поддержки.
    </p>
  `

  return getEmailTemplate({
    subject: `Заказ #${orderNumber} подтвержден`,
    preheader: `Заказ на сумму ${orderTotal.toFixed(2)} ₽ успешно оформлен`,
    content,
    userName
  })
}

/**
 * Шаблон для промо/рекламной рассылки
 */
export function getPromoEmail(
  userName: string,
  userEmail: string,
  subject: string,
  message: string,
  buttonText?: string,
  buttonUrl?: string
): string {
  let content = message
  
  // Добавляем кнопку, если указана
  if (buttonText && buttonUrl) {
    content += `
      <p style="text-align: center;">
        <a href="${buttonUrl}" class="button">
          ${buttonText}
        </a>
      </p>
    `
  }

  return getEmailTemplate({
    subject,
    preheader: message.substring(0, 100).replace(/<[^>]*>/g, ''),
    content,
    userName,
    userEmail,
    isAdvertising: true,
    unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://metalib.shop'}/profile/settings`
  })
}

/**
 * Заменяет переменные в тексте
 */
export function replaceVariables(
  text: string,
  variables: { name?: string; email?: string; [key: string]: any }
): string {
  let result = text
  
  // Заменяем {{name}}
  if (variables.name) {
    result = result.replace(/\{\{name\}\}/g, variables.name)
  }
  
  // Заменяем {{email}}
  if (variables.email) {
    result = result.replace(/\{\{email\}\}/g, variables.email)
  }
  
  // Можно добавить другие переменные
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, String(variables[key]))
  })
  
  return result
}

/**
 * Email шаблон для уведомления о снижении цены
 */
export function getPriceDropEmailTemplate(
  userName: string,
  userEmail: string,
  productName: string,
  oldPrice: number,
  newPrice: number,
  productUrl: string,
  productImage?: string
): string {
  const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100)
  const savedAmount = (oldPrice - newPrice).toFixed(2)

  const content = `
    <div class="info-box">
      <div class="info-box-title">🎉 Отличная новость!</div>
      <p style="margin: 0;">Цена на товар из вашего избранного снизилась!</p>
    </div>

    ${productImage ? `
      <div style="text-align: center; margin: 30px 0;">
        <img src="${productImage}" alt="${productName}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      </div>
    ` : ''}

    <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 15px;">${productName}</h2>

    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 20px; border-radius: 8px; margin: 20px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div>
          <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Старая цена:</div>
          <div style="color: #9ca3af; text-decoration: line-through; font-size: 18px; font-weight: 600;">${oldPrice.toFixed(2)} ₽</div>
        </div>
        <div style="text-align: right;">
          <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Новая цена:</div>
          <div style="color: #059669; font-size: 24px; font-weight: 700;">${newPrice.toFixed(2)} ₽</div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 15px;">
        <span style="background-color: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">
          Экономия ${savedAmount} ₽ (${discount}%)
        </span>
      </div>
    </div>

    <p style="color: #4b5563; margin: 20px 0;">
      Не упустите выгодную покупку! Цена может измениться в любой момент.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${productUrl}" class="button">
        Купить сейчас
      </a>
    </div>

    <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
      Вы получили это письмо, потому что добавили товар в избранное. 
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://metalib.xyz'}/favorites" style="color: #667eea;">Управлять избранным</a>
    </p>
  `

  return getEmailTemplate({
    subject: `🔥 Скидка ${discount}% на ${productName}`,
    preheader: `Цена снизилась с ${oldPrice.toFixed(2)}₽ до ${newPrice.toFixed(2)}₽`,
    content,
    userName,
    userEmail,
    isAdvertising: true,
    unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://metalib.xyz'}/profile/settings`
  })
}

