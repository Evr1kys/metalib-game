import { hasSQLInjection, sanitizeInput, validateEmail } from './security'

// Типы валидации
export type ValidationRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
  sanitize?: boolean
}

export type ValidationSchema = {
  [key: string]: ValidationRule
}

export type ValidationResult = {
  valid: boolean
  errors: { [key: string]: string }
  sanitized?: { [key: string]: any }
}

// Основная функция валидации
export function validateData(
  data: any,
  schema: ValidationSchema
): ValidationResult {
  const errors: { [key: string]: string } = {}
  const sanitized: { [key: string]: any } = {}

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field]

    // Проверка обязательности
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `Поле ${field} обязательно`
      continue
    }

    // Если поле не обязательное и пустое, пропускаем
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue
    }

    // Проверка типа string
    if (typeof value === 'string') {
      // Проверка на SQL injection
      if (hasSQLInjection(value)) {
        errors[field] = `Поле ${field} содержит недопустимые символы`
        continue
      }

      // Проверка минимальной длины
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `Поле ${field} должно содержать минимум ${rules.minLength} символов`
        continue
      }

      // Проверка максимальной длины
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `Поле ${field} должно содержать максимум ${rules.maxLength} символов`
        continue
      }

      // Проверка по паттерну
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = `Поле ${field} имеет неверный формат`
        continue
      }

      // Санитизация
      if (rules.sanitize) {
        sanitized[field] = sanitizeInput(value)
      } else {
        sanitized[field] = value
      }
    } else {
      sanitized[field] = value
    }

    // Кастомная валидация
    if (rules.custom && !rules.custom(value)) {
      errors[field] = `Поле ${field} не прошло валидацию`
      continue
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: Object.keys(errors).length === 0 ? sanitized : undefined
  }
}

// Предопределенные схемы валидации
export const schemas = {
  // Регистрация пользователя
  userRegistration: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      sanitize: true
    },
    email: {
      required: true,
      maxLength: 255,
      custom: (value: string) => validateEmail(value)
    },
    password: {
      required: true,
      minLength: 8,
      maxLength: 100
    }
  },

  // Создание/обновление продукта
  product: {
    name: {
      required: true,
      minLength: 3,
      maxLength: 255,
      sanitize: true
    },
    description: {
      required: false,
      maxLength: 5000,
      sanitize: true
    },
    price: {
      required: true,
      custom: (value: any) => typeof value === 'number' && value > 0 && value < 1000000
    },
    stock: {
      required: false,
      custom: (value: any) => typeof value === 'number' && value >= 0 && value < 1000000
    },
    image: {
      required: false,
      maxLength: 500,
      pattern: /^https?:\/\/.+/
    }
  },

  // Создание категории
  category: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      sanitize: true
    },
    slug: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-z0-9-]+$/
    },
    description: {
      required: false,
      maxLength: 500,
      sanitize: true
    }
  },

  // Создание тикета
  ticket: {
    subject: {
      required: true,
      minLength: 5,
      maxLength: 200,
      sanitize: true
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 5000,
      sanitize: true
    }
  },

  // Сообщение в тикете
  ticketMessage: {
    message: {
      required: true,
      minLength: 1,
      maxLength: 5000,
      sanitize: true
    }
  },

  // Настройки
  settings: {
    key: {
      required: true,
      minLength: 1,
      maxLength: 100,
      pattern: /^[A-Z_]+$/
    },
    value: {
      required: true,
      maxLength: 1000
    }
  },

  // Рассылка
  newsletter: {
    subject: {
      required: true,
      minLength: 5,
      maxLength: 200,
      sanitize: true
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 10000,
      sanitize: true
    },
    target: {
      required: true,
      custom: (value: any) => ['ALL', 'WITH_ORDERS', 'ACTIVE'].includes(value)
    }
  },

  // Обновление пользователя (админ)
  userUpdate: {
    email: {
      required: false,
      maxLength: 255,
      custom: (value: any) => !value || validateEmail(value)
    },
    name: {
      required: false,
      minLength: 2,
      maxLength: 100,
      sanitize: true
    },
    role: {
      required: false,
      custom: (value: any) => !value || ['user', 'admin'].includes(value)
    },
    balance: {
      required: false,
      custom: (value: any) => typeof value === 'number' && value >= 0 && value < 1000000
    }
  },

  // Заказ
  order: {
    steamProfileUrl: {
      required: false,
      maxLength: 500,
      pattern: /^https?:\/\/(steamcommunity\.com|steam\.com)\/.+/
    },
    deliveryEmail: {
      required: false,
      maxLength: 255,
      custom: (value: any) => !value || validateEmail(value)
    }
  }
}

// Валидация ID (UUID или числовой)
export function validateId(id: string): boolean {
  // UUID v4 pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  // Числовой ID
  const numericPattern = /^\d+$/
  
  return uuidPattern.test(id) || numericPattern.test(id)
}

// Валидация цены
export function validatePrice(price: any): boolean {
  if (typeof price !== 'number') {
    return false
  }
  return price > 0 && price < 1000000 && Number.isFinite(price)
}

// Валидация количества
export function validateQuantity(quantity: any): boolean {
  if (typeof quantity !== 'number') {
    return false
  }
  return quantity >= 0 && quantity < 1000000 && Number.isInteger(quantity)
}

// Валидация URL
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// Экспорт готовой функции для быстрой валидации
export function quickValidate(data: any, schemaName: keyof typeof schemas): ValidationResult {
  return validateData(data, schemas[schemaName])
}
