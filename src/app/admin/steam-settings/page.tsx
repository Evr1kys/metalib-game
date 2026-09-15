'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DollarSign, Settings, TrendingUp, Save, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SteamSettings {
  steam_markup_percent: { value: string; description: string }
  steam_min_amount: { value: string; description: string }
  steam_max_amount: { value: string; description: string }
}

interface CurrencyRates {
  USD?: number
  EUR?: number
  RUB?: number
  [key: string]: number | undefined
}

export default function SteamSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshingRates, setRefreshingRates] = useState(false)
  const [settings, setSettings] = useState<SteamSettings>({
    steam_markup_percent: { value: '10', description: 'Процент наценки на пополнение Steam' },
    steam_min_amount: { value: '100', description: 'Минимальная сумма пополнения Steam (RUB)' },
    steam_max_amount: { value: '50000', description: 'Максимальная сумма пополнения Steam (RUB)' }
  })
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(null)

  // Формируемые значения
  const [markupPercent, setMarkupPercent] = useState('10')
  const [minAmount, setMinAmount] = useState('100')
  const [maxAmount, setMaxAmount] = useState('50000')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchSettings()
      fetchCurrencyRates()
    }
  }, [status, session, router])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/steam-settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        setMarkupPercent(data.steam_markup_percent?.value || '10')
        setMinAmount(data.steam_min_amount?.value || '100')
        setMaxAmount(data.steam_max_amount?.value || '50000')
      }
    } catch (error) {
      console.error('Fetch settings error:', error)
      toast.error('Ошибка загрузки настроек')
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrencyRates = async () => {
    try {
      setRefreshingRates(true)
      const res = await fetch('/api/admin/currency-rates')
      if (res.ok) {
        const data = await res.json()
        console.log('Currency rates data:', data)
        setCurrencyRates(data)
        toast.success('Курсы валют обновлены')
      } else {
        const errorData = await res.json()
        console.error('Currency rates error:', errorData)
        toast.error(errorData.error || 'Не удалось загрузить курсы валют')
      }
    } catch (error: any) {
      console.error('Fetch currency rates error:', error)
      toast.error(error.message || 'Ошибка загрузки курсов')
    } finally {
      setRefreshingRates(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Сохраняем каждую настройку
      const updates = [
        {
          key: 'steam_markup_percent',
          value: markupPercent,
          description: 'Процент наценки на пополнение Steam'
        },
        {
          key: 'steam_min_amount',
          value: minAmount,
          description: 'Минимальная сумма пополнения Steam (RUB)'
        },
        {
          key: 'steam_max_amount',
          value: maxAmount,
          description: 'Максимальная сумма пополнения Steam (RUB)'
        }
      ]

      for (const update of updates) {
        const res = await fetch('/api/admin/steam-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
        })

        if (!res.ok) {
          throw new Error('Failed to save setting')
        }
      }

      toast.success('Настройки сохранены')
      fetchSettings()
    } catch (error) {
      console.error('Save settings error:', error)
      toast.error('Ошибка сохранения настроек')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  // Расчет примера
  const exampleAmount = 1000 // RUB
  const markup = parseFloat(markupPercent) || 0
  const finalAmount = exampleAmount * (1 + markup / 100)
  const commission = finalAmount - exampleAmount

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
            Настройки Steam Пополнения
          </h1>
          <p className="text-gray-400 text-lg">
            Управление наценкой и лимитами пополнения Steam Wallet
          </p>
        </div>

        {/* Currency Rates Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Текущие Курсы Валют</h2>
            </div>
            <button
              onClick={fetchCurrencyRates}
              disabled={refreshingRates}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshingRates ? 'animate-spin' : ''}`} />
              {refreshingRates ? 'Обновление...' : 'Обновить'}
            </button>
          </div>

          {currencyRates ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(currencyRates).map(([currency, rate]) => (
                <div
                  key={currency}
                  className="bg-gray-700/50 rounded-xl p-4 border border-gray-600"
                >
                  <div className="text-sm text-gray-400 mb-1">{currency}</div>
                  <div className="text-2xl font-bold text-white">
                    {typeof rate === 'number' ? rate.toFixed(2) : 'N/A'} ₽
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Нажмите &quot;Обновить&quot; для загрузки курсов валют
            </div>
          )}
        </div>

        {/* Settings Form */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-7 h-7 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Параметры Пополнения</h2>
          </div>

          <div className="space-y-6">
            {/* Markup Percent */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Процент наценки (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="10"
              />
              <p className="mt-2 text-sm text-gray-400">
                Процент наценки на пополнение Steam. Например, при 10% пользователь заплатит 1100₽ за пополнение на 1000₽
              </p>
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Минимальная сумма (₽)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="100"
              />
              <p className="mt-2 text-sm text-gray-400">
                Минимальная сумма для пополнения Steam Wallet в рублях
              </p>
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Максимальная сумма (₽)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="50000"
              />
              <p className="mt-2 text-sm text-gray-400">
                Максимальная сумма для пополнения Steam Wallet в рублях
              </p>
            </div>
          </div>

          {/* Example Calculation */}
          <div className="mt-8 p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Пример расчета
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-400 mb-1">Сумма пополнения</div>
                <div className="text-2xl font-bold text-white">{exampleAmount} ₽</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Наценка ({markup}%)</div>
                <div className="text-2xl font-bold text-orange-400">+{commission.toFixed(2)} ₽</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Итого к оплате</div>
                <div className="text-2xl font-bold text-green-400">{finalAmount.toFixed(2)} ₽</div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Сохранить настройки
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
