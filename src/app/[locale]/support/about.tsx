'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

const About = () => {
  const t = useTranslations('AboutPage') // Use a namespace for your translations

  return (
    <>
      <div className='bg-gradient-to-r from-background to-background-secondary'>
        {/* Hero Section */}
        <section className='relative bg-span-bg py-20 text-[--button-text]'>
          <div className='container relative z-10 mx-auto px-4'>
            <div className='text-center'>
              <h1 className='mb-4 text-3xl font-bold md:text-6xl'>
                {t('hero.title')}
              </h1>
              <p className='mx-auto  text-xl leading-relaxed md:text-2xl'>
                {t('hero.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className='px-4 py-16 md:px-8'>
          <div className='container mx-auto'>
            <div className='grid items-center gap-12 md:grid-cols-2'>
              <div>
                <h2 className='mb-6 text-3xl font-bold text-[--primary] md:text-4xl'>
                  {t('mission.title')}
                </h2>
                <p className='text-lg leading-relaxed text-[--text-secondary]'>
                  {t('mission.description')}
                </p>
              </div>
              {/* Image Placeholder */}
              <div className='relative overflow-hidden rounded-lg shadow-lg'>
                <Image
                  src='/bg-2.jpg' // Replace!
                  alt='Researchers Collaborating'
                  width={600}
                  height={400}
                  className='h-full w-full object-cover'
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features/Services Section */}
        <section className='bg-gradient-to-r from-background to-background-secondary px-4 py-16 md:px-8'>
          <div className='container mx-auto'>
            <h2 className='mb-8 text-center text-3xl font-bold text-[--primary] md:text-4xl'>
              {t('features.title')}
            </h2>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
              {/* Feature 1: Comprehensive Data */}
              <div className='bg-bachground rounded-lg p-6 shadow-md'>
                <div className='mb-3 text-2xl font-semibold text-[--secondary]'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='mr-2 inline-block h-8 w-8'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5'
                    />
                  </svg>
                  {t('features.feature1.title')}
                </div>
                <p className='text-[--text-secondary]'>
                  {t('features.feature1.description')}
                </p>
              </div>

              {/* Feature 2: Daily Updates */}
              <div className='bg-bachground rounded-lg p-6 shadow-md'>
                <div className='mb-3 text-2xl font-semibold text-[--secondary]'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='mr-2 inline-block h-8 w-8'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5'
                    />
                  </svg>
                  {t('features.feature2.title')}
                </div>
                <p className='text-[--text-secondary]'>
                  {t('features.feature2.description')}
                </p>
              </div>

              {/* Feature 3: Free Access */}
              <div className='bg-bachground rounded-lg p-6 shadow-md'>
                <div className='mb-3 text-2xl font-semibold text-[--secondary]'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='mr-2 inline-block h-8 w-8'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z'
                    />
                  </svg>
                  {t('features.feature3.title')}
                </div>
                <p className='text-[--text-secondary]'>
                  {t('features.feature3.description')}
                </p>
              </div>

              {/* Feature 4: User Accounts */}
              <div className='bg-bachground rounded-lg p-6 shadow-md'>
                <div className='mb-3 text-2xl font-semibold text-[--secondary]'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='mr-2 inline-block h-8 w-8'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
                    />
                  </svg>
                  {t('features.feature4.title')}
                </div>
                <p className='text-[--text-secondary]'>
                  {t('features.feature4.description')}
                </p>
              </div>

              {/* Feature 5: Smart Search */}
              <div className='bg-bachground rounded-lg p-6 shadow-md'>
                <div className='mb-3 text-2xl font-semibold text-[--secondary]'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='mr-2 inline-block h-8 w-8'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
                    />
                  </svg>
                  {t('features.feature5.title')}
                </div>
                <p className='text-[--text-secondary]'>
                  {t('features.feature5.description')}
                </p>
              </div>

              {/* Feature 6: AI Chatbot */}
              <div className='bg-bachground rounded-lg p-6 shadow-md'>
                <div className='mb-3 text-2xl font-semibold text-[--secondary]'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='mr-2 inline-block h-8 w-8'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                    />
                  </svg>
                  {t('features.feature6.title')}
                </div>
                <p className='text-[--text-secondary]'>
                  {t('features.feature6.description')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default About
