// Заглушка для Prisma Client
// Используется временно для сборки проекта
// После миграции на pg этот файл будет удалён

export const prisma = {
  user: {
    findUnique: async () => null,
    findMany: async () => [],
    findFirst: async () => null,
    create: async () => null,
    update: async () => null,
    delete: async () => null,
    count: async () => 0,
  },
  product: {
    findUnique: async () => null,
    findMany: async () => [],
    findFirst: async () => null,
    create: async () => null,
    update: async () => null,
    delete: async () => null,
    count: async () => 0,
  },
  category: {
    findUnique: async () => null,
    findMany: async () => [],
    findFirst: async () => null,
    create: async () => null,
    update: async () => null,
    delete: async () => null,
    upsert: async () => null,
    count: async () => 0,
  },
  order: {
    findUnique: async () => null,
    findMany: async () => [],
    findFirst: async () => null,
    create: async () => null,
    update: async () => null,
    delete: async () => null,
    count: async () => 0,
    aggregate: async () => ({ _sum: { totalAmount: 0 } }),
  },
  orderItem: {
    findMany: async () => [],
    create: async () => null,
    deleteMany: async () => null,
  },
  ticket: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
  },
  ticketMessage: {
    create: async () => null,
  },
  transaction: {
    findMany: async () => [],
    create: async () => null,
    count: async () => 0,
    aggregate: async () => ({ _sum: { amount: 0 } }),
  },
  verificationToken: {
    findUnique: async () => null,
    create: async () => null,
    delete: async () => null,
    deleteMany: async () => null,
  },
  favorite: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    delete: async () => null,
  },
  settings: {
    findUnique: async () => null,
    findMany: async () => [],
    upsert: async () => null,
  },
} as any

