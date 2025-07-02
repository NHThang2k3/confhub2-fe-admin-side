// src/app/[locale]/dashboard/submitPapers/page.tsx
'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import { useTranslations } from 'next-intl'
import { Send } from 'lucide-react' // Import icon Send

export default function SubmitPapersPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('SubmitPapersPage')
  const { isLoggedIn, isInitializing, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isInitializing) {
      return // Đợi quá trình khởi tạo xác thực hoàn tất
    }

    if (!isLoggedIn) {
      // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
      router.replace(`/${locale}/auth/login`)
    }
    // Nếu đã đăng nhập, không làm gì cả, component sẽ render nội dung
  }, [isLoggedIn, isInitializing, locale, router])

  // Hiển thị trạng thái tải hoặc xác thực
  if (isInitializing || isLoading) {
    return (
      <div className='flex min-h-[50vh] w-full items-center justify-center'>
        <p className='text-lg text-gray-600'>{t('AuthStatus_Loading')}</p>
      </div>
    )
  }

  // Nếu chưa đăng nhập (sau khi isInitializing hoàn tất), không render gì cả
  if (!isLoggedIn) {
    return null
  }

  // Nếu đã đăng nhập, hiển thị nội dung "Tính năng đang phát triển"
  return (
    <div className='flex min-h-[calc(100vh-var(--header-height))] flex-col items-center justify-center p-4 text-center'>
      <Send size={64} className='mb-6 text-blue-500' />
      <h1 className='mb-4 text-3xl font-bold text-gray-800'>
        {t('Feature_Under_Development_Title')}
      </h1>
      <p className='max-w-md text-lg text-gray-600'>
        {t('Feature_Under_Development_Message')}
      </p>
      <p className='mt-2 text-md text-gray-500'>
        {t('Thank_You_For_Patience')}
      </p>
    </div>
  )
}