// LoginForm.tsx
'use client' // This directive is needed because useTranslations is a client-side hook in next-intl v3+

import React, { useEffect, useState } from 'react'
import { Link } from '@/src/navigation' // Assuming this is next-intl's Link component for routing
import useLoginForm from '../../../../hooks/auth/useLoginForm'
import { useTranslations } from 'next-intl' // Keep this import


type LoginFormProps = {
  redirectUri: string
}

const LoginForm: React.FC<LoginFormProps> = (props: LoginFormProps) => {

  // --- Call the useTranslations hook here ---
  // This provides the 't' function to access translated strings.
  // You can optionally provide a namespace, e.g., useTranslations('LoginPage')
  // For this example, we'll use the default namespace.
  const t = useTranslations();
  // ---------------------------------------

  const {
    email,
    password,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    error, // Assuming error is a string directly from the hook or backend
    isLoading
  } = useLoginForm()
  // const router = useRouter()

  // ... (google login commented out section)

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, []) // Added empty dependency array for useEffect

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-5 px-4 py-12  sm:px-6 lg:px-8'>
      <div className='w-full max-w-xl'>
        <div className='bg-white-pure px-8 py-10 shadow-xl  sm:rounded-lg sm:px-16'>
          <div className='space-y-8'>
            <div className='space-y-2 text-center'>
              <h1 className='mx-auto max-w-fit text-xl font-bold tracking-tight sm:text-2xl md:text-3xl'>
                {t('Welcome_Global_Conference_Hub')} {/* Already using t() */}
              </h1>
              <p className='text-sm '>{t('Sign_in_to_your_account')}</p> {/* Already using t() */}
            </div>

            {/* ... (google login commented out section) */}

            {/* ... (or separator commented out section) */}

            <form className='space-y-4' onSubmit={handleSubmit}>
              <div>
                <label htmlFor='email' className='block text-sm font-medium '>
                  {t('Email')} {/* Already using t() */}
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
                    // --- Translate placeholder ---
                    placeholder={t('Email_Placeholder')} // Added translation for placeholder
                    // Original: placeholder='you@example.com'
                    // -----------------------------
                  />
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between'>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium '
                  >
                    {t('Password')} {/* Already using t() */}
                  </label>
                  <div className='text-sm'>
                    <Link
                      href='/auth/forgot-password'
                      className='hover:text-button/80 font-medium text-button'
                    >
                      {t('Forgot_Password')} {/* Already using t() */}
                    </Link>
                  </div>
                </div>
                <div className='mt-1'>
                  <input
                    id='password'
                    name='password'
                    type='password'
                    autoComplete='current-password'
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm'
                    // --- Translate placeholder ---
                    placeholder={t('Password_Placeholder')} // Added translation for placeholder
                    // Original: placeholder='••••••••'
                    // -----------------------------
                  />
                </div>
              </div>

              {/* Displaying the error. If your errors are specific keys (e.g., 'invalid_credentials'),
                  you could translate them here: {error && <p className='text-sm text-red-700'>{t(error)}</p>}
                  But if 'error' is a free-form string from the backend/hook, displaying it directly might be necessary.
                  Leaving it as is based on the original code's pattern.
               */}
              {error && (
                <div className='rounded-md bg-red-50 p-4'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>
                      {/* SVG icon - does not need translation */}
                      <svg
                        className='h-5 w-5 text-red-400'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm text-red-700'>{error}</p> {/* Displaying error string */}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='hover:bg-button/90 flex w-full justify-center rounded-md border border-transparent bg-button px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
                >
                  {isLoading && isClient ? (
                    <div className='flex items-center'>
                       {/* Loading SVG - does not need translation */}
                      <svg
                        className='-ml-1 mr-3 h-5 w-5 animate-spin text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      {t('Signing_in')} 
                    </div>
                  ) : (
                    t('Sign_In') 
                  )}
                </button>
              </div>
            </form>

            <div className='text-center text-sm'>
              {/* Any other links or text can go here */}
            </div>
          </div>
        </div>

        <div className='mt-4 text-center text-xs '>
          {t(
            'By_continuing_you_agree_to_our_Terms_of_Service_and_Privacy_Policy'
          )} {/* Already using t() */}
        </div>
      </div>
    </div>
  )
}

export default LoginForm