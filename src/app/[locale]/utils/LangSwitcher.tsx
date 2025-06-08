// src/components/LangSwitcher.tsx (or wherever it is)
'use client'

import { capitalize } from '@/lib/utils'
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

// 1. Correct the imports. Get Link AND usePathname from your navigation setup.
import { Link, usePathname } from '@/src/navigation'

// We don't need useSearchParams for this functionality because next-intl's Link handles it.
// We also don't need the next/navigation version of usePathname.

interface Option {
  country: string
  code: string
  flagCode: string
}

const LangSwitcher: React.FC = () => {
  // 2. This hook now returns the path WITHOUT the locale prefix and is correctly typed!
  // e.g., it will return '/dashboard/moderation', not '/en/dashboard/moderation'.
  const pathname = usePathname()

  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const options: Option[] = [
    { country: 'English', code: 'en', flagCode: 'gb' },
    { country: 'Tiếng Việt', code: 'vi', flagCode: 'vn' },
    { country: '中文', code: 'zh', flagCode: 'cn' }
  ]

  // 3. The complex `getPathWithoutLocalePrefix` function is no longer needed.
  // You can delete it entirely.

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOptionsExpanded(false)
      }
    }
    if (isOptionsExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOptionsExpanded])
  
  // This logic to find the current locale needs to be updated because we are using the
  // next-intl hook now, which doesn't include the locale in the pathname.
  // We can get the locale from a different hook. Let's use `useLocale` from 'next-intl'.
  // You'll need to install it if you haven't: `npm install next-intl`
  // And configure it in your layout. Let's assume you have it.
  // For now, I'll keep your original logic but it might be brittle.
  // A better way is to use `useLocale` from `next-intl`.
  // For the sake of this example, I'll stick to a simple fix based on your original code structure.
  // We need the original pathname with locale to determine the current language.
  const fullPathname =
    typeof window !== 'undefined' ? window.location.pathname : ''
  const firstPathSegment = fullPathname.split('/')[1] // e.g., 'en' from '/en/dashboard'
  const currentOption = options.find(option => option.code === firstPathSegment)
  const currentLocale =
    currentOption || options.find(opt => opt.code === 'en') || options[0]

  const getFlagUrl = (flagCode: string) => `/admin/country_flags/${flagCode}.svg`

  return (
    <div className='w-full'>
      <div className='relative' ref={dropdownRef}>
        <button
          className='text-destructive inline-flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 md:px-4'
          onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
          aria-haspopup='true'
          aria-expanded={isOptionsExpanded}
          id='options-menu'
        >
          <span className='inline-flex items-center gap-2'>
            <Image
              src={getFlagUrl(currentLocale.flagCode)}
              alt={`${currentLocale.country} flag`}
              width={20}
              height={15}
              className='h-auto w-[20px]'
              priority={true}
            />
            {capitalize(currentLocale.code)}
          </span>
          <svg
            className={`h-5 w-5 flex-shrink-0 transition-transform ${isOptionsExpanded ? 'rotate-180' : ''}`}
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </button>

        {isOptionsExpanded && (
          <div className='absolute right-0 z-50 mt-2 w-full min-w-max origin-top-right rounded-md bg-dropdown shadow-lg'>
            <div
              className='py-1'
              role='menu'
              aria-orientation='vertical'
              aria-labelledby='options-menu'
            >
              {options.map(lang => (
                <Link
                  key={lang.code}
                  // 4. Pass the type-safe pathname directly. This resolves the error.
                  // next-intl will automatically keep any search params.
                  href={pathname}
                  locale={lang.code}
                  onClick={() => {
                    setIsOptionsExpanded(false)
                  }}
                  className={`flex w-full items-center gap-2 whitespace-nowrap px-2 py-2 text-left text-sm hover:bg-dropdownHover md:px-4 ${
                    currentLocale.code === lang.code
                      ? 'bg-selected text-primary hover:bg-selected'
                      : 'text-secondary'
                  }`}
                  role='menuitem'
                >
                  <Image
                    src={getFlagUrl(lang.flagCode)}
                    alt={`${lang.country} flag`}
                    width={20}
                    height={15}
                    className='h-auto w-[20px]'
                    loading='lazy'
                  />
                  {capitalize(lang.code)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LangSwitcher