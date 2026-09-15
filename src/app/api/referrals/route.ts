export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    // Get user data
    const userResult = await query(
      'SELECT referral_code, referred_by FROM users WHERE id = ?',
      [session.user.id]
    )

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const user = userResult.rows[0]

    // Generate referral code if doesn't exist
    let referralCode = user.referral_code
    if (!referralCode) {
      referralCode = Math.random().toString(36).substring(2, 10).toUpperCase()
      await query(
        'UPDATE users SET referral_code = ? WHERE id = ?',
        [referralCode, session.user.id]
      )
    }

    // Get referrals list
    const referralsResult = await query(
      'SELECT id, name, email, DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at FROM users WHERE referred_by = ?',
      [session.user.id]
    )

    const referrals = referralsResult.rows.map((r: any) => ({
      id: r.id,
      name: r.name || '',
      email: r.email || '',
      createdAt: r.created_at || new Date().toISOString(),
    }))

    // Get referral bonus stats
    const statsResult = await query(
      'SELECT SUM(amount) as total_amount, COUNT(*) as count FROM transactions WHERE user_id = ? AND type = ?',
      [session.user.id, 'REFERRAL_BONUS']
    )

    const stats = statsResult.rows[0]

    return NextResponse.json({
      referralCode: referralCode,
      referralUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup?ref=${referralCode}`,
      referrals,
      totalEarnings: parseFloat(stats?.total_amount || 0),
      totalReferrals: referrals.length,
      totalBonuses: parseInt(stats?.count || 0),
    })
  } catch (error) {
    console.error('Get referrals error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении данных о рефералах' },
      { status: 500 }
    )
  }
}
