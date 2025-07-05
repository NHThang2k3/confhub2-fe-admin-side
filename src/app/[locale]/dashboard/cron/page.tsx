// src/app/[locale]/dashboard/crawl/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import CronUpdateCard from './CronUpdateCard';
import { useTranslations } from 'next-intl';


export default function CronPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('CronPage');
    const { isLoggedIn, isInitializing, isLoading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (isInitializing) {
            return;
        }
        if (!isLoggedIn) {
            router.replace(`/${locale}/auth/login`);
        } 
    }, [isLoggedIn, isInitializing, locale, router]);

    if (isInitializing || isLoading) {
        return (
            <div className="flex items-center justify-center w-full min-h-[50vh]">
                {t('AuthStatus_Loading')} 
            </div>
        );
    }

    if (!isLoggedIn) {
        return null;
    }
    return <CronUpdateCard />;
}