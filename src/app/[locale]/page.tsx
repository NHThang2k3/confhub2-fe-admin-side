'use client'
import Button from './utils/Button'
import Banner from './home/Banner'
import PopularConferences from './home/PopularConferences'
import { useEffect, useState } from 'react'
import Footer from './utils/Footer'
import ConsumerInsights from './home/ConsumerInsights'
import { Header } from './utils/Header'
import IntroduceVisualization from './home/IntroduceVisualization'
import FeatureComparisonTable from './home/FeatureComparisonTable'
import SuperBannerTree from './home/SuperBannerTree'
import SubjectAreasJournals from './home/SubjectAreasJournals'

export default function HomePage({ locale }: { locale: string }) {
  const [isVisibleButton, setIsVisibleButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        // Adjust 300 to your preferred scroll distance
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
      {/* <SuperBanner /> */}
      <SuperBannerTree />
      <PopularConferences />
      {/* <SubjectAreasJournals
        speed='90s' // You can still customize other props
        imageHeight='h-60'
        imageWidth='w-40'
        innerClasses='space-x-6 py-4'
      /> */}
      <ConsumerInsights />
      <IntroduceVisualization />
      <FeatureComparisonTable />
      <Footer />
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
