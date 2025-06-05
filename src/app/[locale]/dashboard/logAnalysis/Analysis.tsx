// src/app/[locale]/dashboard/logAnalysis/Analysis.tsx
import React, { useState, useCallback, useEffect } from 'react';
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

    // Hook for managing filters
    const {
        timeFilterOption, filterStartTime, filterEndTime,
        requestIdFilterInput, activeRequestIdFilter, activeCrawler,
        handleTimeFilterChange, setRequestIdFilterInput,
        applyRequestIdFilterFromInput, clearActiveFilterAndGoToList,
        setActiveCrawler, setActiveRequestIdFilter,
    } = useAnalysisFilters('conference');

    // Data fetching hook
    const {
        data: rawData, loading, error, isConnectedToSocket, refetchData
    } = useLogAnalysisData(activeCrawler, filterStartTime, filterEndTime, activeRequestIdFilter);

    // Hook for processing data and deriving view states
    const {
        currentData, isDetailView, isListView,
        allRequestsFilteredOutDueToTime, actuallyAnalyzedRequestsData,
        hasOverallDataForDisplay, hasItemDetailsForDisplay,
        getNoDataFoundMessage,
    } = useAnalysisDataProcessor({
        rawData, activeRequestIdFilter, timeFilterOption, filterStartTime,
        filterEndTime, activeCrawler, loading, t
    });

    // Hook for list view state management (pagination, sorting, selection)
    const {
        currentPage, sortConfig, selectedRequestIds,
        handlePageChange, handleSort,
        handleToggleRequestSelection, handleUpdateSelectedIds,
        setSelectedRequestIds, // Used by delete handler
        resetListView,
    } = useListViewManagement({
        timeFilterOption, activeRequestIdFilter, activeCrawler,
        isDetailView, hasData: !!currentData
    });

    // Hook for deletion logic
    const {
        deleteRequests, isLoading: isLoadingDelete, error: deleteError,
        successMessage: deleteSuccessMessage, detailedResults: deleteDetailedResults,
        clearMessages: clearDeleteMessages
    } = useDeleteLogRequests();

    // UI State specific to Analysis component (can be kept here or moved if complex)
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [isLogRequestsExpanded, setIsLogRequestsExpanded] = useState(true);

    const handleToggleSummary = () => setIsSummaryExpanded(prev => !prev);
    const handleToggleLogRequests = () => setIsLogRequestsExpanded(prev => !prev);

    // Handler to select a request from the list to view its details
    const handleSelectRequestFromList = (reqId: string) => {
        setRequestIdFilterInput(reqId); // Update input for consistency if user navigates back
        setActiveRequestIdFilter(reqId); // This will trigger data refetch for the specific ID
    };

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
            setSelectedRequestIds([]); // Clear selection in the list view management hook
            refetchData(); // Refresh the list
        }
        setTimeout(() => clearDeleteMessages(), 8000);
    };

    // Props for AnalysisHeader, common across different states
    const commonHeaderProps = {
        timeFilterOption,
        handleFilterChange: handleTimeFilterChange,
        refetchData,
        requestIdFilterInput,
        setRequestIdFilterInput,
        applyRequestIdFilter: applyRequestIdFilterFromInput,
        clearRequestIdFilter: () => {
            clearActiveFilterAndGoToList();
            resetListView(); // Also reset list view when clearing request ID filter
        },
        crawlerType: activeCrawler,
    };

    if (loading && !currentData && !error) {
        return (
            <LoadingScreen>
                <CrawlerTypeSelector activeCrawler={activeCrawler} onSelectCrawler={setActiveCrawler} />
                <AnalysisHeader
                    {...commonHeaderProps}
                    loading={true} error={null} isConnected={isConnectedToSocket} data={null}
                />
            </LoadingScreen>
        );
    }

    if (error && !currentData && !loading) {
        return (
            <ErrorScreen error={error} onRetry={refetchData}>
                <CrawlerTypeSelector activeCrawler={activeCrawler} onSelectCrawler={setActiveCrawler} />
                <AnalysisHeader
                    {...commonHeaderProps}
                    loading={false} error={error} isConnected={isConnectedToSocket} data={null}
                />
            </ErrorScreen>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans space-y-6 relative">
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
                    // No need to call resetListView here, as it's an effect dependency in useListViewManagement
                }}
            />
            <AnalysisHeader
                {...commonHeaderProps}
                loading={loading && !!currentData} // Show loading spinner on header if data exists but is refreshing
                error={(error && currentData) ? error : null} // Show error on header if data exists but refresh failed
                isConnected={isConnectedToSocket}
                data={currentData}
                allRequestsFilteredOut={allRequestsFilteredOutDueToTime && isListView}
                overallAnalysisStatus={currentData?.status}
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
                    activeRequestIdFilter={activeRequestIdFilter!}
                    onClearFilter={() => {
                        clearActiveFilterAndGoToList();
                        // resetListView will be triggered by useEffect in useListViewManagement
                    }}
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

            {loading && currentData && ( // Show this only if data exists but is refreshing
                <div className="mt-6 text-center text-blue-600">
                    <FaSyncAlt className="inline mr-2 animate-spin" />
                    {activeRequestIdFilter ? t('refreshing.details', { requestId: activeRequestIdFilter }) : t('refreshing.analysisData')}
                </div>
            )}
            {error && currentData && ( // Show this only if data exists but refresh failed
                <div className="mt-4 text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
                    <FaExclamationTriangle className="inline mr-1" /> {t('refreshing.error', { error: error.toString() })}
                </div>
            )}
        </div>
    );
};

export default Analysis;