const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    console.log(`\n📁 Найдено категорий: ${categories.length}\n`)
    
    if (categories.length > 0) {
      categories.forEach(cat => {
        console.log(`✅ ${cat.name} (${cat.slug})`)
        console.log(`   ID: ${cat.id}`)
        console.log(`   Активна: ${cat.isActive ? 'Да' : 'Нет'}`)
        console.log(`   Порядок: ${cat.sortOrder}\n`)
      })
    } else {
      console.log('❌ Категории отсутствуют в базе данных!')
      console.log('Необходимо создать категории через админ-панель или миграцию.\n')
    }
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCategories()
