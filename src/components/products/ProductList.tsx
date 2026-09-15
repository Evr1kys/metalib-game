'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, LogIn } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  category: string
  stock: number
}

interface ProductListProps {
  limit?: number
}

export default function ProductList({ limit }: ProductListProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(limit ? data.products.slice(0, limit) : data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Не удалось загрузить товары')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image || undefined,
    })
    toast.success('Товар добавлен в корзину')
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-6 rounded mb-2"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Товары не найдены</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full"
        >
          {product.image && (
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6 flex flex-col flex-grow">
            <Link href={`/products/${product.id}`}>
              <h3 className="text-xl font-bold mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition text-gray-900 dark:text-white min-h-[3.5rem] line-clamp-2">
                {product.name}
              </h3>
            </Link>
            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-4 leading-relaxed flex-grow min-h-[5.5rem]">
                {product.description}
              </p>
            )}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatPrice(product.price)}
              </span>
              {session ? (
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {product.stock === 0 ? 'Нет в наличии' : 'В корзину'}
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
                >
                  <LogIn className="w-4 h-4" />
                  Войти
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
