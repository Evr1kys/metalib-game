const { PrismaClient } = require('@prisma/client')
const axios = require('axios')

const prisma = new PrismaClient()

// NS Gifts API конфигурация
const NS_API_URL = process.env.NS_GIFTS_API_URL || 'https://api.ns.gifts'
const NS_API_KEY = process.env.NS_GIFTS_API_KEY

async function syncNSGiftsProducts() {
  try {
    console.log('🔄 Синхронизация продуктов с NS Gifts API...\n')

    if (!NS_API_KEY) {
      console.error('❌ NS_GIFTS_API_KEY не найден в .env')
      return
    }

    // Получаем список продуктов из NS Gifts
    const response = await axios.get(`${NS_API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${NS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    })

    const nsProducts = response.data.data || response.data.products || response.data || []
    console.log(`📦 Получено ${nsProducts.length} продуктов из NS Gifts\n`)

    // Находим категории
    const gamesCategory = await prisma.category.findFirst({
      where: { slug: 'games' }
    })

    const steamWalletCategory = await prisma.category.findFirst({
      where: { slug: 'steam-wallet' }
    })

    if (!gamesCategory || !steamWalletCategory) {
      console.error('❌ Категории не найдены в базе данных')
      return
    }

    let addedCount = 0
    let skippedCount = 0
    let updatedCount = 0

    for (const nsProduct of nsProducts) {
      try {
        // Проверяем, есть ли уже такой продукт
        const existingProduct = await prisma.product.findFirst({
          where: { nsGiftsId: String(nsProduct.id) }
        })

        // Определяем категорию
        const isSteamWallet = 
          nsProduct.name?.toLowerCase().includes('steam') && 
          nsProduct.name?.toLowerCase().includes('wallet')
        
        const categoryId = isSteamWallet ? steamWalletCategory.id : gamesCategory.id

        // Пропускаем бесплатные продукты
        if (!nsProduct.price || nsProduct.price <= 0) {
          skippedCount++
          continue
        }

        const productData = {
          name: nsProduct.name || nsProduct.title || 'Без названия',
          description: nsProduct.description || nsProduct.long_description || nsProduct.full_description || nsProduct.about || 'Описание отсутствует',
          price: nsProduct.price || 0,
          image: nsProduct.image || nsProduct.cover || '/images/placeholder.jpg',
          categoryId: categoryId,
          stock: nsProduct.stock !== undefined ? nsProduct.stock : 999,
          isActive: nsProduct.available !== false,
          nsGiftsId: String(nsProduct.id),
          metadata: JSON.stringify({
            nsGiftsData: nsProduct,
            syncedAt: new Date().toISOString()
          })
        }

        if (existingProduct) {
          // Обновляем существующий продукт
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: productData
          })
          updatedCount++
          console.log(`✅ Обновлён: ${productData.name}`)
        } else {
          // Создаём новый продукт
          await prisma.product.create({
            data: productData
          })
          addedCount++
          console.log(`➕ Добавлен: ${productData.name}`)
        }
      } catch (error) {
        console.error(`❌ Ошибка при обработке продукта ${nsProduct.name}:`, error.message)
      }
    }

    console.log('\n📊 Итоги синхронизации:')
    console.log(`   ➕ Добавлено: ${addedCount}`)
    console.log(`   ✅ Обновлено: ${updatedCount}`)
    console.log(`   ⏭️  Пропущено: ${skippedCount}`)

    // Показываем общую статистику
    const totalProducts = await prisma.product.count()
    const totalGames = await prisma.product.count({
      where: { categoryId: gamesCategory.id }
    })
    const totalSteamWallet = await prisma.product.count({
      where: { categoryId: steamWalletCategory.id }
    })

    console.log('\n📈 Текущая статистика:')
    console.log(`   Всего продуктов: ${totalProducts}`)
    console.log(`   Игр: ${totalGames}`)
    console.log(`   Steam Wallet: ${totalSteamWallet}`)

  } catch (error) {
    console.error('❌ Ошибка синхронизации:', error.message)
    if (error.response) {
      console.error('Ответ API:', error.response.data)
    }
  } finally {
    await prisma.$disconnect()
  }
}

syncNSGiftsProducts()
