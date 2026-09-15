'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Settings, DollarSign, Percent, TrendingUp, Save, RefreshCw } from 'lucide-react'

interface SettingData {
  id: string
  key: string
  value: string
  description?: string
  category: string
  updatedAt: string
}

interface GroupedSettings {
  [category: string]: SettingData[]
}

interface CurrencyRate {
  currency: string
  rate: number
  lastUpdated: string
}

export default function SettingsManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<GroupedSettings>({})
  const [currencies, setCurrencies] = useState<CurrencyRate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchSettings()
      fetchCurrencies()
    }
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings-manage')
      const data = await res.json()
      
      if (res.ok) {
        setSettings(data.settings)
        
        // Initialize edit values
        const values: { [key: string]: string } = {}
        Object.values(data.settings).flat().forEach((setting: any) => {
          values[setting.key] = setting.value
        })
        setEditValues(values)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrencies = async () => {
    try {
      const res = await fetch('/api/admin/sync-nsgifts')
      const data = await res.json()
      
      if (res.ok && data.currencies) {
        setCurrencies(data.currencies)
      }
    } catch (error) {
      console.error('Error fetching currencies:', error)
    }
  }

  const handleSaveSetting = async (key: string) => {
    setSaving(true)
    try {
      const setting = Object.values(settings)
        .flat()
        .find((s) => s.key === key)

      const res = await fetch('/api/admin/settings-manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: editValues[key],
          description: setting?.description,
          category: setting?.category || 'general',
        }),
      })

      if (res.ok) {
        fetchSettings()
      }
    } catch (error) {
      console.error('Error saving setting:', error)
    } finally {
      setSaving(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'currency':
        return <DollarSign className="w-5 h-5" />
      case 'payment':
        return <TrendingUp className="w-5 h-5" />
      case 'shop':
        return <Percent className="w-5 h-5" />
      default:
        return <Settings className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'currency':
        return 'text-green-400'
      case 'payment':
        return 'text-blue-400'
      case 'shop':
        return 'text-purple-400'
      default:
        return 'text-gray-400'
    }
  }

  if (status === 'loading' || session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Настройки системы</h1>
          </div>
          <p className="text-gray-400">Управление наценками, курсами валют и параметрами магазина</p>
        </div>

        {/* Currency Rates */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-500" />
              Курсы валют NS Gifts
            </h2>
            <button
              onClick={fetchCurrencies}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Обновить
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currencies.map((currency) => (
              <div
                key={currency.currency}
                className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4"
              >
                <div className="text-gray-400 text-sm mb-1">{currency.currency}</div>
                <div className="text-2xl font-bold text-white mb-2">
                  ${currency.rate.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(currency.lastUpdated).toLocaleString('ru-RU')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings by Category */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Загрузка...</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(settings).map(([category, categorySettings]) => (
              <div key={category}>
                <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${getCategoryColor(category)}`}>
                  {getCategoryIcon(category)}
                  {category === 'general' && 'Общие настройки'}
                  {category === 'payment' && 'Платежи'}
                  {category === 'shop' && 'Магазин'}
                  {category === 'currency' && 'Валюты'}
                </h2>

                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl divide-y divide-gray-700">
                  {categorySettings.map((setting) => (
                    <div key={setting.id} className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-white mb-1">
                            {setting.key}
                          </label>
                          {setting.description && (
                            <p className="text-sm text-gray-400 mb-3">{setting.description}</p>
                          )}
                          <input
                            type="text"
                            value={editValues[setting.key] || ''}
                            onChange={(e) =>
                              setEditValues({ ...editValues, [setting.key]: e.target.value })
                            }
                            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <button
                          onClick={() => handleSaveSetting(setting.key)}
                          disabled={saving || editValues[setting.key] === setting.value}
                          className="mt-7 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Сохранить
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Обновлено: {new Date(setting.updatedAt).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Setting */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Добавить новую настройку</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              
              try {
                const res = await fetch('/api/admin/settings-manage', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    key: formData.get('key'),
                    value: formData.get('value'),
                    description: formData.get('description'),
                    category: formData.get('category'),
                  }),
                })

                if (res.ok) {
                  fetchSettings()
                  e.currentTarget.reset()
                }
              } catch (error) {
                console.error('Error adding setting:', error)
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              name="key"
              type="text"
              placeholder="Ключ (например: shop_markup)"
              required
              className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <input
              name="value"
              type="text"
              placeholder="Значение"
              required
              className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <input
              name="description"
              type="text"
              placeholder="Описание (опционально)"
              className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <select
              name="category"
              defaultValue="general"
              className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="general">Общие</option>
              <option value="payment">Платежи</option>
              <option value="shop">Магазин</option>
              <option value="currency">Валюты</option>
            </select>
            <button
              type="submit"
              className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Добавить настройку
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
