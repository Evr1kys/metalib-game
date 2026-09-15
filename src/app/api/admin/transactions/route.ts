export const dynamic = 'force-dynamic';

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') || ''
    const userId = searchParams.get('userId') || ''
    
    const skip = (page - 1) * limit

    // Build WHERE conditions
    const conditions: string[] = []
    const params: any[] = []
    
    if (type) {
      conditions.push('t.type = ?')
      params.push(type)
    }
    
    if (userId) {
      conditions.push('t.user_id = ?')
      params.push(userId)
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''

    // Get transactions with user data
    const transactionsResult = await query(
      `SELECT 
        t.id, t.user_id, t.amount, t.type, t.status, t.description,
        DATE_FORMAT(t.created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at,
        DATE_FORMAT(t.updated_at, "%Y-%m-%dT%H:%i:%s.000Z") as updated_at,
        u.id as user_id, u.email as user_email, u.name as user_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, skip]
    )

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM transactions t ${whereClause}`,
      params
    )

    const total = countResult.rows[0]?.total || 0

    // Transform data to match Prisma format
    const transactions = transactionsResult.rows.map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      amount: parseFloat(t.amount),
      type: t.type,
      status: t.status,
      description: t.description,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      user: {
        id: t.user_id,
        email: t.user_email,
        name: t.user_name,
      },
    }))

    return NextResponse.json({
      transactions,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
