const { PrismaClient } = require('@prisma/client')
const axios = require('axios')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Загрузка товаров из NS.Gifts API...')

  try {
    // Тестируем разные endpoints
    console.log('🔐 Тестирование NS.Gifts API...')
    
    const baseAuth = Buffer.from('gg1top:7Dn0zeO7vx').toString('base64')
    
    // Пробуем получить товары напрямую с Basic Auth
    try {
      console.log('📦 Попытка 1: Получение товаров с Basic Auth...')
      const productsResponse = await axios.get('https://api.ns.gifts/catalog', {
        headers: {
          'Authorization': `Basic ${baseAuth}`,
        },
      })
      console.log('✅ Товары получены:', productsResponse.data)
    } catch (e) {
      console.log('❌ Попытка 1 не удалась:', e.response?.status, e.response?.data || e.message)
    }

    // Пробуем другой endpoint
    try {
      console.log('📦 Попытка 2: /api/products...')
      const productsResponse = await axios.get('https://api.ns.gifts/api/products', {
        headers: {
          'Authorization': `Basic ${baseAuth}`,
        },
      })
      console.log('✅ Товары получены:', productsResponse.data)
    } catch (e) {
      console.log('❌ Попытка 2 не удалась:', e.response?.status, e.response?.data || e.message)
    }

    // Пробуем docs endpoint
    try {
      console.log('📦 Попытка 3: Проверяем документацию...')
      const docsResponse = await axios.get('https://api.ns.gifts/docs')
      console.log('✅ Docs доступны')
    } catch (e) {
      console.log('❌ Попытка 3 не удалась:', e.response?.status)
    }

    console.log('\n⚠️  Для настройки API необходимо проверить документацию: https://api.ns.gifts/docs')

    const products = productsResponse.data.data || productsResponse.data.products || productsResponse.data

    if (!products || products.length === 0) {
      console.log('⚠️  Товары не найдены в API')
      return
    }

    console.log(`📊 Найдено товаров: ${products.length}`)

    // Удаляем старые товары-заглушки
    console.log('🗑️  Удаление старых товаров...')
    await prisma.product.deleteMany({})

    // Добавляем товары из API
    let added = 0
    for (const product of products.slice(0, 20)) { // Ограничим 20 товарами для начала
      try {
        await prisma.product.create({
          data: {
            name: product.name || product.title,
            description: product.description || `${product.name} - цифровая доставка`,
            price: parseFloat(product.price || product.cost || 0),
            image: product.image || product.photo || null,
            category: product.category || product.type || 'Игры',
            stock: product.stock || product.quantity || 999,
            isActive: true,
            nsGiftsId: product.id?.toString() || product.product_id?.toString(),
            metadata: JSON.stringify({
              originalData: product,
            }),
          },
        })
        added++
        console.log(`  ✓ ${product.name} - ${product.price}₽`)
      } catch (error) {
        console.error(`  ✗ Ошибка при добавлении товара ${product.name}:`, error.message)
      }
    }

    console.log(`\n✅ Успешно добавлено товаров: ${added}`)
    console.log('🎉 Загрузка завершена!')

  } catch (error) {
    console.error('❌ Ошибка:', error.message)
    if (error.response) {
      console.error('Детали:', error.response.data)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()
