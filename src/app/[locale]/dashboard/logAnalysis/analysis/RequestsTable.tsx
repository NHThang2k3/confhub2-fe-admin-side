import React from 'react';
import {
    FaLink, FaClock, FaStopwatch, FaInfoCircle, FaCheckCircle,
    FaTimesCircle, FaQuestionCircle, FaEllipsisH, FaListAlt, FaChartPie, FaExclamationTriangle,
    FaSort, FaSortUp, FaSortDown, FaCommentAlt,
    FaSpinner,
    FaDownload
} from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { CrawlerType } from '@/src/hooks/logAnalysis/useLogAnalysisData';
import { SortConfig } from './LogRequestsList';

export interface RequestSummaryShared {
    startTime: string | null;
    endTime: string | null;
    durationSeconds: number | null;
    status: string | undefined | null;
    originalRequestId?: string | null;
    description?: string | null;
    hasCsvOutput?: boolean | null;
    dataSource?: 'scimago' | 'client' | string;
    requestId?: string;
}

export interface ConferenceRequestSummaryForTable extends RequestSummaryShared {
    processedConferencesCountForRequest?: number;
    totalConferencesInputForRequest?: number;
}

export interface JournalRequestSummaryForTable extends RequestSummaryShared {
    processedJournalsCountForRequest?: number;
    totalJournalsInputForRequest?: number;
}

export type RequestSummaryUnionForTable = ConferenceRequestSummaryForTable | JournalRequestSummaryForTable;

// <<< THAY ĐỔI: Xóa 'endTime' khỏi các khóa có thể sắp xếp >>>
export type RequestSortableKey =
    | 'requestId'
    | 'originalRequestId'
    | 'description'
    | 'startTime' // Cột gộp sẽ sắp xếp theo startTime
    // | 'endTime' // <<< XÓA DÒNG NÀY
    | 'durationSeconds'
    | 'status'
    | 'processedItemsRatio';

interface RequestsTableProps {
    requestIds: string[];
    requestsData: { [key: string]: RequestSummaryUnionForTable };
    onSelectRequest: (requestId: string) => void;
    formatDateTime: (isoString: string | null | undefined) => string;
    getStatusChipClass: (status: string | undefined | null) => string;
    crawlerType: CrawlerType;
    totalRequestCount: number;
    sortConfig: SortConfig;
    onSort: (key: RequestSortableKey) => void;
    selectedRequestIds: string[];
    onToggleSelectRequest: (requestId: string) => void;
    onToggleSelectAllOnPage: () => void;
    isAllOnPageSelected: boolean;
    // --- THÊM PROPS MỚI ---
    onDownloadRequest: (requestId: string, crawlerType: CrawlerType) => void;
    isDownloadingId: string | null;
}

const RequestsTable: React.FC<RequestsTableProps> = ({
    requestIds,
    requestsData,
    onSelectRequest,
    formatDateTime,
    getStatusChipClass,
    crawlerType,
    totalRequestCount,
    sortConfig,
    onSort,
    selectedRequestIds,
    onToggleSelectRequest,
    onToggleSelectAllOnPage,
    isAllOnPageSelected,
    onDownloadRequest,
    isDownloadingId,
}) => {

    const t = useTranslations('RequestsTable');
    const tCommon = useTranslations('Common');

    const TRUNCATE_LIMIT = 50;

    const columnWidths = {
        select: 'w-12',
        requestId: 'min-w-[160px]',
        originalRequestId: 'min-w-[160px]',
        description: 'w-1/10',
        timeRange: 'w-[200px]',
        duration: 'w-[60px]',
        status: 'w-[200px]',
        processedItemsRatio: 'w-[180px]',
        actions: 'max-w-[30px]', // Cột actions, cố định
    };

    if (!requestIds || requestIds.length === 0) {
        return null;
    }

    const getStatusIcon = (status: string | undefined | null) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return <FaCheckCircle className="text-green-500 mr-1" />;
            case 'completedwitherrors':
            case 'partiallycompleted':
                return <FaExclamationTriangle className="text-yellow-600 mr-1" />;
            case 'failed':
                return <FaTimesCircle className="text-red-500 mr-1" />;
            case 'processing':
                return <FaStopwatch className="text-blue-500 mr-1 animate-pulse" />;
            case 'pending':
                return <FaEllipsisH className="text-gray-500 mr-1" />;
            case 'skipped':
            case 'nodata':
            case 'unknown':
            default:
                return <FaQuestionCircle className="text-gray-400 mr-1" />;
        }
    };

    const getProgressBarColorClass = (percentage: number): string => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const truncateDescription = (description: string | null | undefined, limit: number): string => {
        if (!description) return '';
        if (description.length > limit) {
            return description.substring(0, limit) + '...';
        }
        return description;
    };

    let totalProcessedItemsOnPage = 0;
    let totalItemsInputOnPage = 0;

    requestIds.forEach(reqId => {
        const details = requestsData[reqId];
        if (details) {
            if (crawlerType === 'conference') {
                const confDetails = details as ConferenceRequestSummaryForTable;
                totalProcessedItemsOnPage += confDetails.processedConferencesCountForRequest ?? 0;
                totalItemsInputOnPage += confDetails.totalConferencesInputForRequest ?? 0;
            } else if (crawlerType === 'journal') {
                const journalDetails = details as JournalRequestSummaryForTable;
                totalProcessedItemsOnPage += journalDetails.processedJournalsCountForRequest ?? 0;
                totalItemsInputOnPage += journalDetails.totalJournalsInputForRequest ?? 0;
            }
        }
    });

    const pageSuccessRatePercentage = totalItemsInputOnPage > 0
        ? ((totalProcessedItemsOnPage / totalItemsInputOnPage) * 100)
        : 0;
    const pageSuccessRatePercentageString = pageSuccessRatePercentage.toFixed(1);

    const successRateColumnHeader = crawlerType === 'conference'
        ? t('tableHeaders.conferenceSuccessRate')
        : t('tableHeaders.journalSuccessRate');

    const renderSortIcon = (columnKey: RequestSortableKey) => {
        if (!sortConfig || sortConfig.key !== columnKey) {
            return <FaSort className="ml-1.5 h-3 w-3 text-gray-400 opacity-50 group-hover:opacity-100" />;
        }
        if (sortConfig.direction === 'ascending') {
            return <FaSortUp className="ml-1.5 h-3 w-3 text-blue-500" />;
        }
        return <FaSortDown className="ml-1.5 h-3 w-3 text-blue-500" />;
    };

    const SortableHeader: React.FC<{ columnKey: RequestSortableKey; children: React.ReactNode; className?: string }> = ({ columnKey, children, className = "" }) => (
        <th
            scope="col"
            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group ${className}`}
            onClick={() => onSort(columnKey)}
            aria-sort={sortConfig && sortConfig.key === columnKey ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'}
        >
            <div className="flex items-center">
                {children}
                {renderSortIcon(columnKey)}
            </div>
        </th>
    );

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            {/* <<< THAY ĐỔI 2: Thêm class `table-fixed` để áp dụng layout cố định >>> */}
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-10">
                    <tr>
                        {/* <<< THAY ĐỔI 3: Áp dụng các class độ rộng cho từng header (th) >>> */}
                        <th scope="col" className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${columnWidths.select}`}>
                            <label htmlFor="select-all-requests-on-page" className="sr-only">
                                {isAllOnPageSelected ? tCommon('deselectAllOnPage') : tCommon('selectAllOnPage')}
                            </label>
                            <input
                                id="select-all-requests-on-page"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                checked={isAllOnPageSelected}
                                onChange={onToggleSelectAllOnPage}
                                title={isAllOnPageSelected ? tCommon('deselectAllOnPage') : tCommon('selectAllOnPage')}
                            />
                        </th>
                        <SortableHeader columnKey="requestId" className={columnWidths.requestId}>
                            <FaListAlt className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {t('tableHeaders.requestId')}
                        </SortableHeader>
                        <SortableHeader columnKey="originalRequestId" className={columnWidths.originalRequestId}>
                            <FaLink className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {t('tableHeaders.originalRequestId')}
                        </SortableHeader>
                        <SortableHeader columnKey="description" className={columnWidths.description}>
                            <FaCommentAlt className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {t('tableHeaders.description')}
                        </SortableHeader>
                        <SortableHeader columnKey="startTime" className={columnWidths.timeRange}>
                            <FaClock className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {t('tableHeaders.timeRange')}
                        </SortableHeader>
                        <SortableHeader columnKey="durationSeconds" className={columnWidths.duration}>
                            <FaStopwatch className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {t('tableHeaders.duration')}
                        </SortableHeader>
                        <SortableHeader columnKey="status" className={columnWidths.status}>
                            <FaInfoCircle className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {t('tableHeaders.status')}
                        </SortableHeader>
                        <SortableHeader columnKey="processedItemsRatio" className={columnWidths.processedItemsRatio}>
                            <FaChartPie className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {successRateColumnHeader}
                        </SortableHeader>
                        {/* --- THÊM HEADER CHO CỘT ACTIONS --- */}
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${columnWidths.actions}`}>
                            {t('tableHeaders.actions')}
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {requestIds.map((reqId) => {
                        const details = requestsData[reqId];
                        let totalInputForRequest = 0;
                        let processedForRequest = 0;

                        if (details) {
                            if (crawlerType === 'conference') {
                                const confDetails = details as ConferenceRequestSummaryForTable;
                                totalInputForRequest = confDetails.totalConferencesInputForRequest ?? 0;
                                processedForRequest = confDetails.processedConferencesCountForRequest ?? 0;
                            } else if (crawlerType === 'journal') {
                                const journalDetails = details as JournalRequestSummaryForTable;
                                totalInputForRequest = journalDetails.totalJournalsInputForRequest ?? 0;
                                processedForRequest = journalDetails.processedJournalsCountForRequest ?? 0;
                            }
                        }

                        const requestSuccessRateValue = totalInputForRequest > 0
                            ? (processedForRequest / totalInputForRequest) * 100
                            : 0;
                        const requestSuccessRateString = requestSuccessRateValue.toFixed(1);
                        const textColorForProgressBar = 'text-gray-700';
                        const isSelected = selectedRequestIds.includes(reqId);

                     
                        // --- BỔ SUNG LOGIC KIỂM TRA CSV ---
                        const canDownload = details?.hasCsvOutput === true;
                        // ------------------------------------


                        return (
                            <tr
                                key={reqId}
                                className={`transition-colors duration-150 ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-10'}`}
                                aria-selected={isSelected}
                            >
                                <td className="px-3 py-3">
                                    {/* Checkbox cell */}
                                    <input
                                        id={`select-request-${reqId}`}
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        checked={isSelected}
                                        onChange={() => onToggleSelectRequest(reqId)}
                                        aria-labelledby={`request-id-label-${reqId}`}
                                    />
                                </td>
                                {/* <<< LƯU Ý: class `break-all` rất quan trọng cho các cột có ID dài khi dùng table-fixed >>> */}
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 break-all">
                                    <button
                                        id={`request-id-label-${reqId}`}
                                        onClick={() => onSelectRequest(reqId)}
                                        className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none font-medium"
                                        title={t('viewDetailsForRequestTitle', { requestId: reqId })}
                                    >
                                        {reqId}
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 break-all">
                                    {details?.originalRequestId ? (
                                        <button
                                            onClick={() => onSelectRequest(details.originalRequestId!)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none flex items-center group"
                                            title={t('viewDetailsForOriginalRequestTitle', { requestId: details.originalRequestId })}
                                        >
                                            <FaLink className="mr-1.5 h-3 w-3 text-blue-500 group-hover:text-blue-700" />
                                            {details.originalRequestId}
                                        </button>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                {/* <<< LƯU Ý: class `break-words` phù hợp cho cột mô tả >>> */}
                                <td className="px-4 py-3 text-sm text-gray-600 break-words">
                                    {details?.description ? (
                                        <span title={details.description}>
                                            {truncateDescription(details.description, TRUNCATE_LIMIT)}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {details ? (
                                        <div>
                                            <div className="flex items-center text-xs" title={t('tableHeaders.startTime')}>
                                                <span className="font-semibold text-gray-500 w-6 text-right mr-5">Start:</span>
                                                <span>{formatDateTime(details.startTime)}</span>
                                            </div>
                                            <div className="flex items-center text-xs mt-1" title={t('tableHeaders.endTime')}>
                                                <span className="font-semibold text-gray-500 w-6 text-right mr-5">End:</span>
                                                <span>{formatDateTime(details.endTime)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">{tCommon('na')}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-gray-600">
                                    {details && details.durationSeconds != null ? `${details.durationSeconds.toFixed(2)}s` : tCommon('na')}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {details && details.status ? (
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center justify-center ${getStatusChipClass(details.status)}`}>
                                            {getStatusIcon(details.status)}
                                            {t(`statusNames.${details.status.toLowerCase()}`, { defaultValue: details.status })}
                                        </span>
                                    ) : (
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center justify-center ${getStatusChipClass(null)}`}>
                                            <FaQuestionCircle className="mr-1" /> {t('statusNames.unknown')}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {totalInputForRequest > 0 ? (
                                        <div className="relative w-32 bg-gray-200 rounded-full py-1.5">
                                            <div
                                                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-in-out ${getProgressBarColorClass(requestSuccessRateValue)}`}
                                                style={{ width: `${requestSuccessRateValue}%` }}
                                            ></div>
                                            <span className={`relative z-10 flex items-center justify-center text-xs font-bold ${textColorForProgressBar} leading-none`}>
                                                {requestSuccessRateString}%
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-xs">{tCommon('na')}</span>
                                    )}
                                </td>

                               <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                    {/* --- CẬP NHẬT NÚT DOWNLOAD --- */}
                                    <button
                                        onClick={() => onDownloadRequest(reqId, crawlerType)}
                                        // Vô hiệu hóa nếu đang download HOẶC không có file CSV
                                        disabled={isDownloadingId === reqId || !canDownload}
                                        className="p-2 text-gray-500 hover:text-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title={canDownload ? t('downloadButtonAria', { requestId: reqId }) : t('downloadDisabledTooltip')}
                                    >
                                        {isDownloadingId === reqId ? (
                                            <FaSpinner className="animate-spin h-4 w-4" />
                                        ) : (
                                            <FaDownload className="h-4 w-4" />
                                        )}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                {totalItemsInputOnPage > 0 && (
                    <tfoot className="bg-gray-10 border-t border-gray-200">
                        <tr>
                            {/* --- CẬP NHẬT COLSPAN TỪ 7 LÊN 8 --- */}
                            <td colSpan={8} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center font-semibold">
                                    <FaChartPie className="mr-2 h-4 w-4 text-gray-600" />
                                    {t('tableFooter.currentPageSuccessRate')}:
                                </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                                {totalProcessedItemsOnPage} / {totalItemsInputOnPage} ({pageSuccessRatePercentageString}%)
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
};

export default RequestsTable;