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

    const isDetailView = useMemo(
        () => !!activeRequestIdFilter && !!currentData && currentData.filterRequestId === activeRequestIdFilter,
        [activeRequestIdFilter, currentData]
    );

    const isListView = useMemo(() => {
        if (!currentData) {
            return false;
        }
        const isGeneralList = !activeRequestIdFilter && !currentData.filterRequestId;
        const isFilteredList = !!activeRequestIdFilter && !currentData.filterRequestId;
        
        return isGeneralList || isFilteredList;
    }, [activeRequestIdFilter, currentData]);

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
        
        // --- START OF CORRECTION ---
        // This logic now explicitly filters out all known "placeholder" request types.
        const filteredIds = currentData.analyzedRequestIds.filter(id => {
            const req = currentData.requests[id];

            // Rule 1: Filter out if request data is missing or has no status.
            // This handles the Conference backend's empty objects `{}`.
            if (!req || !req.status) {
                return false;
            }

            // Rule 2: Filter out if the status indicates it was not found.
            // This handles the Journal backend's specific placeholder status.
            // We assume the status string is 'NotFoundInAggregation' based on the UI.
            if (req.status === 'NotFoundInAggregation') {
                return false;
            }

            // Rule 3: Filter out the generic placeholder for when no requests match the time filter.
            // This object should not appear as a row in the table.
            if (req.status === 'NoRequestsAnalyzed' && req.errorMessages?.some(msg => msg.toLowerCase().includes('matching filters'))) {
                return false;
            }

            // If none of the above placeholder conditions are met, it's a real request.
            return true;
        });
        // --- END OF CORRECTION ---

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