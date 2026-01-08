import { SessionProvider } from 'next-auth/react'
import AdminLayout from '@/components/layouts/admin'
import StartUp from '@/components/StartUp'

export default function AdminLayoutMain({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionProvider>
      <AdminLayout>{children}</AdminLayout>
      <StartUp />
    </SessionProvider>
  )
}
