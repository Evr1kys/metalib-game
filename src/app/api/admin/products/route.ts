export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { validateData, schemas } from '@/lib/input-validation'
import { rateLimitWithInfo } from '@/lib/security'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Валидация данных продукта
    const validation = validateData(body, schemas.product)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.errors },
        { status: 400 }
      )
    }

    const data = validation.sanitized!
    const {
      categoryId,
      stock,
      image,
      nsGiftsId,
      systemRequirements,
      isActive,
      isFeatured
    } = body

    // Валидация обязательных полей
    if (!data.name || !body.price || !categoryId) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      )
    }

    // Создание товара
    const result = await query(
      `INSERT INTO products (
        name, description, price, category_id, stock, 
        image, ns_gifts_id, metadata, is_active, is_featured,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.name,
        data.description || null,
        parseFloat(body.price),
        categoryId,
        parseInt(stock) || 999,
        image || null,
        nsGiftsId || null,
        systemRequirements ? JSON.stringify({ systemRequirements }) : null,
        isActive !== false ? 1 : 0,
        isFeatured === true ? 1 : 0
      ]
    )

    // Получаем созданный продукт
    const productResult = await query(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    )

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
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Ошибка создания товара' },
      { status: 500 }
    )
  }
}
