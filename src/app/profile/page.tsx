'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { 
  Wallet, 
  Users, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Shield, 
  ShoppingBag, 
  Clock, 
  TrendingUp, 
  Gift,
  User,
  Settings,
  ArrowRight,
  Code,
  ChevronRight,
  CreditCard,
  Package
} from 'lucide-react'

interface Order {
  id: string
  totalAmount: number
  status: string
  createdAt: string
  items: Array<{
    product: { name: string }
    quantity: number
    price: number
  }>
}

interface ReferralData {
  referralCode: string
  totalReferrals: number
  totalEarnings: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    pendingOrders: 0
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      loadData()
    }
  }, [status, router])

  const loadData = async () => {
    try {
      const [ordersRes, referralsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/referrals')
      ])

      const ordersData = await ordersRes.json()
      const referralsData = await referralsRes.json()

      if (ordersData.success) {
        const allOrders = ordersData.data
        setOrders(allOrders.slice(0, 5))
        
        const completed = allOrders.filter((o: Order) => o.status === 'COMPLETED')
        const pending = allOrders.filter((o: Order) => o.status === 'PENDING' || o.status === 'PROCESSING')
        const totalSpent = completed.reduce((sum: number, o: Order) => sum + parseFloat(o.totalAmount.toString()), 0)

        setStats({
          totalOrders: allOrders.length,
          completedOrders: completed.length,
          totalSpent,
          pendingOrders: pending.length
        })
      }

      if (referralsData.success) {
        setReferralData(referralsData.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      PROCESSING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    
    const icons = {
      COMPLETED: <CheckCircle className="w-3 h-3" />,
      PENDING: <Clock className="w-3 h-3" />,
      PROCESSING: <TrendingUp className="w-3 h-3" />,
      CANCELLED: <XCircle className="w-3 h-3" />
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${styles[status as keyof typeof styles] || styles.PENDING}`}>
        {icons[status as keyof typeof icons]}
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Заголовок профиля */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{session?.user?.name || 'Пользователь'}</h1>
              <p className="text-gray-300">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Баланс */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-8 h-8 text-green-400" />
              <Link href="/balance" className="text-green-400 hover:text-green-300 text-sm">
                Пополнить →
              </Link>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{formatPrice(session?.user?.balance || 0)}</div>
            <div className="text-gray-300 text-sm">Баланс</div>
          </div>

          {/* Всего заказов */}
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.totalOrders}</div>
            <div className="text-gray-300 text-sm">Всего заказов</div>
          </div>

          {/* Выполнено */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.completedOrders}</div>
            <div className="text-gray-300 text-sm">Выполнено</div>
          </div>

          {/* Потрачено */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{formatPrice(stats.totalSpent)}</div>
            <div className="text-gray-300 text-sm">Потрачено</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка - Быстрые действия */}
          <div className="lg:col-span-1 space-y-6">
            {/* Быстрые действия */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">Быстрые действия</h2>
              <div className="space-y-3">
                <Link
                  href="/profile/api-keys"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl hover:from-blue-500/30 hover:to-purple-500/30 transition-all border border-blue-500/30 group"
                >
                  <div className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">API Ключи</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/profile/security"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl hover:from-green-500/30 hover:to-emerald-500/30 transition-all border border-green-500/30 group"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Безопасность</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/referrals"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xl hover:from-orange-500/30 hover:to-yellow-500/30 transition-all border border-orange-500/30 group"
                >
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-orange-400" />
                    <span className="text-white font-medium">Реферальная система</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  href="/balance"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl hover:from-pink-500/30 hover:to-rose-500/30 transition-all border border-pink-500/30 group"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-pink-400" />
                    <span className="text-white font-medium">Пополнить баланс</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </Link>
              </div>
            </div>

            {/* Реферальная статистика */}
            {referralData && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">Реферальная программа</h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Приглашено</div>
                    <div className="text-2xl font-bold text-white">{referralData.totalReferrals}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Заработано</div>
                    <div className="text-2xl font-bold text-green-400">{formatPrice(referralData.totalEarnings)}</div>
                  </div>
                  <Link
                    href="/referrals"
                    className="block w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all text-center"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка - Последние заказы */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Последние заказы</h2>
                <Link href="/orders" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                  Все заказы <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">У вас пока нет заказов</p>
                  <Link
                    href="/products"
                    className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
                  >
                    Перейти в каталог
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-white font-semibold mb-1">
                            Заказ #{order.id.slice(0, 8)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="space-y-2 mb-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-300">
                            {item.product.name} × {item.quantity}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="text-lg font-bold text-white">
                          {formatPrice(order.totalAmount)}
                        </div>
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                        >
                          Подробнее <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
