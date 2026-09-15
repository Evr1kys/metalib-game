export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(`
      SELECT c.*, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
      WHERE c.active = 1
      GROUP BY c.id 
      ORDER BY c.sort_order ASC, c.name ASC
    `)

    const categories = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image: row.image,
      icon: row.icon,
      sortOrder: row.sort_order,
      isActive: row.active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      _count: {
        products: parseInt(row.product_count) || 0
      }
    }))

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
