// src/app/[locale]/addconference/page.tsx (No changes needed here)
'use client'

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '../utils/Header';
import Footer from '../utils/Footer';
import ConferenceForm from './ConferenceForm';
import { useRouter } from 'next/navigation';
import useAuthApi from '@/src/hooks/auth/useAuthApi';

const AddConference = ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  const t = useTranslations('');
  const router = useRouter();

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

  // Render main content only when NOT loading and isLoggedIn
  return (
    <>
      <Header locale={locale} />
      <div className='container mx-auto px-16'>
        <div className='w-full bg-background py-14'></div>
        <h1 className='mb-4 text-2xl font-bold'>{t('Add_New_Conference')}</h1>
        <ConferenceForm />
      </div>
      <Footer />
    </>
  );
};

export default AddConference;