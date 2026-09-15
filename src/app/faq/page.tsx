'use client'

import { useState } from 'react'
import { Search, ChevronDown, ChevronUp, HelpCircle, CreditCard, Package, Shield, Zap, Users } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'Все вопросы', icon: HelpCircle },
    { id: 'payment', name: 'Оплата', icon: CreditCard },
    { id: 'delivery', name: 'Доставка', icon: Package },
    { id: 'security', name: 'Безопасность', icon: Shield },
    { id: 'account', name: 'Аккаунт', icon: Users },
    { id: 'general', name: 'Общие', icon: Zap }
  ]

  const faqs: FAQItem[] = [
    {
      category: 'general',
      question: 'Что такое MetaLib Shop?',
      answer: 'MetaLib Shop — это современная платформа для покупки цифровых ключей игр, DLC, пополнения Steam кошелька и других игровых сервисов. Мы предлагаем мгновенную доставку ключей по конкурентным ценам с гарантией качества.'
    },
    {
      category: 'payment',
      question: 'Какие способы оплаты вы принимаете?',
      answer: 'Мы принимаем различные способы оплаты: банковские карты (Visa, Mastercard, МИР), электронные кошельки, криптовалюту и другие популярные платежные системы. Все платежи проходят через защищенные шлюзы.'
    },
    {
      category: 'payment',
      question: 'Можно ли оплатить со счета баланса?',
      answer: 'Да! Вы можете пополнить баланс аккаунта и использовать его для покупок. Это удобно, если вы часто покупаете игры на нашей платформе. Пополнить баланс можно в разделе "Баланс".'
    },
    {
      category: 'payment',
      question: 'Безопасны ли платежи на сайте?',
      answer: 'Абсолютно! Все платежи проходят через сертифицированные платежные шлюзы с использованием шифрования SSL/TLS. Мы не храним данные ваших банковских карт. Все транзакции защищены по стандартам PCI DSS.'
    },
    {
      category: 'delivery',
      question: 'Как быстро я получу ключ после оплаты?',
      answer: 'В большинстве случаев ключи доставляются мгновенно — в течение нескольких секунд после подтверждения оплаты. Ключ появится в вашем личном кабинете в разделе "Заказы" и придет на email.'
    },
    {
      category: 'delivery',
      question: 'Куда придет мой ключ?',
      answer: 'Ключ будет доступен в вашем личном кабинете в разделе "Заказы". Также мы отправим его на email, указанный при регистрации. Рекомендуем проверить папку "Спам", если письмо не пришло.'
    },
    {
      category: 'delivery',
      question: 'Что делать, если ключ не пришел?',
      answer: 'Сначала проверьте раздел "Заказы" в личном кабинете и папку "Спам" в email. Если ключа нет, обратитесь в службу поддержки через систему тикетов. Мы решим проблему в течение 24 часов.'
    },
    {
      category: 'delivery',
      question: 'Могу ли я вернуть цифровой ключ?',
      answer: 'Возврат цифровых ключей возможен только в том случае, если ключ оказался нерабочим или был активирован ранее. После активации ключа возврат не предусмотрен согласно законодательству о цифровых товарах.'
    },
    {
      category: 'security',
      question: 'Откуда вы берете ключи?',
      answer: 'Мы работаем напрямую с официальными дистрибьюторами и издателями игр. Все ключи легальны и получены из надежных источников. Мы не работаем с серыми схемами и сомнительными поставщиками.'
    },
    {
      category: 'security',
      question: 'Могут ли ключи быть заблокированы?',
      answer: 'Нет, если вы покупаете ключи на нашей платформе. Все наши ключи легальны и получены от официальных поставщиков. Мы даем 100% гарантию работоспособности каждого ключа.'
    },
    {
      category: 'security',
      question: 'Что такое двухфакторная аутентификация?',
      answer: '2FA (двухфакторная аутентификация) — это дополнительный уровень защиты вашего аккаунта. После включения при входе нужно будет вводить код из приложения Google Authenticator. Настроить можно в разделе "Безопасность".'
    },
    {
      category: 'security',
      question: 'Как защитить свой аккаунт?',
      answer: 'Используйте сильный уникальный пароль, включите двухфакторную аутентификацию (2FA), не передавайте данные для входа третьим лицам, регулярно проверяйте историю входов. При подозрительной активности немедленно смените пароль.'
    },
    {
      category: 'account',
      question: 'Как создать аккаунт?',
      answer: 'Нажмите "Регистрация" в верхнем меню, заполните форму с email и паролем, подтвердите email по ссылке из письма. После этого вы сможете совершать покупки и пользоваться всеми функциями сайта.'
    },
    {
      category: 'account',
      question: 'Я забыл пароль, что делать?',
      answer: 'На странице входа нажмите "Забыли пароль?", введите свой email. Мы отправим вам ссылку для сброса пароля. Если письмо не пришло, проверьте папку "Спам" или обратитесь в поддержку.'
    },
    {
      category: 'account',
      question: 'Что такое реферальная программа?',
      answer: 'Реферальная программа позволяет зарабатывать на приглашении друзей. Поделитесь своей реферальной ссылкой, и за каждую покупку приглашенного пользователя вы получите % на баланс. Подробности в разделе "Рефералы".'
    },
    {
      category: 'account',
      question: 'Можно ли изменить email адрес?',
      answer: 'Да, изменить email можно в настройках профиля. После изменения на новый адрес придет письмо с подтверждением. Для безопасности может потребоваться ввести текущий пароль.'
    },
    {
      category: 'general',
      question: 'Есть ли мобильное приложение?',
      answer: 'Пока нет, но наш сайт полностью адаптирован для мобильных устройств. Вы можете комфортно пользоваться всеми функциями через браузер на смартфоне или планшете.'
    },
    {
      category: 'general',
      question: 'Как связаться с поддержкой?',
      answer: 'Создайте тикет в разделе "Поддержка" в личном кабинете. Опишите вашу проблему подробно, приложите скриншоты если нужно. Мы отвечаем на тикеты в течение 24 часов, обычно быстрее.'
    },
    {
      category: 'general',
      question: 'Есть ли скидки и акции?',
      answer: 'Да! Мы регулярно проводим акции, предлагаем скидки на популярные игры. Следите за новостями на главной странице и в наших социальных сетях. Также действует реферальная программа для дополнительной выгоды.'
    },
    {
      category: 'payment',
      question: 'Что такое Steam кошелек и как его пополнить?',
      answer: 'Steam кошелек — это внутренний баланс вашего аккаунта Steam. Пополнить его можно купив специальные коды пополнения в нашем магазине в категории "Steam Кошелек". Коды разных номиналов доставляются мгновенно.'
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full px-6 py-2 mb-6">
              <HelpCircle className="w-5 h-5 text-blue-400 animate-pulse-slow" />
              <span className="text-sm font-medium text-blue-300">Часто задаваемые вопросы</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-slide-up">
              Ответы на ваши вопросы
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
              Здесь вы найдете ответы на самые популярные вопросы о нашем сервисе
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto relative animate-slide-up" style={{animationDelay: '0.2s'}}>
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по вопросам..."
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-gray-900/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 animate-fade-in-up ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <category.icon className="w-5 h-5" />
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-white/30 transition-all animate-fade-in-up"
                  style={{animationDelay: `${index * 0.03}s`}}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                        <HelpCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-white text-lg">{faq.question}</span>
                    </div>
                    {openIndex === index ? (
                      <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openIndex === index && (
                    <div className="px-6 pb-6 animate-fade-in">
                      <div className="pl-14 pr-10">
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="bg-gray-800/30 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-16 h-16 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Ничего не найдено</h3>
              <p className="text-gray-400 mb-6">Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transition-transform"
              >
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 text-center animate-fade-in-up">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
            <HelpCircle className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-float" />
            <h2 className="text-3xl font-black text-white mb-4">Не нашли ответ?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Наша команда поддержки всегда готова помочь вам с любым вопросом
            </p>
            <a
              href="/support"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg"
            >
              Связаться с поддержкой
            </a>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
