// src/hooks/logAnalysis/useDownloadLogOutput.ts
import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CrawlerType } from './useLogAnalysisData';
import { appConfig } from '@/src/middleware';

const NEXT_PUBLIC_BACKEND_URL = appConfig.NEXT_PUBLIC_BACKEND_URL;

export const useDownloadLogOutput = () => {
    const t = useTranslations('AnalysisPage.downloadAction');
    const [isDownloading, setIsDownloading] = useState<string | null>(null); // Lưu requestId đang download
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const downloadFile = useCallback(async (requestId: string, crawlerType: CrawlerType) => {
        setIsDownloading(requestId);
        setDownloadError(null);

        try {
            const url = new URL(`${NEXT_PUBLIC_BACKEND_URL}/api/v1/logs/download`);
            url.searchParams.append('requestId', requestId);
            url.searchParams.append('crawlerType', crawlerType);

            const response = await fetch(url.toString());

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || t('errorGeneric'));
            }

            // Lấy tên file từ header 'Content-Disposition'
            const disposition = response.headers.get('content-disposition');
            let filename = `output_${requestId}.csv`; // Tên file mặc định
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            // Tạo một blob từ response và tạo URL để download
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            
            // Dọn dẹp
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (err: any) {
            console.error('Error downloading file:', err);
            setDownloadError(t('errorNetwork', { errorDetail: err.message || 'Unknown error' }));
            // Tự động xóa thông báo lỗi sau 5 giây
            setTimeout(() => setDownloadError(null), 5000);
        } finally {
            setIsDownloading(null);
        }
    }, [t]);

    return { downloadFile, isDownloading, downloadError };
};