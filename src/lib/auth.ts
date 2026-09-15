import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Введите email и пароль')
        }

        const result = await query(
          'SELECT id, email, name, password, role, balance, email_verified FROM users WHERE email = ?',
          [credentials.email]
        )

        const user = result.rows[0]

        if (!user || !user.password) {
          throw new Error('Неверный email или пароль')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Неверный email или пароль')
        }

        // Разрешаем вход даже без подтверждения email
        // Проверка будет на уровне действий (покупки, пополнение)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          balance: Number(user.balance),
          emailVerified: user.email_verified ? new Date(user.email_verified) : null,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Разрешаем вход всем пользователям, даже без подтверждения email
      return true
    },
    async jwt({ token, user }) {
      console.log('JWT Callback - user:', user ? { id: user.id, email: user.email, role: user.role } : 'none')
      console.log('JWT Callback - token before:', { id: token.id, role: token.role })
      
      if (user) {
        token.role = user.role
        token.id = user.id
        token.balance = (user as any).balance || 0
        token.emailVerified = user.emailVerified
        console.log('JWT Callback - set from user, role:', token.role)
      }
      
      // Обновляем баланс при каждом запросе
      if (token.id) {
        try {
          const result = await query(
            'SELECT balance, role, email_verified FROM users WHERE id = ?',
            [token.id as string]
          )
          const dbUser = result.rows[0]
          if (dbUser) {
            token.balance = Number(dbUser.balance)
            token.role = dbUser.role
            token.emailVerified = dbUser.email_verified ? new Date(dbUser.email_verified) : null
            console.log('JWT Callback - updated from DB, role:', token.role, 'from DB:', dbUser.role)
          }
        } catch (error) {
          console.error('Error updating JWT token:', error)
          // Возвращаем токен без обновления, чтобы не сбрасывать сессию
        }
      }
      
      console.log('JWT Callback - token after:', { id: token.id, role: token.role })
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.balance = token.balance as number
        session.user.emailVerified = token.emailVerified as Date | null | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Включаем debug для всех режимов
}
