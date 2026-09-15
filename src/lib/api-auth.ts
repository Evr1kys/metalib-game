import { NextRequest } from 'next/server'
import { query } from './db'
import crypto from 'crypto'
import { nanoid } from 'nanoid'

export interface ApiKey {
  id: string
  userId: string
  name: string
  permissions: string[]
  isActive: boolean
  lastUsedAt: Date | null
  expiresAt: Date | null
  createdAt: Date
}

// Генерация API ключа
export function generateApiKey(): string {
  return `mk_${nanoid(32)}` // mk = MetaLib Key
}

// Хэширование API ключа для хранения в БД
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

// Создание API ключа
export async function createApiKey(
  userId: string,
  name: string,
  permissions: string[] = ['products:read'],
  expiresInDays?: number
): Promise<{ id: string; key: string }> {
  const key = generateApiKey()
  const keyHash = hashApiKey(key)
  const id = nanoid()
  
  let expiresAt = null
  if (expiresInDays) {
    expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)
  }

  await query(
    `INSERT INTO api_keys (id, user_id, key_hash, name, permissions, is_active, expires_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, ?, NOW(), NOW())`,
    [id, userId, keyHash, name, JSON.stringify(permissions), expiresAt]
  )

  return { id, key }
}

// Валидация API ключа из заголовка
export async function validateApiKey(req: NextRequest): Promise<ApiKey | null> {
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!apiKey || !apiKey.startsWith('mk_')) {
    return null
  }

  const keyHash = hashApiKey(apiKey)
  
  const result = await query(
    `SELECT id, user_id, name, permissions, is_active, last_used_at, expires_at, created_at
     FROM api_keys
     WHERE key_hash = ?`,
    [keyHash]
  )

  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]

  // Проверка активности
  if (row.is_active !== 1) {
    return null
  }

  // Проверка срока действия
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return null
  }

  // Обновляем время последнего использования
  await query(
    'UPDATE api_keys SET last_used_at = NOW() WHERE id = ?',
    [row.id]
  )

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    permissions: JSON.parse(row.permissions || '[]'),
    isActive: row.is_active === 1,
    lastUsedAt: row.last_used_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at
  }
}

// Проверка прав доступа
export function hasPermission(apiKey: ApiKey, permission: string): boolean {
  // Проверяем точное совпадение или wildcard
  return apiKey.permissions.some(p => {
    if (p === '*') return true
    if (p === permission) return true
    // Проверяем namespace (например products:* разрешает products:read, products:write)
    if (p.endsWith(':*')) {
      const namespace = p.replace(':*', '')
      return permission.startsWith(namespace + ':')
    }
    return false
  })
}

// Логирование API запроса
export async function logApiRequest(
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number
): Promise<void> {
  try {
    await query(
      `INSERT INTO api_requests (api_key_id, endpoint, method, status_code, response_time, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [apiKeyId, endpoint, method, statusCode, responseTime]
    )
  } catch (error) {
    console.error('Failed to log API request:', error)
  }
}

// Получение статистики использования API
export async function getApiKeyStats(apiKeyId: string, days: number = 30) {
  const result = await query(
    `SELECT 
       COUNT(*) as total_requests,
       AVG(response_time) as avg_response_time,
       SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) as success_count,
       SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count
     FROM api_requests
     WHERE api_key_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [apiKeyId, days]
  )

  return result.rows[0]
}
