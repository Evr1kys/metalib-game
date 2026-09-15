'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Receipt, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react'

interface TransactionData {
  id: string
  userId: string
  amount: number
  type: string
  status: string
  description: string | null
  createdAt: string
  user: {
    id: string
    email: string
    name: string | null
  }
  order: {
    id: string
    status: string
  } | null
}

export default function TransactionsManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.role !== 'admin') {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, typeFilter, userId])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })
      
      if (typeFilter) params.append('type', typeFilter)
      if (userId) params.append('userId', userId)

      const res = await fetch(`/api/admin/transactions?${params}`)
      const data = await res.json()
      
      if (res.ok) {
        setTransactions(data.transactions)
        setTotalPages(data.pages)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'text-green-400 bg-green-500/10'
      case 'PURCHASE':
        return 'text-red-400 bg-red-500/10'
      case 'REFUND':
        return 'text-blue-400 bg-blue-500/10'
      case 'ADMIN_ADJUSTMENT':
        return 'text-purple-400 bg-purple-500/10'
      default:
        return 'text-gray-400 bg-gray-500/10'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400 bg-green-500/10'
      case 'PENDING':
        return 'text-yellow-400 bg-yellow-500/10'
      case 'FAILED':
        return 'text-red-400 bg-red-500/10'
      default:
        return 'text-gray-400 bg-gray-500/10'
    }
  }

  if (status === 'loading' || session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Транзакции</h1>
          </div>
          <p className="text-gray-400">Полная история всех транзакций пользователей</p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* User ID Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ID пользователя..."
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="">Все типы</option>
              <option value="DEPOSIT">Пополнение</option>
              <option value="PURCHASE">Покупка</option>
              <option value="REFUND">Возврат</option>
              <option value="ADMIN_ADJUSTMENT">Корректировка</option>
            </select>
          </div>

          <button
            onClick={fetchTransactions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors md:col-span-2"
          >
            Обновить
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Дата</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Пользователь</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Тип</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Сумма</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Статус</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Описание</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      Загрузка...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      Транзакции не найдены
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-gray-700 hover:bg-gray-800/30">
                      <td className="px-6 py-4">
                        <code className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded font-mono">
                          {transaction.id.slice(0, 8)}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(transaction.createdAt).toLocaleString('ru-RU')}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">
                            {transaction.user.name || 'Без имени'}
                          </div>
                          <div className="text-sm text-gray-400">{transaction.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1 font-medium ${
                          transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.amount >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          ${Math.abs(transaction.amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                        {transaction.description || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-white hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-white px-4">
              Страница {currentPage} из {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-white hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-white">Всего пополнений</h3>
            </div>
            <div className="text-3xl font-bold text-green-400">
              ${transactions
                .filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED')
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-white">Всего покупок</h3>
            </div>
            <div className="text-3xl font-bold text-red-400">
              ${transactions
                .filter(t => t.type === 'PURCHASE' && t.status === 'COMPLETED')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                .toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-white">Баланс оборота</h3>
            </div>
            <div className="text-3xl font-bold text-blue-400">
              ${transactions
                .filter(t => t.status === 'COMPLETED')
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
