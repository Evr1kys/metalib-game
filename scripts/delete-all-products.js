const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteAllProducts() {
  try {
    console.log('🗑️  Удаление всех товаров...\n')

    // Сначала удаляем все элементы заказов
    const deletedOrderItems = await prisma.orderItem.deleteMany({})
    console.log(`✅ Удалено ${deletedOrderItems.count} элементов заказов`)

    // Затем удаляем все товары
    const deletedProducts = await prisma.product.deleteMany({})
    console.log(`✅ Удалено ${deletedProducts.count} товаров`)

    console.log('\n✨ Все товары успешно удалены!')
    console.log('Теперь вы можете добавлять товары через админ-панель')
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllProducts()
