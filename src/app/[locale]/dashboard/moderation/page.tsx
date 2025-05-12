// src/app/[locale]/dashboard/moderation/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthApi from '@/src/hooks/auth/useAuthApi';
import Moderation from './Moderation';
// Import useTranslations
import { useTranslations } from 'next-intl'; // <-- Added import

// Component Page for route /dashboard/moderation/[locale]
export default function ModerationPage({ params: { locale } }: { params: { locale: string } }) {
    // Call useTranslations hook
    const t = useTranslations('ModerationPage'); // <-- Added hook call (using a namespace example)

    // Use the auth hook
    const { isLoggedIn, isLoading } = useAuthApi();
    const router = useRouter();

    // Effect to check authentication status and redirect
    useEffect(() => {
        if (!isLoading) {
            if (!isLoggedIn) {
                console.log(`[${locale}/dashboard/moderation/page.tsx] User not logged in. Redirecting to login.`);
                router.replace(`/${locale}/auth/login`);
            } else {
                console.log(`[${locale}/dashboard/moderation/page.tsx] User is logged in. Rendering Moderation.`);
            }
        } else {
             console.log(`[${locale}/dashboard/moderation/page.tsx] Checking auth status...`);
        }
    }, [isLoggedIn, isLoading, locale, router]);

    // Hide content or display loading spinner while waiting for auth check
    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full min-h-[50vh]">
               {/* Translate loading message */}
               {t('AuthStatus_Loading')} {/* <-- Translated */}
            </div>
        );
    }

    // If not loading AND not logged in, useEffect triggered redirect.
    // Render null or a small message while waiting for browser navigation.
    if (!isLoggedIn) {
        // Optionally translate redirecting message
        // return <div className="flex items-center justify-center w-full min-h-[50vh]">{t('AuthStatus_Redirecting')}</div>;
        return null;
    }

    // If not loading AND logged in, render Moderation component
    return <Moderation />; // Moderation component will handle its own translations
}