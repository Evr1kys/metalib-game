'use client'

import { Gamepad2, Users, Shield, Zap, Award, Heart, TrendingUp, Clock } from 'lucide-react'

export default function AboutPage() {
  const features = [
    {
      icon: Shield,
      title: 'Безопасность',
      description: 'Все транзакции защищены современными методами шифрования',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Zap,
      title: 'Мгновенная доставка',
      description: 'Ключи доставляются автоматически сразу после оплаты',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Award,
      title: 'Лучшие цены',
      description: 'Конкурентные цены и регулярные акции на популярные игры',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Heart,
      title: 'Поддержка 24/7',
      description: 'Наша команда всегда готова помочь с любыми вопросами',
      color: 'from-red-500 to-orange-600'
    }
  ]

  const stats = [
    { label: 'Довольных клиентов', value: '10,000+', icon: Users },
    { label: 'Игр в каталоге', value: '5,000+', icon: Gamepad2 },
    { label: 'Лет на рынке', value: '3+', icon: Clock },
    { label: 'Рейтинг', value: '4.9/5', icon: Award }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full px-6 py-2 mb-6">
              <Heart className="w-5 h-5 text-pink-400 animate-pulse-slow" />
              <span className="text-sm font-medium text-blue-300">О MetaLib Shop</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-slide-up">
              Мы создаем лучший опыт покупки игр
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-slide-up" style={{animationDelay: '0.1s'}}>
              MetaLib Shop — это современная платформа для покупки цифровых ключей игр, 
              пополнения Steam кошелька и других игровых сервисов. Мы работаем с 2022 года 
              и гордимся тем, что помогаем геймерам получать их любимые игры быстро и безопасно.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center hover:scale-105 transition-all animate-fade-in-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-black text-white mb-4">Почему выбирают нас?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Мы предлагаем лучший сервис для покупки игр и цифровых товаров
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/30 hover:scale-105 transition-all animate-fade-in-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 animate-float`} style={{animationDelay: `${index * 0.3}s`}}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 animate-fade-in-up">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl animate-float">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white">Наша миссия</h2>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Сделать покупку игр максимально простой, быстрой и безопасной для каждого геймера. 
                Мы верим, что доступ к играм должен быть удобным и прозрачным.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Наша команда постоянно работает над улучшением платформы, добавлением новых 
                функций и расширением каталога игр. Мы ценим каждого клиента и стремимся 
                обеспечить лучший сервис на рынке цифровых товаров.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-black text-white text-center mb-12 animate-fade-in">
            Наши ценности
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Прозрачность',
                description: 'Честные цены, никаких скрытых комиссий. Вы всегда знаете, за что платите.',
                emoji: '💎'
              },
              {
                title: 'Надежность',
                description: 'Все ключи проверены и гарантированно работают. Возврат средств, если что-то пойдет не так.',
                emoji: '🛡️'
              },
              {
                title: 'Инновации',
                description: 'Мы внедряем новые технологии для улучшения вашего опыта покупок.',
                emoji: '🚀'
              }
            ].map((value, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center hover:bg-white/10 transition-all animate-fade-in-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-6xl mb-4 animate-float" style={{animationDelay: `${index * 0.3}s`}}>
                  {value.emoji}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 text-center animate-fade-in-up">
          <h2 className="text-4xl font-black text-white mb-6">Остались вопросы?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Мы всегда рады помочь! Свяжитесь с нами любым удобным способом.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/faq"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg"
            >
              Посмотреть FAQ
            </a>
            <a
              href="/support"
              className="px-8 py-4 bg-gray-800 border border-white/20 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
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
