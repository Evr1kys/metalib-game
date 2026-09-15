import mysql from 'mysql2/promise'

const isDevelopment = process.env.NODE_ENV === 'development'

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

export const query = async (text: string, params?: any[]) => {
  try {
    const start = Date.now()
    const [rows] = await pool.execute(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: Array.isArray(rows) ? rows.length : 0 })
    return { rows, rowCount: Array.isArray(rows) ? rows.length : 0 }
  } catch (error: any) {
    // В development режиме возвращаем пустой результат если база недоступна
    if (isDevelopment && error.code === 'ECONNREFUSED') {
      console.warn('⚠️  Database not available (development mode), returning empty result')
      return { rows: [], rowCount: 0 } as any
    }
    throw error
  }
}

export const getClient = async () => {
  return await pool.getConnection()
}

export default pool

