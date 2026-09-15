'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Shield, Smartphone, Key, AlertCircle, CheckCircle, Copy, Lock } from 'lucide-react'

export default function SecurityPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/auth/2fa/status')
      if (res.ok) {
        const data = await res.json()
        setTwoFactorEnabled(data.enabled)
      }
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error)
    }
  }

  const handleSetup = async () => {
    try {
      setLoading(true)
      setError('')
      
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Ошибка настройки 2FA')
      }

      const data = await res.json()
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setShowSetup(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEnable = async () => {
    try {
      setLoading(true)
      setError('')
      
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Ошибка включения 2FA')
      }

      setSuccess('2FA успешно включен!')
      setTwoFactorEnabled(true)
      setShowSetup(false)
      setVerificationCode('')
      setQrCode('')
      setSecret('')
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    try {
      setLoading(true)
      setError('')
      
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Ошибка отключения 2FA')
      }

      setSuccess('2FA успешно отключен!')
      setTwoFactorEnabled(false)
      setVerificationCode('')
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    setSuccess('Секрет скопирован!')
    setTimeout(() => setSuccess(''), 2000)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      setError('Пароль должен содержать минимум 8 символов')
      return
    }
    
    try {
      setPasswordLoading(true)
      
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка смены пароля')
      }
      
      setSuccess('Пароль успешно изменен!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-2xl animate-float">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Безопасность</h1>
            <p className="text-gray-400">Настройка двухфакторной аутентификации</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Password Change Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Смена пароля</h2>
              <p className="text-sm text-gray-400">Обновите пароль вашего аккаунта</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Текущий пароль
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Введите текущий пароль"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Новый пароль
              </label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Минимум 8 символов"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Подтвердите новый пароль
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Повторите новый пароль"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {passwordLoading ? 'Сохранение...' : 'Изменить пароль'}
            </button>
          </form>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Двухфакторная аутентификация</h2>
                <p className="text-sm text-gray-400">Google Authenticator</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              twoFactorEnabled
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-700/50 text-gray-400 border border-gray-600/30'
            }`}>
              {twoFactorEnabled ? 'Включено' : 'Отключено'}
            </div>
          </div>

          <p className="text-gray-300 mb-6">
            Двухфакторная аутентификация добавляет дополнительный уровень защиты вашего аккаунта.
            После включения вам нужно будет вводить код из приложения при каждом входе.
          </p>

          {!twoFactorEnabled && !showSetup && (
            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Настройка...' : 'Настроить 2FA'}
            </button>
          )}

          {showSetup && !twoFactorEnabled && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                  Шаг 1: Отсканируйте QR-код
                </h3>
                <div className="flex justify-center mb-4">
                  {qrCode && (
                    <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                  )}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Используйте Google Authenticator или другое приложение для сканирования
                </p>
              </div>

              <div className="bg-gray-700/30 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-300">
                    Или введите код вручную:
                  </label>
                  <button
                    onClick={copySecret}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <code className="block p-3 bg-gray-900 rounded-lg text-green-400 font-mono text-sm break-all">
                  {secret}
                </code>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Шаг 2: Введите код из приложения
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSetup(false)
                    setVerificationCode('')
                    setQrCode('')
                    setSecret('')
                  }}
                  className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleEnable}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? 'Проверка...' : 'Подтвердить'}
                </button>
              </div>
            </div>
          )}

          {twoFactorEnabled && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-bold text-green-400">
                    2FA активирован
                  </h3>
                </div>
                <p className="text-gray-300">
                  Ваш аккаунт защищен двухфакторной аутентификацией. При входе вам нужно будет вводить код из приложения.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Введите код для отключения 2FA
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleDisable}
                disabled={loading || verificationCode.length !== 6}
                className="w-full py-4 bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Отключение...' : 'Отключить 2FA'}
              </button>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Key className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Что такое 2FA?</h3>
            <p className="text-gray-400 text-sm">
              Двухфакторная аутентификация требует два способа подтверждения личности: ваш пароль и код из приложения.
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="bg-green-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Рекомендуемые приложения</h3>
            <p className="text-gray-400 text-sm">
              Google Authenticator, Microsoft Authenticator, Authy - любое приложение для TOTP кодов.
            </p>
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
            transform: translateY(20px);
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
