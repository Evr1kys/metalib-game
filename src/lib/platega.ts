import axios, { AxiosInstance } from 'axios'

interface PlategaConfig {
  apiKey: string
  shopId: string
  baseURL?: string
}

interface CreatePaymentParams {
  amount: number
  currency?: string
  description: string
  successUrl?: string
  failUrl?: string
  metadata?: Record<string, any>
  paymentMethod?: number
}

interface PaymentResponse {
  transactionId: string
  redirect: string
  status: string
  paymentDetails: string
  expiresIn: string
}

export class PlategaAPI {
  private client: AxiosInstance
  private shopId: string

  constructor(config: PlategaConfig) {
    this.shopId = config.shopId
    this.client = axios.create({
      baseURL: config.baseURL || 'https://app.platega.io',
      headers: {
        'Content-Type': 'application/json',
        'X-MerchantId': config.shopId,
        'X-Secret': config.apiKey,
      },
      timeout: 30000,
    })
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    try {
      const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payments/callback`
      
      const response = await this.client.post('/transaction/process', {
        paymentMethod: params.paymentMethod || 2,
        paymentDetails: {
          amount: params.amount,
          currency: params.currency || 'RUB',
        },
        description: params.description,
        return: params.successUrl || `${process.env.NEXTAUTH_URL}/balance`,
        failedUrl: params.failUrl || `${process.env.NEXTAUTH_URL}/balance`,
        callback: callbackUrl,
        payload: JSON.stringify(params.metadata || {}),
      })

      console.log('Platega payment created:', {
        transactionId: response.data.transactionId,
        callbackUrl,
      })

      return {
        transactionId: response.data.transactionId,
        redirect: response.data.redirect,
        status: response.data.status,
        paymentDetails: response.data.paymentDetails,
        expiresIn: response.data.expiresIn,
      }
    } catch (error: any) {
      console.error('Platega API Error:', error.response?.data || error.message)
      if (error.response) {
        throw new Error(error.response.data?.message || 'Ошибка создания платежа')
      }
      throw new Error('Ошибка создания платежа')
    }
  }

  async getPaymentStatus(transactionId: string): Promise<any> {
    try {
      const response = await this.client.get(`/transaction/${transactionId}`)
      return response.data
    } catch (error: any) {
      console.error('Platega API Error:', error.response?.data || error.message)
      throw new Error('Ошибка получения статуса платежа')
    }
  }

  verifyCallback(signature: string, body: string, secret: string): boolean {
    const crypto = require('crypto')
    const hash = crypto.createHmac('sha256', secret).update(body).digest('hex')
    return hash === signature
  }
}

let platega: PlategaAPI | null = null

export function getPlatega(): PlategaAPI {
  if (!platega) {
    if (!process.env.PLATEGA_API_KEY || !process.env.PLATEGA_SHOP_ID) {
      throw new Error('Platega API credentials not configured')
    }

    platega = new PlategaAPI({
      apiKey: process.env.PLATEGA_API_KEY,
      shopId: process.env.PLATEGA_SHOP_ID,
    })
  }

  return platega
}
