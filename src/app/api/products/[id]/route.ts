export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { validateId, validateData, schemas } from '@/lib/input-validation'
import { rateLimitWithInfo } from '@/lib/security'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Валидация ID
    if (!validateId(params.id)) {
      return NextResponse.json({ error: 'Неверный ID товара' }, { status: 400 })
    }

    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rateCheck = rateLimitWithInfo(`product-get-${clientIP}`, 30, 60000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Слишком много запросов', retryAfter: rateCheck.retryAfter },
        { status: 429 }
      )
    }

    const result = await query(
      `SELECT p.*, c.id as category_id, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
    }

    const row = result.rows[0]
    const product = {
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      image: row.image,
      categoryId: row.category_id,
      isActive: row.is_active === 1,
      isFeatured: row.is_featured === 1,
      stock: row.stock,
      nsGiftsId: row.ns_gifts_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      category: row.category_id ? {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug
      } : null
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении товара' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    // Валидация ID
    if (!validateId(params.id)) {
      return NextResponse.json({ error: 'Неверный ID товара' }, { status: 400 })
    }

    const body = await req.json()
    const { category, ...rest } = body

    // Валидация данных продукта
    const validation = validateData(rest, schemas.product)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.errors },
        { status: 400 }
      )
    }

    const updateFields: string[] = []
    const updateValues: any[] = []
    
    if (rest.name !== undefined) {
      updateFields.push('name = ?')
      updateValues.push(validation.sanitized!.name)
    }
    if (rest.description !== undefined) {
      updateFields.push('description = ?')
      updateValues.push(validation.sanitized!.description)
    }
    if (rest.price !== undefined) {
      updateFields.push('price = ?')
      updateValues.push(rest.price)
    }
    if (rest.image !== undefined) {
      updateFields.push('image = ?')
      updateValues.push(rest.image)
    }
    if (rest.isActive !== undefined) {
      updateFields.push('is_active = ?')
      updateValues.push(rest.isActive ? 1 : 0)
    }
    if (rest.isFeatured !== undefined) {
      updateFields.push('is_featured = ?')
      updateValues.push(rest.isFeatured ? 1 : 0)
    }
    if (rest.stock !== undefined) {
      updateFields.push('stock = ?')
      updateValues.push(rest.stock)
    }
    if (rest.nsGiftsId !== undefined) {
      updateFields.push('ns_gifts_id = ?')
      updateValues.push(rest.nsGiftsId)
    }
    
    // Если категория указана, обновляем связь
    if (category) {
      const catResult = await query(
        'SELECT id FROM categories WHERE slug = ?',
        [category]
      )
      if (catResult.rows.length > 0) {
        updateFields.push('category_id = ?')
        updateValues.push(catResult.rows[0].id)
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 })
    }

    updateFields.push('updated_at = NOW()')
    updateValues.push(params.id)

    await query(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    // Получаем обновленный продукт
    const productResult = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [params.id]
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
      image: row.image,
      categoryId: row.category_id,
      isActive: row.is_active === 1,
      isFeatured: row.is_featured === 1,
      stock: row.stock,
      nsGiftsId: row.ns_gifts_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      category: row.category_id ? {
        name: row.category_name,
        slug: row.category_slug
      } : null
    }

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении товара' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    // Валидация ID
    if (!validateId(params.id)) {
      return NextResponse.json({ error: 'Неверный ID товара' }, { status: 400 })
    }

    // Сначала удаляем связанные записи из order_items
    await query('DELETE FROM order_items WHERE product_id = ?', [params.id])
    
    // Удаляем из избранного
    await query('DELETE FROM favorites WHERE product_id = ?', [params.id])

    // Удаляем сам продукт
    await query('DELETE FROM products WHERE id = ?', [params.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении товара' },
      { status: 500 }
    )
  }
}
