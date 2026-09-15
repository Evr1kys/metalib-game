import Link from 'next/link'
import { Gamepad2, Mail, MessageCircle, Shield, FileText, HelpCircle, Info, Code } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                MetaLib Shop
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Современная платформа для покупки цифровых ключей игр с мгновенной доставкой и гарантией качества.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              Информация
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                  Каталог игр
                </Link>
              </li>
              <li>
                <Link href="/referrals" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                  Реферальная программа
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              Документы
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all"></span>
                  Пользовательское соглашение
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all"></span>
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/profile/security" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-green-400 rounded-full group-hover:w-2 transition-all"></span>
                  Безопасность
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all"></span>
                  <Code className="w-3 h-3" />
                  API Документация
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-purple-400" />
              Связь с нами
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-blue-400" />
                <a href="mailto:support@metalibshop.com" className="hover:text-white transition">
                  support@metalibshop.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <HelpCircle className="w-4 h-4 text-green-400" />
                <Link href="/support" className="hover:text-white transition">
                  Служба поддержки
                </Link>
              </li>
            </ul>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 mb-2">Принимаем к оплате:</p>
              <div className="flex gap-2">
                <div className="bg-white/10 rounded px-2 py-1 text-xs text-gray-400">Visa</div>
                <div className="bg-white/10 rounded px-2 py-1 text-xs text-gray-400">MC</div>
                <div className="bg-white/10 rounded px-2 py-1 text-xs text-gray-400">МИР</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} MetaLib Shop. Все права защищены.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Сделано с ❤️ для геймеров</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
