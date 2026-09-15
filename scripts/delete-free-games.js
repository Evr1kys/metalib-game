const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Удаление бесплатных игр (price = 0)...')
    
    const deleted = await prisma.product.deleteMany({
      where: {
        price: 0
      }
    })

    console.log(`✅ Удалено бесплатных игр: ${deleted.count}`)

    // Показываем статистику
    const totalProducts = await prisma.product.count()
    console.log(`📊 Всего продуктов в базе: ${totalProducts}`)

  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
