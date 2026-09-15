'use client'

import { Shield, Eye, Lock, Database, UserCheck, AlertTriangle } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center gap-4 mb-6 animate-fade-in">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-2xl animate-float">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                Политика конфиденциальности
              </h1>
              <p className="text-gray-400">Последнее обновление: 16 ноября 2025 г.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 md:p-12 space-y-8 animate-fade-in-up">
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-blue-400" />
                1. Введение
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>
                  Настоящая Политика конфиденциальности описывает, как MetaLib Shop собирает, использует, 
                  хранит и защищает персональную информацию пользователей.
                </p>
                <p>
                  Мы серьезно относимся к защите ваших персональных данных и соблюдаем требования 
                  Федерального закона «О персональных данных» № 152-ФЗ.
                </p>
                <p>
                  Используя наш сайт, вы соглашаетесь с условиями данной Политики конфиденциальности.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Database className="w-6 h-6 text-green-400" />
                2. Какие данные мы собираем
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>При регистрации и использовании нашего сайта мы можем собирать следующую информацию:</p>
                
                <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
                  <h3 className="font-bold text-white mb-3">Персональная информация:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Email адрес</li>
                    <li>Имя пользователя</li>
                    <li>Discord ID (при подключении Discord)</li>
                    <li>Реферальный код</li>
                  </ul>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
                  <h3 className="font-bold text-white mb-3">Данные об использовании:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>История покупок и транзакций</li>
                    <li>IP-адрес</li>
                    <li>Тип браузера и устройства</li>
                    <li>Время посещения сайта</li>
                    <li>Страницы, которые вы посещаете</li>
                  </ul>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
                  <h3 className="font-bold text-white mb-3">Платежная информация:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Данные о платежах (через защищенные платежные шлюзы)</li>
                    <li>История баланса</li>
                    <li>Информация о возвратах</li>
                  </ul>
                  <p className="mt-3 text-yellow-400 text-sm">
                    ⚠️ Мы НЕ храним данные банковских карт. Вся платежная информация обрабатывается через 
                    сертифицированные платежные системы.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-purple-400" />
                3. Как мы используем ваши данные
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>Собранная информация используется для следующих целей:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Обработка заказов и доставка цифровых ключей</li>
                  <li>Управление вашей учетной записью</li>
                  <li>Обработка платежей и возвратов</li>
                  <li>Отправка уведомлений о заказах и статусе доставки</li>
                  <li>Предоставление технической поддержки</li>
                  <li>Улучшение качества наших услуг</li>
                  <li>Предотвращение мошенничества и обеспечение безопасности</li>
                  <li>Выполнение реферальной программы</li>
                  <li>Соблюдение законодательных требований</li>
                </ul>
                <p className="text-green-400 mt-4">
                  ✓ Мы НЕ продаем и не передаем ваши персональные данные третьим лицам для маркетинговых целей.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-yellow-400" />
                4. Защита данных
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>Мы применяем современные технологии для защиты ваших данных:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>SSL/TLS шифрование для всех соединений</li>
                  <li>Хеширование паролей с использованием bcrypt</li>
                  <li>Двухфакторная аутентификация (2FA) для дополнительной защиты</li>
                  <li>Регулярное обновление систем безопасности</li>
                  <li>Ограниченный доступ к базам данных</li>
                  <li>Мониторинг подозрительной активности</li>
                  <li>Резервное копирование данных</li>
                </ul>
                <p className="mt-4">
                  Несмотря на все меры безопасности, мы не можем гарантировать абсолютную защиту данных 
                  при их передаче через интернет.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-red-400" />
                5. Cookies и аналитика
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>
                  Мы используем cookies для улучшения работы сайта и анализа посещаемости. Cookies — это 
                  небольшие текстовые файлы, которые сохраняются на вашем устройстве.
                </p>
                
                <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
                  <h3 className="font-bold text-white mb-3">Типы cookies, которые мы используем:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><span className="font-semibold">Необходимые cookies:</span> для работы основных функций сайта (авторизация, корзина)</li>
                    <li><span className="font-semibold">Функциональные cookies:</span> для сохранения ваших предпочтений</li>
                    <li><span className="font-semibold">Аналитические cookies:</span> для анализа использования сайта и улучшения сервиса</li>
                  </ul>
                </div>

                <p className="mt-4">
                  Вы можете отключить cookies в настройках вашего браузера, но это может ограничить 
                  функциональность сайта.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-pink-400" />
                6. Ваши права
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>В соответствии с законодательством о защите персональных данных, вы имеете право:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Получать информацию о ваших персональных данных, которые мы храним</li>
                  <li>Запрашивать исправление неточных данных</li>
                  <li>Запрашивать удаление ваших данных (право на забвение)</li>
                  <li>Ограничивать обработку ваших данных</li>
                  <li>Возражать против обработки данных</li>
                  <li>Получать копию ваших данных в структурированном формате</li>
                  <li>Отозвать согласие на обработку данных</li>
                </ul>
                <p className="mt-4 text-blue-400">
                  Для реализации этих прав, пожалуйста, обратитесь в службу поддержки через систему тикетов 
                  или по email.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                7. Хранение данных
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>
                  Мы храним ваши персональные данные только в течение необходимого периода для выполнения 
                  целей, указанных в данной Политике, или в соответствии с законодательными требованиями.
                </p>
                <p>Сроки хранения:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Данные учетной записи — до момента удаления аккаунта</li>
                  <li>История заказов — 3 года (для налоговой отчетности)</li>
                  <li>Логи безопасности — 1 год</li>
                  <li>Данные о платежах — в соответствии с требованиями платежных систем</li>
                </ul>
                <p className="mt-4">
                  После истечения срока хранения данные удаляются или анонимизируются.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-cyan-400" />
                8. Изменения в политике
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>
                  Мы можем обновлять данную Политику конфиденциальности по мере необходимости. О существенных 
                  изменениях мы уведомим вас по email или через уведомление на сайте.
                </p>
                <p>
                  Рекомендуем периодически проверять эту страницу для ознакомления с актуальной версией Политики.
                </p>
                <p>
                  Продолжая использовать сайт после внесения изменений, вы соглашаетесь с обновленной Политикой 
                  конфиденциальности.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-green-400" />
                9. Контактная информация
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>
                  Если у вас есть вопросы или запросы относительно данной Политики конфиденциальности или 
                  обработки ваших персональных данных, пожалуйста, свяжитесь с нами:
                </p>
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-white/10">
                  <p className="font-semibold text-white mb-2">MetaLib Shop</p>
                  <p>Email: support@metalibshop.com</p>
                  <p>Система поддержки: доступна в личном кабинете</p>
                </div>
                <p className="mt-4">
                  Мы ответим на ваш запрос в течение 30 дней с момента получения.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

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
