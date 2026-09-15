export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NSGiftsAPI } from '@/lib/nsgifts'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    // Проверяем, является ли пользователь администратором
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const nsGifts = new NSGiftsAPI()

    // Получаем баланс из NS Gifts API
    const balance = await nsGifts.getBalance()
    
    console.log('NSGifts balance result:', balance)

    return NextResponse.json({
      balance: balance && typeof balance === 'object' ? balance : { rub: 0, usd: 0 },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('NS Gifts balance check error:', error)
    return NextResponse.json(
      { 
        error: 'Ошибка при получении баланса NS Gifts',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
