import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import ReactQueryProvider from '@/utils/providers/reactQueryProvider'
import UploadingProgress from '@/components/ui/UploadingProgress'
import { FooterProvider } from '@/context/Footer'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'] // Specify the weights you need
})

export const metadata: Metadata = {
  title: 'Dava India | Admin',
  description: 'Dava India Admin Application',
  icons: { icon: '/favicon.svg' }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={montserrat.className}>
        <>
          <ReactQueryProvider>
            <ThemeProvider
              attribute='class'
              enableSystem
              disableTransitionOnChange
            >
              <FooterProvider>
                <main>{children}</main>
              </FooterProvider>
              <Toaster />
            </ThemeProvider>
          </ReactQueryProvider>
          <UploadingProgress />
        </>
      </body>
    </html>
  )
}
