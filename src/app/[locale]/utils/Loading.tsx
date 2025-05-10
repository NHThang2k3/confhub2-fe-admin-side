// Loading.tsx

import React from 'react'
import { useTranslations } from 'next-intl'

const Loading: React.FC = () => {
  const t = useTranslations('')
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-r to-background-secondary'>
      {/* Add a loading spinner container */}
      <div className='flex flex-col items-center rounded-lg bg-white-pure p-6'>
        <div
          data-testid='loading-spinner' // <-- THÊM DÒNG NÀY
          className='h-16 w-16 animate-spin rounded-full border-t-4 border-blue-500'
        ></div>{' '}
        {/* Spinner */}
        <span className='ml-2 mt-4 text-xl '>{t('Loading')}</span>
      </div>
    </div>
  )
}

export default Loading
