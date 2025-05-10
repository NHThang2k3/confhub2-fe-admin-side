'use client'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { appConfig } from '@/src/middleware'


const ForgotPasswordForm = () => {
  const t = useTranslations('')
  const params = useParams()
  const locale = params.locale as string
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      await axios.post(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/forgot-password`, {
        email
      })
      setSuccess(t('Reset_code_sent'))
      setStep('reset')
    } catch (err: any) {
      if (err.response?.data?.message && err.response?.status !== 500) {
        setError(err.response.data.message)
      } else {
        setError(t('Failed_to_send_reset_code'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      await axios.post(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/reset-password`, {
        email,
        code,
        newPassword
      })
      setSuccess(t('Password_reset_successful'))
      // Redirect to login after 2 seconds with locale
      setTimeout(() => {
        window.location.href = `/${locale}/auth/login`
      }, 2000)
    } catch (err: any) {
      if (err.response?.data?.message && err.response?.status !== 500) {
        setError(err.response.data.message)
      } else {
        setError(t('Failed_to_reset_password'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white-pure px-8 py-10 shadow-xl sm:rounded-lg sm:px-16">
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="mx-auto max-w-fit text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            {step === 'request' ? t('Forgot_Password') : t('Reset_Password')}
          </h1>
          <p className="text-sm">
            {step === 'request'
              ? t('Enter_your_email_to_reset_password')
              : t('Enter_reset_code_and_new_password')}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form
          className="space-y-4"
          onSubmit={step === 'request' ? handleRequestReset : handleResetPassword}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              {t('Email')}
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {step === 'reset' && (
            <>
              <div>
                <label htmlFor="code" className="block text-sm font-medium">
                  {t('Reset_Code')}
                </label>
                <div className="mt-1">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                    placeholder="Enter reset code"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium">
                  {t('New_Password')}
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="hover:bg-button/90 flex w-full justify-center rounded-md border border-transparent bg-button px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {step === 'request' ? t('Sending') : t('Resetting')}
                </div>
              ) : (
                step === 'request' ? t('Send_Reset_Code') : t('Reset_Password')
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <Link
            href={"/auth/login"}
            className="hover:text-button/80 font-medium text-button"
          >
            {t('Back_to_Login')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordForm 