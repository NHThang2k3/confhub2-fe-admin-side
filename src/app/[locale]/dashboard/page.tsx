// src/app/[locale]/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// Import useTranslations
import { useTranslations } from 'next-intl'; // <-- Add import


export default function DashboardRootPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  // Call useTranslations hook
  const t = useTranslations(''); // <-- Add hook call (using the default namespace)

  useEffect(() => {
    const rootPath = `/${locale}/dashboard`;
    // Check if the current path is exactly the dashboard root path (with or without trailing slash)
    if (pathname === rootPath || pathname === `${rootPath}/`) {
      console.log(`[${locale}/dashboard/page.tsx] At dashboard root, redirecting to logAnalysis...`);
      router.replace(`/${locale}/dashboard/logAnalysis`);
    }

  }, [locale, pathname, router]); // Dependencies: locale, pathname, router

  // Render nothing or a small loader while redirecting
  return (
     <div className="flex flex-col items-center justify-center w-full">
        {/* Translate loading message */}
        <p>{t('Dashboard_Loading')}</p> {/* <-- Translated */}
     </div>
  );
}