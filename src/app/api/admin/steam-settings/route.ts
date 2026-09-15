export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Получаем настройки Steam
    const settings = await prisma.settings.findMany({
      where: {
        category: 'steam'
      }
    })

    // Преобразуем в объект для удобства
    const steamSettings: Record<string, any> = {}
    settings.forEach((setting: any) => {
      steamSettings[setting.key] = {
        value: setting.value,
        description: setting.description
      }
    })

    // Устанавливаем значения по умолчанию, если не заданы
    if (!steamSettings.steam_markup_percent) {
      steamSettings.steam_markup_percent = { value: '10', description: 'Процент наценки на пополнение Steam' }
    }
    if (!steamSettings.steam_min_amount) {
      steamSettings.steam_min_amount = { value: '100', description: 'Минимальная сумма пополнения Steam (RUB)' }
    }
    if (!steamSettings.steam_max_amount) {
      steamSettings.steam_max_amount = { value: '50000', description: 'Максимальная сумма пополнения Steam (RUB)' }
    }

    return NextResponse.json(steamSettings)
  } catch (error) {
    console.error('Get steam settings error:', error)
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { key, value, description } = body

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      )
    }

    // Валидация значений
    if (key === 'steam_markup_percent') {
      const markup = parseFloat(value)
      if (isNaN(markup) || markup < 0 || markup > 100) {
        return NextResponse.json(
          { error: 'Markup percent must be between 0 and 100' },
          { status: 400 }
        )
      }
    }

    if (key === 'steam_min_amount' || key === 'steam_max_amount') {
      const amount = parseFloat(value)
      if (isNaN(amount) || amount < 0) {
        return NextResponse.json(
          { error: 'Amount must be a positive number' },
          { status: 400 }
        )
      }
    }

    // Обновляем или создаем настройку
    const setting = await prisma.settings.upsert({
      where: { key },
      update: {
        value: value.toString(),
        description,
        category: 'steam'
      },
      create: {
        key,
        value: value.toString(),
        description,
        category: 'steam'
      }
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Update steam settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
