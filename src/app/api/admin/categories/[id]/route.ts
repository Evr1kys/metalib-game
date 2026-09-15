export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - получить категорию по ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryResult = await query(
      'SELECT * FROM categories WHERE id = ?',
      [params.id]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Get active products
    const productsResult = await query(
      'SELECT * FROM products WHERE category_id = ? AND is_active = 1 LIMIT 10',
      [params.id]
    )

    // Get products count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM products WHERE category_id = ?',
      [params.id]
    )

    const row = categoryResult.rows[0]
    const category = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image: row.image,
      icon: row.icon,
      sortOrder: row.sort_order,
      isActive: row.is_active === 1,
      products: productsResult.rows.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: parseFloat(p.price),
        image: p.image,
        isActive: p.is_active === 1
      })),
      _count: {
        products: countResult.rows[0].total || 0
      }
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

// PUT - обновить категорию
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, image, icon, sortOrder, isActive } = body

    await query(
      `UPDATE categories SET 
        name = ?,
        slug = ?,
        description = ?,
        image = ?,
        icon = ?,
        sort_order = ?,
        is_active = ?
       WHERE id = ?`,
      [name, slug, description, image, icon, sortOrder, isActive ? 1 : 0, params.id]
    )

    const categoryResult = await query(
      'SELECT * FROM categories WHERE id = ?',
      [params.id]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const row = categoryResult.rows[0]
    const category = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image: row.image,
      icon: row.icon,
      sortOrder: row.sort_order,
      isActive: row.is_active === 1
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE - удалить категорию
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, есть ли товары в категории
    const countResult = await query(
      'SELECT COUNT(*) as total FROM products WHERE category_id = ?',
      [params.id]
    )

    const productsCount = countResult.rows[0].total || 0

    if (productsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with products. Please reassign products first.' },
        { status: 400 }
      )
    }

    await query('DELETE FROM categories WHERE id = ?', [params.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
