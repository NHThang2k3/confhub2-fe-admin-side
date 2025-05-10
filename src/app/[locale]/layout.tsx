// src/app/[locale]/layout.tsx (hoặc đường dẫn tương tự)

import React from 'react'
import { ThemeProvider } from '@/src/app/[locale]/utils/ThemeProvider'
import type { Metadata } from 'next'
import {
  AbstractIntlMessages,
  NextIntlClientProvider,
  useMessages
} from 'next-intl'
import localFont from 'next/font/local'
import NextTopLoader from 'nextjs-toploader'
import { ToastContainer } from 'react-toastify' // <--- Import ToastContainer
import 'react-toastify/dist/ReactToastify.css' // <--- Import CSS cho react-toastify
import './globals.css'

// ... (Phần định nghĩa fonts: spaceGrotesk, inter, rubik)
const spaceGrotesk = localFont({
  src: [
    {
      path: '../../../public/fonts/SpaceGrotesk-Regular.ttf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../../public/fonts/SpaceGrotesk-Bold.ttf',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--font-space-grotesk',
  display: 'swap'
})
const inter = localFont({
  src: [
    {
      path: '../../../public/fonts/Inter_18pt-Regular.ttf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../../public/fonts/Inter_18pt-Bold.ttf',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--inter',
  display: 'swap'
})
const rubik = localFont({
  src: [
    {
      path: '../../../public/fonts/Rubik-Regular.ttf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../../public/fonts/Rubik-Bold.ttf',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--rubik',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Global Conference Hub',
  description:
    'ConFHub is a comprehensive platform for managing and discovering academic conferences and journals.',
  keywords:
    'conferences, academic conferences, conference management, research conferences',
  authors: [{ name: 'ConFHub Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow'
}

export default function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = useMessages()
  return (
    <html
      lang={locale}
      dir={locale === 'ar' || locale == 'fa' ? 'rtl' : 'ltr'}
      className={`${spaceGrotesk.variable} ${rubik.variable} scroll-smooth scrollbar scrollbar-track-background scrollbar-thumb-background-secondary  `}
      suppressHydrationWarning
    >
      <head>
        {/* Google Fonts link đã có */}
        <link
          href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block'
          rel='stylesheet'
        />
      </head>
      <body>
        {/* --- ThemeProvider bao bọc mọi thứ để ToastContainer có thể nhận theme --- */}
        <ThemeProvider
          enableSystem
          attribute='class'
          defaultTheme='light'
          themes={[
            'light',
            'dark',
            'instagram',
            'facebook',
            'discord',
            'netflix',
            'twilight',
            'reddit'
          ]}
        >
          {/* --- ToastContainer đặt ở đây --- */}
          {/* Có thể thêm props để tùy chỉnh, ví dụ: position, autoClose, theme */}
          <ToastContainer
            position='top-right' // Vị trí hiển thị (phổ biến)
            autoClose={3000} // Tự động đóng sau 3 giây
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={locale === 'ar' || locale === 'fa'} // Hỗ trợ RTL nếu cần
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme='colored' // Sử dụng theme màu ('light', 'dark', 'colored') - 'colored' sẽ có màu theo type (success, error,...)
          />

          {/* --- NextIntlClientProvider --- */}
          <NextIntlClientProvider
            locale={locale}
            messages={messages as AbstractIntlMessages}
          >
            {/* --- NextTopLoader --- */}
            <NextTopLoader
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              easing='ease'
              speed={200}
              shadow='0 0 10px #2299DD,0 0 5px #2299DD'
              color='var(--primary)'
              showSpinner={false}
            />
            {/* --- Nội dung chính của trang --- */}
            <main className='mx-auto max-w-screen-2xl'>{children}</main>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
