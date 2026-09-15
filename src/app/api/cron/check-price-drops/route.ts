export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { getPriceDropEmailTemplate } from '@/lib/email-templates'

/**
 * Cron job для проверки снижения цен на товары в избранном
 * Должен вызываться периодически (например, каждые 6 часов)
 */
export async function GET(req: NextRequest) {
  try {
    // Простая авторизация через секретный ключ в заголовке
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON] Starting price drop check...')

    // Получаем все избранные товары с информацией о пользователе и товаре
    const favoritesResult = await query(
      `SELECT 
        f.id, f.last_notified_price,
        u.id as user_id, u.email, u.name,
        p.id as product_id, p.name as product_name, p.price, p.image
       FROM favorites f
       INNER JOIN users u ON f.user_id = u.id
       INNER JOIN products p ON f.product_id = p.id
       WHERE p.is_active = 1`,
      []
    )

    const favorites = favoritesResult.rows

    console.log(`[CRON] Found ${favorites.length} favorites to check`)

    let notificationsSent = 0
    const errors: string[] = []

    for (const favorite of favorites) {
      try {
        const currentPrice = parseFloat(favorite.price)
        const lastNotifiedPrice = favorite.last_notified_price ? parseFloat(favorite.last_notified_price) : null

        // Если это первое добавление в избранное или цена снизилась
        const shouldNotify = 
          lastNotifiedPrice === null || // Первый раз
          (currentPrice < lastNotifiedPrice && 
           currentPrice < lastNotifiedPrice * 0.95) // Снижение минимум на 5%

        if (shouldNotify && lastNotifiedPrice !== null && currentPrice < lastNotifiedPrice) {
          // Отправляем уведомление о снижении цены
          const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://metalib.xyz'}/products/${favorite.product_id}`
          
          const emailHtml = getPriceDropEmailTemplate(
            favorite.name || favorite.email,
            favorite.email,
            favorite.product_name,
            lastNotifiedPrice,
            currentPrice,
            productUrl,
            favorite.image || undefined
          )

          await sendEmail({
            to: favorite.email,
            subject: `🔥 Цена снизилась на ${favorite.product_name}`,
            html: emailHtml,
          })

          console.log(`[CRON] Sent price drop notification to ${favorite.email} for product ${favorite.product_name}`)
          notificationsSent++
        }

        // Обновляем lastNotifiedPrice только если цена изменилась
        if (lastNotifiedPrice === null || currentPrice !== lastNotifiedPrice) {
          await query(
            'UPDATE favorites SET last_notified_price = ? WHERE id = ?',
            [currentPrice, favorite.id]
          )
        }

      } catch (error) {
        const errorMsg = `Error processing favorite ${favorite.id}: ${error}`
        console.error(`[CRON] ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log(`[CRON] Price drop check completed. Sent ${notificationsSent} notifications`)

    return NextResponse.json({
      success: true,
      checked: favorites.length,
      notificationsSent,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('[CRON] Price drop check failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
