'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Mail, Send, Users, AlertCircle, CheckCircle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewsletterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    target: 'ALL' as 'ALL' | 'WITH_ORDERS' | 'ACTIVE',
    isAdvertising: false
  })
  const [stats, setStats] = useState<{
    total: number
    withOrders: number
    active: number
  } | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchStats()
    }
  }, [status, session])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/newsletter/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject || !formData.message) {
      toast.error('Заполните все поля')
      return
    }

    if (!confirm(`Отправить рассылку ${getTargetCount()} пользователям?`)) {
      return
    }

    try {
      setSending(true)
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`Рассылка отправлена ${data.sent} пользователям`)
        setFormData({
          subject: '',
          message: '',
          target: 'ALL',
          isAdvertising: false
        })
      } else {
        const error = await res.json()
        toast.error(error.error || 'Ошибка отправки')
      }
    } catch (error) {
      console.error('Send error:', error)
      toast.error('Ошибка отправки рассылки')
    } finally {
      setSending(false)
    }
  }

  const getTargetCount = () => {
    if (!stats) return '?'
    switch (formData.target) {
      case 'ALL': return stats.total
      case 'WITH_ORDERS': return stats.withOrders
      case 'ACTIVE': return stats.active
      default: return '?'
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    router.push('/')
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Email рассылка
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Отправка уведомлений и рекламных материалов пользователям
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-xl">
          <Users className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{stats?.total || 0}</div>
          <div className="text-sm opacity-90">Всего пользователей</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-xl">
          <Mail className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{stats?.withOrders || 0}</div>
          <div className="text-sm opacity-90">С покупками</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-xl">
          <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{stats?.active || 0}</div>
          <div className="text-sm opacity-90">Активных (7 дней)</div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="space-y-6">
          {/* Target Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              Кому отправить
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'ALL', label: 'Все пользователи', count: stats?.total },
                { value: 'WITH_ORDERS', label: 'С покупками', count: stats?.withOrders },
                { value: 'ACTIVE', label: 'Активные', count: stats?.active }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, target: option.value as any })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.target === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 dark:text-white">{option.label}</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {option.count || 0}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Email Type */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAdvertising}
                onChange={(e) => setFormData({ ...formData, isAdvertising: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Это рекламная рассылка
              </span>
            </label>
            {formData.isAdvertising && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Рекламные письма должны содержать возможность отписки
                </p>
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              Тема письма
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Введите тему письма"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              Текст сообщения
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors h-48 resize-none font-mono text-sm"
              placeholder="Введите текст сообщения&#10;&#10;Вы можете использовать HTML теги:&#10;<p>Параграф</p>&#10;<strong>Жирный текст</strong>&#10;<a href='url'>Ссылка</a>&#10;&#10;Переменные:&#10;{{name}} - имя пользователя&#10;{{email}} - email пользователя"
              required
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Поддерживается HTML. Переменные: <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{'{{name}}'}</code>, <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{'{{email}}'}</code>
              </p>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Скрыть' : 'Предпросмотр'}
              </button>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Предпросмотр шаблона</span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-950 max-h-96 overflow-y-auto">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl mx-auto">
                  {/* Email Preview */}
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center text-white">
                    <div className="text-2xl font-bold mb-1">💎 MetaLib Shop</div>
                    <div className="text-sm opacity-90">Ваш надежный магазин цифровых товаров</div>
                  </div>
                  <div className="p-6">
                    <div className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Здравствуйте, Пользователь!
                    </div>
                    <div 
                      className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ 
                        __html: formData.message
                          .replace(/{{name}}/g, '<span class="font-semibold text-blue-600">Пользователь</span>')
                          .replace(/{{email}}/g, '<span class="font-semibold text-blue-600">user@example.com</span>')
                          .replace(/\n/g, '<br>')
                      }}
                    />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                    <strong>MetaLib Shop</strong> • Цифровые товары и услуги
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={sending}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {sending ? 'Отправка...' : `Отправить ${getTargetCount()} пользователям`}
          </button>
        </div>
      </form>
    </div>
  )
}
