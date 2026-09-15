'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ShoppingCart, Heart, ChevronRight, Info, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cart'

interface Product {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  category: {
    id: string
    name: string
  }
  stock: number
  image: string
  metadata: string
  nsGiftsId?: string
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const addToCart = useCartStore((state) => state.addItem)
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [systemRequirements, setSystemRequirements] = useState('')

  useEffect(() => {
    loadProduct()
    if (session) {
      checkFavorite()
    }
  }, [params.id, session])

  const loadProduct = async () => {
    try {
      const productId = params.id as string
      const res = await fetch('/api/products/' + productId)
      if (!res.ok) throw new Error('Product not found')
      const data = await res.json()
      setProduct(data)
      try {
        const metadata = JSON.parse(data.metadata || '{}')
        setSystemRequirements(metadata.systemRequirements || '')
      } catch (e) {
        console.error(e)
      }
    } catch (error) {
      toast.error('Ошибка загрузки товара')
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  const checkFavorite = async () => {
    try {
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const favorites = await res.json()
        setIsFavorite(favorites.some((f: any) => f.productId === params.id))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const toggleFavorite = async () => {
    if (!session) {
      toast.error('Войдите для добавления в избранное')
      return
    }
    try {
      const res = await fetch('/api/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: params.id }),
      })
      if (!res.ok) throw new Error('Failed')
      setIsFavorite(!isFavorite)
      toast.success(isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное')
    } catch (error) {
      toast.error('Ошибка при обновлении избранного')
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    addToCart({ 
      productId: product.id, 
      name: product.name, 
      price: product.price, 
      image: product.image 
    })
    toast.success('Добавлено в корзину')
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/cart')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Товар не найден</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-purple-400 transition-colors">
            Главная
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-purple-400 transition-colors">
            Каталог
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-purple-500/20">
              <div className="relative aspect-video bg-black">
                <Image
                  src={product.image || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-6 border border-purple-500/10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-400" />
                Описание
              </h2>
              <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>

            {systemRequirements && (
              <div className="bg-gray-800/30 rounded-xl p-6 border border-purple-500/10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  Системные требования
                </h2>
                <pre className="text-gray-300 whitespace-pre-line font-mono text-sm leading-relaxed">
                  {systemRequirements}
                </pre>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/20 sticky top-24 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{product.name}</h1>
                {product.category && (
                  <p className="text-purple-400">{product.category.name}</p>
                )}
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                <p className="text-gray-400 text-sm mb-1">Цена</p>
                <p className="text-4xl font-bold text-white">{product.price} ₽</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">В наличии:</span>
                <span className={product.stock > 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                  {product.stock > 0 ? product.stock + ' шт.' : 'Нет в наличии'}
                </span>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Мгновенная доставка</p>
                    <p className="text-gray-400 text-sm">Товар придет на email сразу после оплаты</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Официальный ключ</p>
                    <p className="text-gray-400 text-sm">Гарантия подлинности</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 px-6 rounded-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Купить сейчас
                </button>
                
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white py-4 px-6 rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
                >
                  Добавить в корзину
                </button>

                <button
                  onClick={toggleFavorite}
                  className={
                    isFavorite
                      ? 'w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 bg-pink-500/20 text-pink-400 border border-pink-500/50'
                      : 'w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 bg-gray-700/50 text-gray-400 border border-gray-600 hover:border-pink-500/50 hover:text-pink-400'
                  }
                >
                  <Heart className={isFavorite ? 'w-5 h-5 fill-current' : 'w-5 h-5'} />
                  {isFavorite ? 'В избранном' : 'В избранное'}
                </button>
              </div>

              {product.nsGiftsId && (
                <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-700">
                  ID: {product.nsGiftsId}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
