export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { validateData, schemas } from '@/lib/input-validation'
import { rateLimitWithInfo } from '@/lib/security'

// GET - получить все категории
export async function GET() {
  try {
    const result = await query(
      `SELECT c.*, COUNT(p.id) as products_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.id
       ORDER BY c.sort_order ASC`,
      []
    )

    const categories = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image: row.image,
      icon: row.icon,
      sortOrder: row.sort_order,
      isActive: row.is_active === 1,
      _count: {
        products: row.products_count || 0
      }
    }))

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST - создать категорию
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Валидация данных категории
    const validation = validateData(body, schemas.category)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.errors },
        { status: 400 }
      )
    }

    const { name, slug, description } = validation.sanitized!
    const { image, icon, sortOrder } = body

    // Проверяем уникальность slug
    const existingResult = await query(
      'SELECT id FROM categories WHERE slug = ?',
      [slug]
    )

    if (existingResult.rows.length > 0) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO categories (name, slug, description, image, icon, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [name, slug, description || null, image || null, icon || null, sortOrder || 0]
    )

    const categoryResult = await query(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
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
      isActive: row.is_active === 1
    }

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
