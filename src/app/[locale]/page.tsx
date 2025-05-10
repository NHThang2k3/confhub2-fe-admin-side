'use client'

import { Header } from './utils/Header'
import Dashboard from './dashboard/page'

export default function HomePage({ locale }: { locale: string }) {


  return (
    <div className=''>
      <Header locale={locale} />
      <Dashboard locale={locale} />
    </div>
  )
}
