export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Получаем курсы валют от NSGifts
async function getCurrencyRates() {
  try {
    const apiUrl = process.env.NS_GIFTS_API_URL || 'https://api.ns.gifts'
    const email = process.env.NS_GIFTS_LOGIN
    const password = process.env.NS_GIFTS_PASSWORD

    if (!email || !password) {
      throw new Error('NSGifts credentials not configured')
    }

    // Авторизация
    const authResponse = await fetch(`${apiUrl}/api/v1/get_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })

    if (!authResponse.ok) {
      throw new Error('NSGifts authorization failed')
    }

    const authData = await authResponse.json()
    const token = authData.access_token

    if (!token) {
      console.error('NSGifts auth response:', authData)
      throw new Error('No access token in response')
    }

    console.log('Fetching Steam currency rate from NSGifts...')

    // Получаем курс валют для Steam
    const ratesResponse = await fetch(`${apiUrl}/api/v1/steam/get_currency_rate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    if (!ratesResponse.ok) {
      const errorText = await ratesResponse.text()
      console.error('Currency rate error response:', errorText)
      throw new Error(`Failed to get currency rate: ${ratesResponse.status} ${errorText}`)
    }

    const rate = await ratesResponse.json()
    console.log('Steam currency rate received:', rate)
    
    // Формат ответа: {"date":"2025-11-17","rub/usd":"80.88","kzt/usd":"524.96","uah/usd":"42.04"}
    // Преобразуем в удобный формат
    return {
      date: rate.date,
      'RUB/USD': parseFloat(rate['rub/usd'] || '0'),
      'KZT/USD': parseFloat(rate['kzt/usd'] || '0'),
      'UAH/USD': parseFloat(rate['uah/usd'] || '0')
    }
  } catch (error) {
    console.error('Get currency rates error:', error)
    throw error
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const rates = await getCurrencyRates()
    
    return NextResponse.json(rates)
  } catch (error) {
    console.error('Currency rates API error:', error)
    return NextResponse.json(
      { error: 'Failed to get currency rates' },
      { status: 500 }
    )
  }
}
