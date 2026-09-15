import { query } from './db'
import { nanoid } from 'nanoid'

// User helpers
export async function findUserByEmail(email: string) {
  const result = await query('SELECT * FROM users WHERE email = ?', [email])
  return result.rows[0]
}

export async function findUserById(id: string) {
  const result = await query('SELECT * FROM users WHERE id = ?', [id])
  return result.rows[0]
}

export async function updateUser(id: string, data: Record<string, any>) {
  const updates: string[] = []
  const values: any[] = []

  Object.entries(data).forEach(([key, value]) => {
    updates.push(`${key} = ?`)
    values.push(value)
  })

  values.push(id)
  await query(
    `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  )
  
  // Получаем обновленного пользователя
  const result = await query('SELECT * FROM users WHERE id = ?', [id])
  return result.rows[0]
}

// Product helpers
export async function findProducts(filters?: {
  categoryId?: string
  isActive?: boolean
  isFeatured?: boolean
  limit?: number
  offset?: number
}) {
  let sql = `
    SELECT p.*, c.name as category_name, c.slug as category_slug 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `
  const params: any[] = []

  if (filters?.categoryId) {
    sql += ` AND p.category_id = ?`
    params.push(filters.categoryId)
  }

  if (filters?.isActive !== undefined) {
    sql += ` AND p.is_active = ?`
    params.push(filters.isActive ? 1 : 0)
  }

  if (filters?.isFeatured !== undefined) {
    sql += ` AND p.is_featured = ?`
    params.push(filters.isFeatured ? 1 : 0)
  }

  sql += ' ORDER BY p.created_at DESC'

  if (filters?.limit) {
    sql += ` LIMIT ?`
    params.push(filters.limit)
  }

  if (filters?.offset) {
    sql += ` OFFSET ?`
    params.push(filters.offset)
  }

  const result = await query(sql, params)
  return result.rows
}

export async function findProductById(id: string) {
  const result = await query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ?`,
    [id]
  )
  return result.rows[0]
}

// Order helpers
export async function createOrder(data: {
  userId: string
  totalAmount: number
  status?: string
  paymentMethod?: string
  steamProfileUrl?: string
}) {
  const orderId = nanoid()
  await query(
    `INSERT INTO orders (id, user_id, total_amount, status, payment_method, steam_profile_url, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [
      orderId,
      data.userId,
      data.totalAmount,
      data.status || 'PENDING',
      data.paymentMethod || null,
      data.steamProfileUrl || null,
    ]
  )
  
  // Получаем созданный заказ
  const result = await query('SELECT * FROM orders WHERE id = ?', [orderId])
  return result.rows[0]
}

export async function findOrderById(id: string) {
  const result = await query(
    `SELECT o.*, u.email as user_email, u.name as user_name 
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     WHERE o.id = ?`,
    [id]
  )
  return result.rows[0]
}

export async function findOrdersByUserId(userId: string) {
  const result = await query(
    `SELECT o.* 
     FROM orders o 
     WHERE o.user_id = ? 
     ORDER BY o.created_at DESC`,
    [userId]
  )
  return result.rows
}

// Transaction helpers
export async function createTransaction(data: {
  userId: string
  amount: number
  type: string
  status?: string
  description?: string
  orderId?: string
  metadata?: any
}) {
  const transactionId = nanoid()
  await query(
    `INSERT INTO transactions (id, user_id, amount, type, status, description, order_id, metadata, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      transactionId,
      data.userId,
      data.amount,
      data.type,
      data.status || 'PENDING',
      data.description || null,
      data.orderId || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
    ]
  )
  
  // Получаем созданную транзакцию
  const result = await query('SELECT * FROM transactions WHERE id = ?', [transactionId])
  return result.rows[0]
}

// Category helpers
export async function findCategories(isActive?: boolean) {
  let sql = 'SELECT * FROM categories WHERE 1=1'
  const params: any[] = []

  if (isActive !== undefined) {
    sql += ' AND active = ?'
    params.push(isActive ? 1 : 0)
  }

  sql += ' ORDER BY sort_order ASC, name ASC'

  const result = await query(sql, params)
  return result.rows
}
