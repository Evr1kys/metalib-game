'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, LogOut, Shield, Heart, Menu, X, Sparkles } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useEffect, useState } from 'react'
import ThemeToggle from '../ThemeToggle'

export default function Header() {
  const { data: session } = useSession()
  const totalItems = useCartStore((state) => state.getTotalItems())
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg dark:shadow-purple-500/10' 
        : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl'
    } border-b border-gray-200 dark:border-gray-800`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/60 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-2xl font-black text-white">ML</span>
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            </div>
            <div className="hidden md:block">
              <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400">
                MetaLib Shop
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Игровой магазин</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold transition-all relative group rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              Главная
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-3/4 transition-all duration-300" />
            </Link>
            <Link
              href="/products"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold transition-all relative group rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              Каталог
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-3/4 transition-all duration-300" />
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold transition-all relative group rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              О нас
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-3/4 transition-all duration-300" />
            </Link>
            <Link
              href="/support"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold transition-all relative group rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              Поддержка
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-3/4 transition-all duration-300" />
            </Link>
            <Link
              href="/balance/steam-topup"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold transition-all relative group rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              Пополнение Steam
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-3/4 transition-all duration-300" />
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Favorites */}
            {session && (
              <Link
                href="/favorites"
                className="relative p-3 hover:bg-white/10 dark:hover:bg-white/5 rounded-xl transition-all duration-300 group"
                title="Избранное"
              >
                <Heart className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-pink-500 dark:group-hover:text-pink-400 group-hover:scale-110 transition-all duration-300" />
                <span className="absolute inset-0 rounded-xl bg-pink-500/20 opacity-0 group-hover:opacity-100 blur transition-opacity" />
              </Link>
            )}

            {/* Cart */}
            {session && (
              <Link
                href="/cart"
                className="relative p-3 hover:bg-white/10 dark:hover:bg-white/5 rounded-xl transition-all duration-300 group"
                title="Корзина"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-bounce">
                    {totalItems}
                  </span>
                )}
                <span className="absolute inset-0 rounded-xl bg-blue-500/20 opacity-0 group-hover:opacity-100 blur transition-opacity" />
              </Link>
            )}

            {/* User Menu */}
            {session ? (
              <div className="flex items-center gap-2">
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="relative p-3 hover:bg-white/10 rounded-xl transition-all duration-300 group"
                    title="Админ-панель"
                  >
                    <Shield className="w-5 h-5 text-gray-300 group-hover:text-yellow-400 group-hover:scale-110 transition-all duration-300" />
                    <span className="absolute inset-0 rounded-xl bg-yellow-500/20 opacity-0 group-hover:opacity-100 blur transition-opacity" />
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="relative p-3 hover:bg-white/10 rounded-xl transition-all duration-300 group"
                  title="Профиль"
                >
                  <User className="w-5 h-5 text-gray-300 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300" />
                  <span className="absolute inset-0 rounded-xl bg-blue-500/20 opacity-0 group-hover:opacity-100 blur transition-opacity" />
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="relative p-3 hover:bg-white/10 rounded-xl transition-all duration-300 group"
                  title="Выйти"
                >
                  <LogOut className="w-5 h-5 text-gray-300 group-hover:text-red-400 group-hover:scale-110 transition-all duration-300" />
                  <span className="absolute inset-0 rounded-xl bg-red-500/20 opacity-0 group-hover:opacity-100 blur transition-opacity" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="px-5 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-semibold text-sm"
                >
                  Войти
                </Link>
                <Link
                  href="/auth/signup"
                  className="relative px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl overflow-hidden group"
                >
                  <span className="relative z-10">Регистрация</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 hover:bg-white/10 rounded-xl transition-all"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4 animate-slide-down">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-semibold group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  🏠 Главная
                </span>
              </Link>
              <Link
                href="/products"
                className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  🎮 Каталог
                </span>
              </Link>
              <Link
                href="/about"
                className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  ℹ️ О нас
                </span>
              </Link>
              <Link
                href="/support"
                className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  💬 Поддержка
                </span>
              </Link>
              <Link
                href="/balance/steam-topup"
                className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  💳 Пополнение Steam
                </span>
              </Link>
              
              {session && (
                <>
                  <div className="h-px bg-white/10 my-2" />
                  <Link
                    href="/favorites"
                    className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      ❤️ Избранное
                    </span>
                  </Link>
                  <Link
                    href="/referrals"
                    className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      � Рефералы
                    </span>
                  </Link>
                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="px-4 py-3 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-xl transition-all font-semibold flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="w-5 h-5" />
                      Админ-панель
                    </Link>
                  )}
                  <div className="h-px bg-white/10 my-2" />
                  <Link
                    href="/profile"
                    className="px-4 py-3 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl transition-all font-semibold flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Профиль
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all font-semibold flex items-center gap-2 text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Выйти
                  </button>
                </>
              )}
              {!session && (
                <>
                  <div className="h-px bg-white/10 my-2" />
                  <Link
                    href="/auth/signin"
                    className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Войти
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="mx-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </header>
  )
}
