// src/app/[locale]/UpdateConference/page.tsx
'use client'

import React, { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Header } from '../utils/Header' //  Header component
import Footer from '../utils/Footer' //  Footer component
import ConferenceForm from './ConferenceForm'
// import { useLocalStorage } from 'usehooks-ts'; // REMOVE
import { useRouter } from 'next/navigation'
import useAuthApi from '@/src/hooks/auth/useAuthApi' // Import useAuthApi

const UpdateConference = ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  const t = useTranslations('')
  const router = useRouter()

  // Use useAuthApi for authentication status
  const { isLoggedIn } = useAuthApi()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push(`/${locale}/auth/login`)
    }
  }, [isLoggedIn, router, locale])

  if (!isLoggedIn) {
    return <div>Loading...</div> // Or any other loading indicator
  }

  return (
    <>
      <Header locale={locale} />
      <div className='container mx-auto px-16'>
        <div className='w-full bg-background py-14'></div>
        <h1 className='mb-4 text-2xl font-bold'>{t('Update_Conference')}</h1>
        <ConferenceForm />
      </div>
      <Footer />
    </>
  )
}

export default UpdateConference
