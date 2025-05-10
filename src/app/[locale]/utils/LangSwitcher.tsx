'use client'
import { capitalize } from '@/lib/utils' // Đảm bảo đường dẫn này đúng
import {
  usePathname,
  useSearchParams
  // useSelectedLayoutSegments // Không cần thiết trong logic hiện tại
} from 'next/navigation'
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/src/navigation'

interface Option {
  country: string
  code: string
  flagCode: string
}

const LangSwitcher: React.FC = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // --- Options array ---
  const options: Option[] = [
    { country: 'English', code: 'en', flagCode: 'gb' },
    { country: 'Deutsch', code: 'de', flagCode: 'de' },
    { country: 'Français', code: 'fr', flagCode: 'fr' },
    { country: 'Tiếng Việt', code: 'vi', flagCode: 'vn' },
    { country: 'Español', code: 'es', flagCode: 'es' },
    { country: 'Русский', code: 'ru', flagCode: 'ru' },
    { country: '中文', code: 'zh', flagCode: 'cn' },
    { country: '日本語', code: 'ja', flagCode: 'jp' },
    { country: '한국어', code: 'ko', flagCode: 'kr' },
    { country: 'العربية', code: 'ar', flagCode: 'sa' },
    { country: 'فارسی', code: 'fa', flagCode: 'ir' }
  ]
  // --- End of options ---

  // --- Updated getLocalizedUrl (FIXED LOGIC) ---
  const getLocalizedUrl = (locale: string): string => {
    const currentLocaleCode = options.find(
      option =>
        pathname.startsWith(`/${option.code}/`) ||
        pathname === `/${option.code}`
    )?.code

    let pathWithoutLocale = pathname // Start with the full path

    if (currentLocaleCode) {
      // If current path is exactly the locale code (e.g., /en)
      if (pathname === `/${currentLocaleCode}`) {
        pathWithoutLocale = '/' // Reset to root before adding new locale
      }
      // If current path starts with the locale code and a slash (e.g., /en/about)
      else if (pathname.startsWith(`/${currentLocaleCode}/`)) {
        // Get the part after the locale (e.g., /about)
        pathWithoutLocale = pathname.substring(`/${currentLocaleCode}`.length)
        // Ensure it starts with a slash if it's not empty
        if (pathWithoutLocale && !pathWithoutLocale.startsWith('/')) {
          pathWithoutLocale = '/' + pathWithoutLocale
        } else if (!pathWithoutLocale) {
          // If stripping locale results in empty string (e.g. from '/en/'), treat as root
          pathWithoutLocale = '/'
        }
      }
      // else: Path didn't match /<locale>/ or /<locale>, keep pathWithoutLocale as is
    }
    // else: No known locale prefix found in pathname, pathWithoutLocale remains the original pathname.

    // *** THE FIX for trailing slash ***
    // If the path segment to append (after removing potential old locale)
    // is just the root '/', treat it as an empty string.
    // This prevents '/de/' when switching from '/en' or '/'.
    const finalPathSegment = pathWithoutLocale === '/' ? '' : pathWithoutLocale

    // Construct the new path: /<new_locale><remaining_path_or_empty>
    const finalPath = `/${locale}${finalPathSegment}`

    const queryString = searchParams.toString()
    return queryString ? `${finalPath}?${queryString}` : finalPath
  }
  // --- End of updated getLocalizedUrl ---

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

  // --- Determine current locale ---
  const firstPathSegment = pathname.split('/')[1]
  const currentOption = options.find(option => option.code === firstPathSegment)
  const currentLocale = currentOption || options[0] // Default to English
  // --- End of current locale determination ---

  const getFlagUrl = (flagCode: string) => `/country_flags/${flagCode}.svg` // Đảm bảo thư mục này tồn tại trong public/

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
              priority={true} // Priority for current flag is fine
            />
            {capitalize(currentLocale.country)}
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
            {' '}
            {/* Điều chỉnh style nếu cần */}
            <div
              className='py-1'
              role='menu'
              aria-orientation='vertical'
              aria-labelledby='options-menu'
            >
              {options.map(lang => (
                <a
                  key={lang.code}
                  href={getLocalizedUrl(lang.code)}
                  lang={lang.code}
                  onClick={e => {
                    // Prevent default navigation in test if needed, but rely on href mostly
                    // e.preventDefault(); // Usually not needed as tests check href
                    setIsOptionsExpanded(false) // Close dropdown on click
                  }}
                  className={`flex w-full items-center gap-2 whitespace-nowrap px-2 py-2 text-left text-sm hover:bg-dropdownHover md:px-4 ${
                    currentLocale.code === lang.code // Compare with determined currentLocale
                      ? 'bg-selected text-primary hover:bg-selected' // Điều chỉnh style nếu cần
                      : 'text-secondary' // Điều chỉnh style nếu cần
                  }`}
                  role='menuitem'
                >
                  <Image
                    src={getFlagUrl(lang.flagCode)}
                    alt={`${lang.country} flag`}
                    width={20}
                    height={15}
                    className='h-auto w-[20px]'
                    loading='lazy' // Lazy load flags in the dropdown
                  />
                  {capitalize(lang.country)}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LangSwitcher
