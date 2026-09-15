'use client'

import Link from 'next/link'
import { Home, Search, ShoppingBag, ArrowLeft, Sparkles } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Анимированная 404 */}
        <div className="mb-8 relative">
          <div className="text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-none animate-pulse">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-24 h-24 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Страница не найдена
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Похоже, вы попали в измерение, которого не существует 🌌
        </p>

        {/* Описание */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <p className="text-gray-200 mb-4">
            Возможные причины:
          </p>
          <ul className="text-gray-300 space-y-2 text-left max-w-md mx-auto">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Страница была удалена или перемещена</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Ссылка устарела или содержит ошибку</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Вы случайно попали в параллельную вселенную</span>
            </li>
          </ul>
        </div>

        {/* Быстрые действия */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/"
            className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-6 rounded-xl transition-all transform hover:scale-105 flex flex-col items-center gap-3"
          >
            <Home className="w-8 h-8" />
            <span className="font-semibold">На главную</span>
          </Link>

          <Link
            href="/products"
            className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-6 rounded-xl transition-all transform hover:scale-105 flex flex-col items-center gap-3"
          >
            <ShoppingBag className="w-8 h-8" />
            <span className="font-semibold">Каталог игр</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-6 rounded-xl transition-all transform hover:scale-105 flex flex-col items-center gap-3"
          >
            <ArrowLeft className="w-8 h-8" />
            <span className="font-semibold">Назад</span>
          </button>
        </div>

        {/* Поиск помощи */}
        <div className="text-gray-400 text-sm">
          <p className="mb-2">Нужна помощь?</p>
          <Link href="/support" className="text-blue-400 hover:text-blue-300 transition-colors underline">
            Свяжитесь с поддержкой
          </Link>
        </div>

        {/* Декоративные элементы */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }}></div>
      </div>
    </div>
  )
}
