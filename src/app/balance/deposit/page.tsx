'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Wallet, AlertCircle } from 'lucide-react'

const amounts = [100, 500, 1000, 2000, 5000, 10000]

export default function DepositPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  const handleDeposit = async () => {
    // Проверяем подтверждение email
    if (!session?.user?.emailVerified) {
      alert('Подтвердите ваш email перед пополнением баланса. Проверьте вашу почту.')
      return
    }

    const amount = selectedAmount || parseFloat(customAmount)

    if (!amount || amount < 10) {
      alert('Минимальная сумма пополнения: 10 ₽')
      return
    }

    if (amount > 100000) {
      alert('Максимальная сумма пополнения: 100 000 ₽')
      return
    }

    setLoading(true)

    try {
      // Создаем заказ для пополнения баланса
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [],
          deliveryEmail: session?.user?.email,
          isBalanceDeposit: true,
          depositAmount: amount,
        }),
      })

      if (!orderRes.ok) {
        const error = await orderRes.json()
        throw new Error(error.error || 'Ошибка создания заказа')
      }

      const { order } = await orderRes.json()
      console.log('Created order:', order)
      console.log('Order ID:', order.id)

      // Создаем платеж
      const paymentRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })

      if (!paymentRes.ok) {
        const error = await paymentRes.json()
        throw new Error(error.error || 'Ошибка создания платежа')
      }

      const { paymentUrl } = await paymentRes.json()

      // Редирект на страницу оплаты
      window.location.href = paymentUrl
    } catch (error: any) {
      console.error('Deposit error:', error)
      alert(error.message || 'Произошла ошибка при создании платежа')
    } finally {
      setLoading(false)
    }
  }

  const amount = selectedAmount || parseFloat(customAmount) || 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          href="/balance"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к балансу
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Wallet className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Пополнить баланс
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Выберите сумму пополнения
              </p>
            </div>
          </div>

          {/* Email Verification Warning */}
          {!session?.user?.emailVerified && (
            <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                    Требуется подтверждение email
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Для пополнения баланса необходимо подтвердить ваш email адрес.
                    Проверьте почту {session?.user?.email} и перейдите по ссылке из письма.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Предустановленные суммы */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Быстрый выбор
            </label>
            <div className="grid grid-cols-3 gap-3">
              {amounts.map((value) => (
                <button
                  key={value}
                  onClick={() => {
                    setSelectedAmount(value)
                    setCustomAmount('')
                  }}
                  className={`py-3 px-4 rounded-lg border-2 transition font-semibold ${
                    selectedAmount === value
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {value} ₽
                </button>
              ))}
            </div>
          </div>

          {/* Своя сумма */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Или введите свою сумму
            </label>
            <div className="relative">
              <input
                type="number"
                min="10"
                max="100000"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(null)
                }}
                placeholder="Минимум 10 ₽"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                ₽
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Минимум: 10 ₽ • Максимум: 100 000 ₽
            </p>
          </div>

          {/* Информация о платеже */}
          {amount > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Сумма пополнения:</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {amount.toFixed(2)} ₽
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Комиссия:</span>
                <span className="text-gray-900 dark:text-white">0 ₽</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 mt-3 pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">К оплате:</span>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {amount.toFixed(2)} ₽
                </span>
              </div>
            </div>
          )}

          {/* Способы оплаты */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Способы оплаты:</p>
            <div className="flex gap-3">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                💳 Банковская карта
              </div>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                🏦 СБП
              </div>
            </div>
          </div>

          {/* Кнопка оплаты */}
          <button
            onClick={handleDeposit}
            disabled={loading || amount < 10 || !session?.user?.emailVerified}
            className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Создание платежа...
              </>
            ) : !session?.user?.emailVerified ? (
              <>
                <AlertCircle className="w-5 h-5" />
                Подтвердите email для пополнения
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Пополнить на {amount.toFixed(2)} ₽
              </>
            )}
          </button>

          {/* Безопасность */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              🔒 <strong>Безопасная оплата</strong> через платежный шлюз Platega.io
              <br />
              Ваши платежные данные защищены и не передаются третьим лицам.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
