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
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    
    const offset = (page - 1) * limit

    // Build WHERE clause
    const whereConditions: string[] = []
    const queryParams: any[] = []
    
    if (search) {
      whereConditions.push('(email LIKE ? OR name LIKE ?)')
      queryParams.push(`%${search}%`, `%${search}%`)
    }
    
    if (role) {
      whereConditions.push('role = ?')
      queryParams.push(role)
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : ''

    // Get users with counts
    const usersResult = await query(
      `SELECT 
        u.id, u.email, u.name, u.role, u.balance, u.steam_profile_url, 
        u.steam_verified, u.email_verified, u.is_active, u.created_at, u.notes,
        COUNT(DISTINCT o.id) as orders_count,
        COUNT(DISTINCT t.id) as transactions_count
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id
       LEFT JOIN transactions t ON u.id = t.user_id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    )

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      queryParams
    )

    const users = usersResult.rows.map((row: any) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      balance: parseFloat(row.balance),
      steamProfileUrl: row.steam_profile_url,
      steamVerified: row.steam_verified === 1,
      emailVerified: row.email_verified,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      notes: row.notes,
      _count: {
        orders: row.orders_count || 0,
        transactions: row.transactions_count || 0
      }
    }))

    const total = countResult.rows[0].total

    return NextResponse.json({
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
