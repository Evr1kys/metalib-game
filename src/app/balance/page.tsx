'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Wallet, Plus, RefreshCw, Mail, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

type Transaction = {
  id: string
  amount: number
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PURCHASE' | 'REFUND' | 'REFERRAL_BONUS'
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  description: string | null
  createdAt: string
}

const typeLabels = {
  DEPOSIT: 'Пополнение',
  WITHDRAWAL: 'Вывод',
  PURCHASE: 'Покупка',
  REFUND: 'Возврат',
  REFERRAL_BONUS: 'Реферальный бонус',
}

const typeColors = {
  DEPOSIT: 'text-green-600',
  WITHDRAWAL: 'text-red-600',
  PURCHASE: 'text-blue-600',
  REFUND: 'text-green-600',
  REFERRAL_BONUS: 'text-purple-600',
}

const statusLabels = {
  PENDING: 'В обработке',
  COMPLETED: 'Завершено',
  FAILED: 'Отклонено',
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
}

export default function BalancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTransactions()
    }
  }, [status])

  const fetchTransactions = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/balance', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions)
        setBalance(data.balance)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const resendVerification = async () => {
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success('Письмо отправлено! Проверьте вашу почту.')
      } else {
        toast.error(data.error || 'Ошибка отправки письма')
      }
    } catch (error) {
      toast.error('Ошибка отправки письма')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  // Проверка подтверждения email
  const isEmailVerified = session?.user?.emailVerified
  
  if (!isEmailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-yellow-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Подтвердите Email</h1>
              <p className="text-gray-400 mb-6">
                Для пополнения баланса необходимо подтвердить вашу электронную почту
              </p>
              
              <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700">
                <div className="flex items-start gap-3 text-left">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-2">Проверьте почту:</p>
                    <p className="text-white font-medium">{session?.user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={resendVerification}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Отправить письмо повторно
                </button>
                <Link
                  href="/profile"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition text-center"
                >
                  Вернуться в профиль
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
          Баланс
        </h1>
        <button
          onClick={fetchTransactions}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-100 mb-2">Доступный баланс</p>
            <p className="text-4xl font-bold">{balance.toFixed(2)} ₽</p>
          </div>
          <Link
            href="/balance/deposit"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Пополнить
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">История транзакций</h2>
        </div>
        
        <div className="divide-y">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              У вас пока нет транзакций
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-semibold ${typeColors[transaction.type]}`}>
                        {typeLabels[transaction.type]}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[transaction.status]}`}>
                        {statusLabels[transaction.status]}
                      </span>
                    </div>
                    {transaction.description && (
                      <p className="text-gray-600 text-sm mb-1">{transaction.description}</p>
                    )}
                    <p className="text-gray-500 text-sm">
                      {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'Неизвестно'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} ₽
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
