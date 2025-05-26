// src/app/[locale]/dashboard/logAnalysis/Analysis.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLogAnalysisData } from '../../../../hooks/logAnalysis/useLogAnalysisData';
import {
    FaExclamationTriangle, FaSyncAlt
} from 'react-icons/fa';
import { useTranslations } from 'next-intl'; // Import useTranslations

import AnalysisHeader from './analysis/AnalysisHeader';
import OverallSummary from './OverallSummary';
import ConferenceDetails from './analysis/ConferenceDetails';

// New Child Components
import LogRequestsList from './analysis/LogRequestsList';
import RequestDetailView from './analysis/RequestDetailView';
import LoadingScreen from './analysis/LoadingScreen';
import ErrorScreen from './analysis/ErrorScreen';
import NoDataDisplay from './analysis/NoDataDisplay';

export type CrawlerType = 'conference' | 'journal';

// (formatDateTime function giữ nguyên - vì nó xử lý định dạng ngày giờ, không phải chuỗi hiển thị)
export const formatDateTime = (isoString: string | null | undefined): string => {
    if (!isoString) {
        return 'N/A';
    }
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        const datePart = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timePart = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        return `${datePart} ${timePart}`;
    } catch (e) {
        return 'Invalid Date String';
    }
};

// Helper function để lấy class màu cho status chip (giữ nguyên)
// Lưu ý: Nếu bạn muốn dịch các trạng thái như 'Completed', 'Failed', bạn sẽ cần truyền t và dịch chúng ở đây.
// Hiện tại, chúng ta chỉ dịch các chuỗi hiển thị, không phải giá trị của status.
export const getStatusChipClass = (status: string | undefined | null): string => {
    if (!status) return 'bg-gray-100 text-gray-700';
    switch (status.toLowerCase()) {
        case 'completed':
            return 'bg-green-100 text-green-700';
        case 'failed':
            return 'bg-red-100 text-red-700';
        case 'processing':
            return 'bg-blue-100 text-blue-700';
        case 'partiallycompleted':
            return 'bg-yellow-100 text-yellow-700';
        case 'unknown':
            return 'bg-gray-200 text-gray-600';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const Analysis: React.FC = () => {
    // Khởi tạo t với namespace 'AnalysisPage'
    const t = useTranslations('AnalysisPage');

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
            return t('noData.forRequestId', { requestId: activeRequestIdFilter });
        }
        if (isListView && (!data?.analyzedRequestIds || data.analyzedRequestIds.length === 0)) {
            return t('noData.noRequestsForPeriod');
        }
        if (!loading && !hasOverallDataForDisplay && timeFilterOption !== 'latest' && !isDetailView) {
            return t('noData.noResultsForPeriod');
        }
        if (!loading && !hasOverallDataForDisplay && !isDetailView) {
            return t('noData.genericNoResults');
        }
        return t('noData.noSpecificData');
    }, [isDetailView, activeRequestIdFilter, isListView, data, hasOverallDataForDisplay, loading, timeFilterOption, t]);


    if (loading && !data && !error) {
        return (
            <LoadingScreen>
                <AnalysisHeader
                    loading={true} error={null} isConnected={isConnectedToSocket} data={null}
                    timeFilterOption={timeFilterOption} handleFilterChange={handleTimeFilterChange}
                    refetchData={refetchData}
                    requestIdFilterInput={requestIdFilterInput}
                    setRequestIdFilterInput={setRequestIdFilterInput}
                    applyRequestIdFilter={applyRequestIdFilterFromInput}
                    clearRequestIdFilter={clearActiveFilterAndGoToList}
                />
            </LoadingScreen>
        );
    }

    if (error && !data && !loading) {
        return (
            <ErrorScreen error={error} onRetry={refetchData}>
                <AnalysisHeader
                    loading={false} error={error} isConnected={isConnectedToSocket} data={null}
                    timeFilterOption={timeFilterOption} handleFilterChange={handleTimeFilterChange}
                    refetchData={refetchData}
                    requestIdFilterInput={requestIdFilterInput}
                    setRequestIdFilterInput={setRequestIdFilterInput}
                    applyRequestIdFilter={applyRequestIdFilterFromInput}
                    clearRequestIdFilter={clearActiveFilterAndGoToList}
                />
            </ErrorScreen>
        );
    }

    return (
        <div className="p-2 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans space-y-6">
            <AnalysisHeader
                loading={loading && !!data} // Show loading on header if data exists but is refreshing
                error={(error && data) ? error : null} // Show error on header if data exists and refresh failed
                isConnected={isConnectedToSocket}
                data={data}
                timeFilterOption={timeFilterOption}
                handleFilterChange={handleTimeFilterChange}
                refetchData={refetchData}
                requestIdFilterInput={requestIdFilterInput}
                setRequestIdFilterInput={setRequestIdFilterInput}
                applyRequestIdFilter={applyRequestIdFilterFromInput}
                clearRequestIdFilter={clearActiveFilterAndGoToList}
            />

            {isListView && data && (
                <LogRequestsList
                    isExpanded={isLogRequestsExpanded}
                    onToggle={handleToggleLogRequests}
                    data={data}
                    onSelectRequest={handleSelectRequestFromList}
                    formatDateTime={formatDateTime}
                    getStatusChipClass={getStatusChipClass}
                    OverallSummaryComponent={OverallSummary}
                    isSummaryExpandedOverall={isSummaryExpanded}
                    onToggleSummaryOverall={handleToggleSummary}
                    getNoDataMessage={getNoDataFoundMessage}
                    hasOverallDataForDisplay={hasOverallDataForDisplay}
                />
            )}

            {isDetailView && data && (
                <RequestDetailView
                    data={data}
                    activeRequestIdFilter={activeRequestIdFilter}
                    onClearFilter={clearActiveFilterAndGoToList}
                    OverallSummaryComponent={OverallSummary}
                    isSummaryExpandedOverall={isSummaryExpanded}
                    onToggleSummaryOverall={handleToggleSummary}
                    ConferenceDetailsComponent={ConferenceDetails}
                    getNoDataMessage={getNoDataFoundMessage}
                    hasOverallDataForDisplay={hasOverallDataForDisplay}
                    hasConferenceDetailsForDisplay={hasConferenceDetailsForDisplay}
                    loading={loading}
                // activeCrawler={activeCrawler} // Pass if JournalDetails is re-enabled and needs this
                />
            )}

            {/* Fallback No Data / Status Messages */}
            {!loading && data === null && !error && (
                <NoDataDisplay message={getNoDataFoundMessage()} />
            )}
            {!loading && data !== null && !isListView && !isDetailView && (
                <NoDataDisplay
                    message={t('statusMessages.dataLoadedCriteriaNotMet')}
                    subMessage={data.filterRequestId ? t('statusMessages.dataIsForRequestId', { requestId: data.filterRequestId }) : t('statusMessages.dataIsGeneralSummary')}
                />
            )}

            {/* Refreshing/Error states when data already exists */}
            {loading && data && (
                <div className="mt-6 text-center text-blue-600">
                    <FaSyncAlt className="inline mr-2 animate-spin" />
                    {activeRequestIdFilter ? t('refreshing.details', { requestId: activeRequestIdFilter }) : t('refreshing.analysisData')}
                </div>
            )}
            {error && data && (
                <div className="mt-4 text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
                    <FaExclamationTriangle className="inline mr-1" /> {t('refreshing.error', { error: error })}
                </div>
            )}
        </div>
    );
};

export default Analysis;