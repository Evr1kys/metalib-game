export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const result = await query(
      `SELECT 
        f.id, f.user_id, f.product_id, f.last_notified_price, f.created_at,
        p.id as p_id, p.name, p.description, p.price, p.image, p.category_id, 
        p.is_active, p.is_featured, p.stock, p.ns_gifts_id,
        c.id as c_id, c.name as c_name, c.slug as c_slug
       FROM favorites f
       INNER JOIN products p ON f.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [session.user.id]
    )

    const favorites = result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      productId: row.product_id,
      lastNotifiedPrice: row.last_notified_price ? parseFloat(row.last_notified_price) : null,
      createdAt: row.created_at,
      product: {
        id: row.p_id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        image: row.image,
        categoryId: row.category_id,
        isActive: row.is_active === 1,
        isFeatured: row.is_featured === 1,
        stock: row.stock,
        nsGiftsId: row.ns_gifts_id,
        category: row.c_id ? {
          id: row.c_id,
          name: row.c_name,
          slug: row.c_slug
        } : null
      }
    }))

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении избранного' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: 'productId обязателен' }, { status: 400 })
    }

    // Check if already in favorites
    const existingResult = await query(
      'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
      [session.user.id, productId]
    )

    if (existingResult.rows.length > 0) {
      // Remove from favorites
      await query(
        'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
        [session.user.id, productId]
      )
      return NextResponse.json({ message: 'Удалено из избранного', isFavorite: false })
    } else {
      // Получаем текущую цену товара
      const productResult = await query(
        'SELECT price FROM products WHERE id = ?',
        [productId]
      )

      if (productResult.rows.length === 0) {
        return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
      }

      const currentPrice = parseFloat(productResult.rows[0].price)

      // Add to favorites with current price
      await query(
        'INSERT INTO favorites (user_id, product_id, last_notified_price, created_at) VALUES (?, ?, ?, NOW())',
        [session.user.id, productId, currentPrice]
      )
      return NextResponse.json({ message: 'Добавлено в избранное', isFavorite: true })
    }
  } catch (error) {
    console.error('Toggle favorite error:', error)
    return NextResponse.json(
      { error: 'Ошибка при изменении избранного' },
      { status: 500 }
    )
  }
}
