// components/Header/components/DesktopNavigation.tsx
import { FC } from 'react'

import ThemeSwitch from '../ThemeSwitch'
import LangSwitcher from '../LangSwitcher'

interface Props {
  locale: string
}

const DesktopNavigation: FC<Props> = ({ locale }) => {

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
