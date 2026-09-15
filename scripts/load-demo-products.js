const { PrismaClient } = require('@prisma/client')
const { nanoid } = require('nanoid')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Создание тестовых товаров...')

  // Удаляем старые товары
  console.log('🗑️  Удаление старых товаров...')
  await prisma.product.deleteMany({})

  // Реальные популярные игры и товары
  const products = [
    {
      name: 'Steam Wallet 100₽',
      description: 'Пополнение кошелька Steam на 100 рублей. Моментальная доставка кода активации.',
      price: 110,
      category: 'Пополнение Steam',
      stock: 999,
      image: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/753/135dc1ac1cd9763dfc8ad52f4e880d2ac058a36c.jpg',
    },
    {
      name: 'Steam Wallet 500₽',
      description: 'Пополнение кошелька Steam на 500 рублей. Моментальная доставка кода активации.',
      price: 530,
      category: 'Пополнение Steam',
      stock: 999,
      image: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/753/135dc1ac1cd9763dfc8ad52f4e880d2ac058a36c.jpg',
    },
    {
      name: 'Steam Wallet 1000₽',
      description: 'Пополнение кошелька Steam на 1000 рублей. Моментальная доставка кода активации.',
      price: 1050,
      category: 'Пополнение Steam',
      stock: 999,
      image: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/753/135dc1ac1cd9763dfc8ad52f4e880d2ac058a36c.jpg',
    },
    {
      name: 'Counter-Strike 2 Prime Status',
      description: 'Статус Prime в CS2 открывает доступ к Prime-матчмейкингу, эксклюзивным предметам и дропам.',
      price: 1299,
      category: 'Игры',
      stock: 50,
      image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg',
    },
    {
      name: 'Baldur\'s Gate 3',
      description: 'Эпическая RPG от Larian Studios. Окунитесь в мир Забытых Королевств!',
      price: 2299,
      category: 'Игры',
      stock: 20,
      image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg',
    },
    {
      name: 'Red Dead Redemption 2',
      description: 'Легендарный вестерн от Rockstar Games. История преступника Артура Моргана.',
      price: 1999,
      category: 'Игры',
      stock: 15,
      image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg',
    },
    {
      name: 'Cyberpunk 2077',
      description: 'Ролевая игра с открытым миром в футуристическом Найт-Сити от CD PROJEKT RED.',
      price: 1499,
      category: 'Игры',
      stock: 30,
      image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
    },
    {
      name: 'Elden Ring',
      description: 'Action RPG от FromSoftware и Джорджа Мартина. Исследуйте мир Земель Между.',
      price: 2499,
      category: 'Игры',
      stock: 25,
      image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
    },
    {
      name: 'Hogwarts Legacy',
      description: 'Окунитесь в мир магии! Исследуйте Хогвартс и окрестности в 1800-х годах.',
      price: 2199,
      category: 'Игры',
      stock: 20,
      image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/header.jpg',
    },
    {
      name: 'Starfield',
      description: 'Космическая RPG от Bethesda. Исследуйте галактику с тысячами планет!',
      price: 2999,
      category: 'Игры',
      stock: 18,
      image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1716740/header.jpg',
    },
    {
      name: 'The Witcher 3: Wild Hunt GOTY',
      description: 'Легендарная RPG с дополнениями. Завершите эпическую историю Геральта.',
      price: 799,
      category: 'Игры',
      stock: 40,
      image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg',
    },
    {
      name: 'GTA V Premium Edition',
      description: 'Grand Theft Auto V с режимом GTA Online и стартовым набором Criminal Enterprise.',
      price: 1299,
      category: 'Игры',
      stock: 35,
      image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg',
    },
    {
      name: 'Valorant Points 1000 VP',
      description: 'Внутриигровая валюта для Valorant. Покупайте скины оружия и агентов!',
      price: 750,
      category: 'Пополнение игр',
      stock: 999,
      image: 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt5118a6cf94cf28f1/5eb26f2c8b0d935713e1c991/V_LOGOMARK_1920x1080_Red_BG.jpg',
    },
    {
      name: 'Apex Legends Coins 1000',
      description: 'Игровая валюта Apex Legends. Открывайте легенд, скины и боевые пропуска!',
      price: 690,
      category: 'Пополнение игр',
      stock: 999,
      image: 'https://media.contentapi.ea.com/content/dam/apex-legends/common/articles/patch-notes/season-19/apex-featured-image-16x9-season19-ignite.jpg.adapt.crop191x100.628p.jpg',
    },
    {
      name: 'Minecraft Java & Bedrock',
      description: 'Полная версия Minecraft с доступом к Java и Bedrock изданиям.',
      price: 1999,
      category: 'Игры',
      stock: 100,
      image: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Background-PMP.jpg',
    },
  ]

  let added = 0
  for (const product of products) {
    try {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          category: product.category,
          stock: product.stock,
          isActive: true,
          nsGiftsId: `demo_${nanoid(8)}`,
          metadata: JSON.stringify({
            isDemoProduct: true,
            createdAt: new Date().toISOString(),
          }),
        },
      })
      added++
      console.log(`  ✓ ${product.name} - ${product.price}₽`)
    } catch (error) {
      console.error(`  ✗ Ошибка при добавлении ${product.name}:`, error.message)
    }
  }

  console.log(`\n✅ Успешно добавлено товаров: ${added}`)
  console.log('🎉 Готово! Товары отображаются в магазине')
  console.log('\n💡 Для интеграции с NS.Gifts API проверьте документацию: https://api.ns.gifts/docs')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
