export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      description,
      price,
      categoryId,
      stock,
      image,
      nsGiftsId,
      systemRequirements,
      isActive,
      isFeatured
    } = body

    await query(
      `UPDATE products SET 
        name = ?,
        description = ?,
        price = ?,
        category_id = ?,
        stock = ?,
        image = ?,
        ns_gifts_id = ?,
        metadata = ?,
        is_active = ?,
        is_featured = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        name,
        description,
        parseFloat(price),
        categoryId,
        parseInt(stock),
        image,
        nsGiftsId || null,
        systemRequirements ? JSON.stringify({ systemRequirements }) : null,
        isActive ? 1 : 0,
        isFeatured ? 1 : 0,
        (await params).id
      ]
    )

    // Получаем обновленный продукт
    const productResult = await query(
      'SELECT * FROM products WHERE id = ?',
      [(await params).id]
    )

    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 })
    }

    const row = productResult.rows[0]
    const product = {
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      categoryId: row.category_id,
      stock: row.stock,
      image: row.image,
      nsGiftsId: row.ns_gifts_id,
      metadata: row.metadata,
      isActive: row.is_active === 1,
      isFeatured: row.is_featured === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления товара' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Удаление связанных элементов заказов
    await query('DELETE FROM order_items WHERE product_id = ?', [(await params).id])

    // Удаление из избранного
    await query('DELETE FROM favorites WHERE product_id = ?', [(await params).id])

    // Удаление товара
    await query('DELETE FROM products WHERE id = ?', [(await params).id])

    return NextResponse.json({
      success: true,
      message: 'Товар удален'
    })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления товара' },
      { status: 500 }
    )
  }
}
