import { useTranslations } from 'next-intl'
import VerifyEmailForm from './VerifyEmailForm' // Component form sẽ tạo ở dưới
import { Suspense } from 'react' // <<< Import Suspense

// Function để lấy email từ searchParams một cách an toàn phía Client
function VerifyEmailClientContent() {
  const t = useTranslations('')
  // --- Cần component con để dùng useSearchParams ---
  return <VerifyEmailForm />
}

export default function VerifyEmailPage() {
  const t = useTranslations('') // t có thể dùng cho tiêu đề chung của trang

  return (
    <div className='bg-gray-5 0 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md'>
        <div className='bg-white-pure px-8 py-10 shadow-xl  sm:rounded-lg sm:px-10'>
          <div className='mb-8 space-y-2 text-center'>
            <h1 className='text-2xl font-bold tracking-tight '>
              {t('Verify_Your_Email_Address')}
            </h1>
            <p className='text-sm '>{t('Enter_Code_Sent_To_Email')}</p>
          </div>
          {/* --- Bọc component dùng searchParams bằng Suspense --- */}
          <Suspense
            fallback={<div className='text-center'>{t('Loading')}</div>}
          >
            <VerifyEmailClientContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
