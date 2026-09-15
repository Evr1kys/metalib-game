'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Wallet, ArrowLeft, AlertCircle, CheckCircle, Loader2, Zap, Shield, User } from 'lucide-react'

interface SteamSettings {
  steam_markup_percent: { value: string }
  steam_min_amount: { value: string }
  steam_max_amount: { value: string }
}

export default function SteamTopupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [steamLogin, setSteamLogin] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState<SteamSettings | null>(null)

  useEffect(() => {
    // Загружаем настройки Steam
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/steam-settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
    fetchSettings()
  }, [])

  const markupPercent = parseFloat(settings?.steam_markup_percent?.value || '10')
  const minAmount = parseFloat(settings?.steam_min_amount?.value || '100')
  const maxAmount = parseFloat(settings?.steam_max_amount?.value || '50000')

  // Расчет итоговой суммы с наценкой (для отображения)
  const displayAmount = parseFloat(amount) || 0
  const displayMarkup = displayAmount * (markupPercent / 100)
  const displayTotal = displayAmount + displayMarkup

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!steamLogin.trim()) {
      setError('Введите ваш Steam логин')
      return
    }

    const numAmount = parseFloat(amount)

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Введите корректную сумму')
      return
    }

    if (numAmount < minAmount) {
      setError(`Минимальная сумма пополнения: ${minAmount}₽`)
      return
    }

    if (numAmount > maxAmount) {
      setError(`Максимальная сумма пополнения: ${maxAmount}₽`)
      return
    }

    // Рассчитываем итоговую сумму с наценкой
    const finalAmount = numAmount * (1 + markupPercent / 100)

    try {
      setLoading(true)
      setError('')

      // Проверяем баланс
      const balanceRes = await fetch('/api/balance')
      const balanceData = await balanceRes.json()

      if (!balanceRes.ok) {
        throw new Error('Ошибка при проверке баланса')
      }

      if (balanceData.balance < finalAmount) {
        setError(`Недостаточно средств. Нужно ${finalAmount.toFixed(2)}₽ (включая наценку ${markupPercent}%)`)
        setLoading(false)
        return
      }

      // Отправляем запрос на пополнение Steam
      const res = await fetch('/api/orders/steam-topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          steamLogin: steamLogin.trim(),
          amount: numAmount 
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при пополнении Steam')
      }

      setSuccess(true)
      setSteamLogin('')
      setAmount('')
      
      setTimeout(() => {
        router.push('/profile')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <Link
          href="/balance"
          className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-8 transition group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
          <span className="font-medium">Назад к балансу</span>
        </Link>

        {/* Main Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 overflow-hidden shadow-2xl">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white mb-1">Пополнение Steam Wallet</h1>
                <p className="text-blue-100">Заявка на пополнение Steam (обработка до 24 часов)</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 rounded-xl border border-blue-500/20">
                <Zap className="w-8 h-8 text-blue-400 mb-2" />
                <h3 className="font-bold text-white mb-1">Быстро</h3>
                <p className="text-sm text-gray-400">Обработка до 24 часов</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-4 rounded-xl border border-purple-500/20">
                <Shield className="w-8 h-8 text-purple-400 mb-2" />
                <h3 className="font-bold text-white mb-1">Безопасно</h3>
                <p className="text-sm text-gray-400">Защищенная транзакция</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 p-4 rounded-xl border border-pink-500/20">
                <User className="w-8 h-8 text-pink-400 mb-2" />
                <h3 className="font-bold text-white mb-1">Удобно</h3>
                <p className="text-sm text-gray-400">Пополнение по логину</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Steam Login */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Steam логин / имя пользователя <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={steamLogin}
                    onChange={(e) => setSteamLogin(e.target.value)}
                    placeholder="Введите ваш Steam логин"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition text-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Введите ваш логин Steam аккаунта, на который нужно пополнить баланс
                </p>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Сумма пополнения ({minAmount} - {maxAmount.toLocaleString()} ₽) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Введите сумму"
                    min={minAmount}
                    max={maxAmount}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition text-lg font-semibold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₽</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Минимум: {minAmount}₽ • Максимум: {maxAmount.toLocaleString()}₽
                </p>
              </div>

              {/* Price Calculation */}
              {displayAmount > 0 && (
                <div className="p-5 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl border border-green-500/30">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Расчет стоимости:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Сумма пополнения:</span>
                      <span className="text-white font-semibold">{displayAmount.toFixed(2)} ₽</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Наценка ({markupPercent}%):</span>
                      <span className="text-orange-400 font-semibold">+{displayMarkup.toFixed(2)} ₽</span>
                    </div>
                    <div className="h-px bg-gray-600 my-2"></div>
                    <div className="flex justify-between text-base">
                      <span className="text-gray-300 font-semibold">Итого к оплате:</span>
                      <span className="text-green-400 font-bold text-lg">{displayTotal.toFixed(2)} ₽</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 font-medium">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-green-400 font-medium">
                    ✅ Пополнение выполнено! Перенаправление...
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !amount || !steamLogin || success}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Пополнить Steam Wallet
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                Как это работает?
              </h3>
              <ol className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>Введите ваш Steam логин и сумму пополнения</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>Средства спишутся с вашего баланса MetaLib Shop</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>Деньги поступят на ваш Steam Wallet в течение 5 минут</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
