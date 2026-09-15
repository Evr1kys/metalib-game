const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deleteSteamWalletCategory() {
  try {
    console.log('🔍 Поиск категории steam-wallet...')
    
    const category = await prisma.category.findFirst({
      where: { slug: 'steam-wallet' }
    })

    if (!category) {
      console.log('✅ Категория steam-wallet не найдена (уже удалена)')
      return
    }

    console.log(`📦 Найдена категория: ${category.name} (ID: ${category.id})`)

    // Удаляем все продукты этой категории
    const deletedProducts = await prisma.product.deleteMany({
      where: { categoryId: category.id }
    })

    console.log(`🗑️  Удалено продуктов Steam Wallet: ${deletedProducts.count}`)

    // Удаляем саму категорию
    await prisma.category.delete({
      where: { id: category.id }
    })

    console.log('✅ Категория steam-wallet успешно удалена!')

    // Показываем статистику
    const totalProducts = await prisma.product.count()
    const totalCategories = await prisma.category.count()

    console.log('\n📊 Текущая статистика:')
    console.log(`   Категорий: ${totalCategories}`)
    console.log(`   Продуктов: ${totalProducts}`)

  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

deleteSteamWalletCategory()
