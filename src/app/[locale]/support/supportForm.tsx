import { useTranslations } from 'next-intl'
import React, { useState } from 'react' // Import useState
import Image from 'next/image'
import Link from 'next/link' // Import Link để tạo liên kết đúng chuẩn Next.js

const SupportForm: React.FC = () => {
  // --- next-intl integration ---
  // Chọn namespace là 'SupportForm'. Các key sẽ nằm trong đối tượng SupportForm trong file JSON
  const t = useTranslations('SupportForm')
  // --------------------------

  // State để quản lý trạng thái checkbox đồng ý điều khoản
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!agreedToTerms) {
      // Sử dụng key từ file dịch cho thông báo alert
      alert(t('termsRequiredAlert'))
      return
    }

    console.log('Form submitted!')
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())
    console.log(data)
    // Thêm logic gửi form ở đây (ví dụ: gọi API)
  }

  return (
    <>
      {/* Phần Header với thẻ Image nền - Tăng chiều cao */}
      <section className='relative h-96 md:h-[500px] lg:h-[550px]'>
        <Image
          src='/bg-2.jpg'
          // Sử dụng key từ file dịch cho alt text
          alt={t('backgroundImageAlt')}
          layout='fill'
          objectFit='cover'
          quality={75}
          priority
          className=''
        />
        <div className='absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/80'></div>
        <div className='absolute inset-0 z-10 flex flex-col items-center px-4 pt-32 text-center'>
          {/* Sử dụng key từ file dịch */}
          <h1 className='mb-4 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl'>
            {t('headerTitle')}
          </h1>
          {/* Sử dụng key từ file dịch */}
          <p className='mb-8 max-w-screen-md font-light sm:text-xl'>
            {t('headerSubtitle')}
          </p>
        </div>
      </section>

      {/* Phần Form */}
      <div className='bg-gray-5 pb-8  lg:pb-16'>
        <div className='relative z-20 mx-auto -mt-24 max-w-screen-md rounded-lg bg-white-pure p-6 px-4 shadow-xl  sm:p-8 md:-mt-56 lg:p-10'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Trường Chủ đề */}
            <div>
              <label
                htmlFor='subject'
                className='mb-2 block text-sm font-medium '
              >
                {/* Sử dụng key từ file dịch */}
                {t('subjectLabel')} <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='subject'
                name='subject'
                className='dark:shadow-sm-light block w-full rounded-lg border border-gray-30 bg-gray-5 p-2.5 text-sm  placeholder-primary shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500'
                // Sử dụng key từ file dịch
                placeholder={t('subjectPlaceholder')}
                required
              />
            </div>

            {/* Trường Loại (Dropdown) */}
            <div>
              <label
                htmlFor='type'
                className='mb-2 block text-sm font-medium  '
              >
                {/* Sử dụng key từ file dịch */}
                {t('typeLabel')} <span className='text-red-500'>*</span>
              </label>
              <select
                id='type'
                name='type'
                className='dark:shadow-sm-light block w-full rounded-lg border border-gray-30 bg-gray-5 p-2.5 text-sm  placeholder-primary shadow-sm focus:border-blue-500    focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500'
                required
                defaultValue=''
              >
                {/* Sử dụng key từ file dịch */}
                <option value='' disabled>
                  {t('typeDefaultOption')}
                </option>
                {/* Sử dụng key từ file dịch */}
                <option value='report'>{t('typeOptionReport')}</option>
                {/* Sử dụng key từ file dịch */}
                <option value='contact'>{t('typeOptionContact')}</option>
              </select>
            </div>

            {/* Trường Tin nhắn */}
            <div className='sm:col-span-2'>
              <label
                htmlFor='message'
                className='mb-2 block text-sm font-medium  '
              >
                {/* Sử dụng key từ file dịch */}
                {t('messageLabel')} <span className='text-red-500'>*</span>
              </label>
              <textarea
                id='message'
                name='message'
                rows={6}
                className='block w-full rounded-lg border border-gray-30 bg-gray-5 p-2.5 text-sm  placeholder-primary shadow-sm focus:border-blue-500   focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500'
                // Sử dụng key từ file dịch
                placeholder={t('messagePlaceholder')}
                required
              ></textarea>
            </div>

            {/* Checkbox Đồng ý điều khoản - Sử dụng t.rich */}
            <div className='flex items-start'>
              <div className='flex h-5 items-center'>
                <input
                  id='terms'
                  aria-describedby='terms-description'
                  name='termsAgreement'
                  type='checkbox'
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  required
                  className='focus:ring-3 h-4 w-4 rounded border border-gray-30 bg-gray-5 focus:ring-blue-300   dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                />
              </div>
              <div className='ml-3 text-sm'>
                <label
                  htmlFor='terms'
                  id='terms-description' // Thêm id để aria-describedby hoạt động đúng
                  className='font-light  '
                >
                  {/* Sử dụng t.rich để nhúng Link vào text */}
                  {t.rich('termsLabel', {
                    // Định nghĩa cách render thẻ <termsLink> trong file JSON
                    termsLink: chunks => (
                      <Link
                        href='/terms-and-conditions' // Thay bằng đường dẫn thực tế
                        className='font-medium text-blue-600 hover:underline dark:text-blue-500'
                        target='_blank' // Mở tab mới nếu cần
                        rel='noopener noreferrer'
                      >
                        {chunks}
                      </Link>
                    ),
                    // Định nghĩa cách render thẻ <privacyLink> trong file JSON
                    privacyLink: chunks => (
                      <Link
                        href='/privacy-policy' // Thay bằng đường dẫn thực tế
                        className='font-medium text-blue-600 hover:underline dark:text-blue-500'
                        target='_blank' // Mở tab mới nếu cần
                        rel='noopener noreferrer'
                      >
                        {chunks}
                      </Link>
                    )
                  })}
                </label>
              </div>
            </div>

            {/* Nút Submit */}
            <button
              type='submit'
              disabled={!agreedToTerms}
              className={`rounded-lg bg-blue-700 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto ${
                !agreedToTerms ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              {/* Sử dụng key từ file dịch */}
              {t('submitButton')}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default SupportForm
