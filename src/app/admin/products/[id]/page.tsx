'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
}

export default function EditProductPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
    nsGiftsId: '',
    systemRequirements: '',
    isActive: true,
    isFeatured: false
  })

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      loadProduct()
      loadCategories()
    }
  }, [session, productId])

  const loadProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`)
      if (res.ok) {
        const data = await res.json()
        const metadata = data.product.metadata ? JSON.parse(data.product.metadata) : {}
        setFormData({
          name: data.product.name || '',
          description: data.product.description || '',
          price: data.product.price.toString(),
          categoryId: data.product.categoryId || '',
          image: data.product.image || '',
          nsGiftsId: data.product.nsGiftsId || '',
          systemRequirements: metadata.systemRequirements || '',
          isActive: data.product.isActive,
          isFeatured: data.product.isFeatured
        })
      }
    } catch (error) {
      console.error('Failed to load product:', error)
      toast.error('Ошибка загрузки товара')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        console.log('Categories loaded:', data)
        const cats = (data.categories || []).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        }))
        setCategories(cats)
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error('Заполните обязательные поля')
      return
    }

    setSaving(true)

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: 999999,
          nsGiftsId: formData.nsGiftsId || null,
          systemRequirements: formData.systemRequirements || null
        })
      })

      if (res.ok) {
        toast.success('Товар успешно обновлен!')
        router.push('/admin/products')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Ошибка обновления товара')
      }
    } catch (error) {
      console.error('Update product error:', error)
      toast.error('Ошибка обновления товара')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Товар удален')
        router.push('/admin/products')
      } else {
        toast.error('Ошибка удаления товара')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Ошибка удаления товара')
    }
  }

  if (session?.user?.role !== 'admin' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Редактировать товар
              </h1>
              <p className="text-gray-400 mt-2">Обновите информацию о товаре</p>
            </div>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-xl hover:bg-red-600/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Удалить
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 space-y-6">
          {/* Название */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Название товара <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              required
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
            />
          </div>

          {/* Системные требования */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Системные требования <span className="text-blue-400 text-xs">(для игр)</span>
            </label>
            <textarea
              value={formData.systemRequirements}
              onChange={(e) => setFormData({ ...formData, systemRequirements: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none font-mono text-sm"
            />
          </div>

          {/* Категория и NS.Gifts ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Категория <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                NS.Gifts ID <span className="text-yellow-400 text-xs">(для автовыдачи)</span>
              </label>
              <input
                type="text"
                value={formData.nsGiftsId}
                onChange={(e) => setFormData({ ...formData, nsGiftsId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          {/* Цена и Наличие */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Цена (₽) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Изображение */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              URL изображения <span className="text-blue-400 text-xs">(рекомендуется 600x400px)</span>
            </label>
            <div className="space-y-3">
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              {formData.image && (
                <div className="relative w-full h-48 bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Чекбоксы */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-gray-700 bg-gray-900/50 text-purple-500 focus:ring-purple-500 cursor-pointer"
              />
              <span className="text-gray-200 font-medium group-hover:text-white transition-colors">
                Активный товар
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-5 h-5 rounded border-gray-700 bg-gray-900/50 text-purple-500 focus:ring-purple-500 cursor-pointer"
              />
              <span className="text-gray-200 font-medium group-hover:text-white transition-colors">
                Рекомендуемый товар
              </span>
            </label>
          </div>

          {/* Кнопки */}
          <div className="flex items-center gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/30"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Сохранить изменения
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-4 bg-gray-700/50 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 hover:text-white transition-all"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
