import { FC, useState, useEffect } from 'react'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import ThemeSwitch from '../ThemeSwitch'
import LangSwitcher from '../LangSwitcher'

interface Props {
  isMobileMenuOpen: boolean
  closeAllMenus: () => void
  locale: string
  isLogin: boolean
}

const MobileNavigation: FC<Props> = ({
  isMobileMenuOpen,
  closeAllMenus,
  locale,
  isLogin
}) => {
  const t = useTranslations('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // ---- Đảm bảo không có gì ở giữa đây ----

  return (
    <div
      className={`mobile-navigation border-border absolute right-0 top-full z-40 w-40 border-b bg-background-secondary shadow-md lg:hidden ${
        isMobileMenuOpen ? '' : 'hidden'
      }`}
      // suppressHydrationWarning // Nếu cần, đặt nó làm prop của div
    >
      {/* Render ThemeSwitch/LangSwitcher ở client */}
      {/* Bọc chúng trong một div để layout tốt hơn nếu cần */}
      {isClient && (
        <>
          <div className='px-2 hover:bg-gray-10 dark:hover:bg-gray-70'>
            <ThemeSwitch />
          </div>
          <div className='px-2 hover:bg-gray-10 dark:hover:bg-gray-70'>
            <LangSwitcher />
          </div>
        </>
      )}

      <div className='flex flex-col text-sm '>
        

        {/* Chỉ render phần này sau khi đã chắc chắn ở client */}
        {isClient && !isLogin && (
          <>
            <Link
              href={`/auth/login`}
              locale={locale}
              className='px-4 py-2 hover:bg-gray-10 dark:hover:bg-gray-70'
            >
              {t('Login')}
            </Link>
            
          </>
        )}
      </div>
    </div>
  )
}

export default MobileNavigation
