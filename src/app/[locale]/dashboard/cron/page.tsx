// src/app/[locale]/dashboard/crawl/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import CronUpdateCard from './CronUpdateCard';
import { DelayedCrawlCard } from '@/src/components/cron';
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
    
    return (
        <div className="space-y-6 p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('PageTitle') || 'Cron Job Management'}</h1>
                <p className="text-gray-600 mt-2">{t('PageDescription') || 'Manage automatic and delayed conference crawl jobs'}</p>
            </div>
            <CronUpdateCard />
            <DelayedCrawlCard />
        </div>
    );
}