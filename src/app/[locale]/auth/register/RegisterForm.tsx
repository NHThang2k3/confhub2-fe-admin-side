'use client'

import { Link, useRouter } from '@/src/navigation' // <<< Import useRouter
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { appConfig } from '@/src/middleware'
import { login } from '@/src/hooks/auth/useAuthApi'
// Bỏ import login nếu không dùng nữa sau khi đăng ký thành công mà chưa xác thực
// import { login } from '@/src/hooks/auth/useAuthApi'

interface RegisterFormProps {
  // No props needed
}

const RegisterForm: React.FC<RegisterFormProps> = () => {
  const t = useTranslations('')
  const router = useRouter() // <<< Lấy instance router

  const [firstname, setFirstName] = useState('')
  const [lastname, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [dob, setDob] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  // const [showVerificationMessage, setShowVerificationMessage] = useState(false) // <<< Xóa state này

  const isOldEnough = (dateString: string): boolean => {
    if (!dateString) return false
    try {
      const today = new Date()
      const birthDate = new Date(dateString)
      const cutoffDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      )
      return birthDate <= cutoffDate
    } catch (e) {
      console.error('Error parsing date:', e)
      return false
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    // setShowVerificationMessage(false) // <<< Xóa dòng này

    // --- Validation ---
    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !confirmPassword ||
      !dob
    ) {
      setError(t('Error_Fill_All_Fields'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('Error_Password_Mismatch'))
      return
    }
    if (password.length < 8) {
      setError(t('Error_Password_Too_Short'))
      return
    }
    if (!isOldEnough(dob)) {
      setError(t('Error_Age_Requirement'))
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t('Error_Invalid_Email_Format'))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName: firstname,
            lastName: lastname,
            email: email,
            password: password,
            dob: dob
          })
        }
      )

      const data = await response.json()
      login(data) // <<< Không đăng nhập nếu cần verify

      if (response.status === 201) {
        console.log('Registration pending verification:', data.message)

        // --- CHUYỂN HƯỚNG ĐẾN TRANG XÁC THỰC ---
        // Truyền email qua query param để trang kia có thể sử dụng
        router.push({
          pathname: '/auth/verify-email', // <<< Pathname cơ bản
          query: { email: email } // <<< Query parameters dưới dạng object
        }) // Không cần xóa form hay set showVerificationMessage nữa vì đã chuyển trang
      } else {
        // Xử lý các lỗi khác từ backend (400, 409, 500)
        setError(
          data.message ||
            t('Error_Registration_Failed_Status', { status: response.status })
        )
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(t('Error_Registration_Generic'))
    } finally {
      // Chỉ set isLoading false nếu không chuyển hướng thành công
      // Nếu chuyển hướng thành công, component sẽ unmount, không cần set nữa.
      // Tuy nhiên, để an toàn nếu có lỗi nào đó xảy ra với router.push, vẫn nên giữ lại trong finally.
      setIsLoading(false)
    }
  }

  // --- Phần JSX (Bỏ phần hiển thị thông báo xác thực) ---
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-5 px-4 py-12  sm:px-6 lg:px-8'>
      <div className='w-full max-w-xl'>
        <div className='bg-white-pure px-8 py-10 shadow-xl  sm:rounded-lg sm:px-16'>
          {/* Chỉ hiển thị form đăng ký */}
          <div className='space-y-8'>
            <div className='space-y-2 text-center'>
              <h1 className='mx-auto max-w-fit text-xl font-bold tracking-tight sm:text-2xl md:text-3xl'>
                {t('Welcome_Global_Conference_Hub')}
              </h1>
              <p className='text-sm '>{t('Create_your_account')}</p>
            </div>

            <form className='space-y-4' onSubmit={handleSubmit}>
              {/* Các input fields (First Name, Last Name, DOB, Email, Password, Confirm Password) - Giữ nguyên */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='firstname'
                    className='block text-sm font-medium '
                  >
                    {t('First_Name')} <span className='text-red-500'>*</span>
                  </label>
                  <div className='mt-1'>
                    <input
                      id='firstname'
                      name='firstname'
                      type='text'
                      required
                      value={firstname}
                      onChange={e => setFirstName(e.target.value)}
                      className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm'
                      placeholder={t('First_Name')}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor='lastname'
                    className='block text-sm font-medium '
                  >
                    {t('Last_Name')} <span className='text-red-500'>*</span>
                  </label>
                  <div className='mt-1'>
                    <input
                      id='lastname'
                      name='lastname'
                      type='text'
                      required
                      value={lastname}
                      onChange={e => setLastName(e.target.value)}
                      className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm'
                      placeholder={t('Last_Name')}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor='dob' className='block text-sm font-medium '>
                  {t('Date_of_Birth')} <span className='text-red-500'>*</span>
                </label>
                <div className='mt-1'>
                  <input
                    id='dob'
                    name='dob'
                    type='date'
                    required
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm'
                  />
                </div>
              </div>
              <div>
                <label htmlFor='email' className='block text-sm font-medium '>
                  {t('Email')} <span className='text-red-500'>*</span>
                </label>
                <div className='mt-1'>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm'
                    placeholder='you@example.com'
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium '
                >
                  {t('Password')} <span className='text-red-500'>*</span>
                </label>
                <div className='mt-1'>
                  <input
                    id='password'
                    name='password'
                    type='password'
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm'
                    placeholder='••••••••'
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium '
                >
                  {t('Confirm_Password')}{' '}
                  <span className='text-red-500'>*</span>
                </label>
                <div className='mt-1'>
                  <input
                    id='confirmPassword'
                    name='confirmPassword'
                    type='password'
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm'
                    placeholder='••••••••'
                  />
                </div>
              </div>

              {/* Hiển thị lỗi */}
              {error && (
                <div className='rounded-md bg-red-50 p-4'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>
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
                      <p className='text-sm text-red-700'>{error}</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Nút Submit */}
              <div>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='hover:bg-button/90 flex w-full justify-center rounded-md border border-transparent bg-button px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isLoading ? (
                    <div className='flex items-center'>
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
                      {t('Creating_account')}
                    </div>
                  ) : (
                    t('Create_account')
                  )}
                </button>
              </div>
            </form>

            {/* Link đăng nhập */}
            <div className='text-center text-sm'>
              <div className='flex items-center justify-center space-x-1'>
                <span className=''>{t('Already_have_an_account')}</span>
                <Link
                  href='/auth/login'
                  className='hover:text-button/80 font-medium text-button'
                >
                  {t('Sign_In')}
                </Link>
              </div>
              <div className='flex items-center justify-center space-x-1'>
                <Link
                  href='/'
                  className='hover:text-button/80 font-medium text-button'
                >
                  {t('Back_to_Home')}
                </Link>
              </div>
            </div>
          </div>
          {/* Kết thúc form đăng ký */}
        </div>

        {/* Link Terms & Privacy (Luôn hiển thị) */}
        <div className='mt-4 text-center text-xs '>
          {t(
            'By_continuing_you_agree_to_our_Terms_of_Service_and_Privacy_Policy'
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterForm
