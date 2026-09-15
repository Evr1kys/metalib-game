'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Save, RefreshCw, Shield, Store, Mail, Key } from 'lucide-react'

interface Settings {
  SITE_NAME: string
  SITE_DESCRIPTION: string
  SITE_URL: string
  SUPPORT_EMAIL: string
  MIN_DEPOSIT: string
  MAX_DEPOSIT: string
  COMMISSION_PERCENT: string
  REFERRAL_BONUS_PERCENT: string
  ENABLE_REGISTRATIONS: string
  ENABLE_EMAIL_VERIFICATION: string
  MAINTENANCE_MODE: string
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>({
    SITE_NAME: 'MetaLib Shop',
    SITE_DESCRIPTION: 'Магазин цифровых товаров',
    SITE_URL: 'http://localhost:3000',
    SUPPORT_EMAIL: 'support@metalib.xyz',
    MIN_DEPOSIT: '10',
    MAX_DEPOSIT: '100000',
    COMMISSION_PERCENT: '5',
    REFERRAL_BONUS_PERCENT: '5',
    ENABLE_REGISTRATIONS: 'true',
    ENABLE_EMAIL_VERIFICATION: 'true',
    MAINTENANCE_MODE: 'false',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchSettings()
    }
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        alert('Настройки сохранены успешно!')
      } else {
        alert('Ошибка сохранения настроек')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Ошибка сохранения настроек')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-5xl font-black bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
          Настройки магазина
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Основные настройки */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Основные настройки</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Название сайта</label>
              <input
                type="text"
                value={settings.SITE_NAME}
                onChange={(e) => handleChange('SITE_NAME', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <textarea
                value={settings.SITE_DESCRIPTION}
                onChange={(e) => handleChange('SITE_DESCRIPTION', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL сайта</label>
              <input
                type="url"
                value={settings.SITE_URL}
                onChange={(e) => handleChange('SITE_URL', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Email настройки */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold">Email настройки</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email поддержки</label>
              <input
                type="email"
                value={settings.SUPPORT_EMAIL}
                onChange={(e) => handleChange('SUPPORT_EMAIL', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="emailVerification"
                checked={settings.ENABLE_EMAIL_VERIFICATION === 'true'}
                onChange={(e) => handleChange('ENABLE_EMAIL_VERIFICATION', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4"
              />
              <label htmlFor="emailVerification" className="text-sm font-medium">
                Включить верификацию email
              </label>
            </div>
          </div>
        </div>

        {/* Финансовые настройки */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">Финансовые настройки</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Минимальная сумма пополнения (₽)</label>
              <input
                type="number"
                value={settings.MIN_DEPOSIT}
                onChange={(e) => handleChange('MIN_DEPOSIT', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Максимальная сумма пополнения (₽)</label>
              <input
                type="number"
                value={settings.MAX_DEPOSIT}
                onChange={(e) => handleChange('MAX_DEPOSIT', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Комиссия магазина (%)</label>
              <input
                type="number"
                value={settings.COMMISSION_PERCENT}
                onChange={(e) => handleChange('COMMISSION_PERCENT', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Бонус за реферала (%)</label>
              <input
                type="number"
                value={settings.REFERRAL_BONUS_PERCENT}
                onChange={(e) => handleChange('REFERRAL_BONUS_PERCENT', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Безопасность */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold">Безопасность и доступ</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="registrations"
                checked={settings.ENABLE_REGISTRATIONS === 'true'}
                onChange={(e) => handleChange('ENABLE_REGISTRATIONS', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4"
              />
              <label htmlFor="registrations" className="text-sm font-medium">
                Разрешить регистрацию новых пользователей
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="maintenance"
                checked={settings.MAINTENANCE_MODE === 'true'}
                onChange={(e) => handleChange('MAINTENANCE_MODE', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4"
              />
              <label htmlFor="maintenance" className="text-sm font-medium">
                Режим обслуживания (только для администраторов)
              </label>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="font-semibold mb-2">🔒 Безопасность включена</h3>
          <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Rate limiting: 100 req/min (API), 5 req/min (Auth)</li>
            <li>• Security headers: HSTS, CSP, XSS Protection</li>
            <li>• Password strength: минимум 8 символов, A-Z, 0-9</li>
            <li>• SQL Injection protection: Prisma ORM</li>
            <li>• XSS Protection: Input sanitization</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
