// src/app/[locale]/dashboard/logAnalysis/analysis/LogRequestsList.tsx
import React, { useState, useMemo, useCallback } from 'react'; // Added useCallback
import { FaListAlt, FaChevronUp, FaChevronDown, FaInfoCircle, FaChartBar, FaFileAlt, FaTrash } from 'react-icons/fa';
import RequestsTable, { RequestSummaryUnionForTable, RequestSortableKey, ConferenceRequestSummaryForTable, JournalRequestSummaryForTable } from './RequestsTable';
import NoDataDisplay from './NoDataDisplay';
import { useTranslations } from 'next-intl';
import { LogAnalysisResultUnion, CrawlerType } from '@/src/hooks/logAnalysis/useLogAnalysisData';
import ConferenceOverallSummary from '../overallSummary/ConferenceOverallSummary';
import JournalOverallSummary from '../journalOverallSummary/JournalOverallSummary';
import { ConferenceLogAnalysisResult } from '@/src/models/logAnalysis';
import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types';
import RequestsOverallSummary from '../overallSummary/RequestsOverallSummary';
import GeneralPagination from '../../../utils/GeneralPagination';

const ITEMS_PER_PAGE = 10;
type SummaryViewType = 'requests' | 'details';

export interface SortConfig {
    key: RequestSortableKey;
    direction: 'ascending' | 'descending';
}

interface LogRequestsListProps {
    isExpanded: boolean;
    onToggle: () => void;
    data: LogAnalysisResultUnion;
    onSelectRequest: (requestId: string) => void; // For viewing details
    formatDateTime: (isoString: string | null | undefined) => string;
    getStatusChipClass: (status: string | undefined | null) => string;
    isSummaryExpandedOverall: boolean;
    onToggleSummaryOverall: () => void;
    getNoDataMessage: () => string;
    hasOverallDataForDisplay: boolean;
    crawlerType: CrawlerType;
    currentPage: number;
    onPageChange: (page: number) => void;
    totalRequestCount: number;
    sortConfig: SortConfig;
    onSort: (key: RequestSortableKey) => void;
    
    // Props for selection and deletion
    selectedRequestIds: string[];
    onToggleSelectRequest: (requestId: string) => void; // For checkbox selection
    onDeleteSelected: () => void;
    isLoadingDelete: boolean;
    onUpdateSelectedIds: (idsToSelect: string[], idsToDeselect: string[]) => void;
}

const LogRequestsList: React.FC<LogRequestsListProps> = ({
    isExpanded,
    onToggle,
    data,
    onSelectRequest,
    formatDateTime,
    getStatusChipClass,
    isSummaryExpandedOverall,
    onToggleSummaryOverall,
    getNoDataMessage,
    hasOverallDataForDisplay,
    crawlerType,
    currentPage,
    onPageChange,
    totalRequestCount,
    sortConfig,
    onSort,
    selectedRequestIds,
    onToggleSelectRequest,
    onDeleteSelected,
    isLoadingDelete,
    onUpdateSelectedIds,
}) => {
    const t = useTranslations('LogRequestsList');
    const tCommon = useTranslations('Common');
    const [activeSummaryView, setActiveSummaryView] = useState<SummaryViewType>('requests');

    const allRequestIdsOriginal = data.analyzedRequestIds || [];
    const requestsData = data.requests as { [key: string]: RequestSummaryUnionForTable };

    const sortedRequestIds = useMemo(() => {
        const sortableArray = [...allRequestIdsOriginal];

        sortableArray.sort((aId, bId) => {
            const aItem = requestsData[aId];
            const bItem = requestsData[bId];

            if (!aItem || !bItem) return 0;

            let aValue: any;
            let bValue: any;

            if (sortConfig.key === 'processedItemsRatio') {
                if (crawlerType === 'conference') {
                    const aConf = aItem as ConferenceRequestSummaryForTable;
                    const bConf = bItem as ConferenceRequestSummaryForTable;
                    aValue = (aConf.totalConferencesInputForRequest ?? 0) > 0 ? (aConf.processedConferencesCountForRequest ?? 0) / aConf.totalConferencesInputForRequest! : -1;
                    bValue = (bConf.totalConferencesInputForRequest ?? 0) > 0 ? (bConf.processedConferencesCountForRequest ?? 0) / bConf.totalConferencesInputForRequest! : -1;
                } else {
                    const aJourn = aItem as JournalRequestSummaryForTable;
                    const bJourn = bItem as JournalRequestSummaryForTable;
                    aValue = (aJourn.totalJournalsInputForRequest ?? 0) > 0 ? (aJourn.processedJournalsCountForRequest ?? 0) / aJourn.totalJournalsInputForRequest! : -1;
                    bValue = (bJourn.totalJournalsInputForRequest ?? 0) > 0 ? (bJourn.processedJournalsCountForRequest ?? 0) / bJourn.totalJournalsInputForRequest! : -1;
                }
            } else {
                if (sortConfig.key === 'requestId') {
                    aValue = aId;
                    bValue = bId;
                } else {
                    aValue = (aItem as any)[sortConfig.key];
                    bValue = (bItem as any)[sortConfig.key];
                }
            }

            switch (sortConfig.key) {
                case 'startTime':
                case 'endTime':
                    aValue = aValue ? new Date(aValue).getTime() : (sortConfig.direction === 'ascending' ? Infinity : -Infinity);
                    bValue = bValue ? new Date(bValue).getTime() : (sortConfig.direction === 'ascending' ? Infinity : -Infinity);
                    break;
                case 'durationSeconds':
                    aValue = aValue ?? (sortConfig.direction === 'ascending' ? Infinity : -Infinity);
                    bValue = bValue ?? (sortConfig.direction === 'ascending' ? Infinity : -Infinity);
                    break;
                case 'status':
                case 'requestId':
                case 'originalRequestId':
                    aValue = String(aValue ?? '').toLowerCase();
                    bValue = String(bValue ?? '').toLowerCase();
                    break;
                default:
                    if (typeof aValue === 'number' && typeof bValue === 'number') {
                        // no change
                    } else {
                        aValue = String(aValue ?? '').toLowerCase();
                        bValue = String(bValue ?? '').toLowerCase();
                    }
                    break;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sortableArray;
    }, [allRequestIdsOriginal, requestsData, sortConfig, crawlerType]);

    const hasRequestsData = sortedRequestIds.length > 0;
    const totalPages = Math.ceil(sortedRequestIds.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    // Use useMemo for paginatedRequestIds as it depends on sortedRequestIds, startIndex, endIndex
    const paginatedRequestIds = useMemo(() => {
        return sortedRequestIds.slice(startIndex, endIndex);
    }, [sortedRequestIds, startIndex, endIndex]);

    // Calculate if all items on the current page are selected
    const isAllOnPageSelected = useMemo(() => {
        if (paginatedRequestIds.length === 0) return false;
        return paginatedRequestIds.every(id => selectedRequestIds.includes(id));
    }, [paginatedRequestIds, selectedRequestIds]);

    // Handler for "select all on page" checkbox
    const handleToggleSelectAllOnPage = useCallback(() => {
        if (isAllOnPageSelected) {
            // Deselect all on current page
            onUpdateSelectedIds([], paginatedRequestIds);
        } else {
            // Select all on current page (only those not already selected)
            const idsToSelect = paginatedRequestIds.filter(id => !selectedRequestIds.includes(id));
            onUpdateSelectedIds(idsToSelect, []);
        }
    }, [isAllOnPageSelected, paginatedRequestIds, selectedRequestIds, onUpdateSelectedIds]);

    const summaryNavButtonBaseClass = "px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-150 ease-in-out flex items-center";
    const summaryNavButtonActiveClass = "bg-blue-600 text-white";
    const summaryNavButtonInactiveClass = "bg-gray-100 text-gray-700 hover:bg-gray-200";

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div
                className="flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-10"
                onClick={onToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onToggle()}
                aria-expanded={isExpanded}
                aria-controls="log-requests-content"
            >
                <h2 className="text-xl font-semibold text-gray-800 mb-0 flex items-center">
                    <FaListAlt className="mr-2 text-blue-600" /> {t('title')}
                </h2>
                <button
                    className="text-gray-500 hover:text-blue-600 focus:outline-none p-1 rounded-full"
                    aria-label={isExpanded ? t('ariaLabel.collapse') : t('ariaLabel.expand')}
                >
                    {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
                    <span className='sr-only'>{isExpanded ? t('srOnly.collapse') : t('srOnly.expand')}</span>
                </button>
            </div>

            <div
                id="log-requests-content"
                className={`transition-max-height duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100 visible p-4 sm:p-6' : 'max-h-0 opacity-0 invisible'}`}
            >
                {hasRequestsData ? (
                    <>
                        {selectedRequestIds.length > 0 && (
                            <div className="mb-4 p-1 flex justify-end items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                    {t('selectedCount', { count: selectedRequestIds.length })}
                                </span>
                                <button
                                    onClick={onDeleteSelected}
                                    disabled={isLoadingDelete || selectedRequestIds.length === 0}
                                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    aria-label={t('deleteSelectedButtonAria', { count: selectedRequestIds.length })}
                                    title={t('deleteSelectedButtonAria', { count: selectedRequestIds.length })}
                                >
                                    <FaTrash className="mr-1.5 h-3.5 w-3.5" />
                                    {t('deleteSelectedButton', { count: selectedRequestIds.length })}
                                    {isLoadingDelete && (
                                        <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                        <RequestsTable
                            requestIds={paginatedRequestIds} // Pass paginated IDs
                            requestsData={requestsData}
                            onSelectRequest={onSelectRequest} // For viewing details
                            formatDateTime={formatDateTime}
                            getStatusChipClass={getStatusChipClass}
                            crawlerType={crawlerType}
                            totalRequestCount={totalRequestCount} // This is the overall total
                            sortConfig={sortConfig}
                            onSort={onSort}
                            // Selection props
                            selectedRequestIds={selectedRequestIds}
                            onToggleSelectRequest={onToggleSelectRequest} // For checkbox selection
                            onToggleSelectAllOnPage={handleToggleSelectAllOnPage}
                            isAllOnPageSelected={isAllOnPageSelected}
                        />
                        {totalPages > 1 && (
                            <GeneralPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                                className="mt-4 py-2"
                            />
                        )}
                    </>
                ) : (
                    <NoDataDisplay message={getNoDataMessage()} icon={<FaInfoCircle size={20} className="mb-2 inline-block" />} />
                )}

                {hasOverallDataForDisplay && (
                    <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">
                                {t('overallSummaryTitle')}
                            </h3>
                            <button
                                onClick={onToggleSummaryOverall}
                                className="text-gray-500 hover:text-blue-600 focus:outline-none p-1 rounded-full text-xs"
                                aria-label={isSummaryExpandedOverall ? tCommon('collapse') : tCommon('expand')}
                            >
                                {isSummaryExpandedOverall ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                        </div>

                        {isSummaryExpandedOverall && (
                            <>
                                <div className="mb-4 flex justify-center space-x-1 border border-gray-200 p-1 rounded-lg bg-gray-10 w-auto inline-flex">
                                    <button
                                        onClick={() => setActiveSummaryView('requests')}
                                        className={`${summaryNavButtonBaseClass} rounded-md ${activeSummaryView === 'requests' ? summaryNavButtonActiveClass : summaryNavButtonInactiveClass}`}
                                    >
                                        <FaChartBar className="mr-2" /> {t('summaryViews.requestsLevel')}
                                    </button>
                                    <button
                                        onClick={() => setActiveSummaryView('details')}
                                        className={`${summaryNavButtonBaseClass} rounded-md ${activeSummaryView === 'details' ? summaryNavButtonActiveClass : summaryNavButtonInactiveClass}`}
                                    >
                                        <FaFileAlt className="mr-2" /> {t('summaryViews.detailsLevel', { type: crawlerType === 'conference' ? tCommon('conference') : tCommon('journal') })}
                                    </button>
                                </div>

                                {activeSummaryView === 'requests' && (
                                    <RequestsOverallSummary data={data} />
                                )}
                                {activeSummaryView === 'details' && (
                                    crawlerType === 'conference' ? (
                                        <ConferenceOverallSummary
                                            data={data as ConferenceLogAnalysisResult}
                                            isExpanded={true}
                                            onToggle={() => { }}
                                        />
                                    ) : (
                                        <JournalOverallSummary
                                            data={data as JournalLogAnalysisResult}
                                            isExpanded={true}
                                            onToggle={() => { }}
                                        />
                                    )
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogRequestsList;