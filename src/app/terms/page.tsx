'use client'

import { FileText, Scale, CheckCircle } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center gap-4 mb-6 animate-fade-in">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-2xl animate-float">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                Пользовательское соглашение
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
                <CheckCircle className="w-6 h-6 text-blue-400" />
                1. Общие положения
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>
                  Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между 
                  владельцем сайта MetaLib Shop (далее — «Администрация») и пользователем сайта (далее — «Пользователь»).
                </p>
                <p>
                  Используя сайт MetaLib Shop, вы соглашаетесь с условиями данного Соглашения. Если вы не согласны 
                  с условиями, пожалуйста, не используйте наш сайт.
                </p>
                <p>
                  Администрация оставляет за собой право изменять настоящее Соглашение без предварительного уведомления. 
                  Новая редакция вступает в силу с момента ее размещения на сайте.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                2. Регистрация и учетная запись
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>
                  Для совершения покупок необходимо пройти регистрацию на сайте. При регистрации Пользователь обязуется 
                  предоставить достоверную и полную информацию о себе.
                </p>
                <p>
                  Пользователь несет ответственность за сохранность своих данных для входа (логин и пароль) и не имеет 
                  права передавать их третьим лицам.
                </p>
                <p>
                  В случае утраты доступа к учетной записи, Пользователь должен немедленно уведомить Администрацию. 
                  Администрация не несет ответственности за любые действия, совершенные с использованием учетной записи 
                  Пользователя до момента уведомления.
                </p>
                <p>
                  Пользователю запрещается создавать более одной учетной записи, а также учетные записи с целью 
                  мошенничества или нарушения правил сайта.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-purple-400" />
                3. Покупка товаров
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>
                  Все товары на сайте являются цифровыми (ключи активации, коды пополнения и т.д.) и доставляются 
                  автоматически в личный кабинет Пользователя и на указанный email после подтверждения оплаты.
                </p>
                <p>
                  Цены на товары указаны в рублях и могут быть изменены Администрацией в одностороннем порядке. 
                  Стоимость уже оплаченных товаров изменению не подлежит.
                </p>
                <p>
                  После получения цифрового ключа Пользователь обязан проверить его работоспособность в течение 
                  24 часов. Претензии, поступившие позже указанного срока, могут быть отклонены.
                </p>
                <p>
                  Администрация гарантирует, что все предоставляемые ключи получены легальным путем и имеют право 
                  на активацию. Возврат средств возможен только в случае технических проблем с ключом.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-yellow-400" />
                4. Оплата и возврат средств
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>
                  Оплата производится через защищенные платежные системы. Администрация не имеет доступа к данным 
                  банковских карт Пользователей.
                </p>
                <p>
                  Возврат средств за цифровые товары осуществляется только в следующих случаях:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Ключ оказался нерабочим или уже активированным</li>
                  <li>Товар не соответствует описанию на сайте</li>
                  <li>Технический сбой при доставке ключа</li>
                  <li>Двойное списание средств</li>
                </ul>
                <p>
                  Возврат НЕ осуществляется, если:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Ключ был успешно активирован</li>
                  <li>Пользователь передумал или ошибся при выборе товара</li>
                  <li>У Пользователя отсутствует доступ к платформе активации (например, Steam)</li>
                  <li>Региональные ограничения товара</li>
                </ul>
                <p>
                  Возврат средств производится на тот же счет, с которого была произведена оплата, в течение 7-14 
                  рабочих дней.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-red-400" />
                5. Запрещенные действия
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>Пользователям запрещается:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Использовать сайт в незаконных целях</li>
                  <li>Пытаться получить несанкционированный доступ к системе</li>
                  <li>Распространять вредоносное ПО</li>
                  <li>Проводить мошеннические операции</li>
                  <li>Копировать, воспроизводить или распространять контент сайта без разрешения</li>
                  <li>Создавать ложные отзывы или рейтинги</li>
                  <li>Использовать уязвимости системы в личных целях</li>
                  <li>Перепродавать купленные ключи без согласия Администрации</li>
                </ul>
                <p>
                  За нарушение данных правил Администрация имеет право заблокировать учетную запись Пользователя 
                  без возврата средств.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-pink-400" />
                6. Ответственность
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>
                  Администрация не несет ответственности за временные технические неполадки и перерывы в работе сайта, 
                  а также за возможную потерю информации.
                </p>
                <p>
                  Пользователь самостоятельно несет ответственность за достоверность предоставленной информации и 
                  за все действия, совершенные под его учетной записью.
                </p>
                <p>
                  Администрация не несет ответственности за действия третьих лиц, включая платежные системы и 
                  игровые платформы.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-cyan-400" />
                7. Заключительные положения
              </h2>
              <div className="text-gray-300 space-y-3 leading-relaxed">
                <p>
                  Все споры и разногласия решаются путем переговоров. При невозможности достижения согласия, 
                  споры подлежат рассмотрению в соответствии с действующим законодательством РФ.
                </p>
                <p>
                  Продолжая использовать сайт после внесения изменений в Соглашение, Пользователь автоматически 
                  принимает новые условия.
                </p>
                <p>
                  По всем вопросам, связанным с работой сайта, вы можете обратиться в службу поддержки через 
                  систему тикетов в личном кабинете.
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
