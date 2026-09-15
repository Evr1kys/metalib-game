const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixProducts() {
  const categories = await prisma.category.findMany();
  const catMap = {};
  categories.forEach(c => { catMap[c.slug] = c.id; });
  
  // Оставляем только реальные пополнения в steam-wallet
  const steamWalletKeywords = ['Steam Wallet', 'пополнение', 'Wallet'];
  
  // Получаем все продукты Steam Wallet
  const steamProducts = await prisma.product.findMany({
    where: { categoryId: catMap['steam-wallet'] }
  });
  
  let moved = 0;
  
  for (const product of steamProducts) {
    const isRealWallet = steamWalletKeywords.some(kw => 
      product.name.includes(kw)
    );
    
    if (!isRealWallet) {
      // Переносим в категорию Игры
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId: catMap['games'] }
      });
      console.log(`  ✓ ${product.name} → Игры`);
      moved++;
    }
  }
  
  console.log(`\n✅ Перенесено ${moved} игр в категорию 'Игры'\n`);
  
  // DLC в категорию dlc
  const dlcProducts = await prisma.product.findMany({
    where: { 
      OR: [
        { name: { contains: 'DLC' } },
        { name: { contains: 'Dragonborn' } },
        { name: { contains: 'Shadow of the Erdtree' } },
        { name: { contains: 'Blood and Wine' } },
        { name: { contains: 'Lightfall' } }
      ]
    }
  });
  
  for (const dlc of dlcProducts) {
    await prisma.product.update({
      where: { id: dlc.id },
      data: { categoryId: catMap['dlc'] }
    });
    console.log(`  ✓ ${dlc.name} → DLC`);
  }
  
  console.log(`\n✅ Перенесено ${dlcProducts.length} DLC в категорию 'DLC'\n`);
  
  // Подписки
  const subProducts = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'EA Play' } },
        { name: { contains: 'Game Pass' } },
        { name: { contains: 'PlayStation Plus' } }
      ]
    }
  });
  
  for (const sub of subProducts) {
    await prisma.product.update({
      where: { id: sub.id },
      data: { categoryId: catMap['subscriptions'] }
    });
    console.log(`  ✓ ${sub.name} → Подписки`);
  }
  
  console.log(`\n✅ Перенесено ${subProducts.length} подписок в категорию 'Подписки'\n`);
  
  // Показываем финальную статистику
  console.log('\n📊 Итоговая статистика:');
  const finalCategories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } }
  });
  
  finalCategories.forEach(c => {
    console.log(`  ${c.icon} ${c.name}: ${c._count.products} товаров`);
  });
}

fixProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
