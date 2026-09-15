export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.settings.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' },
      ],
    })

    // Group by category
    const grouped = settings.reduce((acc: any, setting: any) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    }, {})

    return NextResponse.json({ settings: grouped })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, description, category } = body

    const setting = await prisma.settings.upsert({
      where: { key },
      create: {
        key,
        value,
        description,
        category: category || 'general',
      },
      update: {
        value,
        description,
        category: category || 'general',
      },
    })

    return NextResponse.json({ setting })
  } catch (error) {
    console.error('Error saving setting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
