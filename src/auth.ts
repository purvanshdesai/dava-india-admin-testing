import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'

import { handleServerAuthentication } from './utils/actions/authActions'

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google,
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        userType: {
          label: 'User Type',
          type: 'text',
          placeholder: 'super-admin or store-admin'
        }
      },
      authorize: async credentials => {
        const user = await handleServerAuthentication(credentials)
        return user
      }
    }),
    FacebookProvider({
      id: 'facebook-login',
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET
    })
  ],
  trustHost: true,
  pages: {
    signIn: '/login'
  },
  callbacks: {
    authorized({ request: { nextUrl }, auth }) {
      const isLoggedIn = !!auth?.user

      const { pathname } = nextUrl

      if (pathname.startsWith('/store-reset-password')) {
        return true
      }
      if (pathname.startsWith('/invitation')) {
        return true
      }
      if (pathname.startsWith('/login') && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl))
      }
      if (pathname.startsWith('/store/login')) {
        return true
      }
      if (pathname.startsWith('/store/forgot-password')) {
        return true
      }
      if (pathname.startsWith('/super-admin/forgot-password')) {
        return true
      }
      if (pathname.startsWith('/super-admin/reset-password')) {
        return true
      }

      return !!auth
    },
    async session({ session, token }: any) {
      if (token?._id) session.user.id = token?._id
      // Pass the access token from the JWT to the session object
      if (token?.accessToken) session.accessToken = token?.accessToken
      if (token?.role) session.user.role = token?.role
      if (token?.permissions) session.user.permissions = token?.permissions
      if (token?.storeIds) session.user.storeIds = token?.storeIds
      if (token?.stores) session.user.stores = token?.stores
      if (token?.name || token?.fullName)
        session.user.name = token?.name || token?.fullName

      // console.log(session)

      return session
    },
    async jwt({ token, user }: any) {
      if (user) {
        token._id = user._id as string
        token.accessToken = user.accessToken as string
        token.role = user?.role
        token.permissions = user?.permissions
        token.name = user?.name || user?.fullName

        if (user?.role == 'store-admin') {
          token.storeIds = user?.storeIds
          token.stores = user?.stores
          token.name = user?.stores?.length ? user?.stores[0].storeName : ''
        }
      }

      return token
    }
  }
})
