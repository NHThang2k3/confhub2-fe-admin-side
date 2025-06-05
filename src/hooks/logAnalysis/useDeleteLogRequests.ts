// src/hooks/logAnalysis/useDeleteLogRequests.ts
import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CrawlerType } from './useLogAnalysisData'; // Assuming CrawlerType is exported here
import { appConfig } from '@/src/middleware';

interface DeleteRequestsPayload {
    requestIds: string[];
    crawlerType: CrawlerType;
}

interface DeletionOpResultFE { // Frontend version of DeletionOpResult
    success: boolean;
    path?: string;
    error?: string;
}

// Make sure to export this interface
export interface RequestDeletionResultFE { // Frontend version of RequestDeletionResult
    requestId: string;
    logFile: DeletionOpResultFE;
    cacheFile: DeletionOpResultFE;
    overallSuccess: boolean;
    errorMessage?: string;
}

interface DeletionApiResponse {
    message: string;
    results?: RequestDeletionResultFE[];
}

const NEXT_PUBLIC_BACKEND_URL = appConfig.NEXT_PUBLIC_BACKEND_URL;

export const useDeleteLogRequests = () => {
    const t = useTranslations('AnalysisPage.deleteAction'); // Namespace for delete related translations
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [detailedResults, setDetailedResults] = useState<RequestDeletionResultFE[] | null>(null); // Uses RequestDeletionResultFE

    const deleteRequests = useCallback(async (payload: DeleteRequestsPayload): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        setDetailedResults(null);

        try {
            // Adjust API path if your Next.js app serves the API from a different base
            const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/v1/logs/requests`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data: DeletionApiResponse = await response.json();

            if (!response.ok && response.status !== 207) { // 207 is partial success
                const errorMsg = data.message || t('errorGeneric');
                setError(errorMsg);
                if(data.results) setDetailedResults(data.results);
                console.error('Error deleting requests:', data);
                return false;
            }

            setSuccessMessage(data.message || t('successGeneric'));
            if(data.results) setDetailedResults(data.results);
            return true; // Indicates the API call itself was successful (even if some items failed)
        } catch (err: any) {
            console.error('Network or unexpected error deleting requests:', err);
            setError(t('errorNetwork', { errorDetail: err.message || 'Unknown error' }));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    const clearMessages = useCallback(() => {
        setError(null);
        setSuccessMessage(null);
        setDetailedResults(null);
    }, []);

    return { deleteRequests, isLoading, error, successMessage, detailedResults, clearMessages };
};