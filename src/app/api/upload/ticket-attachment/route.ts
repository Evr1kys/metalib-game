export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import sharp from 'sharp'

/**
 * Upload file for ticket attachments with automatic compression
 * Images are converted to WebP and compressed
 * Allowed: images (jpg, jpeg, png, gif, webp) and documents (pdf, txt)
 * Max size before compression: 10MB
 * Max size after compression: 2MB for images
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
    }

    // Validate file size (10MB max before compression)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Файл слишком большой. Максимальный размер: 10MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const documentTypes = ['application/pdf', 'text/plain']
    const allowedTypes = [...imageTypes, ...documentTypes]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Недопустимый тип файла. Разрешены: JPG, PNG, GIF, WEBP, PDF, TXT' },
        { status: 400 }
      )
    }

    // Create upload directory if not exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'tickets')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let finalBuffer: Buffer = buffer
    let finalExtension = file.name.split('.').pop()
    let finalSize = file.size
    let isCompressed = false

    // Compress images
    if (imageTypes.includes(file.type)) {
      try {
        // Convert to WebP with compression
        const compressed = await sharp(buffer)
          .webp({ quality: 80, effort: 6 }) // High compression effort
          .resize(1920, 1920, { // Max dimensions
            fit: 'inside',
            withoutEnlargement: true
          })
          .toBuffer()

        // Use compressed version if it's smaller or under 2MB
        const maxCompressedSize = 2 * 1024 * 1024 // 2MB
        if (compressed.length < buffer.length || compressed.length < maxCompressedSize) {
          finalBuffer = compressed
          finalExtension = 'webp'
          finalSize = compressed.length
          isCompressed = true
        }

        // If still too large, compress more aggressively
        if (finalSize > maxCompressedSize) {
          const moreCompressed = await sharp(buffer)
            .webp({ quality: 60, effort: 6 })
            .resize(1280, 1280, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .toBuffer()
          
          finalBuffer = moreCompressed
          finalSize = moreCompressed.length
        }

      } catch (error) {
        console.error('Compression error:', error)
        // Fallback to original if compression fails
      }
    }

    const filename = `${timestamp}-${randomString}.${finalExtension}`
    const filepath = join(uploadDir, filename)

    // Save file
    await writeFile(filepath, finalBuffer)

    // Calculate compression ratio
    const compressionRatio = isCompressed 
      ? Math.round((1 - finalSize / file.size) * 100)
      : 0

    // Return public URL
    const fileUrl = `/uploads/tickets/${filename}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: file.name,
      originalSize: file.size,
      finalSize,
      compressed: isCompressed,
      compressionRatio: compressionRatio > 0 ? `${compressionRatio}%` : null,
      type: isCompressed ? 'image/webp' : file.type
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки файла' },
      { status: 500 }
    )
  }
}
