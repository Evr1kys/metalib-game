'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Star, 
  ArrowRight,
  Gamepad2,
  Wallet,
  Gift,
  ShoppingBag,
  Shield,
  Clock,
  ChevronRight
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  image: string | null
  categoryId: string | null
  isFeatured: boolean
  category?: {
    id: string
    name: string
    slug: string
    icon: string | null
  }
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  _count: { products: number }
}

export default function HomePage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ])

      if (productsRes.ok) {
        const data = await productsRes.json()
        // Filter out free games (price = 0)
        const paidProducts = (data.products || []).filter((p: Product) => p.price > 0)
        setProducts(paidProducts)
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [products, searchQuery])

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section - только для неавторизованных */}
      {!session && (
        <section className="relative overflow-hidden pt-32 pb-20">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 dark:bg-gradient-to-br dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-600/20 animate-gradient-shift"></div>
          {/* Animated blur circles */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/30 dark:bg-blue-600/20 rounded-full filter blur-3xl opacity-70 dark:opacity-30 animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/30 dark:bg-purple-600/20 rounded-full filter blur-3xl opacity-70 dark:opacity-30 animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-400/30 dark:bg-pink-600/20 rounded-full filter blur-3xl opacity-70 dark:opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-blue-200 dark:border-blue-500/30 rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Лучшие цены • Мгновенная доставка • 24/7 Поддержка
              </span>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-center mb-6 animate-slide-up">
            <div className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
              MetaLib Shop
            </div>
            <div className="text-xl md:text-3xl text-gray-700 dark:text-gray-300 font-medium">
              Цифровые игры и контент для всех платформ
            </div>
          </h1>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in" style={{animationDelay: '0.2s'}}>
            {[
              { icon: Zap, text: 'Моментальная доставка', gradient: 'from-yellow-500 to-orange-500' },
              { icon: Shield, text: 'Гарантия качества', gradient: 'from-green-500 to-emerald-500' },
              { icon: Clock, text: 'Поддержка 24/7', gradient: 'from-blue-500 to-cyan-500' }
            ].map((feature, idx) => (
              <div key={idx} className="group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`}></div>
                <div className="relative flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                  <feature.icon className={`w-5 h-5 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`} />
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{feature.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Найди свою следующую игру..."
                className="w-full pl-16 pr-6 py-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all shadow-xl hover:shadow-2xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors text-2xl"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Steam Wallet Topup - Только для авторизованных */}
      {session && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-1 animate-fade-in-up shadow-2xl hover:shadow-3xl transition-shadow">
              <div className="bg-white dark:bg-gray-800 rounded-[22px] p-8">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-5 rounded-2xl shadow-lg animate-pulse">
                      <Wallet className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Пополнение Steam Wallet</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">Прямое пополнение по логину • От 50₽ до 15000₽ • Зачисление за 5 минут</p>
                    </div>
                  </div>
                  <Link
                    href="/balance/steam-topup"
                    className="group relative bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:via-orange-600 hover:to-pink-600 px-8 py-4 rounded-xl font-black text-white transition-all hover:scale-110 shadow-2xl border-2 border-white/30 text-lg flex items-center gap-3"
                  >
                    <Zap className="w-6 h-6 animate-pulse" />
                    <span>Пополнить сейчас</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && !searchQuery && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4 animate-fade-in">
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-3 rounded-xl shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Популярное
                </h2>
              </div>
              <Link 
                href="/products"
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group font-semibold"
              >
                <span>Смотреть все</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group animate-fade-in-up"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl flex flex-col h-full">
                    {/* Featured Badge */}
                    <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1.5 rounded-full shadow-lg">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-white fill-white animate-pulse" />
                        <span className="text-xs font-bold text-white">ХИТ</span>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex-shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col h-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[3.5rem]">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3 flex-grow min-h-[4rem]">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                          {product.price} ₽
                        </span>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                          <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10 animate-fade-in">
            <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {searchQuery ? `Результаты: "${searchQuery}"` : 'Все товары'}
            </h2>
            <span className="text-gray-600 dark:text-gray-300 font-semibold bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              {filteredProducts.length} товаров
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full mb-6 shadow-lg">
                <Search className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Ничего не найдено</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">Попробуйте изменить параметры поиска</p>
              <button
                onClick={() => setSearchQuery('')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group animate-fade-in-up"
                  style={{animationDelay: `${index * 0.02}s`}}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-all hover:scale-105 hover:-translate-y-1 shadow-md hover:shadow-xl flex flex-col h-full">
                    <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex-shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gift className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-4 flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[3rem]">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2 flex-grow">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-auto">
                        <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                          {product.price} ₽
                        </span>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                          <ShoppingBag className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-1 animate-fade-in shadow-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-[22px] p-12 text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 dark:bg-blue-600/20 rounded-full filter blur-3xl opacity-30 animate-float"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 dark:bg-purple-600/20 rounded-full filter blur-3xl opacity-30 animate-float" style={{animationDelay: '1s'}}></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-xl animate-pulse">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                  Начни играть прямо сейчас
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                  Тысячи игр по лучшим ценам. Моментальная доставка. Безопасные платежи.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    href="/products"
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-xl flex items-center gap-2"
                  >
                    <span>Смотреть каталог</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  {!session && (
                    <Link
                      href="/auth/signup"
                      className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-950 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 border-2 border-gray-200 dark:border-gray-700 shadow-lg"
                    >
                      Зарегистрироваться
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
