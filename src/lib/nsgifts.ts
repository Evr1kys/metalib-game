import axios, { AxiosInstance } from 'axios'

export class NSGiftsAPI {
  private client: AxiosInstance
  private token: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NS_GIFTS_API_URL || 'https://api.ns.gifts',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    // Если есть API ключ, используем его сразу
    if (process.env.NS_GIFTS_API_KEY) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${process.env.NS_GIFTS_API_KEY}`
    }
  }

  /**
   * Авторизация в API
   */
  async auth() {
    if (this.token) return this.token

    try {
      console.log('Trying NS.Gifts auth endpoint: /api/v1/get_token')
      const response = await this.client.post('/api/v1/get_token', {
        email: process.env.NS_GIFTS_LOGIN,
        password: process.env.NS_GIFTS_PASSWORD,
      })
      
      this.token = response.data.access_token
      if (this.token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        console.log('NS.Gifts auth successful')
        return this.token
      }
      
      throw new Error('No access_token in response')
    } catch (error: any) {
      console.error('NS.Gifts API Error - auth:', error.response?.data || error.message)
      throw new Error('Ошибка авторизации в NS.Gifts API')
    }
  }

  /**
   * Получить список доступных товаров
   */
  async getProducts() {
    try {
      // Попробуем без авторизации (если используется API ключ)
      if (process.env.NS_GIFTS_API_KEY) {
        const response = await this.client.get('/products')
        return response.data
      }
      
      // Иначе используем авторизацию
      await this.auth()
      const response = await this.client.get('/products')
      return response.data
    } catch (error: any) {
      console.error('NS.Gifts API Error - getProducts:', error.response?.data || error.message)
      
      // Если товары не найдены, попробуем альтернативные endpoints
      const endpoints = ['/products', '/api/products', '/v1/products', '/goods', '/items']
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying products endpoint: ${endpoint}`)
          const response = await this.client.get(endpoint)
          return response.data
        } catch (err) {
          continue
        }
      }
      
      throw new Error('Не удалось получить список товаров')
    }
  }

  /**
   * Получить информацию о конкретном товаре
   */
  async getProduct(productId: string) {
    try {
      await this.auth()
      const response = await this.client.get(`/products/${productId}`)
      return response.data
    } catch (error) {
      console.error('NS.Gifts API Error - getProduct:', error)
      throw new Error('Не удалось получить информацию о товаре')
    }
  }

  /**
   * Создать заказ
   */
  async createOrder(data: {
    productId: string
    quantity: number
    email: string
    steamProfileUrl?: string
    customData?: any
  }) {
    try {
      await this.auth()
      const response = await this.client.post('/orders', {
        product_id: data.productId,
        quantity: data.quantity,
        customer_email: data.email,
        steam_profile_url: data.steamProfileUrl,
        custom_data: data.customData,
      })
      return response.data
    } catch (error) {
      console.error('NS.Gifts API Error - createOrder:', error)
      throw new Error('Не удалось создать заказ')
    }
  }

  /**
   * Получить статус заказа
   */
  async getOrderStatus(orderId: string) {
    try {
      await this.auth()
      const response = await this.client.get(`/orders/${orderId}`)
      return response.data
    } catch (error) {
      console.error('NS.Gifts API Error - getOrderStatus:', error)
      throw new Error('Не удалось получить статус заказа')
    }
  }

  /**
   * Получить баланс магазина
   */
  async getBalance() {
    try {
      await this.auth()
      
      const response = await this.client.post('/api/v1/check_balance')
      const balanceUsd = parseFloat(response.data) || 0
      
      // Баланс NSGifts в долларах, конвертируем в рубли
      const currencies = await this.getCurrencies()
      const rubRate = currencies.find((c: any) => c.code === 'RUB')?.rate || 92.5
      const balanceRub = balanceUsd * rubRate
      
      return {
        usd: balanceUsd,
        rub: balanceRub
      }
    } catch (error) {
      console.error('NS.Gifts API Error - getBalance:', error)
      return { rub: 0, usd: 0 }
    }
  }

  /**
   * Получить курсы валют
   */
  async getCurrencies() {
    try {
      await this.auth()
      
      const endpoints = [
        '/currencies',
        '/api/currencies',
        '/v1/currencies',
        '/rates',
        '/api/rates'
      ]

      for (const endpoint of endpoints) {
        try {
          const response = await this.client.get(endpoint)
          if (response.data) {
            return Array.isArray(response.data) 
              ? response.data 
              : response.data.data || response.data.currencies || []
          }
        } catch (err) {
          continue
        }
      }

      // If no endpoint works, return mock data
      return [
        { code: 'USD', rate: 1, name: 'US Dollar' },
        { code: 'EUR', rate: 0.92, name: 'Euro' },
        { code: 'RUB', rate: 92.5, name: 'Russian Ruble' },
        { code: 'UAH', rate: 37.8, name: 'Ukrainian Hryvnia' },
      ]
    } catch (error) {
      console.error('NS.Gifts API Error - getCurrencies:', error)
      return []
    }
  }

  /**
   * Проверить доступность товара
   */
  async checkAvailability(productId: string, quantity: number) {
    try {
      await this.auth()
      const response = await this.client.post('/products/check-availability', {
        product_id: productId,
        quantity,
      })
      return response.data
    } catch (error) {
      console.error('NS.Gifts API Error - checkAvailability:', error)
      return { available: false }
    }
  }

  /**
   * Получить курс валют для Steam
   */
  async getSteamCurrencyRate() {
    try {
      await this.auth()
      const response = await this.client.post('/api/v1/steam/get_currency_rate')
      return response.data
    } catch (error: any) {
      console.error('NS.Gifts API Error - getSteamCurrencyRate:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Рассчитать сумму для пополнения Steam
   */
  async calculateSteamAmount(amount: number) {
    try {
      await this.auth()
      const response = await this.client.post('/api/v1/steam/get_amount', {
        amount: amount
      })
      return response.data
    } catch (error: any) {
      console.error('NS.Gifts API Error - calculateSteamAmount:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Получить список доступных Steam игр/приложений
   */
  async getSteamApps() {
    try {
      await this.auth()
      const response = await this.client.post('/api/v1/steam_gift/get_apps')
      return response.data
    } catch (error: any) {
      console.error('NS.Gifts API Error - getSteamApps:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Рассчитать стоимость Steam подарка
   */
  async calculateSteamGift(data: { sub_id: number; region: string }) {
    try {
      await this.auth()
      const response = await this.client.post('/api/v1/steam_gift/calculate', {
        sub_id: data.sub_id,
        region: data.region || 'ru'
      })
      return response.data
    } catch (error: any) {
      console.error('NS.Gifts API Error - calculateSteamGift:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Создать заказ на Steam подарок
   */
  async createSteamGiftOrder(data: {
    friendLink: string
    sub_id: number
    region: string
    giftName: string
    giftDescription: string
  }) {
    try {
      await this.auth()
      const response = await this.client.post('/api/v1/steam_gift/create_order', {
        friendLink: data.friendLink,
        sub_id: data.sub_id,
        region: data.region || 'ru',
        giftName: data.giftName,
        giftDescription: data.giftDescription
      })
      return response.data
    } catch (error: any) {
      console.error('NS.Gifts API Error - createSteamGiftOrder:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Оплатить заказ Steam подарка
   */
  async paySteamGiftOrder(customId: string) {
    try {
      await this.auth()
      const response = await this.client.post('/api/v1/steam_gift/pay_order', {
        custom_id: customId
      })
      return response.data
    } catch (error: any) {
      console.error('NS.Gifts API Error - paySteamGiftOrder:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Пополнить Steam по логину (прямое пополнение, без кодов)
   * Примечание: NSGifts использует систему Steam Gift, а не прямое пополнение
   */
  async topupSteam(data: {
    steamLogin: string
    amount: number
    email?: string
  }) {
    try {
      await this.auth()
      
      // NSGifts не поддерживает прямое пополнение Steam кошелька
      // Вместо этого они работают через Steam подарки
      // Для пополнения кошелька используется другой механизм
      
      console.log('Steam topup requested, but NSGifts uses gift system')
      return {
        success: false,
        error: 'Прямое пополнение Steam не поддерживается. Используйте покупку Steam подарков или другой метод.'
      }
      
    } catch (error: any) {
      console.error('NS.Gifts API Error - topupSteam:', error.response?.data || error.message)
      return {
        success: false,
        error: error.message || 'Не удалось выполнить пополнение Steam'
      }
    }
  }
}

export const nsGiftsAPI = new NSGiftsAPI()
