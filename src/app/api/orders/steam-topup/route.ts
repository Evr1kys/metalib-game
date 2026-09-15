export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { rateLimitWithInfo, sanitizeInput } from '@/lib/security'
import { nsGiftsAPI } from '@/lib/nsgifts'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    // Rate limiting - 3 попытки в час для безопасности
    const rateLimitKey = `steam_topup_${session.user.id}`
    const rateCheck = rateLimitWithInfo(rateLimitKey, 3, 60 * 60 * 1000)

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Слишком много запросов. Попробуйте через ${rateCheck.retryAfter} секунд` 
        },
        { status: 429 }
      )
    }

    // Загружаем настройки Steam
    const settings = await prisma.settings.findMany({
      where: { category: 'steam' }
    })

    const settingsMap: Record<string, string> = {}
    settings.forEach((s: any) => {
      settingsMap[s.key] = s.value
    })

    const markupPercent = parseFloat(settingsMap.steam_markup_percent || '10')
    const minAmount = parseFloat(settingsMap.steam_min_amount || '100')
    const maxAmount = parseFloat(settingsMap.steam_max_amount || '50000')

    const body = await req.json()
    const steamLogin = sanitizeInput(body.steamLogin)
    const amount = parseFloat(body.amount)

    // Валидация Steam логина
    if (!steamLogin || steamLogin.length < 3) {
      return NextResponse.json({ error: 'Некорректный Steam логин' }, { status: 400 })
    }

    // Валидация суммы
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Некорректная сумма' }, { status: 400 })
    }

    if (amount < minAmount) {
      return NextResponse.json({ error: `Минимальная сумма: ${minAmount}₽` }, { status: 400 })
    }

    if (amount > maxAmount) {
      return NextResponse.json({ error: `Максимальная сумма: ${maxAmount}₽` }, { status: 400 })
    }

    // Рассчитываем итоговую сумму с наценкой
    const finalAmount = amount * (1 + markupPercent / 100)

    // Получаем пользователя с балансом
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        balance: true,
        steamProfileUrl: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Проверяем Steam профиль
    if (!user.steamProfileUrl) {
      return NextResponse.json(
        { error: 'Привяжите Steam аккаунт в профиле для пополнения' },
        { status: 400 }
      )
    }

    // Проверяем баланс (с учетом наценки)
    if (user.balance < finalAmount) {
      return NextResponse.json(
        { error: `Недостаточно средств. Нужно ${finalAmount.toFixed(2)}₽ (включая наценку ${markupPercent}%)` },
        { status: 400 }
      )
    }

    // Вызываем NSGifts API для расчета суммы Steam
    const calculation = await nsGiftsAPI.calculateSteamAmount(amount)
    
    console.log('Steam amount calculation:', calculation)

    // Списываем средства с баланса пользователя (с наценкой)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: {
          decrement: finalAmount
        }
      }
    })

    // Создаем транзакцию
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: -finalAmount,
        type: 'PURCHASE',
        status: 'COMPLETED',
        description: `Пополнение Steam на ${amount}₽ (наценка ${markupPercent}%)`,
        metadata: JSON.stringify({
          steamLogin: steamLogin,
          steamProfile: user.steamProfileUrl,
          baseAmount: amount,
          markup: markupPercent,
          totalAmount: finalAmount,
          calculation: calculation
        })
      }
    })

    return NextResponse.json({
      success: true,
      transaction,
      message: `Заявка на пополнение Steam на ${amount}₽ создана. Ожидайте обработки.`,
      steamLogin: steamLogin,
      baseAmount: amount,
      markup: finalAmount - amount,
      totalAmount: finalAmount,
      note: 'Пополнение будет выполнено в течение 24 часов'
    })
  } catch (error: any) {
    console.error('Steam topup error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при создании заявки на пополнение Steam' },
      { status: 500 }
    )
  }
}
