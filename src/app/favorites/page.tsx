'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2, RefreshCw } from 'lucide-react'

interface Favorite {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: number
    image: string | null
    category: {
      name: string
      slug: string
    } | null
  }
  createdAt: string
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchFavorites()
    }
  }, [status, router])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (productId: string) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })

      if (res.ok) {
        setFavorites(prev => prev.filter(f => f.productId !== productId))
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-4 rounded-2xl shadow-2xl">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">
                Избранное
              </h1>
              <p className="text-gray-400 text-lg mt-1">
                {favorites.length} {favorites.length === 1 ? 'товар' : 'товаров'}
              </p>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-800 rounded-full mb-6">
              <Heart className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Избранное пусто
            </h3>
            <p className="text-gray-400 mb-8">
              Добавляйте понравившиеся товары в избранное
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {favorites.map((favorite, index) => (
              <div
                key={favorite.id}
                className="group relative bg-gray-800/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 animate-fade-in-up"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <Link href={`/products/${favorite.productId}`}>
                  {/* Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-blue-900/20 to-purple-900/20 overflow-hidden">
                    {favorite.product.image ? (
                      <img
                        src={favorite.product.image}
                        alt={favorite.product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-16 h-16 text-gray-600" />
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        removeFavorite(favorite.productId)
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full transition-colors z-10"
                      title="Удалить из избранного"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {favorite.product.category && (
                      <div className="text-xs text-blue-400 mb-2">
                        {favorite.product.category.name}
                      </div>
                    )}
                    <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {favorite.product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {favorite.product.price} ₽
                      </span>
                      <ShoppingBag className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
