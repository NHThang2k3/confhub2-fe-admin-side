// src/app/[locale]/dashboard/logAnalysis/Analysis.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    useLogAnalysisData,
    CrawlerType,
    LogAnalysisResultUnion
} from '../../../../hooks/logAnalysis/useLogAnalysisData';
import {
    FaExclamationTriangle, FaSyncAlt, FaBookOpen, FaUsers, FaCheckCircle, FaTimesCircle // Added for deletion status
} from 'react-icons/fa';
import { useTranslations } from 'next-intl';

import AnalysisHeader from './analysis/AnalysisHeader';
import { ConferenceLogAnalysisResult } from '@/src/models/logAnalysis';
import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types';
import LogRequestsList, { SortConfig } from './analysis/LogRequestsList';
import { RequestSortableKey } from './analysis/RequestsTable';
import RequestDetailView from './analysis/RequestDetailView';
import LoadingScreen from './analysis/LoadingScreen';
import ErrorScreen from './analysis/ErrorScreen';
import NoDataDisplay from './analysis/NoDataDisplay';
import { useDeleteLogRequests } // Import the hook
    from '../../../../hooks/logAnalysis/useDeleteLogRequests';


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
    const tCommon = useTranslations('Common'); // For common translations like "close"

    const [timeFilterOption, setTimeFilterOption] = useState<string>('latest');
    const [filterStartTime, setFilterStartTime] = useState<number | undefined>(undefined);
    const [filterEndTime, setFilterEndTime] = useState<number | undefined>(undefined);
    const [requestIdFilterInput, setRequestIdFilterInput] = useState<string>('');
    const [activeRequestIdFilter, setActiveRequestIdFilter] = useState<string | undefined>(undefined);

    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [activeCrawler, setActiveCrawler] = useState<CrawlerType>('conference');
    const [isLogRequestsExpanded, setIsLogRequestsExpanded] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig>(DEFAULT_SORT_CONFIG);

    // State for selected request IDs
    const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);

    // Hook for deletion logic
    const {
        deleteRequests,
        isLoading: isLoadingDelete,
        error: deleteError,
        successMessage: deleteSuccessMessage,
        detailedResults: deleteDetailedResults,
        clearMessages: clearDeleteMessages
    } = useDeleteLogRequests();


    useEffect(() => {
        setCurrentPage(1);
        setSortConfig(DEFAULT_SORT_CONFIG);
        setSelectedRequestIds([]); // Clear selection when main filters change
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

    const handleSort = (key: RequestSortableKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
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
    }, []);

    const handleSelectRequestFromList = (reqId: string) => { // This is for viewing details
        setRequestIdFilterInput(reqId);
        setActiveRequestIdFilter(reqId);
    };

    const handleToggleSummary = () => setIsSummaryExpanded(prev => !prev);
    const handleToggleLogRequests = () => setIsLogRequestsExpanded(prev => !prev);

    // Handler for individual checkbox selection
    const handleToggleRequestSelection = useCallback((requestId: string) => {
        setSelectedRequestIds(prevSelected =>
            prevSelected.includes(requestId)
                ? prevSelected.filter(id => id !== requestId)
                : [...prevSelected, requestId]
        );
    }, []);

    // Handler for "select all on page" or updating selections in bulk
    const handleUpdateSelectedIds = useCallback((idsToSelect: string[], idsToDeselect: string[]) => {
        setSelectedRequestIds(prevSelected => {
            let newSelected = [...prevSelected];
            idsToSelect.forEach(id => {
                if (!newSelected.includes(id)) {
                    newSelected.push(id);
                }
            });
            newSelected = newSelected.filter(id => !idsToDeselect.includes(id));
            return newSelected;
        });
    }, []);

    // Handler for deleting selected requests
    const handleDeleteSelectedRequests = async () => {
        if (selectedRequestIds.length === 0 || isLoadingDelete) {
            return;
        }

        if (!window.confirm(t('deleteAction.confirmDelete', { count: selectedRequestIds.length }))) {
            return;
        }

        clearDeleteMessages();
        const apiCallSuccessful = await deleteRequests({
            requestIds: selectedRequestIds,
            crawlerType: activeCrawler,
        });

        if (apiCallSuccessful) {
            // Check if all individual deletions were successful from detailedResults
            const allItemsFullyDeleted = deleteDetailedResults?.every(r => r.overallSuccess) ?? false;
            if (allItemsFullyDeleted) {
                // Optionally show a specific success message if all items were deleted
                // The hook's successMessage already covers the general API response
            }
            setSelectedRequestIds([]); // Clear selection
            refetchData(); // Refresh the list
        }
        // Messages (success/error/detailed) are available from the hook
        // Auto-clear messages after a delay
        setTimeout(() => clearDeleteMessages(), 8000); // Increased timeout
    };


    const isDetailView = !!activeRequestIdFilter && !!data && data.filterRequestId === activeRequestIdFilter;
    const isListView = !activeRequestIdFilter && !!data && !data.filterRequestId;


    // Clear selection when switching to detail view or if data becomes null
    useEffect(() => {
        if (isDetailView || !data) {
            setSelectedRequestIds([]);
        }
    }, [isDetailView, data]);

    const currentData = data as LogAnalysisResultUnion | null;

    // *** THÊM LOGIC KIỂM TRA NẾU TẤT CẢ REQUESTS BỊ FILTER LOẠI BỎ ***
    const allRequestsFilteredOutDueToTime = useMemo(() => {
        if (!currentData || !currentData.requests || !currentData.analyzedRequestIds || currentData.analyzedRequestIds.length === 0) {
            return false; // Không có request nào để xem xét, hoặc không có dữ liệu
        }
        // Kiểm tra nếu có filter thời gian được áp dụng (timeFilterOption không phải 'latest' hoặc filterStartTime/EndTime có giá trị)
        const hasTimeFilterApplied = timeFilterOption !== 'latest' || filterStartTime !== undefined || filterEndTime !== undefined;
        if (!hasTimeFilterApplied) {
            return false; // Không có filter thời gian, không phải trường hợp này
        }

        // Kiểm tra nếu tất cả các request trong analyzedRequestIds có status là 'NoRequestsAnalyzed'
        // và có errorMessages chứa "matching filters"
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

        // Chỉ giữ lại các request không có status 'NoRequestsAnalyzed'
        // HOẶC nếu có status 'NoRequestsAnalyzed' nhưng không phải do filter thời gian
        // (ví dụ: file log rỗng thực sự, không phải do filter)
        const filteredIds = currentData.analyzedRequestIds.filter(id => {
            const req = currentData.requests[id];
            if (!req) return false;
            if (req.status !== 'NoRequestsAnalyzed') {
                return true; // Luôn giữ lại nếu không phải 'NoRequestsAnalyzed'
            }
            // Nếu là 'NoRequestsAnalyzed', chỉ giữ lại nếu KHÔNG phải do filter thời gian
            // (tức là không có lỗi "matching filters")
            // Điều này cho phép hiển thị request "NoRequestsAnalyzed" nếu nó thực sự không có log,
            // ngay cả khi có filter thời gian.
            const isFilteredByTime = req.errorMessages?.some(msg => msg.toLowerCase().includes('matching filters'));
            return !isFilteredByTime;
        });

        if (filteredIds.length === 0 && currentData.analyzedRequestIds.length > 0 && allRequestsFilteredOutDueToTime) {
            // Trường hợp đặc biệt: tất cả đều bị filter loại bỏ, trả về null để NoDataDisplay xử lý
            return null;
        }

        // Nếu không có filter thời gian, hoặc có request được phân tích, trả về toàn bộ data
        // để LogRequestsList tự xử lý (nó sẽ hiển thị cả "NoRequestsAnalyzed" nếu chúng không phải do filter)
        const hasTimeFilterApplied = timeFilterOption !== 'latest' || filterStartTime !== undefined || filterEndTime !== undefined;
        if (!hasTimeFilterApplied) {
            return currentData; // Trả về toàn bộ data nếu không có filter thời gian
        }

        // Nếu có filter thời gian, chỉ trả về những request thực sự được phân tích
        // hoặc những request "NoRequestsAnalyzed" không phải do filter
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
            // Nếu request cụ thể không có data (có thể do filter thời gian hoặc request đó thực sự không có log)
            const requestDetail = currentData?.requests?.[activeRequestIdFilter!];
            if (requestDetail?.status === 'NoRequestsAnalyzed' && requestDetail.errorMessages?.some(msg => msg.toLowerCase().includes('matching filters'))) {
                return t('noData.forRequestIdMatchingFilters', { requestId: activeRequestIdFilter });
            }
            return t('noData.forRequestId', { requestId: activeRequestIdFilter });
        }
        // *** SỬA ĐỔI Ở ĐÂY ***
        if (isListView && allRequestsFilteredOutDueToTime) { // Điều kiện này vẫn quan trọng
            return t('noData.allRequestsFilteredByTime');
        }
        if (isListView && (!actuallyAnalyzedRequestsData?.analyzedRequestIds || actuallyAnalyzedRequestsData.analyzedRequestIds.length === 0)) {
            if (timeFilterOption !== 'latest' || filterStartTime || filterEndTime) {
                return t('noData.noRequestsMatchingFiltersOrPeriod'); // Thông báo cụ thể hơn
            }
            return t('noData.noRequestsForPeriod');
        }
        // Giữ nguyên các trường hợp khác
        if (!loading && !hasOverallDataForDisplay && timeFilterOption !== 'latest' && !isDetailView) {
            return t('noData.noResultsForPeriod');
        }
        if (!loading && !hasOverallDataForDisplay && !isDetailView) {
            return t('noData.genericNoResults');
        }
        return t('noData.noSpecificData');
    }, [isDetailView, activeRequestIdFilter, isListView, actuallyAnalyzedRequestsData, hasOverallDataForDisplay, loading, timeFilterOption, t, allRequestsFilteredOutDueToTime, filterStartTime, filterEndTime]);



    const CrawlerTypeSelector = () => (
        <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-md shadow-sm bg-white border border-gray-300" role="group">
                <button
                    type="button"
                    onClick={() => {
                        setActiveCrawler('conference');
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

    // Component to display deletion status messages
    const DeletionStatusDisplay: React.FC = () => {
        if (!isLoadingDelete && !deleteError && !deleteSuccessMessage) return null;

        const getStatusColorClasses = () => {
            if (deleteError) return 'bg-red-100 border-red-300 text-red-700';
            if (deleteSuccessMessage) {
                const someFailed = deleteDetailedResults?.some(r => !r.overallSuccess);
                return someFailed ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'bg-green-100 border-green-300 text-green-700';
            }
            return 'bg-blue-100 border-blue-300 text-blue-700'; // For loading
        };

        const Icon = deleteError ? FaTimesCircle : (deleteSuccessMessage && !(deleteDetailedResults?.some(r => !r.overallSuccess)) ? FaCheckCircle : FaExclamationTriangle);

        return (
            <div className="fixed bottom-4 right-4 z-[100] w-full max-w-md p-1">
                <div className={`relative p-4 pr-10 rounded-md shadow-lg border ${getStatusColorClasses()}`}>
                    <button
                        onClick={clearDeleteMessages}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        aria-label={tCommon('close')}
                    >
                        <FaTimesCircle size={18} />
                    </button>
                    <div className="flex items-start">
                        <Icon className={`mr-3 h-6 w-6 flex-shrink-0 ${deleteError ? 'text-red-500' : (deleteSuccessMessage && !(deleteDetailedResults?.some(r => !r.overallSuccess)) ? 'text-green-500' : 'text-yellow-500')}`} />
                        <div>
                            <p className="font-semibold text-sm">
                                {isLoadingDelete ? t('deleteAction.loading') : (deleteError ? t('deleteAction.errorTitle') : t('deleteAction.statusTitle'))}
                            </p>
                            <p className="text-xs mt-1">
                                {isLoadingDelete ? t('deleteAction.processing') : (deleteError || deleteSuccessMessage)}
                            </p>
                            {deleteDetailedResults && (deleteError || deleteSuccessMessage) && (
                                <ul className="text-xs mt-2 list-disc list-inside max-h-24 overflow-y-auto">
                                    {deleteDetailedResults.map(r => (
                                        <li key={r.requestId} className={r.overallSuccess ? 'text-green-700' : 'text-red-700'}>
                                            {r.requestId}: {r.overallSuccess ? t('deleteAction.deletedSuccessfully') : (r.errorMessage || t('deleteAction.deletionFailed'))}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    if (loading && !currentData && !error) {
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
        <div className="bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans space-y-6 relative"> {/* Added relative for positioning DeletionStatusDisplay */}
            <DeletionStatusDisplay />
            <CrawlerTypeSelector />
            <AnalysisHeader
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
                // *** THÊM THÔNG TIN VỀ FILTER ĐỂ HEADER CÓ THỂ HIỂN THỊ THÔNG BÁO PHÙ HỢP ***
                allRequestsFilteredOut={allRequestsFilteredOutDueToTime && isListView}
                overallAnalysisStatus={currentData?.status}
                overallAnalysisErrorMessage={currentData?.errorMessage}
            />

            {/* SỬ DỤNG actuallyAnalyzedRequestsData CHO LogRequestsList */}
            {isListView && actuallyAnalyzedRequestsData && actuallyAnalyzedRequestsData.analyzedRequestIds.length > 0 && (
                <LogRequestsList
                    isExpanded={isLogRequestsExpanded}
                    onToggle={handleToggleLogRequests}
                    data={actuallyAnalyzedRequestsData} // <<<< THAY ĐỔI Ở ĐÂY
                    onSelectRequest={handleSelectRequestFromList} // For viewing details
                    formatDateTime={formatDateTime}
                    getStatusChipClass={getStatusChipClass}
                    isSummaryExpandedOverall={isSummaryExpanded}
                    onToggleSummaryOverall={handleToggleSummary}
                    getNoDataMessage={getNoDataFoundMessage}
                    hasOverallDataForDisplay={hasOverallDataForDisplay}
                    crawlerType={activeCrawler}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    totalRequestCount={actuallyAnalyzedRequestsData.analyzedRequestIds.length}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    // Selection and Deletion props
                    selectedRequestIds={selectedRequestIds}
                    onToggleSelectRequest={handleToggleRequestSelection} // For checkbox selection
                    onDeleteSelected={handleDeleteSelectedRequests}
                    isLoadingDelete={isLoadingDelete}
                    onUpdateSelectedIds={handleUpdateSelectedIds}
                />
            )}

            {/* Hiển thị NoDataDisplay nếu không có request nào được phân tích thực sự HOẶC tất cả bị filter */}
            {isListView && (!actuallyAnalyzedRequestsData || actuallyAnalyzedRequestsData.analyzedRequestIds.length === 0) && currentData && (
                <NoDataDisplay message={getNoDataFoundMessage()} />
            )}


            {isDetailView && currentData && (
                <RequestDetailView
                    data={currentData}
                    activeRequestIdFilter={activeRequestIdFilter!} // Assert non-null as isDetailView implies it's set
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