export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { validateId, validateData, schemas } from '@/lib/input-validation'
import { rateLimitWithInfo, sanitizeInput } from '@/lib/security'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Валидация ID
    if (!validateId(params.id)) {
      return NextResponse.json({ error: 'Неверный ID пользователя' }, { status: 400 })
    }

    // Get user
    const userResult = await query(
      'SELECT * FROM users WHERE id = ?',
      [params.id]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRow = userResult.rows[0]

    // Get recent orders
    const ordersResult = await query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [params.id]
    )

    // Get recent transactions
    const transactionsResult = await query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [params.id]
    )

    // Get recent tickets
    const ticketsResult = await query(
      'SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [params.id]
    )

    const user = {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      role: userRow.role,
      balance: parseFloat(userRow.balance),
      steamProfileUrl: userRow.steam_profile_url,
      steamVerified: userRow.steam_verified === 1,
      emailVerified: userRow.email_verified,
      isActive: userRow.is_active === 1,
      createdAt: userRow.created_at,
      notes: userRow.notes,
      referralCode: userRow.referral_code,
      referredBy: userRow.referred_by,
      orders: ordersResult.rows.map((row: any) => ({
        id: row.id,
        status: row.status,
        totalAmount: parseFloat(row.total_amount),
        createdAt: row.created_at
      })),
      transactions: transactionsResult.rows.map((row: any) => ({
        id: row.id,
        amount: parseFloat(row.amount),
        type: row.type,
        status: row.status,
        description: row.description,
        createdAt: row.created_at
      })),
      tickets: ticketsResult.rows.map((row: any) => ({
        id: row.id,
        subject: row.subject,
        status: row.status,
        createdAt: row.created_at
      }))
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Валидация ID
    if (!validateId(params.id)) {
      return NextResponse.json({ error: 'Неверный ID пользователя' }, { status: 400 })
    }

    const body = await request.json()

    // Валидация данных
    const validation = validateData(body, schemas.userUpdate)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.errors },
        { status: 400 }
      )
    }

    const data = validation.sanitized!
    const { 
      role, 
      balance, 
      emailVerified, 
      steamVerified,
      isActive, 
      steamProfileUrl 
    } = body

    const updateFields: string[] = []
    const updateValues: any[] = []
    
    if (data.email !== undefined) {
      updateFields.push('email = ?')
      updateValues.push(data.email)
    }
    if (data.name !== undefined) {
      updateFields.push('name = ?')
      updateValues.push(data.name)
    }
    if (role !== undefined) {
      updateFields.push('role = ?')
      updateValues.push(role)
    }
    if (balance !== undefined) {
      updateFields.push('balance = ?')
      updateValues.push(parseFloat(balance))
    }
    if (emailVerified !== undefined) {
      updateFields.push('email_verified = ?')
      updateValues.push(emailVerified ? new Date() : null)
    }
    if (steamVerified !== undefined) {
      updateFields.push('steam_verified = ?')
      updateValues.push(steamVerified ? 1 : 0)
    }
    if (isActive !== undefined) {
      updateFields.push('is_active = ?')
      updateValues.push(isActive ? 1 : 0)
    }
    if (body.notes !== undefined) {
      updateFields.push('notes = ?')
      updateValues.push(sanitizeInput(body.notes))
    }
    if (steamProfileUrl !== undefined) {
      updateFields.push('steam_profile_url = ?')
      updateValues.push(steamProfileUrl)
    }

    if (updateFields.length > 0) {
      updateValues.push(params.id)
      await query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )
    }

    // Create transaction for balance adjustment
    if (balance !== undefined) {
      const currentUserResult = await query(
        'SELECT balance FROM users WHERE id = ?',
        [params.id]
      )

      if (currentUserResult.rows.length > 0) {
        const currentBalance = parseFloat(currentUserResult.rows[0].balance)
        const difference = parseFloat(balance) - currentBalance

        if (difference !== 0) {
          await query(
            `INSERT INTO transactions (
              user_id, amount, type, status, description, created_at
            ) VALUES (?, ?, 'ADMIN_ADJUSTMENT', 'COMPLETED', ?, NOW())`,
            [
              params.id,
              difference,
              sanitizeInput(`Admin balance adjustment by ${session.user.email}`)
            ]
          )
        }
      }
    }

    // Get updated user
    const userResult = await query(
      'SELECT * FROM users WHERE id = ?',
      [params.id]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRow = userResult.rows[0]
    const user = {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      role: userRow.role,
      balance: parseFloat(userRow.balance),
      steamProfileUrl: userRow.steam_profile_url,
      steamVerified: userRow.steam_verified === 1,
      emailVerified: userRow.email_verified,
      isActive: userRow.is_active === 1,
      createdAt: userRow.created_at,
      notes: userRow.notes
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Валидация ID
    if (!validateId(params.id)) {
      return NextResponse.json({ error: 'Неверный ID пользователя' }, { status: 400 })
    }

    // Prevent deleting yourself
    if (session.user.id === params.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete related data first (cascading delete)
    await query('DELETE FROM favorites WHERE user_id = ?', [params.id])
    await query('DELETE FROM transactions WHERE user_id = ?', [params.id])
    await query('DELETE FROM ticket_messages WHERE user_id = ?', [params.id])
    await query('DELETE FROM tickets WHERE user_id = ?', [params.id])
    await query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)', [params.id])
    await query('DELETE FROM orders WHERE user_id = ?', [params.id])
    
    // Delete user
    await query('DELETE FROM users WHERE id = ?', [params.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
