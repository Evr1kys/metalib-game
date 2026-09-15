'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Users, DollarSign, Gift, Copy, Check, TrendingUp, Calendar } from 'lucide-react'

type Referral = {
  id: string
  name: string
  email: string
  createdAt: string
}

type ReferralData = {
  referralCode: string
  referralUrl: string
  referrals: Referral[]
  totalReferrals: number
  totalEarnings: number
}

export default function ReferralsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReferrals()
    }
  }, [status])

  const fetchReferrals = async () => {
    try {
      const res = await fetch('/api/referrals')
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (data?.referralUrl) {
      navigator.clipboard.writeText(data.referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !data) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/30 rounded-full px-6 py-3 mb-6">
            <Gift className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Зарабатывайте вместе с друзьями
            </span>
          </div>
          <h1 className="text-5xl font-black text-white mb-4">Реферальная программа</h1>
          <p className="text-xl text-gray-300">
            Приглашайте друзей и получайте бонусы с каждой покупки
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
              <Users className="w-8 h-8 text-white mb-2" />
              <p className="text-blue-100 text-sm font-medium mb-1">Всего рефералов</p>
              <p className="text-4xl font-black text-white">{data.totalReferrals || 0}</p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
              <DollarSign className="w-8 h-8 text-white mb-2" />
              <p className="text-green-100 text-sm font-medium mb-1">Заработано</p>
              <p className="text-4xl font-black text-white">{(data.totalEarnings || 0).toFixed(2)} ₽</p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <TrendingUp className="w-8 h-8 text-white mb-2" />
              <p className="text-purple-100 text-sm font-medium mb-1">Ваш код</p>
              <p className="text-3xl font-black text-white tracking-wider">{data.referralCode}</p>
            </div>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 mb-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Gift className="w-6 h-6 text-blue-400" />
            Ваша реферальная ссылка
          </h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Поделитесь этой ссылкой с друзьями. Когда они зарегистрируются и сделают первую покупку, 
            вы получите <span className="text-blue-400 font-bold">{process.env.NEXT_PUBLIC_REFERRAL_BONUS_PERCENTAGE || '5'}%</span> от суммы их заказа на баланс!
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={data.referralUrl}
              readOnly
              className="flex-1 px-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={copyToClipboard}
              className={`px-6 py-4 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center gap-2 ${
                copied
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Скопировано
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Копировать
                </>
              )}
            </button>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              Ваши рефералы ({data.referrals.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-700/50">
            {data.referrals.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-700/30 rounded-full mb-4">
                  <Users className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Пока нет рефералов</h3>
                <p className="text-gray-400">
                  Поделитесь своей ссылкой, чтобы начать зарабатывать!
                </p>
              </div>
            ) : (
              data.referrals.map((referral) => (
                <div key={referral.id} className="p-6 hover:bg-gray-700/20 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {referral.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{referral.name || 'Без имени'}</p>
                        <p className="text-gray-400 text-sm">{referral.email}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">ID: {referral.id.slice(0, 12)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {referral.createdAt ? new Date(referral.createdAt).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }) : 'Неизвестно'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
