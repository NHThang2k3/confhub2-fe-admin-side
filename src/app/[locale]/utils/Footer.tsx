'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link, usePathname } from '@/src/navigation' // Corrected import

const Footer = () => {
  const t = useTranslations('')
  const pathname = usePathname() // Get the current pathname

  // Check if the current page is the homepage.  Handle locale prefixes.
  const isHomePage =
    pathname === '/' ||
    /^\/[a-z]{2}$/.test(pathname) ||
    /^\/[a-z]{2}\/$/.test(pathname)

  return (
    <footer className='mx-auto w-full max-w-screen-2xl bg-gradient-to-r from-background to-background-secondary pt-12'>
      <div className='container mx-auto px-4'>
        {isHomePage && ( // Conditionally render the full footer
          <>
            <div className='grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-4'>
              {/* Quick Links (Combined with Follow Us) */}
              <div className='md:col-span-1 lg:col-span-1'>
                <h4 className='mb-2 text-base font-bold uppercase'>
                  {t('Quick_link')}
                </h4>
                <ul className='space-y-1 text-sm'>
                  <li>
                    <Link href='/support' className='hover:text-text-secondary'>
                      {t('Support')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/conferences'
                      className='hover:text-text-secondary'
                    >
                      {t('Conferences')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/journals'
                      className='hover:text-text-secondary'
                    >
                      {t('Journals')}
                    </Link>
                  </li>
                  {/* <li><Link href="/support" className="hover:text-text-secondary">Support</Link></li> */}
                  <li>
                    <Link
                      href='/addconference'
                      className='hover:text-text-secondary'
                    >
                      {t('Add_Conference')}
                    </Link>
                  </li>
                  <li>
                    <Link href='/chatbot' className='hover:text-text-secondary'>
                      {t('Chatbot')}
                    </Link>
                  </li>
                </ul>
                {/* Follow Us */}
                <h4 className='mb-2 mt-6 text-base font-bold uppercase'>
                  {t('Follow_us')}
                </h4>
                <div className='flex space-x-4'>
                  <Link
                    href='/'
                    className='rounded-full bg-background p-2 hover:opacity-80'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16'
                      height='16'
                      fill='currentColor'
                      className='h-5 w-5 fill-current'
                      viewBox='0 0 16 16'
                    >
                      <path d='M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951' />
                    </svg>
                  </Link>
                  {/* ... other social icons ... */}
                  <Link
                    href='/'
                    className='rounded-full bg-background p-2 hover:opacity-80'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16'
                      height='16'
                      fill='currentColor'
                      className='h-5 w-5 fill-current'
                      viewBox='0 0 16 16'
                    >
                      <path d='M5.026 15c6.038 0 9.341-5.003 9.341-9.334q.002-.211-.006-.422A6.7 6.7 0 0 0 16 3.542a6.7 6.7 0 0 1-1.889.518 3.3 3.3 0 0 0 1.447-1.817 6.5 6.5 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.32 9.32 0 0 1-6.767-3.429 3.29 3.29 0 0 0 1.018 4.382A3.3 3.3 0 0 1 .64 6.575v.045a3.29 3.29 0 0 0 2.632 3.218 3.2 3.2 0 0 1-.865.115 3 3 0 0 1-.614-.057 3.28 3.28 0 0 0 3.067 2.277A6.6 6.6 0 0 1 .78 13.58a6 6 0 0 1-.78-.045A9.34 9.34 0 0 0 5.026 15' />
                    </svg>
                  </Link>
                  <Link
                    href='/'
                    className='rounded-full bg-background p-2 hover:opacity-80'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16'
                      height='16'
                      fill='currentColor'
                      className='h-5 w-5 fill-current'
                      viewBox='0 0 16 16'
                    >
                      <path d='M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334' />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Popular Topics */}
              <div className='md:col-span-1 lg:col-span-1'>
                <h4 className='mb-2 text-base font-bold uppercase'>
                  {t('Popular_topics')}
                </h4>
                <ul className='space-y-1 text-sm'>
                  <li>
                    <Link
                      href={{
                        pathname: `/conferences`,
                        query: { topics: 'Business' }
                      }}
                      className='hover:text-text-secondary'
                    >
                      Business
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={{
                        pathname: `/conferences`,
                        query: { topics: 'Banking and Economics' }
                      }}
                      className='hover:text-text-secondary'
                    >
                      Banking and Economics
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={{
                        pathname: `/conferences`,
                        query: { topics: 'Engineering' }
                      }}
                      className='hover:text-text-secondary'
                    >
                      Engineering
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={{
                        pathname: `/conferences`,
                        query: { topics: 'Education' }
                      }}
                      className='hover:text-text-secondary'
                    >
                      Education
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={{
                        pathname: `/conferences`,
                        query: { topics: 'Health' }
                      }}
                      className='hover:text-text-secondary'
                    >
                      Health
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Popular Countries */}
              <div className='md:col-span-1 lg:col-span-1'>
                <h4 className='mb-2 text-base font-bold uppercase'>
                  {t('Popular_countries')}
                </h4>
                <ul className='space-y-1 text-sm'>
                  <li>
                    <Link
                      href={{
                        pathname: `/conferences`,
                        query: { country: 'Australia' }
                      }}
                      className='hover:text-text-secondary'
                    >
                      {t('Australia')}
                    </Link>
                  </li>

                  <li>
                    <Link
                      href={{
                        pathname: `/conferences`,
                        query: { country: 'Germany' }
                      }}
                      className='hover:text-text-secondary'
                    >
                      {t('Germany')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={{
                        pathname: `/conferences`,
                        query: { country: 'India' }
                      }}
                      className='hover:text-text-secondary'
                    >
                      {t('India')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={{
                        pathname: `/conferences`,
                        query: { country: 'United States' }
                      }}
                      className='hover:text-text-secondary'
                    >
                      {t('United_States')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={{
                        pathname: `/conferences`,
                        query: { country: 'United Kingdom' }
                      }}
                      className='hover:text-text-secondary'
                    >
                      {t('United_Kingdom')}
                    </Link>
                  </li>
                </ul>
              </div>
              {/* Company Info */}
              <div className='md:col-span-2 lg:col-span-1'>
                <h4 className='mb-2 text-base font-bold uppercase'>
                  {t('Company')}
                </h4>
                {/* Image positioned relative to its container */}
                <div className='relative  h-[200px] w-full  md:h-[300px] '>
                  <Image
                    src={`/hcmus_logo.png`}
                    alt='Background image'
                    width={300} // These are defaults, overridden by style
                    height={300}
                    style={{
                      objectFit: 'contain',
                      width: '50%',
                      height: '50%'
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Copyright (always shown) */}
        <div
          className={`mb-4 border-text-secondary p-4 ${isHomePage ? 'border-t' : ''}`}
        >
          <p className='text-center text-sm'>{t('Terms_of_Service')}</p>
          <p className='text-center text-sm'>{t('Copyrights')}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
