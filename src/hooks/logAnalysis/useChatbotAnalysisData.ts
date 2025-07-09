'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatbotLogAnalysisResult } from '@/src/app/api/logAnalysis/logAnalysisChatbot.types';
import { useAuth } from '@/src/contexts/AuthContext';
import { fetchChatbotLogAnalysisData } from '@/src/app/api/logAnalysis/chatbotLogAnalysisApi';

export const useChatbotAnalysisData = () => {
    const { isLoggedIn, isInitializing: isAuthInitializing, getToken } = useAuth();
    const [data, setData] = useState<ChatbotLogAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const fetchData = useCallback(async (isManualRefresh = false) => {
        if (!isMountedRef.current) return;
        
        console.log(`[useChatbotAnalysisData] Fetching data. Manual: ${isManualRefresh}`);
        setIsLoading(true);
        setError(null);
        
        const currentToken = getToken();
        if (!currentToken) {
            if (isMountedRef.current) {
                setError("Authentication required.");
                setIsLoading(false);
                setData(null);
            }
            return;
        }

        try {
            const result = await fetchChatbotLogAnalysisData();
            if (isMountedRef.current) {
                setData(result);
            }
        } catch (err: any) {
            if (isMountedRef.current) {
                setError(err.message || 'Failed to fetch data');
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [getToken]);

    // Effect để fetch data khi component mount hoặc login status thay đổi
    useEffect(() => {
        if (isAuthInitializing) {
            if (isMountedRef.current) setIsLoading(true);
            return;
        }
        if (!isLoggedIn) {
            if (isMountedRef.current) {
                setData(null);
                setIsLoading(false);
                setError(null);
            }
            return;
        }
        fetchData(false);
    }, [isAuthInitializing, isLoggedIn, fetchData]);

    return { data, isLoading, error, refetchData: fetchData };
};