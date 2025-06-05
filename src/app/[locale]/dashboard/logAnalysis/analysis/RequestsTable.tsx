// src/app/[locale]/dashboard/logAnalysis/analysis/RequestsTable.tsx
import React from 'react';
import { FaExternalLinkAlt, FaLink, FaClock, FaStopwatch, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaEllipsisH, FaListAlt, FaChartPie, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { CrawlerType } from '@/src/hooks/logAnalysis/useLogAnalysisData';

export interface RequestSummaryShared {
    startTime: string | null;
    endTime: string | null;
    durationSeconds: number | null;
    status: string | undefined | null;
    originalRequestId?: string | null;
    dataSource?: 'scimago' | 'client' | string;
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


interface RequestsTableProps {
    requestIds: string[]; // IDs for the current page
    requestsData: { [key: string]: RequestSummaryUnionForTable };
    onSelectRequest: (requestId: string) => void;
    formatDateTime: (isoString: string | null | undefined) => string;
    getStatusChipClass: (status: string | undefined | null) => string;
    crawlerType: CrawlerType;
    totalRequestCount: number; // *** THÊM PROP TỔNG SỐ REQUEST ***
}

const RequestsTable: React.FC<RequestsTableProps> = ({
    requestIds, // IDs for the current page
    requestsData,
    onSelectRequest,
    formatDateTime,
    getStatusChipClass,
    crawlerType,
    totalRequestCount, // *** NHẬN PROP ***
}) => {
    const t = useTranslations('RequestsTable');

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
            case 'pending': // Giả sử có thể có trạng thái này
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

    // These calculations are for the CURRENT PAGE requests
    let totalProcessedItemsOverall = 0;
    let totalItemsOverallInput = 0;

    requestIds.forEach(reqId => {
        const details = requestsData[reqId];
        if (details) {
            if (crawlerType === 'conference') {
                const confDetails = details as ConferenceRequestSummaryForTable;
                totalProcessedItemsOverall += confDetails.processedConferencesCountForRequest ?? 0;
                totalItemsOverallInput += confDetails.totalConferencesInputForRequest ?? 0;
            } else if (crawlerType === 'journal') {
                const journalDetails = details as JournalRequestSummaryForTable;
                totalProcessedItemsOverall += journalDetails.processedJournalsCountForRequest ?? 0;
                totalItemsOverallInput += journalDetails.totalJournalsInputForRequest ?? 0;
            }
        }
    });

    const overallSuccessRatePercentage = totalItemsOverallInput > 0
        ? ((totalProcessedItemsOverall / totalItemsOverallInput) * 100)
        : 0;
    const overallSuccessRatePercentageString = overallSuccessRatePercentage.toFixed(1);

    const successRateColumnHeader = crawlerType === 'conference'
        ? t('tableHeaders.conferenceSuccessRate')
        : t('tableHeaders.journalSuccessRate');

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-10"> {/* Sửa bg-gray-5 thành bg-gray-10 để đồng nhất nếu cần */}
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                                <FaListAlt className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {t('tableHeaders.requestId')}
                            </div>
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                                <FaLink className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {t('tableHeaders.originalRequestId')}
                            </div>
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                                <FaClock className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {t('tableHeaders.startTime')}
                            </div>
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                                <FaClock className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {t('tableHeaders.endTime')}
                            </div>
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                                <FaStopwatch className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {t('tableHeaders.duration')}
                            </div>
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                                <FaInfoCircle className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {t('tableHeaders.status')}
                            </div>
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                                <FaChartPie className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> {successRateColumnHeader}
                            </div>
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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

                        return (
                            <tr key={reqId} className="hover:bg-gray-10 transition-colors duration-150"> {/* Sửa bg-gray-5 thành bg-gray-10 */}
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 break-all">
                                    {reqId}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 break-all">
                                    {details?.originalRequestId ? (
                                        <button
                                            onClick={() => onSelectRequest(details.originalRequestId!)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none flex items-center group"
                                            title={t('viewDetailsForOriginalRequestTitle', { requestId: details.originalRequestId })}
                                            aria-label={t('viewDetailsForOriginalRequestAriaLabel', { requestId: details.originalRequestId })}
                                        >
                                            <FaLink className="mr-1.5 h-3 w-3 text-blue-500 group-hover:text-blue-700 transition-colors duration-150" />
                                            {details.originalRequestId}
                                        </button>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {details ? formatDateTime(details.startTime) : t('common.na')}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {details ? formatDateTime(details.endTime) : t('common.na')}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {details && details.durationSeconds != null ? `${details.durationSeconds.toFixed(2)}s` : t('common.na')}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {details && details.status ? (
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center ${getStatusChipClass(details.status)}`}>
                                            {getStatusIcon(details.status)}
                                            {t(`statusNames.${details.status.toLowerCase()}`, { defaultMessage: details.status })}
                                        </span>
                                    ) : (
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center ${getStatusChipClass(null)}`}>
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
                                        <span className="text-gray-400 text-xs">{t('common.na')}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => onSelectRequest(reqId)}
                                        className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none flex items-center group"
                                        aria-label={t('viewDetailsForRequestAriaLabel', { requestId: reqId })}
                                    >
                                        {t('viewDetailsButton')} <FaExternalLinkAlt className="ml-1.5 h-3 w-3 text-blue-500 group-hover:text-blue-700 transition-colors duration-150" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                {/* *** CẬP NHẬT TFOOT *** */}
                {totalItemsOverallInput > 0 && ( // totalItemsOverallInput là của trang hiện tại
                    <tfoot className="bg-gray-10 border-t border-gray-200">
                        <tr>
                            <td colSpan={6} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center font-semibold">
                                    <FaChartPie className="mr-2 h-4 w-4 text-gray-600" />
                                    {t('tableFooter.totalSuccessRate')}: {/* Đây là success rate của trang hiện tại */}
                                </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                                {totalProcessedItemsOverall} / {totalItemsOverallInput} ({overallSuccessRatePercentageString}%)
                            </td>
                            {/* Ô này trước đây trống, giờ hiển thị tổng số request */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                                {t('tableFooter.totalAllRequests', { count: totalRequestCount })}
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
};

export default RequestsTable;