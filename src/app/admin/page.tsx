'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  RefreshCw, 
  Package, 
  DollarSign, 
  Users, 
  ShoppingCart,
  Download,
  FolderTree,
  Settings,
  Receipt,
  MessageSquare,
  Mail,
  Code
} from 'lucide-react'

interface Stats {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  recentOrders: Order[]
  totalProducts: number
}

interface Order {
  id: string
  userId: string
  user: {
    email: string
    name: string | null
  }
  status: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

interface OrderItem {
  id: string
  quantity: number
  price: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [nsBalance, setNsBalance] = useState<{ rub: number; usd: number } | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchData()
      fetchNSBalance()
    }
  }, [session, status, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/stats', {
        cache: 'no-store'
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNSBalance = async () => {
    try {
      setBalanceLoading(true)
      const res = await fetch('/api/admin/nsgifts-balance')
      if (res.ok) {
        const data = await res.json()
        console.log('NS Balance response:', data)
        if (data.balance) {
          setNsBalance(data.balance)
        } else {
          console.error('No balance in response:', data)
          setNsBalance(null)
        }
      } else {
        console.error('Balance fetch failed:', res.status)
        setNsBalance(null)
      }
    } catch (error) {
      console.error('Failed to fetch NS balance:', error)
      setNsBalance(null)
    } finally {
      setBalanceLoading(false)
    }
  }

  const syncNSGifts = async () => {
    if (!confirm('Синхронизировать все игры с NS.Gifts? Это может занять несколько минут.')) {
      return
    }

    try {
      setSyncing(true)
      const res = await fetch('/api/admin/sync-nsgifts', {
        method: 'POST'
      })
      
      if (res.ok) {
        const data = await res.json()
        alert(`Успешно загружено ${data.imported} товаров из ${data.total}`)
        fetchData()
      } else {
        const error = await res.json()
        alert('Ошибка синхронизации: ' + (error.error || 'Неизвестная ошибка'))
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Ошибка синхронизации')
    } finally {
      setSyncing(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Панель управления
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Добро пожаловать, {session?.user?.name || 'Администратор'}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg transition-all"
            title="Обновить данные"
          >
            <RefreshCw className="w-6 h-6 text-blue-600" />
          </button>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-10 h-10 opacity-80" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Всего
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalOrders}</div>
            <div className="text-sm opacity-90">Заказов</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-10 h-10 opacity-80" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Выручка
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalRevenue.toFixed(0)} ₽</div>
            <div className="text-sm opacity-90">Общая сумма</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 opacity-80" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Активно
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
            <div className="text-sm opacity-90">Пользователей</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-10 h-10 opacity-80" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                В каталоге
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalProducts || 0}</div>
            <div className="text-sm opacity-90">Товаров</div>
          </div>
        </div>

        {/* NS.Gifts Balance & Sync */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Баланс NS.Gifts</h3>
                <p className="text-sm text-gray-500">Поставщик игр</p>
              </div>
            </div>
            
            {balanceLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : nsBalance !== null ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {nsBalance.rub.toFixed(2)}
                  </span>
                  <span className="text-xl text-gray-500">₽</span>
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400">
                  ${nsBalance.usd.toFixed(2)} USD
                </div>
                <button
                  onClick={fetchNSBalance}
                  className="w-full mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors text-sm font-medium"
                >
                  Обновить баланс
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Ошибка загрузки</p>
                <button
                  onClick={fetchNSBalance}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Повторить
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Download className={`w-8 h-8 ${syncing ? 'animate-bounce' : ''}`} />
              <div>
                <h3 className="text-xl font-bold">Синхронизация с NS.Gifts</h3>
                <p className="text-sm opacity-90">Импорт товаров из каталога поставщика</p>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <p className="text-sm opacity-90">
                Загрузите актуальный каталог игр с автоматическим обновлением цен и наличия
              </p>
              <button
                onClick={syncNSGifts}
                disabled={syncing}
                className="w-full px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {syncing ? 'Синхронизация...' : 'Запустить синхронизацию'}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/products"
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Товары</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Управление каталогом продуктов, цены и наличие
            </p>
          </Link>

          <Link
            href="/admin/categories"
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <FolderTree className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Категории</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Организация товаров по категориям
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Пользователи</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Управление учетными записями пользователей
            </p>
          </Link>

          <Link
            href="/admin/transactions"
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Транзакции</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              История платежей и финансовые операции
            </p>
          </Link>

          <Link
            href="/admin/tickets"
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Тикеты</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Поддержка и обращения пользователей
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Настройки</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Конфигурация сайта и интеграций
            </p>
          </Link>

          <Link
            href="/admin/newsletter"
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Рассылка</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Email уведомления и реклама
            </p>
          </Link>

          <Link
            href="/admin/steam-settings"
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Steam Пополнение</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Настройки наценки и лимитов
            </p>
          </Link>

          <Link
            href="/admin/api-stats"
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Code className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">API Статистика</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Мониторинг API ключей и запросов
            </p>
          </Link>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Последние заказы</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Актуальные транзакции в магазине
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    ID Заказа
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Заказов пока нет
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {order.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.user?.name || 'Гость'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'PAID'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : order.status === 'PROCESSING'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : order.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {order.totalAmount.toFixed(2)} ₽
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
