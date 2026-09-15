import 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: string
    balance?: number
    emailVerified?: Date | null
    steamProfileUrl?: string | null
    steamVerified?: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role?: string
      balance?: number
      emailVerified?: Date | null
      steamProfileUrl?: string | null
      steamVerified?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
    balance?: number
    emailVerified?: Date | null
    steamProfileUrl?: string | null
    steamVerified?: boolean
  }
}
