const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixProductCategories() {
  try {
    // Получаем категории
    const categories = await prisma.category.findMany();
    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c.id; });
    
    console.log('📂 Категории в базе:');
    Object.keys(catMap).forEach(slug => {
      console.log(`  - ${slug}: ${catMap[slug]}`);
    });
    console.log('');
    
    // Получаем все продукты
    const products = await prisma.product.findMany({
      select: { id: true, name: true, categoryId: true, price: true }
    });
    
    console.log(`📦 Всего продуктов: ${products.length}\n`);
    
    // Ключевые слова для определения категорий
    const steamWalletKeywords = ['steam wallet', 'пополнение', 'стим кошелёк', 'steam gift card'];
    const gameCurrencyKeywords = ['gold', 'coins', 'credits', 'валюта', 'монеты', 'кредиты'];
    const dlcKeywords = ['dlc', 'expansion', 'season pass', 'дополнение'];
    
    let updated = 0;
    
    for (const product of products) {
      const nameLower = product.name.toLowerCase();
      let newCategoryId = null;
      
      // Steam Wallet - только пополнения
      if (steamWalletKeywords.some(kw => nameLower.includes(kw))) {
        newCategoryId = catMap['steam-wallet'];
      }
      // Игровая валюта
      else if (gameCurrencyKeywords.some(kw => nameLower.includes(kw))) {
        newCategoryId = catMap['game-currency'];
      }
      // DLC
      else if (dlcKeywords.some(kw => nameLower.includes(kw))) {
        newCategoryId = catMap['dlc'];
      }
      // Остальное - игры
      else {
        newCategoryId = catMap['games'];
      }
      
      // Обновляем только если категория изменилась
      if (newCategoryId && product.categoryId !== newCategoryId) {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: newCategoryId }
        });
        
        const newCategoryName = Object.keys(catMap).find(k => catMap[k] === newCategoryId);
        console.log(`✅ ${product.name} → ${newCategoryName}`);
        updated++;
      }
    }
    
    console.log(`\n✅ Обновлено ${updated} продуктов`);
    
    // Статистика по категориям
    const stats = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    console.log('\n📊 Статистика по категориям:');
    stats.forEach(cat => {
      console.log(`  ${cat.name}: ${cat._count.products} товаров`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductCategories();
