// components/Header/components/DesktopNavigation.tsx
import { FC } from 'react'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import ThemeSwitch from '../ThemeSwitch'
import LangSwitcher from '../LangSwitcher'
import Button from '../Button'

interface Props {
  locale: string
}

const DesktopNavigation: FC<Props> = ({ locale }) => {
  const t = useTranslations('')
  const pathname = usePathname()
  // console.log('pathname', pathname)

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <nav className='mr-2 hidden gap-0 lg:inline-flex lg:items-center lg:justify-center lg:gap-0  lg:text-sm lg:font-semibold'>
      <Link
        lang={locale}
        href={`/conferences`}
        className={`group relative mx-2 font-semibold transition-colors duration-300 ease-in-out hover:text-button md:mx-4 ${isActive(`/${locale}/conferences`) ? 'text-button' : ''}`}
      >
        {t('Conferences')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-button transition-transform duration-300 ease-in-out ${
            isActive('/conferences')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link
        lang={locale}
        href={`/journals`}
        className={`group relative mx-2 font-semibold transition-colors duration-300 ease-in-out hover:text-button md:mx-4 ${isActive(`/${locale}/journals`) ? 'text-button' : ''}`}
      >
        {t('Journals')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-button transition-transform duration-300 ease-in-out ${
            isActive('/journals')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link
        lang={locale}
        href={`/visualization`}
        className={`group relative mx-2 font-semibold transition-colors duration-300 ease-in-out hover:text-button md:mx-4 ${isActive(`/${locale}/visualization`) ? 'text-button' : ''}`}
      >
        {t('Visualization')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-button transition-transform duration-300 ease-in-out ${
            isActive('/visualization')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link
        lang={locale}
        href={`/chatbot/landingchatbot`}
        className={`group relative mx-2 font-semibold transition-colors duration-300 ease-in-out hover:text-button md:mx-4 ${isActive(`/${locale}/chatbot`) ? 'text-button' : ''}`}
      >
        {t('Chatbot')}
        {/* Thêm thẻ span cho chữ NEW */}
        <span className='mb-1 ml-1 inline-block rounded bg-button px-1.5 py-0.5 align-middle text-xs font-semibold text-button-text'>
          {t('NEW')}
        </span>
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-button transition-transform duration-300 ease-in-out ${
            isActive('/chatbot')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link
        lang={locale}
        href={`/support`}
        className={`group relative mx-2 font-semibold transition-colors duration-300 ease-in-out hover:text-button md:mx-4 ${isActive(`/${locale}/support`) ? 'text-button' : ''}`}
      >
        {t('Support')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-button transition-transform duration-300 ease-in-out ${
            isActive('/support')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link lang={locale} href={`/addconference`}>
        <Button
          className={`group relative mx-2 font-semibold md:mx-4`}
          variant='primary'
          size='small'
        >
          {t('Publish')}
        </Button>
      </Link>

      <div className=' font-semibold'>
        <ThemeSwitch />
      </div>
      <div className='font-semibold'>
        <LangSwitcher />
      </div>
    </nav>
  )
}

export default DesktopNavigation
