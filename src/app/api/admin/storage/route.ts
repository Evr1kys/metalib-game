export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { readdir, stat, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * Admin endpoint для получения статистики по файлам и очистки
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'tickets')
    
    if (!existsSync(uploadDir)) {
      return NextResponse.json({
        totalFiles: 0,
        totalSize: 0,
        totalSizeMB: '0.00'
      })
    }

    const files = await readdir(uploadDir)
    let totalSize = 0

    for (const file of files) {
      const filepath = join(uploadDir, file)
      const stats = await stat(filepath)
      totalSize += stats.size
    }

    return NextResponse.json({
      totalFiles: files.length,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      files: files.slice(0, 10).map(f => ({ name: f })) // First 10 files
    })

  } catch (error) {
    console.error('Get storage stats error:', error)
    return NextResponse.json(
      { error: 'Ошибка получения статистики' },
      { status: 500 }
    )
  }
}

/**
 * Admin endpoint для очистки неиспользуемых файлов
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
    }

    const { action } = await req.json()

    if (action !== 'cleanup-orphaned') {
      return NextResponse.json({ error: 'Неверное действие' }, { status: 400 })
    }

    // Get all files in uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'tickets')
    
    if (!existsSync(uploadDir)) {
      return NextResponse.json({
        deleted: 0,
        spaceFreed: '0.00 MB'
      })
    }

    const files = await readdir(uploadDir)
    
    // Get all attachments from database
    const { prisma } = await import('@/lib/prisma')
    const messages = await prisma.ticketMessage.findMany({
      where: {
        attachments: {
          not: null
        }
      },
      select: {
        attachments: true
      }
    })

    // Extract all used filenames
    const usedFiles = new Set<string>()
    for (const message of messages) {
      try {
        const attachments = JSON.parse(message.attachments || '[]')
        for (const attachment of attachments) {
          const url = typeof attachment === 'string' ? attachment : attachment.url
          const filename = url.split('/').pop()
          if (filename) {
            usedFiles.add(filename)
          }
        }
      } catch (err) {
        // Skip invalid JSON
      }
    }

    // Delete orphaned files
    let deleted = 0
    let bytesFreed = 0

    for (const file of files) {
      if (!usedFiles.has(file)) {
        const filepath = join(uploadDir, file)
        const stats = await stat(filepath)
        await unlink(filepath)
        deleted++
        bytesFreed += stats.size
      }
    }

    return NextResponse.json({
      deleted,
      spaceFreed: `${(bytesFreed / 1024 / 1024).toFixed(2)} MB`,
      bytesFreed
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Ошибка очистки' },
      { status: 500 }
    )
  }
}
