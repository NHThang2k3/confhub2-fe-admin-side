// src/app/[locale]/dashboard/logAnalysis/Analysis.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLogAnalysisData } from '../../../../hooks/logAnalysis/useLogAnalysisData';
import {
    FaExclamationTriangle, FaSyncAlt
} from 'react-icons/fa';

import ConferenceCrawlUploader from './ConferenceCrawlUploader';
import JournalCrawlUploader from './JournalCrawlUploader';

// New Child Components
import CrawlerTools from './CrawlerTools';

// import LogRequestsList from './analysis/LogRequestsList';
// import RequestDetailView from './analysis/RequestDetailView';
import LoadingScreen from '../logAnalysis/analysis/LoadingScreen';
import ErrorScreen from '../logAnalysis/analysis/ErrorScreen';
import NoDataDisplay from '../logAnalysis/analysis/NoDataDisplay';

export type CrawlerType = 'conference' | 'journal';

const Crawl: React.FC = () => {
    const [timeFilterOption, setTimeFilterOption] = useState<string>('latest');
    const [filterStartTime, setFilterStartTime] = useState<number | undefined>(undefined);
    const [filterEndTime, setFilterEndTime] = useState<number | undefined>(undefined);
    const [requestIdFilterInput, setRequestIdFilterInput] = useState<string>('');
    const [activeRequestIdFilter, setActiveRequestIdFilter] = useState<string | undefined>(undefined);

    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [activeCrawler, setActiveCrawler] = useState<CrawlerType>('conference');
    const [isCrawlerSectionExpanded, setIsCrawlerSectionExpanded] = useState(false);
    const [isLogRequestsExpanded, setIsLogRequestsExpanded] = useState(true);

    useEffect(() => {
        const now = Date.now();
        let start: number | undefined = undefined;
        let end: number | undefined = undefined;

        switch (timeFilterOption) {
            case 'last_hour': start = now - 60 * 60 * 1000; end = now; break;
            case 'last_6h': start = now - 6 * 60 * 60 * 1000; end = now; break;
            case 'last_24h': start = now - 24 * 60 * 60 * 1000; end = now; break;
            case 'last_7d': start = now - 7 * 24 * 60 * 60 * 1000; end = now; break;
            case 'latest': default: break;
        }
        setFilterStartTime(start);
        setFilterEndTime(end);
    }, [timeFilterOption]);

    const { data, loading, error, isConnectedToSocket, refetchData } = useLogAnalysisData(
        filterStartTime,
        filterEndTime,
        activeRequestIdFilter
    );

    const handleTimeFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeFilterOption(event.target.value);
    };

    const applyRequestIdFilterFromInput = useCallback(() => {
        const trimmedInput = requestIdFilterInput.trim();
        setActiveRequestIdFilter(trimmedInput || undefined);
    }, [requestIdFilterInput]);

    const clearActiveFilterAndGoToList = useCallback(() => {
        setRequestIdFilterInput('');
        setActiveRequestIdFilter(undefined);
    }, []);

    const handleSelectRequestFromList = (reqId: string) => {
        setRequestIdFilterInput(reqId);
        setActiveRequestIdFilter(reqId);
    };

    const handleToggleSummary = () => setIsSummaryExpanded(prev => !prev);
    const handleToggleCrawlerSection = () => setIsCrawlerSectionExpanded(prev => !prev);
    const handleToggleLogRequests = () => setIsLogRequestsExpanded(prev => !prev);

    const isDetailView = !!activeRequestIdFilter && !!data && data.filterRequestId === activeRequestIdFilter;
    const isListView = !activeRequestIdFilter && !!data && !data.filterRequestId;
    const hasOverallDataForDisplay = !!data?.overall && data.overall.processedConferencesCount > 0;
    const hasConferenceDetailsForDisplay = !!data?.conferenceAnalysis && Object.keys(data.conferenceAnalysis).length > 0;

    const getNoDataFoundMessage = useCallback((): string => {
        if (isDetailView && !hasOverallDataForDisplay) {
            return `No analysis results found for Request ID: "${activeRequestIdFilter}".`;
        }
        if (isListView && (!data?.analyzedRequestIds || data.analyzedRequestIds.length === 0)) {
            return `No analysis requests found for the selected time period. Consider selecting "Latest" or uploading new logs.`;
        }
        if (!loading && !hasOverallDataForDisplay && timeFilterOption !== 'latest' && !isDetailView) {
            return `No analysis results found for the selected time period. Consider selecting "Latest".`;
        }
        if (!loading && !hasOverallDataForDisplay && !isDetailView) {
            return "No analysis results found. The log might be empty, processing is pending, or no data matches the current time filter.";
        }
        return "No specific data to display for the current view.";
    }, [isDetailView, activeRequestIdFilter, isListView, data, hasOverallDataForDisplay, loading, timeFilterOption]);


    if (loading && !data && !error) {
        return (
            <LoadingScreen>
            </LoadingScreen>
        );
    }

    if (error && !data && !loading) {
        return (
            <ErrorScreen error={error} onRetry={refetchData}>
            </ErrorScreen>
        );
    }

    return (
        <div className="p-2 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans space-y-6">
            {!isDetailView && (
                <CrawlerTools
                    isExpanded={isCrawlerSectionExpanded}
                    onToggle={handleToggleCrawlerSection}
                    activeCrawler={activeCrawler}
                    onSetCrawler={setActiveCrawler}
                    ConferenceCrawlUploaderComponent={ConferenceCrawlUploader}
                    // JournalCrawlUploaderComponent={JournalCrawlUploader}
                />
            )}

            {/* Fallback No Data / Status Messages */}
            {!loading && data === null && !error && (
                <NoDataDisplay message={getNoDataFoundMessage()} />
            )}
            {!loading && data !== null && !isListView && !isDetailView && (
                <NoDataDisplay
                    message="Analysis data loaded, but current view criteria not met. Try adjusting filters or refreshing."
                    subMessage={data.filterRequestId ? `Data is for: ${data.filterRequestId}` : "Data is general summary."}
                />
            )}

            {/* Refreshing/Error states when data already exists */}
            {loading && data && (
                <div className="mt-6 text-center text-blue-600">
                    <FaSyncAlt className="inline mr-2 animate-spin" />
                    {activeRequestIdFilter ? `Refreshing details for ${activeRequestIdFilter}...` : "Refreshing analysis data..."}
                </div>
            )}
            {error && data && (
                <div className="mt-4 text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
                    <FaExclamationTriangle className="inline mr-1" /> Error refreshing data: {error}
                </div>
            )}
        </div>
    );
};

export default Crawl;