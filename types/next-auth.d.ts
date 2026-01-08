import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    _id: string
    accessToken: string
    role?: any
    name: string
  }

  interface Session {
    user: User
    accessToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id: string
    accessToken: string
  }
}
