export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NSGiftsAPI } from '@/lib/nsgifts'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const api = new NSGiftsAPI()

    // Try to get currency rates
    let currencies = []
    try {
      const currencyData = await api.getCurrencies()
      currencies = currencyData.map((c: any) => ({
        currency: c.code || c.name,
        rate: parseFloat(c.rate || c.value || 0),
        lastUpdated: new Date().toISOString(),
      }))
    } catch (error) {
      console.error('Could not fetch currencies:', error)
    }

    return NextResponse.json({ 
      success: true,
      currencies,
    })
  } catch (error: any) {
    console.error('NS Gifts sync error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync with NS Gifts' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Создаём/получаем категории
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'steam-wallet' },
        update: {},
        create: {
          name: 'Steam Wallet',
          slug: 'steam-wallet',
          description: 'Пополнение кошелька Steam',
          icon: '💳',
          sortOrder: 1,
          isActive: true
        }
      }),
      prisma.category.upsert({
        where: { slug: 'games' },
        update: {},
        create: {
          name: 'Игры',
          slug: 'games',
          description: 'Игры для Steam',
          icon: '🎮',
          sortOrder: 2,
          isActive: true
        }
      }),
      prisma.category.upsert({
        where: { slug: 'dlc' },
        update: {},
        create: {
          name: 'DLC',
          slug: 'dlc',
          description: 'Дополнения к играм',
          icon: '📦',
          sortOrder: 3,
          isActive: true
        }
      }),
      prisma.category.upsert({
        where: { slug: 'subscriptions' },
        update: {},
        create: {
          name: 'Подписки',
          slug: 'subscriptions',
          description: 'Игровые подписки',
          icon: '⭐',
          sortOrder: 4,
          isActive: true
        }
      })
    ])

    const [walletCat, gamesCat, dlcCat, subsCat] = categories

    // ВРЕМЕННОЕ РЕШЕНИЕ: NS.Gifts API недоступен для синхронизации
    // Вместо этого добавим популярные товары вручную
    const demoProducts = [
      // Steam Wallet
      { name: 'Steam Wallet 50₽', price: 55, categoryId: walletCat.id, oldCategory: 'STEAM_WALLET', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/753/header.jpg' },
      { name: 'Steam Wallet 100₽', price: 105, categoryId: walletCat.id, oldCategory: 'STEAM_WALLET', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/753/header.jpg' },
      { name: 'Steam Wallet 200₽', price: 210, categoryId: walletCat.id, oldCategory: 'STEAM_WALLET', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/753/header.jpg' },
      { name: 'Steam Wallet 500₽', price: 525, categoryId: walletCat.id, oldCategory: 'STEAM_WALLET', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/753/header.jpg' },
      { name: 'Steam Wallet 1000₽', price: 1050, categoryId: walletCat.id, oldCategory: 'STEAM_WALLET', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/753/header.jpg' },
      { name: 'Steam Wallet 2000₽', price: 2100, categoryId: walletCat.id, oldCategory: 'STEAM_WALLET', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/753/header.jpg' },
      { name: 'Steam Wallet 5000₽', price: 5250, categoryId: walletCat.id, oldCategory: 'STEAM_WALLET', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/753/header.jpg' },
      
      // Free to Play
      { name: 'Counter-Strike 2', price: 0, categoryId: gamesCat.id, oldCategory: 'GAME', isFeatured: true, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg' },
      { name: 'Dota 2', price: 0, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg' },
      { name: 'Team Fortress 2', price: 0, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/440/header.jpg' },
      { name: 'Apex Legends', price: 0, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg' },
      { name: 'Warframe', price: 0, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/230410/header.jpg' },
      { name: 'Path of Exile', price: 0, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/238960/header.jpg' },
      
      // AAA Games
      { name: 'Cyberpunk 2077', price: 1999, categoryId: gamesCat.id, oldCategory: 'GAME', isFeatured: true, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg' },
      { name: 'Red Dead Redemption 2', price: 2499, categoryId: gamesCat.id, oldCategory: 'GAME', isFeatured: true, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg' },
      { name: 'GTA V', price: 1499, categoryId: gamesCat.id, oldCategory: 'GAME', isFeatured: true, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg' },
      { name: 'The Witcher 3: Wild Hunt', price: 599, categoryId: gamesCat.id, oldCategory: 'GAME', isFeatured: true, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg' },
      { name: 'Hogwarts Legacy', price: 2399, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/990080/header.jpg' },
      { name: 'Baldur\'s Gate 3', price: 2299, categoryId: gamesCat.id, oldCategory: 'GAME', isFeatured: true, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg' },
      { name: 'Elden Ring', price: 2499, categoryId: gamesCat.id, oldCategory: 'GAME', isFeatured: true, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg' },
      { name: 'God of War', price: 1999, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg' },
      { name: 'Spider-Man Remastered', price: 1999, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/header.jpg' },
      { name: 'Resident Evil 4', price: 1899, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/header.jpg' },
      
      // Shooters
      { name: 'Call of Duty: Modern Warfare II', price: 2999, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/header.jpg' },
      { name: 'Rainbow Six Siege', price: 899, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/359550/header.jpg' },
      { name: 'Escape from Tarkov', price: 2499, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.akamai.steamstatic.com/steam/apps/700330/header.jpg' },
      { name: 'PUBG: BATTLEGROUNDS', price: 0, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg' },
      { name: 'Rust', price: 999, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg' },
      
      // Survival & Sandbox
      { name: 'Valheim', price: 599, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg' },
      { name: 'Minecraft', price: 899, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg' },
      { name: 'Terraria', price: 399, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg' },
      { name: 'ARK: Survival Evolved', price: 599, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg' },
      { name: 'DayZ', price: 1499, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg' },
      
      // Strategy
      { name: 'Civilization VI', price: 1999, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/289070/header.jpg' },
      { name: 'Total War: WARHAMMER III', price: 2299, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1142710/header.jpg' },
      { name: 'Cities: Skylines', price: 899, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/255710/header.jpg' },
      { name: 'Stellaris', price: 1299, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/281990/header.jpg' },
      { name: 'Age of Empires IV', price: 1799, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1466860/header.jpg' },
      
      // RPG
      { name: 'Skyrim Special Edition', price: 1299, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/489830/header.jpg' },
      { name: 'Fallout 4', price: 599, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/377160/header.jpg' },
      { name: 'Dark Souls III', price: 1499, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/374320/header.jpg' },
      { name: 'Divinity: Original Sin 2', price: 1199, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/435150/header.jpg' },
      { name: 'Monster Hunter: World', price: 999, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/582010/header.jpg' },
      
      // Horror
      { name: 'Resident Evil Village', price: 1899, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1196590/header.jpg' },
      { name: 'Dead Space', price: 2299, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1693980/header.jpg' },
      { name: 'The Evil Within 2', price: 899, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/601430/header.jpg' },
      { name: 'Outlast', price: 599, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/238320/header.jpg' },
      
      // Racing
      { name: 'Forza Horizon 5', price: 2499, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg' },
      { name: 'F1 23', price: 2299, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2108330/header.jpg' },
      { name: 'Need for Speed Heat', price: 1499, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1222680/header.jpg' },
      
      // Indie
      { name: 'Stardew Valley', price: 399, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg' },
      { name: 'Hollow Knight', price: 449, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg' },
      { name: 'Hades', price: 899, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg' },
      { name: 'Celeste', price: 599, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg' },
      { name: 'Dead Cells', price: 849, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/588650/header.jpg' },
      { name: 'Undertale', price: 349, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/391540/header.jpg' },
      
      // Multiplayer
      { name: 'Sea of Thieves', price: 1499, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172620/header.jpg' },
      { name: 'Among Us', price: 149, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/945360/header.jpg' },
      { name: 'Phasmophobia', price: 499, categoryId: gamesCat.id, oldCategory: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/739630/header.jpg' },
      { name: 'Overcooked! 2', price: 899, category: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/728880/header.jpg' },
      
      // Fighting
      { name: 'Mortal Kombat 11', price: 1499, category: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/976310/header.jpg' },
      { name: 'Street Fighter 6', price: 2399, category: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1364780/header.jpg' },
      { name: 'Tekken 7', price: 899, category: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/389730/header.jpg' },
      
      // Simulation
      { name: 'Microsoft Flight Simulator', price: 2499, category: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1250410/header.jpg' },
      { name: 'Euro Truck Simulator 2', price: 599, category: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/227300/header.jpg' },
      { name: 'The Sims 4', price: 0, category: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1222670/header.jpg' },
      { name: 'Planet Zoo', price: 1699, category: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/703080/header.jpg' },
      
      // Sports
      { name: 'FIFA 23', price: 2299, category: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1811260/header.jpg' },
      { name: 'NBA 2K23', price: 1999, category: 'GAME', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1919590/header.jpg' },
      
      // DLC Popular
      { name: 'The Witcher 3: Blood and Wine', price: 599, category: 'DLC', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/378649/header.jpg' },
      { name: 'Elden Ring: Shadow of the Erdtree', price: 1499, category: 'DLC', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2778580/header.jpg' },
      { name: 'Destiny 2: Lightfall', price: 1799, category: 'DLC', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1656360/header.jpg' },
      { name: 'Skyrim: Dragonborn', price: 599, category: 'DLC', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/226880/header.jpg' },
      
      // Subscriptions
      { name: 'EA Play 1 месяц', price: 299, category: 'SUBSCRIPTION', image: 'https://cdn.akamai.steamstatic.com/steam/apps/1240440/header.jpg' },
      { name: 'Xbox Game Pass PC 1 месяц', price: 599, category: 'SUBSCRIPTION', image: 'https://cdn.akamai.steamstatic.com/steam/apps/1817190/header.jpg' },
      { name: 'PlayStation Plus 1 месяц', price: 799, category: 'SUBSCRIPTION', image: 'https://cdn.akamai.steamstatic.com/steam/apps/1448080/header.jpg' },
    ]

    let imported = 0

    for (const product of demoProducts) {
      try {
        // Find category by slug
        const category = await prisma.category.findFirst({
          where: { slug: product.category }
        })

        // Проверяем существование
        const existing = await prisma.product.findFirst({
          where: { name: product.name }
        })

        if (!existing) {
          await prisma.product.create({
            data: {
              name: product.name,
              description: `${product.name} - популярный товар`,
              price: product.price,
              categoryId: category?.id,
              image: product.image,
              stock: 999,
              isActive: true,
            }
          })
          imported++
        }
      } catch (err) {
        console.error(`Failed to import ${product.name}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      total: demoProducts.length,
      imported: imported,
      message: `Добавлено ${imported} новых товаров. NS.Gifts API временно недоступен, используются демо-товары.`,
      note: 'Для полной интеграции с NS.Gifts требуется актуальная документация API'
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync products: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
