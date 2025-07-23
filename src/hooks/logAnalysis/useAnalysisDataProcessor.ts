import { useMemo, useCallback } from 'react';
import {
    LogAnalysisResultUnion,
    CrawlerType,
} from '@/src/hooks/logAnalysis/useLogAnalysisData';
import { ConferenceLogAnalysisResult } from '@/src/models/logAnalysis';
import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types';

type TranslationFunction = (key: string, values?: Record<string, any>) => string;

interface UseAnalysisDataProcessorProps {
    rawData: LogAnalysisResultUnion | null;
    activeRequestIdFilter?: string; // This is the activeTextFilter from the parent
    timeFilterOption: string;
    filterStartTime?: number;
    filterEndTime?: number;
    activeCrawler: CrawlerType;
    loading: boolean;
    t: TranslationFunction;
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

    const currentData = useMemo(() => rawData as LogAnalysisResultUnion | null, [rawData]);

    // --- START OF CHANGE ---
    // Logic xác định isDetailView và isListView được làm lại để xử lý đúng các trường hợp
    
    const isDetailView = useMemo(() => {
        // Điều kiện tiên quyết để là Detail View:
        // 1. Phải có một filter ID đang được áp dụng (activeRequestIdFilter).
        // 2. Phải có dữ liệu trả về từ backend (currentData).
        // 3. Backend phải xác nhận rằng nó đã lọc theo đúng ID đó (currentData.filterRequestId === activeRequestIdFilter).
        // Đây là tín hiệu mạnh nhất cho thấy người dùng đã chủ động yêu cầu xem chi tiết một request cụ thể.
        return !!activeRequestIdFilter && !!currentData && currentData.filterRequestId === activeRequestIdFilter;
    }, [activeRequestIdFilter, currentData]);

    const isListView = useMemo(() => {
        // Nếu không phải là Detail View và có dữ liệu, thì nó là List View.
        // Điều này bao gồm cả trường hợp danh sách có nhiều mục, một mục, hoặc không có mục nào (sẽ hiển thị thông báo NoData).
        if (!currentData) {
            return false;
        }
        return !isDetailView;
    }, [currentData, isDetailView]);

    // --- END OF CHANGE ---


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

            if (!req || !req.status) {
                return false;
            }

            if (req.status === 'NotFoundInAggregation') {
                return false;
            }

            if (req.status === 'NoRequestsAnalyzed' && req.errorMessages?.some(msg => msg.toLowerCase().includes('matching filters'))) {
                return false;
            }

            return true;
        });

        if (filteredIds.length === 0 && currentData.analyzedRequestIds.length > 0 && allRequestsFilteredOutDueToTime) {
            return null;
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
    }, [currentData, allRequestsFilteredOutDueToTime]);

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