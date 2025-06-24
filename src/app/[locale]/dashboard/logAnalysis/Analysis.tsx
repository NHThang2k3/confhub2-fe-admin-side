// Analysis.tsx
import React, { useState } from 'react';
import { useLogAnalysisData } from '../../../../hooks/logAnalysis/useLogAnalysisData';
import { FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

import AnalysisHeader from './analysis/AnalysisHeader';
import LogRequestsList from './analysis/LogRequestsList';
import RequestDetailView from './analysis/RequestDetailView';
import LoadingScreen from './analysis/LoadingScreen';
import ErrorScreen from './analysis/ErrorScreen';
import NoDataDisplay from './analysis/NoDataDisplay';
import { useDeleteLogRequests } from '../../../../hooks/logAnalysis/useDeleteLogRequests';
import { formatDateTime, getStatusChipClass } from './utils/commonUtils';
import CrawlerTypeSelector from './analysis/CrawlerTypeSelector';
import DeletionStatusDisplay from './analysis/DeletionStatusDisplay';

// Import custom hooks
import { useAnalysisFilters } from '@/src/hooks/logAnalysis/useAnalysisFilters';
import { useListViewManagement } from '@/src/hooks/logAnalysis/useListViewManagement';
import { useAnalysisDataProcessor } from '@/src/hooks/logAnalysis/useAnalysisDataProcessor';


const Analysis: React.FC = () => {
    const t = useTranslations('AnalysisPage');

    // --- Hooks ---
    const {
        timeFilterOption, filterStartTime, filterEndTime,
        textFilterInput, activeTextFilter, activeCrawler,
        tempCustomStartDate, setTempCustomStartDate,
        tempCustomEndDate, setTempCustomEndDate,
        applyCustomDateFilter,
        handleTimeFilterChange, setTextFilterInput,
        // THAY ĐỔI: Lấy hàm mới từ hook
        setTextFilterAndApplyImmediately,
        clearActiveTextFilter,
        setActiveCrawler,
    } = useAnalysisFilters('conference');

    const {
        data: rawData, loading, error, isConnectedToSocket, refetchData
    } = useLogAnalysisData(activeCrawler, filterStartTime, filterEndTime, activeTextFilter);

    const {
        currentData, isDetailView, isListView,
        allRequestsFilteredOutDueToTime, actuallyAnalyzedRequestsData,
        hasOverallDataForDisplay, hasItemDetailsForDisplay,
        getNoDataFoundMessage,
    } = useAnalysisDataProcessor({
        rawData, activeRequestIdFilter: activeTextFilter,
        timeFilterOption, filterStartTime,
        filterEndTime, activeCrawler, loading, t
    });

    const {
        currentPage, sortConfig, selectedRequestIds,
        handlePageChange, handleSort,
        handleToggleRequestSelection, handleUpdateSelectedIds,
        setSelectedRequestIds,
    } = useListViewManagement({
        timeFilterOption, activeRequestIdFilter: activeTextFilter,
        activeCrawler,
        isDetailView, hasData: !!currentData
    });

    const {
        deleteRequests, isLoading: isLoadingDelete, error: deleteError,
        successMessage: deleteSuccessMessage, detailedResults: deleteDetailedResults,
        clearMessages: clearDeleteMessages
    } = useDeleteLogRequests();

    // --- UI State & Handlers ---
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [isLogRequestsExpanded, setIsLogRequestsExpanded] = useState(true);

    const handleToggleSummary = () => setIsSummaryExpanded(prev => !prev);
    const handleToggleLogRequests = () => setIsLogRequestsExpanded(prev => !prev);

    const handleSelectRequestFromList = (reqId: string) => {
        // THAY ĐỔI: Sử dụng hàm mới để cập nhật filter ngay lập tức, bỏ qua debounce
        setTextFilterAndApplyImmediately(reqId);
    };

    const handleDeleteSelectedRequests = async () => {
        if (selectedRequestIds.length === 0 || isLoadingDelete) return;
        if (!window.confirm(t('deleteAction.confirmDelete', { count: selectedRequestIds.length }))) return;

        clearDeleteMessages();
        const apiCallSuccessful = await deleteRequests({
            requestIds: selectedRequestIds,
            crawlerType: activeCrawler,
        });
        if (apiCallSuccessful) {
            setSelectedRequestIds([]);
            refetchData();
        }
        setTimeout(() => clearDeleteMessages(), 8000);
    };

    // 'controls' object cho props của header
    const filterControls = {
        timeFilterOption,
        handleFilterChange: handleTimeFilterChange,
        textFilterInput,
        // QUAN TRỌNG: Vẫn truyền `setTextFilterInput` gốc vào header
        // để việc gõ phím vẫn có debounce.
        setTextFilterInput,
        tempCustomStartDate,
        setTempCustomStartDate,
        tempCustomEndDate,
        setTempCustomEndDate,
        applyCustomDateFilter,
    };

    // --- Render Logic ---

    if (loading && !currentData && !error) {
        return (
            <LoadingScreen>
                <CrawlerTypeSelector activeCrawler={activeCrawler} onSelectCrawler={setActiveCrawler} />
                <AnalysisHeader
                    loading={true}
                    error={null}
                    isConnected={isConnectedToSocket}
                    data={null}
                    crawlerType={activeCrawler}
                    refetchData={refetchData}
                    controls={filterControls}
                />
            </LoadingScreen>
        );
    }

    if (error && !currentData && !loading) {
        return (
            <ErrorScreen error={error} onRetry={refetchData}>
                <CrawlerTypeSelector activeCrawler={activeCrawler} onSelectCrawler={setActiveCrawler} />
                <AnalysisHeader
                    loading={false}
                    error={error}
                    isConnected={isConnectedToSocket}
                    data={null}
                    crawlerType={activeCrawler}
                    refetchData={refetchData}
                    controls={filterControls}
                />
            </ErrorScreen>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans space-y-6 relative p-4">
            <DeletionStatusDisplay
                isLoading={isLoadingDelete}
                error={deleteError}
                successMessage={deleteSuccessMessage}
                detailedResults={deleteDetailedResults}
                onClearMessages={clearDeleteMessages}
            />
            <CrawlerTypeSelector
                activeCrawler={activeCrawler}
                onSelectCrawler={(crawler) => {
                    setActiveCrawler(crawler);
                }}
            />
            <AnalysisHeader
                loading={loading && !!currentData}
                error={(error && currentData) ? error : null}
                isConnected={isConnectedToSocket}
                data={currentData}
                crawlerType={activeCrawler}
                refetchData={refetchData}
                controls={filterControls}
                allRequestsFilteredOut={allRequestsFilteredOutDueToTime && isListView}
                overallAnalysisErrorMessage={currentData?.errorMessage}
            />

            {isListView && actuallyAnalyzedRequestsData && actuallyAnalyzedRequestsData.analyzedRequestIds.length > 0 && (
                <LogRequestsList
                    isExpanded={isLogRequestsExpanded}
                    onToggle={handleToggleLogRequests}
                    data={actuallyAnalyzedRequestsData}
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
                    totalRequestCount={actuallyAnalyzedRequestsData.analyzedRequestIds.length}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    selectedRequestIds={selectedRequestIds}
                    onToggleSelectRequest={handleToggleRequestSelection}
                    onDeleteSelected={handleDeleteSelectedRequests}
                    isLoadingDelete={isLoadingDelete}
                    onUpdateSelectedIds={handleUpdateSelectedIds}
                />
            )}

            {isListView && (!actuallyAnalyzedRequestsData || actuallyAnalyzedRequestsData.analyzedRequestIds.length === 0) && currentData && (
                <NoDataDisplay message={getNoDataFoundMessage()} />
            )}

            {isDetailView && currentData && (
                <RequestDetailView
                    data={currentData}
                    activeRequestIdFilter={activeTextFilter!}
                    onClearFilter={clearActiveTextFilter}
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
                    {activeTextFilter ? t('refreshing.details', { requestId: activeTextFilter }) : t('refreshing.analysisData')}
                </div>
            )}
            {error && currentData && (
                <div className="mt-4 text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
                    <FaExclamationTriangle className="inline mr-1" /> {t('refreshing.error', { error: error.toString() })}
                </div>
            )}
        </div>
    );
};

export default Analysis;