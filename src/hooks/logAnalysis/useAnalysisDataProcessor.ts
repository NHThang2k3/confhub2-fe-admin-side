// src/app/[locale]/dashboard/logAnalysis/hooks/useAnalysisDataProcessor.ts
import { useMemo, useCallback } from 'react';
import {
    LogAnalysisResultUnion,
    CrawlerType,
    
    
} from '@/src/hooks/logAnalysis/useLogAnalysisData';
import { ConferenceLogAnalysisResult } from '@/src/models/logAnalysis';
import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types';

// Định nghĩa một kiểu tổng quát cho hàm dịch
type TranslationFunction = (key: string, values?: Record<string, any>) => string;

interface UseAnalysisDataProcessorProps {
    rawData: LogAnalysisResultUnion | null;
    activeRequestIdFilter?: string;
    timeFilterOption: string;
    filterStartTime?: number;
    filterEndTime?: number;
    activeCrawler: CrawlerType;
    loading: boolean;
    t: TranslationFunction; // Sử dụng kiểu đã định nghĩa
}

export const useAnalysisDataProcessor = ({
    rawData,
    activeRequestIdFilter,
    timeFilterOption,
    filterStartTime,
    filterEndTime,
    activeCrawler,
    loading,
    t,
}: UseAnalysisDataProcessorProps) => {
    // ... (phần còn lại của hook giữ nguyên)

    const currentData = useMemo(() => rawData as LogAnalysisResultUnion | null, [rawData]);

    const isDetailView = useMemo(
        () => !!activeRequestIdFilter && !!currentData && currentData.filterRequestId === activeRequestIdFilter,
        [activeRequestIdFilter, currentData]
    );

    const isListView = useMemo(
        () => !activeRequestIdFilter && !!currentData && !currentData.filterRequestId,
        [activeRequestIdFilter, currentData]
    );

    const allRequestsFilteredOutDueToTime = useMemo(() => {
        if (!currentData || !currentData.requests || !currentData.analyzedRequestIds || currentData.analyzedRequestIds.length === 0) {
            return false;
        }
        const hasTimeFilterApplied = timeFilterOption !== 'latest' || filterStartTime !== undefined || filterEndTime !== undefined;
        if (!hasTimeFilterApplied) {
            return false;
        }
        return currentData.analyzedRequestIds.every(id => {
            const req = currentData.requests[id];
            return req?.status === 'NoRequestsAnalyzed' &&
                req.errorMessages?.some(msg => msg.toLowerCase().includes('matching filters'));
        });
    }, [currentData, timeFilterOption, filterStartTime, filterEndTime]);

    const actuallyAnalyzedRequestsData = useMemo(() => {
        if (!currentData || !currentData.requests || !currentData.analyzedRequestIds) {
            return null;
        }
        const filteredIds = currentData.analyzedRequestIds.filter(id => {
            const req = currentData.requests[id];
            if (!req) return false;
            if (req.status !== 'NoRequestsAnalyzed') {
                return true;
            }
            const isFilteredByTime = req.errorMessages?.some(msg => msg.toLowerCase().includes('matching filters'));
            return !isFilteredByTime;
        });

        if (filteredIds.length === 0 && currentData.analyzedRequestIds.length > 0 && allRequestsFilteredOutDueToTime) {
            return null;
        }

        const hasTimeFilterApplied = timeFilterOption !== 'latest' || filterStartTime !== undefined || filterEndTime !== undefined;
        if (!hasTimeFilterApplied) {
            return currentData;
        }

        const newRequestsMap: typeof currentData.requests = {};
        filteredIds.forEach(id => {
            if (currentData.requests[id]) {
                newRequestsMap[id] = currentData.requests[id];
            }
        });

        return {
            ...currentData,
            requests: newRequestsMap,
            analyzedRequestIds: filteredIds,
        } as LogAnalysisResultUnion;
    }, [currentData, allRequestsFilteredOutDueToTime, timeFilterOption, filterStartTime, filterEndTime]);

    const hasOverallDataForDisplay = useMemo(() => {
        if (!currentData?.overall) return false;
        if (activeCrawler === 'conference') {
            const confData = currentData as ConferenceLogAnalysisResult;
            return (confData.overall.processedConferencesCount || 0) > 0 || (confData.overall.totalConferencesInput || 0) > 0;
        }
        if (activeCrawler === 'journal') {
            const journalData = currentData as JournalLogAnalysisResult;
            return (journalData.overall.totalJournalsProcessed || 0) > 0 || (journalData.overall.totalJournalsInput || 0) > 0;
        }
        return false;
    }, [currentData, activeCrawler]);

    const hasItemDetailsForDisplay = useMemo(() => {
        if (!currentData) return false;
        if (activeCrawler === 'conference') {
            const confData = currentData as ConferenceLogAnalysisResult;
            return !!confData.conferenceAnalysis && Object.keys(confData.conferenceAnalysis).length > 0;
        }
        if (activeCrawler === 'journal') {
            const journalData = currentData as JournalLogAnalysisResult;
            return !!journalData.journalAnalysis && Object.keys(journalData.journalAnalysis).length > 0;
        }
        return false;
    }, [currentData, activeCrawler]);

    const getNoDataFoundMessage = useCallback((): string => {
        if (isDetailView && !hasOverallDataForDisplay) {
            const requestDetail = currentData?.requests?.[activeRequestIdFilter!];
            if (requestDetail?.status === 'NoRequestsAnalyzed' && requestDetail.errorMessages?.some(msg => msg.toLowerCase().includes('matching filters'))) {
                return t('noData.forRequestIdMatchingFilters', { requestId: activeRequestIdFilter });
            }
            return t('noData.forRequestId', { requestId: activeRequestIdFilter });
        }
        if (isListView && allRequestsFilteredOutDueToTime) {
            return t('noData.allRequestsFilteredByTime');
        }
        if (isListView && (!actuallyAnalyzedRequestsData?.analyzedRequestIds || actuallyAnalyzedRequestsData.analyzedRequestIds.length === 0)) {
            if (timeFilterOption !== 'latest' || filterStartTime || filterEndTime) {
                return t('noData.noRequestsMatchingFiltersOrPeriod');
            }
            return t('noData.noRequestsForPeriod');
        }
        if (!loading && !hasOverallDataForDisplay && timeFilterOption !== 'latest' && !isDetailView) {
            return t('noData.noResultsForPeriod');
        }
        if (!loading && !hasOverallDataForDisplay && !isDetailView) {
            return t('noData.genericNoResults');
        }
        return t('noData.noSpecificData');
    }, [
        isDetailView, activeRequestIdFilter, isListView, actuallyAnalyzedRequestsData,
        hasOverallDataForDisplay, loading, timeFilterOption, t,
        allRequestsFilteredOutDueToTime, filterStartTime, filterEndTime, currentData
    ]);

    return {
        currentData,
        isDetailView,
        isListView,
        allRequestsFilteredOutDueToTime,
        actuallyAnalyzedRequestsData,
        hasOverallDataForDisplay,
        hasItemDetailsForDisplay,
        getNoDataFoundMessage,
    };
};