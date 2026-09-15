'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Save, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
}

export default function CreateProductPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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

  // Загрузка категорий при монтировании
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        console.log('Categories loaded:', data)
        const cats = (data.categories || []).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        }))
        setCategories(cats)
      })
      .catch(err => console.error('Failed to load categories:', err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error('Заполните обязательные поля')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
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
        toast.success('Товар успешно создан!')
        router.push('/admin/products')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Ошибка создания товара')
      }
    } catch (error) {
      console.error('Create product error:', error)
      toast.error('Ошибка создания товара')
    } finally {
      setLoading(false)
    }
  }

  if (session?.user?.role !== 'admin') {
    return null
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
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Добавить товар
          </h1>
          <p className="text-gray-400 mt-2">Заполните информацию о новом товаре</p>
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
              placeholder="Например: Grand Theft Auto V"
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
              placeholder="Подробное описание товара..."
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
              placeholder="Минимальные и рекомендуемые системные требования..."
              rows={6}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Пример: OS: Windows 10, Процессор: Intel Core i5, RAM: 8GB, Видео: GTX 1060
            </p>
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
                NS.Gifts ID <span className="text-yellow-400 text-xs">(важно для автовыдачи)</span>
              </label>
              <input
                type="text"
                value={formData.nsGiftsId}
                onChange={(e) => setFormData({ ...formData, nsGiftsId: e.target.value })}
                placeholder="ID товара в NS.Gifts"
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
                placeholder="999.00"
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
                placeholder="https://example.com/game-image.jpg"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              {formData.image && (
                <div className="relative w-full h-48 bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.png'
                    }}
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Совет: используйте изображения хорошего качества для лучшего отображения
            </p>
          </div>

          {/* Чекбоксы */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-gray-700 bg-gray-900/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 focus:ring-2 cursor-pointer"
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
                className="w-5 h-5 rounded border-gray-700 bg-gray-900/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 focus:ring-2 cursor-pointer"
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
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Создать товар
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-4 bg-gray-700/50 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
            >
              Отмена
            </button>
          </div>
        </form>

        {/* Подсказка */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-sm text-blue-300">
            <strong>💡 Важно:</strong> NS.Gifts ID необходим для автоматической выдачи товара через API. 
            Без него заказы будут требовать ручной обработки.
          </p>
        </div>
      </div>
    </div>
  )
}
