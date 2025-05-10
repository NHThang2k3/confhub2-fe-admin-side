"use client";

import { useTranslations } from 'next-intl';
import RegisterForm from './RegisterForm';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthApi from '@/src/hooks/auth/useAuthApi'; // Import useAuthApi

export default function Register({
  params: { locale }
}: {
  params: { locale: string; };
}) {
  const t = useTranslations('');
  const { isLoggedIn, isLoading } = useAuthApi(); // Get isLoading
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect if NOT logged in AND loading is complete
    if (isLoggedIn && !isLoading) {
      router.push(`/${locale}`);
    }
  }, [isLoggedIn, isLoading]); // Add isLoading and locale to dependencies

  return (
    <>
      {!isLoggedIn && !isLoading && <RegisterForm />}
    </>
  );
}