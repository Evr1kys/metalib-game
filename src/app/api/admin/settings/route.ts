export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')

    if (key) {
      const result = await query('SELECT * FROM settings WHERE key = ?', [key])
      return NextResponse.json(result.rows.length > 0 ? { [key]: result.rows[0].value } : {})
    }

    const result = await query('SELECT * FROM settings', [])
    const settingsObj = result.rows.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {})
    return NextResponse.json(settingsObj)
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Batch update all settings using INSERT ... ON DUPLICATE KEY UPDATE
    for (const [key, value] of Object.entries(body)) {
      await query(
        `INSERT INTO settings (\`key\`, value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE value = ?`,
        [key, String(value), String(value)]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings POST error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key, value } = await req.json()

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    await query(
      `INSERT INTO settings (\`key\`, value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE value = ?`,
      [key, value, value]
    )

    const result = await query('SELECT * FROM settings WHERE `key` = ?', [key])
    const setting = result.rows[0]

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
