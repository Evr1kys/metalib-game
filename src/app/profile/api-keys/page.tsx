'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ApiKey {
  id: string
  name: string
  keyPreview: string
  permissions: string[]
  isActive: boolean
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
  stats?: {
    totalRequests: number
    avgResponseTime: number
    successCount: number
    errorCount: number
  }
}

export default function ApiKeysPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['products:read'])
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      loadApiKeys()
    }
  }, [status, router])

  const loadApiKeys = async () => {
    try {
      const res = await fetch('/api/api-keys')
      const data = await res.json()
      if (data.success) {
        setApiKeys(data.data)
      }
    } catch (err) {
      console.error('Error loading API keys:', err)
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      setError('Введите название ключа')
      return
    }

    if (selectedPermissions.length === 0) {
      setError('Выберите хотя бы одно разрешение')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          permissions: selectedPermissions,
          expiresInDays
        })
      })

      const data = await res.json()
      
      if (data.success) {
        setCreatedKey(data.data.key)
        setNewKeyName('')
        setSelectedPermissions(['products:read'])
        setExpiresInDays(null)
        await loadApiKeys()
      } else {
        setError(data.error || 'Ошибка создания ключа')
      }
    } catch (err) {
      setError('Ошибка создания ключа')
    } finally {
      setLoading(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Удалить этот API ключ? Это действие нельзя отменить.')) {
      return
    }

    try {
      const res = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      
      if (data.success) {
        await loadApiKeys()
      } else {
        alert(data.error || 'Ошибка удаления ключа')
      }
    } catch (err) {
      alert('Ошибка удаления ключа')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Скопировано в буфер обмена')
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
  }

  const availablePermissions = [
    { value: '*', label: 'Все права (полный доступ)', color: 'red' },
    { value: 'products:read', label: 'Чтение каталога товаров', color: 'blue' },
    { value: 'products:*', label: 'Все операции с товарами', color: 'purple' },
    { value: 'orders:create', label: 'Создание заказов', color: 'green' },
    { value: 'orders:read', label: 'Чтение заказов', color: 'blue' },
    { value: 'orders:*', label: 'Все операции с заказами', color: 'purple' }
  ]

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-white text-center">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">API Ключи</h1>
          <p className="text-gray-300">
            Управление API ключами для интеграции и ресейла товаров
          </p>
        </div>

        {/* Кнопка создания */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
          >
            + Создать новый API ключ
          </button>
        </div>

        {/* Список ключей */}
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center">
              <p className="text-gray-300">У вас пока нет API ключей</p>
            </div>
          ) : (
            apiKeys.map(key => (
              <div key={key.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{key.name}</h3>
                    <p className="text-gray-400 text-sm font-mono">{key.keyPreview}</p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        key.isActive
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {key.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                    <button
                      onClick={() => deleteApiKey(key.id)}
                      className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm hover:bg-red-500/30"
                    >
                      Удалить
                    </button>
                  </div>
                </div>

                {/* Разрешения */}
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">Разрешения:</p>
                  <div className="flex flex-wrap gap-2">
                    {key.permissions.map(perm => (
                      <span
                        key={perm}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Статистика */}
                {key.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Всего запросов</p>
                      <p className="text-white text-lg font-bold">{key.stats.totalRequests}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Успешных</p>
                      <p className="text-green-400 text-lg font-bold">{key.stats.successCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Ошибок</p>
                      <p className="text-red-400 text-lg font-bold">{key.stats.errorCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Средний ответ</p>
                      <p className="text-white text-lg font-bold">{key.stats.avgResponseTime}ms</p>
                    </div>
                  </div>
                )}

                {/* Даты */}
                <div className="text-sm text-gray-400">
                  <p>Создан: {new Date(key.createdAt).toLocaleString('ru-RU')}</p>
                  {key.lastUsedAt && (
                    <p>Последнее использование: {new Date(key.lastUsedAt).toLocaleString('ru-RU')}</p>
                  )}
                  {key.expiresAt && (
                    <p>Истекает: {new Date(key.expiresAt).toLocaleString('ru-RU')}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Модалка создания ключа */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Создать API ключ</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
                  {error}
                </div>
              )}

              {createdKey ? (
                <div className="mb-4">
                  <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-4">
                    <p className="text-green-300 mb-2">Ключ успешно создан! Скопируйте его сейчас, вы не сможете увидеть его снова:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={createdKey}
                        readOnly
                        className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(createdKey)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Копировать
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCreatedKey(null)
                      setShowCreateModal(false)
                    }}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Закрыть
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-white mb-2">Название ключа</label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Например: Мой магазин на Telegram"
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-white mb-2">Разрешения</label>
                    <div className="space-y-2">
                      {availablePermissions.map(perm => (
                        <label key={perm.value} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.value)}
                            onChange={() => togglePermission(perm.value)}
                            className="w-5 h-5"
                          />
                          <span className="text-white">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-white mb-2">Срок действия (дней)</label>
                    <input
                      type="number"
                      value={expiresInDays || ''}
                      onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Оставьте пустым для бессрочного"
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                      min="1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={createApiKey}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Создание...' : 'Создать'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateModal(false)
                        setError('')
                      }}
                      className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Отмена
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
