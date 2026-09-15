'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { Trash2, Plus, Minus, ShoppingCart, Package, CreditCard, Mail, ArrowRight, X, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

export default function CartPage() {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice())
  const clearCart = useCartStore((state) => state.clearCart)

  const [steamProfileUrl, setSteamProfileUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [useBalance, setUseBalance] = useState(false)
  const [userBalance, setUserBalance] = useState(0)

  useEffect(() => {
    if (session?.user?.steamProfileUrl) {
      setSteamProfileUrl(session.user.steamProfileUrl)
    }
    if (typeof session?.user?.balance === 'number') {
      setUserBalance(session.user.balance)
    }
  }, [session])

  // Проверка подтверждения email
  const isEmailVerified = session?.user?.emailVerified

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

  const totalPrice = getTotalPrice
  const balanceToUse = useBalance ? Math.min(userBalance, totalPrice) : 0
  const remainingAmount = totalPrice - balanceToUse

  const validateSteamUrl = (url: string) => {
    const steamUrlRegex = /^https:\/\/(steamcommunity\.com\/(id|profiles)\/[a-zA-Z0-9_-]+|s\.team\/p\/[a-zA-Z0-9_-]+)\/?$/
    return steamUrlRegex.test(url)
  }

  const handleCheckout = async () => {
    if (!session) {
      toast.error('Войдите в аккаунт для оформления заказа')
      router.push('/auth/signin')
      return
    }

    if (!steamProfileUrl) {
      toast.error('Введите ссылку на Steam профиль')
      return
    }

    if (!validateSteamUrl(steamProfileUrl)) {
      toast.error('Неверная ссылка на Steam профиль. Используйте формат: https://steamcommunity.com/id/username')
      return
    }

    if (items.length === 0) {
      toast.error('Корзина пуста')
      return
    }

    setLoading(true)
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          steamProfileUrl: steamProfileUrl,
          useBalance: useBalance,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        toast.error(orderData.error || 'Ошибка при создании заказа')
        return
      }

      // Если оплата полностью балансом
      if (remainingAmount <= 0) {
        try {
          const balancePaymentRes = await fetch(`/api/orders/${orderData.order.id}/pay-balance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })

          const balancePaymentData = await balancePaymentRes.json()

          if (!balancePaymentRes.ok) {
            toast.error(balancePaymentData.error || 'Ошибка при оплате заказа')
            return
          }

          toast.success('Заказ успешно оплачен!')
          clearCart()
          
          // Обновляем сессию
          await updateSession()
          
          // Редирект в профиль
          router.push('/profile')
        } catch (error) {
          console.error('Payment error:', error)
          toast.error('Произошла ошибка при оплате')
        }
        return
      }

      const paymentRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.order.id,
        }),
      })

      const paymentData = await paymentRes.json()

      if (!paymentRes.ok) {
        toast.error(paymentData.error || 'Ошибка при создании платежа')
        return
      }

      clearCart()
      window.location.href = paymentData.paymentUrl
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Произошла ошибка при оформлении заказа')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12">
        <div className="max-w-2xl mx-auto px-4 text-center animate-fade-in">
          <div className="bg-gray-800/30 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <ShoppingCart className="w-16 h-16 text-gray-600" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4">Корзина пуста</h1>
          <p className="text-xl text-gray-400 mb-8">
            Добавьте игры в корзину, чтобы оформить заказ
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg"
          >
            <Package className="w-5 h-5" />
            Перейти к покупкам
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-2xl animate-float">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Корзина</h1>
            <p className="text-gray-400">{items.length} {items.length === 1 ? 'товар' : 'товаров'} в корзине</p>
          </div>
        </div>

        {/* Предупреждение о неподтвержденном email */}
        {session && !isEmailVerified && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-yellow-400 font-semibold mb-1">Подтвердите Email для оформления заказа</h3>
                <p className="text-sm text-gray-300 mb-3">
                  Для совершения покупок необходимо подтвердить вашу электронную почту
                </p>
                <button
                  onClick={resendVerification}
                  className="text-sm px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition"
                >
                  Отправить письмо повторно
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div 
                key={item.productId} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-white/30 transition-all animate-fade-in-up"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div className="flex items-center gap-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl border border-white/10"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Package className="w-12 h-12 text-white opacity-50" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg mb-2 truncate">{item.name}</h3>
                    <p className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-gray-900/50 rounded-xl p-2 border border-white/10">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-2 hover:bg-white/10 rounded-lg transition text-gray-300 hover:text-white"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-white text-lg">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-2 hover:bg-white/10 rounded-lg transition text-gray-300 hover:text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-3 hover:bg-red-500/20 text-red-400 rounded-xl transition border border-red-500/20 hover:border-red-500/50"
                    title="Удалить"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-sm">
                  <span className="text-gray-400">Подытог:</span>
                  <span className="font-bold text-white">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Очистить корзину
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sticky top-20 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-black text-white">Оформление</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    Steam профиль для доставки
                  </label>
                  <input
                    type="url"
                    value={steamProfileUrl}
                    onChange={(e) => setSteamProfileUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="https://steamcommunity.com/id/username"
                  />
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Игры будут отправлены подарком на ваш Steam профиль
                  </p>
                  {session?.user?.steamVerified && (
                    <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
                      ✓ Steam профиль подтвержден
                    </p>
                  )}
                </div>

                {session && userBalance > 0 && (
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useBalance}
                        onChange={(e) => setUseBalance(e.target.checked)}
                        className="w-5 h-5 rounded border-white/20 bg-gray-900 text-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm">Использовать баланс</div>
                        <div className="text-xs text-gray-400">Доступно: {formatPrice(userBalance)}</div>
                      </div>
                    </label>
                  </div>
                )}

                <div className="bg-gray-900/50 rounded-xl p-4 space-y-3 border border-white/10">
                  <div className="flex justify-between text-gray-300">
                    <span>Товары ({items.length}):</span>
                    <span className="font-semibold">{formatPrice(totalPrice)}</span>
                  </div>
                  
                  {useBalance && balanceToUse > 0 && (
                    <div className="flex justify-between text-green-400 border-t border-white/10 pt-3">
                      <span>Оплата балансом:</span>
                      <span className="font-semibold">-{formatPrice(balanceToUse)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xl font-black text-white border-t border-white/20 pt-3">
                    <span>К оплате:</span>
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {formatPrice(remainingAmount)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || !steamProfileUrl || !session || !isEmailVerified}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Обработка...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {!isEmailVerified && session ? 'Подтвердите Email' : remainingAmount > 0 ? 'Перейти к оплате' : 'Оформить заказ'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {!session && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-yellow-300">
                      <Link href="/auth/signin" className="font-bold hover:underline">
                        Войдите в аккаунт
                      </Link>
                      {' '}для оформления заказа
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center">
                Оформляя заказ, вы соглашаетесь с{' '}
                <Link href="/terms" className="text-blue-400 hover:underline">
                  условиями использования
                </Link>
                {' '}и{' '}
                <Link href="/privacy" className="text-blue-400 hover:underline">
                  политикой конфиденциальности
                </Link>
              </p>
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
