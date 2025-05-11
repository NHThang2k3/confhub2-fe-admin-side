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
    <nav className='mr-2  gap-0 inline-flex lg:items-center lg:justify-center lg:gap-0  lg:text-sm lg:font-semibold'>
      

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
