
'use client';

import React, { useEffect } from 'react'; 
import { useRouter } from 'next/navigation';

import { useAuth } from '@/src/contexts/AuthContext';
import ChatbotAnalysis from './ChatbotAnalysis';

import { useTranslations } from 'next-intl';


export default function LogAnalysisPage({ params: { locale } }: { params: { locale: string } }) {
    
    const t = useTranslations('ChatbotLogAnalysisPage'); 

    
    const { isLoggedIn, isInitializing, isLoading } = useAuth();
    const router = useRouter();

    
    useEffect(() => {
        
        if (isInitializing) {
            console.log(`[${locale}/dashboard/chatbot/page.tsx] AuthContext is initializing...`);
            return; 
        }

        
        if (!isLoggedIn) {
            console.log(`[${locale}/dashboard/chatbot/page.tsx] User not logged in (after init). Redirecting to login.`);
            
            router.replace(`/${locale}/auth/login`);
        } else {
            console.log(`[${locale}/dashboard/chatbot/page.tsx] User is logged in (after init). Rendering Analysis.`);
        }
    
    }, [isLoggedIn, isInitializing, locale, router]);

    
    
    if (isInitializing || isLoading) {
        return (
            <div className="flex items-center justify-center w-full min-h-[50vh]">
               {t('AuthStatus_Loading')} {/* Sử dụng key từ translations */}
            </div>
        );
    }

    
    
    if (!isLoggedIn) {
        
        return null; 
    }

    
    return <ChatbotAnalysis />; 
}