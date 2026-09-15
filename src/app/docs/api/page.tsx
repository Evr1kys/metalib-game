'use client'

import { useState } from 'react'

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('products-list')

  const endpoints = [
    {
      id: 'products-list',
      method: 'GET',
      path: '/api/v1/products',
      title: 'Список товаров',
      description: 'Получить список всех доступных товаров с пагинацией',
      permission: 'products:read',
      params: [
        { name: 'category', type: 'string', required: false, description: 'Фильтр по slug категории' },
        { name: 'limit', type: 'number', required: false, description: 'Количество товаров (1-100, по умолчанию 50)' },
        { name: 'offset', type: 'number', required: false, description: 'Смещение для пагинации' },
        { name: 'active', type: 'boolean', required: false, description: 'Фильтр по активности (по умолчанию true)' }
      ],
      example: {
        curl: `curl -X GET "https://metalib-shop.com/api/v1/products?limit=10&category=games" \\
  -H "x-api-key: mk_your_api_key_here"`,
        response: `{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "Grand Theft Auto V",
      "description": "Игра...",
      "price": 1299.99,
      "image": "https://...",
      "stock": 100,
      "isActive": true,
      "category": {
        "id": "cat123",
        "name": "Игры",
        "slug": "games"
      }
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 50,
    "hasMore": true
  }
}`
      }
    },
    {
      id: 'product-detail',
      method: 'GET',
      path: '/api/v1/products/:id',
      title: 'Детали товара',
      description: 'Получить подробную информацию о конкретном товаре',
      permission: 'products:read',
      params: [
        { name: 'id', type: 'string', required: true, description: 'ID товара' }
      ],
      example: {
        curl: `curl -X GET "https://metalib-shop.com/api/v1/products/abc123" \\
  -H "x-api-key: mk_your_api_key_here"`,
        response: `{
  "success": true,
  "data": {
    "id": "abc123",
    "name": "Grand Theft Auto V",
    "description": "Описание игры...",
    "price": 1299.99,
    "image": "https://...",
    "stock": 100,
    "isActive": true,
    "createdAt": "2024-01-01T12:00:00Z",
    "category": {
      "id": "cat123",
      "name": "Игры",
      "slug": "games"
    }
  }
}`
      }
    },
    {
      id: 'categories',
      method: 'GET',
      path: '/api/v1/categories',
      title: 'Список категорий',
      description: 'Получить все доступные категории товаров',
      permission: 'products:read',
      params: [],
      example: {
        curl: `curl -X GET "https://metalib-shop.com/api/v1/categories" \\
  -H "x-api-key: mk_your_api_key_here"`,
        response: `{
  "success": true,
  "data": [
    {
      "id": "cat123",
      "name": "Игры",
      "slug": "games",
      "description": "Игровые ключи",
      "icon": "🎮",
      "isActive": true,
      "productCount": 50
    }
  ]
}`
      }
    },
    {
      id: 'create-order',
      method: 'POST',
      path: '/api/v1/orders',
      title: 'Создать заказ',
      description: 'Создать новый заказ на товары',
      permission: 'orders:create',
      params: [
        { name: 'items', type: 'array', required: true, description: 'Массив товаров [{productId, quantity}]' },
        { name: 'customerEmail', type: 'string', required: false, description: 'Email покупателя (опционально)' }
      ],
      example: {
        curl: `curl -X POST "https://metalib-shop.com/api/v1/orders" \\
  -H "x-api-key: mk_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "items": [
      {"productId": "abc123", "quantity": 1},
      {"productId": "def456", "quantity": 2}
    ],
    "customerEmail": "customer@example.com"
  }'`,
        response: `{
  "success": true,
  "data": {
    "orderId": "order123",
    "totalAmount": 3899.97,
    "status": "PENDING_API",
    "items": [
      {
        "productId": "abc123",
        "productName": "Grand Theft Auto V",
        "price": 1299.99,
        "quantity": 1
      }
    ],
    "message": "Заказ создан. Свяжитесь с поддержкой для оплаты и получения товаров."
  }
}`
      }
    }
  ]

  const current = endpoints.find(e => e.id === selectedEndpoint)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">API Документация</h1>
          <p className="text-gray-300">
            Руководство по интеграции MetaLib Shop API для ресейлеров
          </p>
        </div>

        {/* Основная информация */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Начало работы</h2>
          
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">1. Получение API ключа</h3>
              <p>Перейдите в раздел <a href="/profile/api-keys" className="text-blue-400 hover:underline">API Ключи</a> в вашем профиле и создайте новый ключ с нужными разрешениями.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">2. Аутентификация</h3>
              <p>Все запросы к API должны содержать заголовок с вашим API ключом:</p>
              <div className="bg-gray-900 rounded-lg p-4 mt-2 font-mono text-sm overflow-x-auto">
                <div>x-api-key: mk_your_api_key_here</div>
                <div className="text-gray-500 mt-1"># или</div>
                <div>Authorization: Bearer mk_your_api_key_here</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Base URL</h3>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                https://metalib-shop.com/api/v1
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">4. Rate Limits</h3>
              <p>API имеет ограничения по количеству запросов:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>100 запросов в минуту для чтения данных</li>
                <li>20 запросов в минуту для создания заказов</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">5. Коды ответов</h3>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><span className="text-green-400">200</span> - Успешный запрос</li>
                <li><span className="text-green-400">201</span> - Ресурс создан</li>
                <li><span className="text-yellow-400">400</span> - Ошибка в запросе</li>
                <li><span className="text-yellow-400">401</span> - Неверный API ключ</li>
                <li><span className="text-yellow-400">403</span> - Недостаточно прав</li>
                <li><span className="text-yellow-400">404</span> - Ресурс не найден</li>
                <li><span className="text-red-400">500</span> - Ошибка сервера</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Меню endpoints */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 sticky top-4">
              <h3 className="text-lg font-bold text-white mb-4">Endpoints</h3>
              <div className="space-y-2">
                {endpoints.map(endpoint => (
                  <button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpoint(endpoint.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                      selectedEndpoint === endpoint.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xs font-mono mb-1">{endpoint.method}</div>
                    <div className="text-sm font-semibold">{endpoint.title}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Детали endpoint */}
          <div className="lg:col-span-3">
            {current && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-lg font-mono text-sm font-bold ${
                    current.method === 'GET' ? 'bg-blue-600' : 'bg-green-600'
                  } text-white`}>
                    {current.method}
                  </span>
                  <span className="font-mono text-white">{current.path}</span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">{current.title}</h2>
                <p className="text-gray-300 mb-6">{current.description}</p>

                {/* Разрешение */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Требуемое разрешение</h3>
                  <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-lg font-mono text-sm">
                    {current.permission}
                  </span>
                </div>

                {/* Параметры */}
                {current.params.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Параметры</h3>
                    <div className="space-y-3">
                      {current.params.map(param => (
                        <div key={param.name} className="bg-gray-900/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-white">{param.name}</span>
                            <span className="text-xs text-gray-400">{param.type}</span>
                            {param.required && (
                              <span className="text-xs px-2 py-1 bg-red-600/30 text-red-300 rounded">
                                обязательный
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Пример */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Пример запроса</h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono">{current.example.curl}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Пример ответа</h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono">{current.example.response}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Поддержка */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Нужна помощь?</h2>
          <p className="text-gray-300 mb-4">
            Если у вас возникли вопросы по работе с API, обращайтесь в нашу поддержку:
          </p>
          <a
            href="/support"
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            Связаться с поддержкой
          </a>
        </div>
      </div>
    </div>
  )
}
