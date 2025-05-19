'use client'
import { capitalize } from '@/lib/utils'
import {
  usePathname,
  useSearchParams
} from 'next/navigation' // Sử dụng từ next/navigation
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/src/navigation' // Đảm bảo đây là Link từ next-intl

interface Option {
  country: string
  code: string
  flagCode: string
}

const LangSwitcher: React.FC = () => {
  // pathname từ usePathname() của next/navigation sẽ là path sau basePath.
  // Ví dụ: nếu URL là http://localhost:1314/admin/en/dashboard
  // thì pathname sẽ là /en/dashboard
  // Nếu URL là http://localhost:1314/admin/dashboard (ngôn ngữ mặc định không có prefix)
  // thì pathname sẽ là /dashboard
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const options: Option[] = [
    { country: 'English', code: 'en', flagCode: 'gb' },
    { country: 'Tiếng Việt', code: 'vi', flagCode: 'vn' },
    { country: '中文', code: 'zh', flagCode: 'cn' }
  ]

  // Hàm này sẽ trả về đường dẫn hiện tại nhưng đã loại bỏ tiền tố ngôn ngữ (nếu có).
  // Ví dụ:
  // - từ /en/dashboard -> /dashboard
  // - từ /vi/profile -> /profile
  // - từ /dashboard (ngôn ngữ mặc định) -> /dashboard
  // - từ /en -> /
  // - từ / -> /
  const getPathWithoutLocalePrefix = (): string => {
    const currentLocaleOption = options.find(
      option =>
        pathname.startsWith(`/${option.code}/`) || // e.g. /en/some/path
        pathname === `/${option.code}`             // e.g. /en
    );
    const currentLocaleCode = currentLocaleOption?.code;

    let pathSegmentForHref = pathname;

    if (currentLocaleCode) {
      // Case 1: Path is /<locale>/something...
      if (pathname.startsWith(`/${currentLocaleCode}/`)) {
        // Lấy phần sau /<locale>/, ví dụ "dashboard/moderation"
        pathSegmentForHref = pathname.substring(`/${currentLocaleCode}/`.length);
        // Đảm bảo nó bắt đầu bằng dấu '/', ví dụ "/dashboard/moderation"
        if (!pathSegmentForHref.startsWith('/')) {
          pathSegmentForHref = '/' + pathSegmentForHref;
        }
        // Nếu sau khi cắt chỉ còn chuỗi rỗng (ví dụ từ "/en/" thành "") thì nó phải là "/"
        if (pathSegmentForHref === '/') pathSegmentForHref = '/';


      }
      // Case 2: Path is just /<locale>
      else if (pathname === `/${currentLocaleCode}`) {
        pathSegmentForHref = '/';
      }
      // else: pathname không có prefix locale này, không làm gì cả, giữ nguyên pathSegmentForHref
    }
    // else: pathname không có prefix locale nào (ví dụ, ngôn ngữ mặc định), giữ nguyên pathSegmentForHref

    // Đảm bảo kết quả luôn là một đường dẫn hợp lệ bắt đầu bằng /
    // hoặc chỉ là / nếu nó là trang gốc.
    // Điều này chủ yếu để xử lý trường hợp pathSegmentForHref là "" sau khi substring.
    if (pathSegmentForHref === '' || !pathSegmentForHref.startsWith('/')) {
        // Nếu pathSegmentForHref là rỗng (ví dụ từ /en/ thành rỗng), nó phải là /
        // Nếu nó không bắt đầu bằng / (ví dụ 'dashboard'), thêm / vào đầu.
        pathSegmentForHref = '/' + (pathSegmentForHref || '');
        // Dọn dẹp nếu có // (ví dụ nếu pathSegmentForHref ban đầu là rỗng)
        if (pathSegmentForHref === '//') pathSegmentForHref = '/';
    }


    const queryString = searchParams.toString();
    return queryString ? `${pathSegmentForHref}?${queryString}` : pathSegmentForHref;
  };


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

  const firstPathSegment = pathname.split('/')[1]
  const currentOption = options.find(option => option.code === firstPathSegment)
  const currentLocale = currentOption || options.find(opt => opt.code === 'en') || options[0]


  // Giả sử file flags của bạn nằm trong `public/country_flags/`
  // Next.js sẽ tự động thêm basePath `/admin` khi phục vụ các file từ `public`
  // const getFlagUrl = (flagCode: string) => `/country_flags/${flagCode}.svg`;
  // Nếu file thực sự nằm trong `public/admin/country_flags/`, thì bạn có thể giữ:
  const getFlagUrl = (flagCode: string) => `/admin/country_flags/${flagCode}.svg`;
  // Nhưng cách trên (không có /admin trong path) thường được ưu tiên hơn.

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
                  // href sẽ là path không có tiền tố ngôn ngữ, ví dụ: /dashboard/moderation hoặc /
                  href={getPathWithoutLocalePrefix()}
                  // locale prop sẽ cho next-intl biết cần thêm tiền tố ngôn ngữ nào
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