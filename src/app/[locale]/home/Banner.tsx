'use client'

import React from 'react'
import Image from 'next/image'
import Button from '../utils/Button'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'
import { useTheme } from 'next-themes' // Import useTheme from next-themes

const Banner: React.FC = () => {
  const t = useTranslations('')
  const { theme } = useTheme() // Use the useTheme hook to get the current theme

  // Determine the image source based on the theme
  const imageSrc = theme === 'dark' ? '/2.png' : '/light.jpg' // Assuming you have '3-dark.png' for dark mode

  return (
    <section className='relative h-screen w-full py-0'>
      <Image
        src={imageSrc} // Sử dụng nguồn ảnh động
        alt='Banner Background'
        fill={true} // Đặt fill={true} thay vì layout="fill"
        style={{
          objectFit: 'cover',
          objectPosition: 'center'
        }}
        className='h-full w-full transition-opacity duration-500 ease-in-out' // Thêm w-full để đảm bảo lấp đầy container
      />
      <div className='container relative z-20 flex flex-col  items-center  justify-center py-24'>
        <h1 className='mt-4 text-center text-4xl font-extrabold leading-tight md:text-6xl'>
          {t('Slogan_Website')}
        </h1>
        <div className='my-2 text-center text-sm text-text-secondary sm:px-20 md:text-xl'>
          {t('Slogan_Website_describe')}
        </div>

        {/* <div className='py-12'></div> */}
        <div className='mt-2 flex flex-col items-center gap-4 sm:flex-row'>
          <div className=''>
            <Link href={`/conferences`}>
              <Button rounded size='large' advanced advancedDivColor='p-8'>
                {t('Search_Conferences')}
              </Button>
            </Link>
          </div>

          <div className='px-12 sm:px-0 sm:py-8'>
            <Link href={`/journals`}>
              <Button rounded size='large' variant='secondary'>
                {t('Search_Journals')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner
