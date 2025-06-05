// src/app/[locale]/dashboard/logAnalysis/Analysis.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    useLogAnalysisData,
    CrawlerType,
    LogAnalysisResultUnion
} from '../../../../hooks/logAnalysis/useLogAnalysisData';
import {
    FaExclamationTriangle, FaSyncAlt, FaBookOpen, FaUsers
} from 'react-icons/fa';
import { useTranslations } from 'next-intl';

import AnalysisHeader from './analysis/AnalysisHeader';
import { ConferenceLogAnalysisResult } from '@/src/models/logAnalysis';
import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types';
// *** IMPORT SortConfig và RequestSortableKey TỪ LogRequestsList HOẶC ĐỊNH NGHĨA Ở ĐÂY ***
import LogRequestsList, { SortConfig } from './analysis/LogRequestsList';
import { RequestSortableKey } from './analysis/RequestsTable'; // Giả sử RequestSortableKey được export từ RequestsTable
import RequestDetailView from './analysis/RequestDetailView';
import LoadingScreen from './analysis/LoadingScreen';
import ErrorScreen from './analysis/ErrorScreen';
import NoDataDisplay from './analysis/NoDataDisplay';

// formatDateTime và getStatusChipClass giữ nguyên

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
        case 'completedwitherrors':
            return 'bg-yellow-100 text-yellow-700';
        case 'unknown':
            return 'bg-gray-200 text-gray-600';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const DEFAULT_SORT_CONFIG: SortConfig = { key: 'startTime', direction: 'descending' };

const Analysis: React.FC = () => {
    const t = useTranslations('AnalysisPage');

    const [timeFilterOption, setTimeFilterOption] = useState<string>('latest');
    const [filterStartTime, setFilterStartTime] = useState<number | undefined>(undefined);
    const [filterEndTime, setFilterEndTime] = useState<number | undefined>(undefined);
    const [requestIdFilterInput, setRequestIdFilterInput] = useState<string>('');
    const [activeRequestIdFilter, setActiveRequestIdFilter] = useState<string | undefined>(undefined);

    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [activeCrawler, setActiveCrawler] = useState<CrawlerType>('conference');
    const [isLogRequestsExpanded, setIsLogRequestsExpanded] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // *** STATE CHO SẮP XẾP - QUẢN LÝ Ở ANALYSIS.TSX ***
    const [sortConfig, setSortConfig] = useState<SortConfig>(DEFAULT_SORT_CONFIG);

    // *** RESET CURRENT PAGE VÀ SORT CONFIG KHI FILTERS CHÍNH THAY ĐỔI ***
    useEffect(() => {
        setCurrentPage(1);
        setSortConfig(DEFAULT_SORT_CONFIG); // Reset sort về mặc định
    }, [timeFilterOption, activeRequestIdFilter, activeCrawler]);


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
        activeCrawler,
        filterStartTime,
        filterEndTime,
        activeRequestIdFilter
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // *** HÀM XỬ LÝ SẮP XẾP - QUẢN LÝ Ở ANALYSIS.TSX ***
    const handleSort = (key: RequestSortableKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending'; // Quay lại ascending thay vì bỏ sort
        }
        setSortConfig({ key, direction });
        setCurrentPage(1); // Reset về trang 1 khi sort
    };

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
        // Sort config sẽ được reset bởi useEffect ở trên
    }, []);

    const handleSelectRequestFromList = (reqId: string) => {
        setRequestIdFilterInput(reqId);
        setActiveRequestIdFilter(reqId);
        // Sort config sẽ được reset bởi useEffect ở trên
    };

    const handleToggleSummary = () => setIsSummaryExpanded(prev => !prev);
    const handleToggleLogRequests = () => setIsLogRequestsExpanded(prev => !prev);


    const isDetailView = !!activeRequestIdFilter && !!data && data.filterRequestId === activeRequestIdFilter;
    const isListView = !activeRequestIdFilter && !!data && !data.filterRequestId;

    const currentData = data as LogAnalysisResultUnion | null;

    const hasOverallDataForDisplay = useMemo(() => {
        // ... (logic giữ nguyên)
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
        // ... (logic giữ nguyên)
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
        // ... (logic giữ nguyên)
        if (isDetailView && !hasOverallDataForDisplay) {
            return t('noData.forRequestId', { requestId: activeRequestIdFilter });
        }
        if (isListView && (!currentData?.analyzedRequestIds || currentData.analyzedRequestIds.length === 0)) {
            return t('noData.noRequestsForPeriod');
        }
        if (!loading && !hasOverallDataForDisplay && timeFilterOption !== 'latest' && !isDetailView) {
            return t('noData.noResultsForPeriod');
        }
        if (!loading && !hasOverallDataForDisplay && !isDetailView) {
            return t('noData.genericNoResults');
        }
        return t('noData.noSpecificData');
    }, [isDetailView, activeRequestIdFilter, isListView, currentData, hasOverallDataForDisplay, loading, timeFilterOption, t]);

    const CrawlerTypeSelector = () => (
        // ... (logic giữ nguyên)
        <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-md shadow-sm bg-white border border-gray-300" role="group">
                <button
                    type="button"
                    onClick={() => {
                        setActiveCrawler('conference');
                        // Sort config sẽ được reset bởi useEffect ở trên
                    }}
                    className={`px-6 py-3 text-sm font-medium rounded-l-md focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150 ease-in-out
                        ${activeCrawler === 'conference'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 hover:bg-gray-100 border-gray-300'
                        }`}
                >
                    <FaUsers className="inline mr-2" /> {t('crawlerTypes.conference')}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setActiveCrawler('journal');
                        // Sort config sẽ được reset bởi useEffect ở trên
                    }}
                    className={`px-6 py-3 text-sm font-medium rounded-r-md focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150 ease-in-out
                        ${activeCrawler === 'journal'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 hover:bg-gray-100 border-gray-300'
                        }`}
                >
                    <FaBookOpen className="inline mr-2" /> {t('crawlerTypes.journal')}
                </button>
            </div>
        </div>
    );


    if (loading && !currentData && !error) {
        // ... (LoadingScreen giữ nguyên)
        return (
            <LoadingScreen>
                <CrawlerTypeSelector />
                <AnalysisHeader
                    loading={true} error={null} isConnected={isConnectedToSocket} data={null}
                    timeFilterOption={timeFilterOption} handleFilterChange={handleTimeFilterChange}
                    refetchData={refetchData}
                    requestIdFilterInput={requestIdFilterInput}
                    setRequestIdFilterInput={setRequestIdFilterInput}
                    applyRequestIdFilter={applyRequestIdFilterFromInput}
                    clearRequestIdFilter={clearActiveFilterAndGoToList}
                    crawlerType={activeCrawler}
                />
            </LoadingScreen>
        );
    }

    if (error && !currentData && !loading) {
        // ... (ErrorScreen giữ nguyên)
        return (
            <ErrorScreen error={error} onRetry={refetchData}>
                <CrawlerTypeSelector />
                <AnalysisHeader
                    loading={false} error={error} isConnected={isConnectedToSocket} data={null}
                    timeFilterOption={timeFilterOption} handleFilterChange={handleTimeFilterChange}
                    refetchData={refetchData}
                    requestIdFilterInput={requestIdFilterInput}
                    setRequestIdFilterInput={setRequestIdFilterInput}
                    applyRequestIdFilter={applyRequestIdFilterFromInput}
                    clearRequestIdFilter={clearActiveFilterAndGoToList}
                    crawlerType={activeCrawler}
                />
            </ErrorScreen>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans space-y-6"> {/* Sửa lại p-2 nếu bạn muốn */}
            <CrawlerTypeSelector />
            <AnalysisHeader
                // ... (props giữ nguyên)
                loading={loading && !!currentData}
                error={(error && currentData) ? error : null}
                isConnected={isConnectedToSocket}
                data={currentData}
                timeFilterOption={timeFilterOption}
                handleFilterChange={handleTimeFilterChange}
                refetchData={refetchData}
                requestIdFilterInput={requestIdFilterInput}
                setRequestIdFilterInput={setRequestIdFilterInput}
                applyRequestIdFilter={applyRequestIdFilterFromInput}
                clearRequestIdFilter={clearActiveFilterAndGoToList}
                crawlerType={activeCrawler}
            />

            {isListView && currentData && (
                <LogRequestsList
                    isExpanded={isLogRequestsExpanded}
                    onToggle={handleToggleLogRequests}
                    data={currentData}
                    onSelectRequest={handleSelectRequestFromList}
                    formatDateTime={formatDateTime}
                    getStatusChipClass={getStatusChipClass}
                    isSummaryExpandedOverall={isSummaryExpanded}
                    onToggleSummaryOverall={handleToggleSummary}
                    getNoDataMessage={getNoDataFoundMessage}
                    hasOverallDataForDisplay={hasOverallDataForDisplay}
                    crawlerType={activeCrawler}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    totalRequestCount={currentData.analyzedRequestIds ? currentData.analyzedRequestIds.length : 0}
                    // *** TRUYỀN SORT CONFIG VÀ HANDLER XUỐNG ***
                    sortConfig={sortConfig}
                    onSort={handleSort}
                />
            )}

            {isDetailView && currentData && (
                // ... (RequestDetailView giữ nguyên)
                <RequestDetailView
                    data={currentData}
                    activeRequestIdFilter={activeRequestIdFilter}
                    onClearFilter={clearActiveFilterAndGoToList}
                    isSummaryExpandedOverall={isSummaryExpanded}
                    onToggleSummaryOverall={handleToggleSummary}
                    getNoDataMessage={getNoDataFoundMessage}
                    hasOverallDataForDisplay={hasOverallDataForDisplay}
                    hasItemDetailsForDisplay={hasItemDetailsForDisplay}
                    loading={loading}
                    activeCrawler={activeCrawler}
                />
            )}

            {/* ... (Fallback No Data / Status Messages giữ nguyên) ... */}
             {!loading && currentData === null && !error && (
                <NoDataDisplay message={getNoDataFoundMessage()} />
            )}
            {!loading && currentData !== null && !isListView && !isDetailView && (
                <NoDataDisplay
                    message={t('statusMessages.dataLoadedCriteriaNotMet')}
                    subMessage={currentData.filterRequestId ? t('statusMessages.dataIsForRequestId', { requestId: currentData.filterRequestId }) : t('statusMessages.dataIsGeneralSummary')}
                />
            )}

            {loading && currentData && (
                <div className="mt-6 text-center text-blue-600">
                    <FaSyncAlt className="inline mr-2 animate-spin" />
                    {activeRequestIdFilter ? t('refreshing.details', { requestId: activeRequestIdFilter }) : t('refreshing.analysisData')}
                </div>
            )}
            {error && currentData && (
                <div className="mt-4 text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
                    <FaExclamationTriangle className="inline mr-1" /> {t('refreshing.error', { error: error })}
                </div>
            )}
        </div>
    );
};

export default Analysis;