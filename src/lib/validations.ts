import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

export const productSchema = z.object({
  name: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().optional(),
  price: z.number().positive('Цена должна быть положительным числом'),
  category: z.enum(['GAME', 'STEAM_WALLET', 'DLC', 'SUBSCRIPTION', 'OTHER']),
  stock: z.number().int().nonnegative('Количество не может быть отрицательным'),
  image: z.string().url('Введите корректный URL изображения').optional(),
  nsGiftsId: z.string().optional(),
})

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1, 'Корзина не может быть пустой'),
  steamProfileUrl: z.string().url('Введите корректную ссылку на Steam профиль').optional(),
  deliveryEmail: z.string().email('Введите корректный email для доставки').optional(),
}).refine((data) => data.steamProfileUrl || data.deliveryEmail, {
  message: 'Укажите Steam профиль или email для доставки',
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProductInput = z.infer<typeof productSchema>
export type OrderInput = z.infer<typeof orderSchema>
