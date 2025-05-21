// src/app/[locale]/auth/login/LoginForm.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { Link, useRouter as useNextIntlRouter } from '@/src/navigation' // Assuming this is next-intl's Link/useRouter
import useLoginForm from '../../../../hooks/auth/useLoginForm'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff } from 'lucide-react' // Import Eye and EyeOff



type LoginFormProps = {
  // redirectUri is no longer needed here as Google flow is handled by useAuthApi
  // redirectUri: string
}

const LoginForm: React.FC<LoginFormProps> = (/* props: LoginFormProps */) => {
  const t = useTranslations('')
  const nextIntlRouter = useNextIntlRouter(); // For navigation that preserves locale
  const [showPassword, setShowPassword] = useState(false)

  const {
    email,
    password,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    handleGoogleLogin, // This will now call googleSignIn from useAuthApi
    error,
    isLoading // This isLoading comes from useAuthApi via useLoginForm
  } = useLoginForm()

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])


  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-5 px-4 py-12  sm:px-6 lg:px-8'>
      <div className='w-full max-w-xl'>
        <div className='bg-white-pure px-8 py-10 shadow-xl  sm:rounded-lg sm:px-16'>
          <div className='space-y-8'>
            <div className='space-y-2 text-center'>
              <h1 className='mx-auto max-w-fit text-xl font-bold tracking-tight sm:text-2xl md:text-3xl'>
                {t('Welcome_Global_Conference_Hub')}
              </h1>
              <p className='text-sm '>{t('Sign_in_to_your_account')}</p>
            </div>

            

            <form className='space-y-4' onSubmit={handleSubmit}>
              <div>
                <label htmlFor='email' className='block text-sm font-medium '>
                  {t('Email')}
                </label>
                <div className='mt-1'>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    value={email}
                    onChange={handleEmailChange}
                    className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm'
                    placeholder='you@example.com'
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between'>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium '
                  >
                    {t('Password')}
                  </label>
                  <div className='text-sm'>
                    <Link
                      href='/auth/forgot-password' // Make sure this path is correct with locale if needed
                      className='hover:text-button/80 font-medium text-button'
                    >
                      {t('Forgot_Password')}
                    </Link>
                  </div>
                </div>
                <div className='mt-1'>
                  <div className='relative'>
                    <input
                      id='password'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      autoComplete='current-password'
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm'
                      placeholder='••••••••'
                      disabled={isLoading}
                    />
                    {/* Thay thế biểu tượng mắt thủ công bằng icon từ lucide-react */}
                    {password && // Hiển thị nút toggle chỉ khi có mật khẩu
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-0' // Thêm một số style cho nút
                        aria-label={showPassword ? t('Hide password') : t('Show password')} // Thêm aria-label cho accessibility
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />} {/* Sử dụng icon lucide-react */}
                      </button>
                    }
                  </div>
                </div>
              </div>

              {error && (
                <div className='rounded-md bg-red-50 p-4'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>
                       {/* SVG for error icon */}
                       <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'><path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' /></svg>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm text-red-700'>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='hover:bg-button/90 flex w-full justify-center rounded-md border border-transparent bg-button px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isLoading && isClient ? ( // isClient check to prevent hydration mismatch for spinner
                    <div className='flex items-center'>
                      {/* SVG for loading spinner */}
                      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path></svg>
                      {t('Signing_in')}
                    </div>
                  ) : (
                    t('Sign_In')
                  )}
                </button>
              </div>
            </form>

            
          </div>
        </div>

        <div className='mt-4 text-center text-xs '>
          {t(
            'By_continuing_you_agree_to_our_Terms_of_Service_and_Privacy_Policy'
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginForm