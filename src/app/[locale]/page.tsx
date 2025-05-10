'use client'
import Button from './utils/Button'
import { useEffect, useState } from 'react'
import { Header } from './utils/Header'
import SuperBannerTree from './home/SuperBannerTree'

export default function HomePage({ locale }: { locale: string }) {
  const [isVisibleButton, setIsVisibleButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisibleButton(true)
      } else {
        setIsVisibleButton(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // for smooth scrolling
    })
  }

  return (
    <div className=''>
      <Header locale={locale} />
      <SuperBannerTree />

      {isVisibleButton && (
        <Button
          onClick={scrollToTop}
          className='hover:bg-logo-shadow fixed bottom-4 right-4 rounded bg-button px-2 py-4 font-bold'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-6'
          >
            <path
              fillRule='evenodd'
              d='M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z'
              clipRule='evenodd'
            />
          </svg>
        </Button>
      )}
    </div>
  )
}
