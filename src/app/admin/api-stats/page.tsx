'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Code, TrendingUp, Users, Activity, Clock, CheckCircle, XCircle, Key } from 'lucide-react'

interface ApiStats {
  totalKeys: number
  activeKeys: number
  totalRequests: number
  requestsToday: number
  avgResponseTime: number
  successRate: number
  topEndpoints: Array<{
    endpoint: string
    count: number
    avgTime: number
  }>
  recentRequests: Array<{
    endpoint: string
    method: string
    status: number
    responseTime: number
    createdAt: string
    keyName: string
  }>
}

export default function AdminApiStatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<ApiStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/')
      } else {
        loadStats()
      }
    }
  }, [status, session, router])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/api-stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error loading API stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">API Статистика</h1>
          <p className="text-gray-300">Мониторинг использования API ключей и запросов</p>
        </div>

        {/* Основные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Всего ключей */}
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <Key className="w-10 h-10 text-blue-400" />
              <div className="text-right">
                <div className="text-sm text-gray-400">Активных</div>
                <div className="text-lg font-bold text-blue-400">{stats.activeKeys}</div>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.totalKeys}</div>
            <div className="text-gray-300">Всего ключей</div>
          </div>

          {/* Всего запросов */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-10 h-10 text-purple-400" />
              <div className="text-right">
                <div className="text-sm text-gray-400">Сегодня</div>
                <div className="text-lg font-bold text-purple-400">{stats.requestsToday}</div>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.totalRequests.toLocaleString()}</div>
            <div className="text-gray-300">Всего запросов</div>
          </div>

          {/* Среднее время ответа */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-10 h-10 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.avgResponseTime}ms</div>
            <div className="text-gray-300">Среднее время</div>
          </div>

          {/* Success Rate */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.successRate.toFixed(1)}%</div>
            <div className="text-gray-300">Успешных запросов</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Топ эндпоинтов */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Популярные эндпоинты</h2>
            <div className="space-y-4">
              {stats.topEndpoints.map((endpoint, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-sm text-blue-400">{endpoint.endpoint}</div>
                    <div className="text-white font-bold">{endpoint.count}</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-400">Среднее время</div>
                    <div className="text-green-400">{endpoint.avgTime}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Последние запросы */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Последние запросы</h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {stats.recentRequests.map((request, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">
                          {request.method}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-mono ${
                          request.status >= 200 && request.status < 300
                            ? 'bg-green-500/20 text-green-400'
                            : request.status >= 400
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="font-mono text-sm text-white">{request.endpoint}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">{request.responseTime}ms</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div>Ключ: {request.keyName}</div>
                    <div>{new Date(request.createdAt).toLocaleString('ru-RU')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* График активности (заглушка для будущего) */}
        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">График активности</h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            График будет добавлен в следующем обновлении
          </div>
        </div>
      </div>
    </div>
  )
}
