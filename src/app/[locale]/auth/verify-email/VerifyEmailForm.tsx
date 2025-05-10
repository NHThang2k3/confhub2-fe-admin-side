// app/[locale]/auth/verify-email/VerifyEmailForm.tsx
'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/src/navigation'
import { appConfig } from '@/src/middleware'
import { useTranslations } from 'next-intl'

interface VerifyEmailFormProps {
  // Có thể thêm props nếu cần, ví dụ: t cho i18n
  // t: (key: string) => string;
}

// Define the cooldown duration in seconds
const RESEND_COOLDOWN_SECONDS = 60

const VerifyEmailForm: React.FC<VerifyEmailFormProps> = () => {
  const t = useTranslations('')
  const searchParams = useSearchParams()

  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // State for resend functionality
  const [isResending, setIsResending] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendSuccessMessage, setResendSuccessMessage] = useState<
    string | null
  >(null)
  const [cooldown, setCooldown] = useState(0) // Cooldown timer in seconds

  // useEffect(() => {}, [searchParams])

  // Effect to handle the cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1)
      }, 1000)
      return () => clearTimeout(timer) // Cleanup the timer
    }
  }, [cooldown])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null) // Reset success message on new submit attempt
    setResendError(null) // Also clear resend errors on new submit
    setResendSuccessMessage(null) // Also clear resend success on new submit

    if (!code) {
      setError(t('verifyEmail.error.missingFields')) // Nên dùng t('verifyEmail.error.missingFields')
      return
    }
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError(t('verifyEmail.error.invalidCodeFormat'))
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError(t('verifyEmail.error.noToken')) // Handle case where token is missing
        setIsLoading(false)
        return
      }
      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // Thêm token vào header
          },
          body: JSON.stringify({ code })
        }
      )

      const data = await response.json()

      if (response.ok) {
        // Status 200
        // Chỉ cần set message thành công, không cần redirect tự động nữa
        setSuccessMessage(data.message || t('verifyEmail.success.message'))
        setCode('') // Xóa code khỏi input
        // --- BỎ PHẦN TỰ ĐỘNG CHUYỂN HƯỚNG ---
        // setTimeout(() => {
        //     const localePrefix = pathname.split('/')[1];
        //     const pathWithLocale = `/${localePrefix}/auth/login`;
        //     router.push(pathWithLocale);
        // }, 3000);
        // --- KẾT THÚC BỎ ---
      } else {
        // Lỗi từ backend (400, 404, 500)
        setError(data.message || t('verifyEmail.error.backendFailed'))
      }
    } catch (err: any) {
      console.error('Verification error:', err)
      if (err.message === 'Failed to fetch') {
        setError(t('verifyEmail.error.network'))
      } else {
        setError(t('verifyEmail.error.generic')) // Use a generic error message
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setResendError(null) // Clear previous resend errors
    setResendSuccessMessage(null) // Clear previous resend success messages
    setError(null) // Also clear general errors
    setSuccessMessage(null) // Also clear general success messages

    // Prevent resend if already resending or in cooldown
    if (isResending || cooldown > 0) {
      return
    }

    setIsResending(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setResendError(t('verifyEmail.error.noToken')) // Handle case where token is missing
        setIsResending(false)
        return
      }

      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/re-send-verify`,
        {
          method: 'GET', // Corrected based on image provided
          headers: {
            // 'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
          // Often no body is needed for resend if the token identifies the user
          // body: JSON.stringify({})
        }
      )

      const data = await response.json()

      if (response.ok) {
        // Success (e.g., 200 or 201)
        setResendSuccessMessage(data.message || t('verifyEmail.resendSuccess'))
        setCooldown(RESEND_COOLDOWN_SECONDS) // Start cooldown
      } else {
        // Error from backend
        setResendError(data.message || t('verifyEmail.resendError'))
        // Consider checking specific status codes if needed (e.g., 429 Too Many Requests)
        if (response.status === 429) {
          // Example for rate limiting
          // Maybe get cooldown time from backend if provided
        }
      }
    } catch (err: any) {
      // Use 'any' or specific error type
      console.error('Resend error:', err)
      if (err.message === 'Failed to fetch') {
        setResendError(t('verifyEmail.error.network'))
      } else {
        setResendError(t('verifyEmail.error.generic'))
      }
    } finally {
      setIsResending(false)
    }
  }

  // ---- CÁC THAY ĐỔI TRONG JSX ----
  return (
    <div className='space-y-6'>
      {' '}
      {/* Đổi form thành div hoặc giữ form nhưng không submit nếu đã thành công */}
      {/* Thông báo thành công */}
      {successMessage && (
        <div className='rounded-md bg-green-50 p-4'>
          <div className='flex'>
            <div className='ml-3'>
              <p className='text-sm font-medium text-green-800'>
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Thông báo lỗi */}
      {error && !successMessage && (
        <div className='rounded-md bg-red-50 p-4'>
          {/* ... icon lỗi ... */}
          <div className='ml-3'>
            <p className='text-sm text-red-700'>{error}</p>
          </div>
        </div>
      )}
      {/* Thông báo thành công resend */}
      {resendSuccessMessage && (
        <div className='rounded-md bg-green-50 p-4'>
          <div className='flex'>
            {/* Icon success */}
            <div className='ml-3'>
              <p className='text-sm font-medium text-green-800'>
                {resendSuccessMessage}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Thông báo lỗi resend */}
      {resendError && (
        <div className='rounded-md bg-red-50 p-4'>
          {/* Icon lỗi */}
          <div className='ml-3'>
            <p className='text-sm text-red-700'>{resendError}</p>
          </div>
        </div>
      )}
      {/* Chỉ hiển thị form nhập liệu KHI CHƯA thành công */}
      {!successMessage && (
        <form className='space-y-6' onSubmit={handleSubmit}>
          {/* Input Email */}

          {/* Input Verification Code */}
          <div>
            <label htmlFor='code' className='block text-sm font-medium '>
              {t('verifyEmail.codeLabel')}
            </label>
            <div className='mt-1'>
              <input
                id='code'
                name='code'
                type='text'
                inputMode='numeric'
                maxLength={6}
                required
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm'
                placeholder={t('verifyEmail.codePlaceholder')}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type='submit'
              disabled={isLoading} // Không cần disable khi thành công nữa vì nút này sẽ bị ẩn
              className='hover:bg-button/90 flex w-full justify-center rounded-md border border-transparent bg-button px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 disabled:opacity-50'
            >
              {isLoading
                ? t('verifyEmail.verifying')
                : t('verifyEmail.submitButton')}
            </button>
          </div>

          {/* Link phụ */}
          <div className='text-center text-sm'>
            <span className='text-gray-600'>
              {t('verifyEmail.noCode')} {/* Nên dùng t('verifyEmail.noCode') */}{' '}
            </span>
            {/* Có thể thêm link gửi lại code nếu cần */}
            {/* Resend Button/Link - Conditional rendering based on cooldown and loading */}
            {cooldown > 0 ? (
              <span className='text-gray-500'>
                {t('verifyEmail.resendCooldown', { seconds: cooldown })}
              </span>
            ) : (
              // Use a button styled as a link for accessibility and correct semantic meaning (action vs navigation)
              <button
                type='button' // Important: type="button" to prevent form submission
                onClick={handleResend}
                disabled={isResending} // Disable button when resending
                className='hover:text-button/80 font-medium text-button focus:underline focus:outline-none disabled:cursor-not-allowed disabled:opacity-50' // Add focus styles for accessibility
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer'
                }} // Style to look like a link
              >
                {isResending
                  ? t('verifyEmail.resending')
                  : t('verifyEmail.resendLink')}
              </button>
            )}
            <span className='text-gray-600'> {t('Common.or')} </span>{' '}
            <Link
              href='/auth/login'
              className='hover:text-button/80 font-medium text-button'
            >
              {t('verifyEmail.backToLogin')}
            </Link>
          </div>
        </form>
      )}
      {/* ---- HIỂN THỊ NÚT QUAY VỀ LOGIN KHI THÀNH CÔNG ---- */}
      {successMessage && (
        <div className='mt-6'>
          {' '}
          {/* Thêm khoảng cách trên nếu cần */}
          <Link
            href='/auth/login' // Quan trọng: Dùng đường dẫn không có locale, Link của next-intl sẽ tự xử lý
            className='hover:bg-button/90 flex w-full justify-center rounded-md border border-transparent bg-button px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
          >
            {t('verifyEmail.returnToHomeButton')}
          </Link>
        </div>
      )}
      {/* ---- KẾT THÚC NÚT QUAY VỀ ---- */}
    </div>
  )
}

export default VerifyEmailForm
