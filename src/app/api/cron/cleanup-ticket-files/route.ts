export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * Cron job для очистки файлов из закрытых/архивных тикетов
 * Удаляет вложения из тикетов старше 30 дней со статусом CLOSED или ARCHIVED
 */
export async function GET(req: NextRequest) {
  try {
    // Простая авторизация через секретный ключ
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON] Starting ticket attachments cleanup...')

    // Дата 30 дней назад
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Получаем закрытые/архивные тикеты старше 30 дней
    const oldTickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { status: 'CLOSED' },
          { isArchived: true }
        ],
        updatedAt: {
          lt: thirtyDaysAgo
        }
      },
      include: {
        messages: {
          where: {
            attachments: {
              not: null
            }
          },
          select: {
            id: true,
            attachments: true
          }
        }
      }
    })

    console.log(`[CRON] Found ${oldTickets.length} old tickets to process`)

    let filesDeleted = 0
    let bytesFreed = 0
    let messagesUpdated = 0
    const errors: string[] = []

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'tickets')

    for (const ticket of oldTickets) {
      for (const message of ticket.messages) {
        try {
          if (!message.attachments) continue

          const attachments = JSON.parse(message.attachments)
          
          if (Array.isArray(attachments)) {
            for (const attachment of attachments) {
              try {
                // Extract filename from URL
                const url = typeof attachment === 'string' ? attachment : attachment.url
                const filename = url.split('/').pop()
                
                if (filename) {
                  const filepath = join(uploadDir, filename)
                  
                  if (existsSync(filepath)) {
                    // Get file size before deletion
                    const fs = require('fs')
                    const stats = fs.statSync(filepath)
                    const fileSize = stats.size
                    
                    // Delete file
                    await unlink(filepath)
                    filesDeleted++
                    bytesFreed += fileSize
                    
                    console.log(`[CRON] Deleted file: ${filename} (${(fileSize / 1024).toFixed(2)} KB)`)
                  }
                }
              } catch (err) {
                errors.push(`Error deleting file ${attachment}: ${err}`)
              }
            }
          }

          // Update message to remove attachments
          await prisma.ticketMessage.update({
            where: { id: message.id },
            data: { attachments: null }
          })
          messagesUpdated++

        } catch (error) {
          const errorMsg = `Error processing message ${message.id}: ${error}`
          console.error(`[CRON] ${errorMsg}`)
          errors.push(errorMsg)
        }
      }
    }

    const mbFreed = (bytesFreed / 1024 / 1024).toFixed(2)

    console.log(`[CRON] Cleanup completed:`)
    console.log(`  - Files deleted: ${filesDeleted}`)
    console.log(`  - Space freed: ${mbFreed} MB`)
    console.log(`  - Messages updated: ${messagesUpdated}`)

    return NextResponse.json({
      success: true,
      ticketsProcessed: oldTickets.length,
      filesDeleted,
      spaceFreed: `${mbFreed} MB`,
      bytesFreed,
      messagesUpdated,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('[CRON] Cleanup failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
