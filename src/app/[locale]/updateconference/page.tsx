// src/app/[locale]/UpdateConference/page.tsx
'use client'

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '../utils/Header'; //  Header component
import Footer from '../utils/Footer'; //  Footer component
import UpdateConferenceForm from './UpdateConferenceForm';
// import { useLocalStorage } from 'usehooks-ts'; // REMOVE
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthApi from '@/src/hooks/auth/useAuthApi'; // Import useAuthApi

const UpdateConference = ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  const t = useTranslations('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const conferenceId = searchParams.get('id') || '';

  const { isLoggedIn, isLoading } = useAuthApi(); // Get isLoading
  
    useEffect(() => {
      // Only redirect if NOT logged in AND loading is complete
      if (!isLoggedIn && !isLoading) {
        router.push(`/${locale}/auth/login`);
      }
    }, [isLoggedIn, isLoading, router, locale]); // Add isLoading and locale to dependencies
  
    // Render loading state while isLoading is true
    if (isLoading) {
      return <div>Loading...</div>;
    }

  return (
    <>
      <Header locale={locale} />
      <div className='container mx-auto px-16'>
        <div className='w-full bg-background py-14'></div>
        <h1 className='mb-4 text-2xl font-bold'>{t('Update_Conference')}</h1>
        {/* Pass the conferenceId to UpdateConferenceForm */}
        <UpdateConferenceForm locale={locale} conferenceId={conferenceId} />
      </div>
      <Footer />
    </>
  );
};

export default UpdateConference;