'use server'
import { signIn, signOut } from '@/auth'
import { CredentialsSignin } from 'next-auth'
import axios from 'axios'
import { signInSchema } from '@/lib/zod'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

const handleCredentialSignIn = async (
  formData: any,
  isSuperAdmin?: boolean
) => {
  try {
    const { email, password } = formData

    if (!email || !password)
      throw new CredentialsSignin('Please provide email & password!')

    const parsedCredentials = signInSchema.safeParse({ email, password })

    if (!parsedCredentials.success) {
      console.log('Validation Error', parsedCredentials?.error?.errors)
      throw new Error('Validation Error!')
    }
    // if (isSuperAdmin) {
    await signIn('credentials', {
      email: email,
      password: password,
      redirect: false,
      userType: isSuperAdmin ? 'super-admin' : 'store-admin'
    })
    redirect('/')

    // redirect(
    //   callbackUrl ? callbackUrl : isSuperAdmin ? '/stores' : '/store/orders'
    // )
  } catch (e: any) {
  if (e instanceof AuthError && 'type' in e) {
    switch (e.type) {
      case 'CredentialsSignin':
        throw new Error('Invalid Credentials!')
        
      default:
        throw new Error('Something went wrong')
    }
  }

  throw e
}

}

const handleServerAuthentication = async (credentials: any) => {
  try {
    // Make a request to the FeathersJS authentication endpoint
    let response = null
    if (credentials?.userType == 'super-admin') {
      response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/super-admin/authentication`,
        {
          strategy: 'credentials-super-admin',
          email: credentials?.email,
          password: credentials?.password
        }
      )
    } else if (credentials?.userType == 'store-admin') {
      response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/store-admin/authentication`,
        {
          strategy: 'credentials-store-admin',
          email: credentials?.email,
          password: credentials?.password
        }
      )
    }
    if (!response) throw new Error('No user found')

    const user = response.data.user // Extract user data
    const accessToken = response.data.accessToken // Extract access_token from Feathers

    console.log(response.data)

    if (user && accessToken) {
      // Return the user object and access token
      return { ...user, accessToken }
    } else return null // Authentication failed
  } catch (e: any) {
    const error = e?.response?.data
    console.log(error)
    return null
  }
}

async function handleGoogleSignIn() {
  await signIn('google', { redirectTo: '/' })
}

const handleSignOut = async (role?: string) => {
  let redirectTo = '/login'
  if (role === 'store-admin') redirectTo = '/store/login'
  await signOut({ redirectTo })
}

const register = async () => {}

export {
  handleCredentialSignIn,
  handleServerAuthentication,
  handleGoogleSignIn,
  handleSignOut,
  register
}
