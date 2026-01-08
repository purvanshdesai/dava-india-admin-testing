export { auth as middleware } from '@/auth'

export const config = {
  matcher: [
    // '/admin(.*)',
    '/((?!forgot-password|!api|_next/static|_next/image|images|favicon.ico).*)'
  ]
}
