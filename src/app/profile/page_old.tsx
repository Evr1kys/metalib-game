'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { 
  Wallet, 
  Users, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Shield, 
  ShoppingBag, 
  Clock, 
  Package, 
  TrendingUp, 
  Gift,
  ExternalLink,
  User,
  Settings,
  ArrowRight,
  AlertCircle
} from 'lucide-react'

interface Order {
  id: string
  totalAmount: number
  status: string
  createdAt: string
  deliveryData?: string | null
  items: Array<{
    product: {
      name: string
    }
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchOrders()
      fetchReferralData()
    }
  }, [status, router])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReferralData = async () => {
    try {
      const res = await fetch('/api/referrals')
      if (res.ok) {
        const data = await res.json()
        setReferralData({
          referralCode: data.referralCode || '',
          totalReferrals: data.totalReferrals || 0,
          totalEarnings: data.totalEarnings || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching referral data:', error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
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
                Для доступа к профилю и совершения покупок необходимо подтвердить вашу электронную почту
              </p>
              
              <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700">
                <div className="flex items-start gap-3 text-left">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-2">Что делать:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-400">
                      <li>Проверьте почту <span className="text-white font-medium">{session?.user?.email}</span></li>
                      <li>Откройте письмо от MetaLib Game</li>
                      <li>Нажмите на ссылку подтверждения</li>
                      <li>Вернитесь на сайт и обновите страницу</li>
                    </ol>
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
                <button
                  onClick={() => router.refresh()}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                >
                  Обновить страницу
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Не получили письмо? Проверьте папку &quot;Спам&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      PROCESSING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
    }
    return styles[status as keyof typeof styles] || styles.PENDING
  }

  const getStatusText = (status: string) => {
    const texts = {
      COMPLETED: 'Выполнен',
      PENDING: 'Ожидание',
      PROCESSING: 'В обработке',
      CANCELLED: 'Отменен',
    }
    return texts[status as keyof typeof texts] || status
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-2xl animate-float">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Личный кабинет</h1>
              <p className="text-gray-400">Добро пожаловать, {session?.user.name || 'Пользователь'}!</p>
            </div>
          </div>
          <Link
            href="/profile/security"
            className="flex items-center gap-2 px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:border-white/30 transition-all"
          >
            <Settings className="w-5 h-5" />
            Настройки
          </Link>
        </div>

        {/* Email Verification Warning */}
        {!session?.user?.emailVerified && (
          <div className="mb-6 bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-500/20 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">
                  Подтвердите ваш email
                </h3>
                <p className="text-gray-300 mb-4">
                  Вы не сможете пополнять баланс и совершать покупки до подтверждения email адреса.
                  Проверьте вашу почту <span className="font-bold text-white">{session?.user?.email}</span> и перейдите по ссылке из письма.
                </p>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/auth/resend-verification', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      })
                      if (res.ok) {
                        toast.success('Письмо отправлено! Проверьте почту.')
                      } else {
                        toast.error('Ошибка отправки письма')
                      }
                    } catch (error) {
                      toast.error('Произошла ошибка')
                    }
                  }}
                  className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 font-bold rounded-lg transition-all"
                >
                  Отправить письмо повторно
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-black text-white">Профиль</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Имя</p>
                  <p className="font-bold text-white">{session?.user.name || 'Не указано'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    Email
                  </p>
                  <p className="font-bold text-white flex items-center gap-2 text-sm">
                    {session?.user.email}
                    {session?.user.emailVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Роль
                  </p>
                  <p className="font-bold text-white">
                    {session?.user.role === 'admin' ? (
                      <span className="text-purple-400">Администратор</span>
                    ) : (
                      'Пользователь'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-black text-white">Баланс</h2>
              </div>
              <p className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                {formatPrice(session?.user.balance || 0)}
              </p>
              <Link
                href="/balance/deposit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg"
              >
                <Wallet className="w-4 h-4" />
                Пополнить
              </Link>
            </div>

            {/* Referral */}
            {referralData && (
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl border border-green-500/30 p-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-5 h-5 text-green-400" />
                  <h3 className="font-bold text-white">Реферальная программа</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Рефералов:</span>
                    <span className="font-bold text-white">{referralData.totalReferrals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Заработано:</span>
                    <span className="font-bold text-green-400">{formatPrice(referralData.totalEarnings)}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Ваш код:</p>
                    <p className="font-mono font-bold text-lg text-purple-400">
                      {referralData.referralCode}
                    </p>
                  </div>
                </div>
                <Link
                  href="/referrals"
                  className="mt-4 flex items-center justify-center gap-2 text-sm text-white hover:text-green-300 transition font-semibold"
                >
                  Подробнее
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Main Content - Orders */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-black text-white">Мои заказы</h2>
                </div>
                {orders.length > 0 && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold">
                    {orders.length}
                  </span>
                )}
              </div>
              
              {orders.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="bg-gray-800/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-12 h-12 text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-lg mb-6">У вас пока нет заказов</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg"
                  >
                    <Package className="w-5 h-5" />
                    Перейти к покупкам
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr className="border-b border-white/10">
                        <th className="text-left text-xs font-semibold text-gray-400 p-4">ID ЗАКАЗА</th>
                        <th className="text-left text-xs font-semibold text-gray-400 p-4">ТОВАРЫ</th>
                        <th className="text-left text-xs font-semibold text-gray-400 p-4">ПОЛУЧАТЕЛЬ</th>
                        <th className="text-center text-xs font-semibold text-gray-400 p-4">СТАТУС</th>
                        <th className="text-right text-xs font-semibold text-gray-400 p-4">СУММА</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((order, index) => {
                        let deliveryInfo = null
                        let steamProfile = null
                        try {
                          if (order.deliveryData) {
                            deliveryInfo = typeof order.deliveryData === 'string' 
                              ? JSON.parse(order.deliveryData) 
                              : order.deliveryData
                            steamProfile = deliveryInfo?.steamProfileUrl
                          }
                        } catch (e) {}
                        
                        return (
                          <tr key={order.id} className="group hover:bg-white/5 transition-all" style={{animationDelay: `${index * 0.05}s`}}>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-mono text-purple-400 font-bold">#{order.id.slice(0, 8).toUpperCase()}</span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(order.createdAt)}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                {order.items.slice(0, 2).map((item, idx) => (
                                  <div key={idx} className="text-sm text-white font-medium truncate max-w-[250px]" title={item.product.name}>
                                    <Package className="w-3.5 h-3.5 inline mr-1.5 text-gray-500" />
                                    {item.product.name} {item.quantity > 1 && <span className="text-gray-400">×{item.quantity}</span>}
                                  </div>
                                ))}
                                {order.items.length > 2 && (
                                  <span className="text-xs text-gray-500">+{order.items.length - 2} товар(ов)</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              {steamProfile ? (
                                <a 
                                  href={steamProfile} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors group/link"
                                  title={steamProfile}
                                >
                                  <span className="font-medium">Steam профиль</span>
                                  <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                                </a>
                              ) : (
                                <span className="text-sm text-gray-500">Не указан</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusBadge(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <span className="font-black text-lg text-purple-400">
                                {formatPrice(order.totalAmount)}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
