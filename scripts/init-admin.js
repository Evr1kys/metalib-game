const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { customAlphabet } = require('nanoid')

const prisma = new PrismaClient()
const generateReferralCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8)

async function main() {
  console.log('🚀 Инициализация базы данных...')

  // Создаем администратора
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@metalib.shop'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log('✅ Администратор уже существует')
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Администратор',
        password: hashedPassword,
        role: 'ADMIN',
        referralCode: generateReferralCode(),
        emailVerified: new Date(),
      },
    })

    console.log('✅ Администратор создан:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log('   ⚠️  ОБЯЗАТЕЛЬНО СМЕНИТЕ ПАРОЛЬ ПОСЛЕ ПЕРВОГО ВХОДА!')
  }

  // Создаем демо-товары
  const demoProducts = [
    {
      name: 'Steam Wallet 100 RUB',
      description: 'Пополнение Steam кошелька на 100 рублей. Мгновенная доставка.',
      price: 100,
      category: 'STEAM_WALLET',
      stock: 100,
      image: null, // Используйте реальные URL изображений
    },
    {
      name: 'Steam Wallet 500 RUB',
      description: 'Пополнение Steam кошелька на 500 рублей. Мгновенная доставка.',
      price: 500,
      category: 'STEAM_WALLET',
      stock: 100,
      image: null,
    },
    {
      name: 'CS2 Prime Status',
      description: 'Prime статус для Counter-Strike 2. Доступ к эксклюзивным возможностям.',
      price: 1500,
      category: 'GAME',
      stock: 50,
      image: null,
    },
  ]

  for (const product of demoProducts) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    })

    if (!existing) {
      await prisma.product.create({ data: product })
      console.log(`✅ Создан товар: ${product.name}`)
    }
  }

  console.log('🎉 Инициализация завершена!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
