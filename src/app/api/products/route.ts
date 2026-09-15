export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { productSchema } from '@/lib/validations'
import { nanoid } from 'nanoid'
import { findProducts, findCategories } from '@/lib/db-helpers'

export async function GET() {
  try {
    const products = await findProducts({ isActive: true })
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении товаров' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const body = await req.json()
    const { category, ...rest } = body
    const validatedData = productSchema.parse(rest)

    let categoryId = null
    
    // Если категория указана, находим её
    if (category) {
      const catResult = await query(
        'SELECT id FROM categories WHERE slug = ?',
        [category]
      )
      if (catResult.rows.length > 0) {
        categoryId = catResult.rows[0].id
      }
    }

    const productId = nanoid()
    await query(
      `INSERT INTO products (id, name, description, price, image, category_id, is_active, is_featured, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        productId,
        validatedData.name,
        validatedData.description || null,
        validatedData.price,
        validatedData.image || null,
        categoryId,
        1, // is_active по умолчанию
        0, // is_featured по умолчанию
      ]
    )

    // Получаем созданный продукт
    const productResult = await query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    )
    const product = productResult.rows[0]

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании товара' },
      { status: 500 }
    )
  }
}
