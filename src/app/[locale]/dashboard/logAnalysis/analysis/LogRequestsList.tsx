// src/app/[locale]/dashboard/logAnalysis/analysis/LogRequestsList.tsx
import React, { useState } from 'react'; // *** THÊM useState ***
import { FaListAlt, FaChevronUp, FaChevronDown, FaInfoCircle, FaChartBar, FaFileAlt } from 'react-icons/fa'; // *** THÊM ICONS CHO TABS ***
import RequestsTable from './RequestsTable';
import NoDataDisplay from './NoDataDisplay';
import { useTranslations } from 'next-intl';
import { LogAnalysisResultUnion, CrawlerType } from '@/src/hooks/logAnalysis/useLogAnalysisData';
import ConferenceOverallSummary from '../overallSummary/ConferenceOverallSummary';
import JournalOverallSummary from '../journalOverallSummary/JournalOverallSummary';
import { ConferenceLogAnalysisResult } from '@/src/models/logAnalysis';
import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types';
import RequestsOverallSummary from '../overallSummary/RequestsOverallSummary'; // *** IMPORT COMPONENT MỚI ***
import GeneralPagination from '../../../utils/GeneralPagination';
const ITEMS_PER_PAGE = 10;

type SummaryViewType = 'requests' | 'details'; // *** TYPE CHO VIEW SUMMARY ***

interface LogRequestsListProps {
    isExpanded: boolean;
    onToggle: () => void;
    data: LogAnalysisResultUnion;
    onSelectRequest: (requestId: string) => void;
    formatDateTime: (isoString: string | null | undefined) => string;
    getStatusChipClass: (status: string | undefined | null) => string;
    isSummaryExpandedOverall: boolean; // This controls the entire summary section visibility
    onToggleSummaryOverall: () => void; // This controls the entire summary section visibility
    getNoDataMessage: () => string;
    hasOverallDataForDisplay: boolean; // Used to decide if summary section should be shown AT ALL
    crawlerType: CrawlerType;
    currentPage: number;
    onPageChange: (page: number) => void;
    totalRequestCount: number; // Prop này đã được thêm ở bước trước
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
    totalRequestCount
}) => {
    const t = useTranslations('LogRequestsList');
    const tCommon = useTranslations('Common');

    // *** STATE ĐỂ QUẢN LÝ VIEW SUMMARY NÀO ĐANG ACTIVE ***
    const [activeSummaryView, setActiveSummaryView] = useState<SummaryViewType>('requests');

    const allRequestIds = data.analyzedRequestIds || [];
    const hasRequestsData = allRequestIds.length > 0;

    const totalPages = Math.ceil(allRequestIds.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedRequestIds = allRequestIds.slice(startIndex, endIndex);

    const requestsDataForTable = data.requests as { [key: string]: { startTime: string | null; endTime: string | null; status: string | undefined | null; durationSeconds: number | null; } };

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
                className={`transition-max-height duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100 visible p-4 sm:p-6' : 'max-h-0 opacity-0 invisible'}`} // Tăng max-h
            >
                {hasRequestsData ? (
                    <>
                        <RequestsTable
                            requestIds={paginatedRequestIds}
                            requestsData={requestsDataForTable}
                            onSelectRequest={onSelectRequest}
                            formatDateTime={formatDateTime}
                            getStatusChipClass={getStatusChipClass}
                            crawlerType={crawlerType}
                            totalRequestCount={totalRequestCount}
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

                {/* Overall Summary Section - controlled by isSummaryExpandedOverall */}
                {hasOverallDataForDisplay && ( // Chỉ hiển thị mục summary nếu có dữ liệu tổng thể
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
                                {/* Navigation for Summary Types */}
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

                                {/* Conditional Rendering of Summaries */}
                                {activeSummaryView === 'requests' && (
                                    <RequestsOverallSummary data={data} />
                                )}
                                {activeSummaryView === 'details' && (
                                    crawlerType === 'conference' ? (
                                        <ConferenceOverallSummary
                                            data={data as ConferenceLogAnalysisResult}
                                            isExpanded={true} // Luôn expanded khi view này active
                                            onToggle={() => {}} // Không cần toggle riêng ở đây nữa
                                        />
                                    ) : ( // crawlerType === 'journal'
                                        <JournalOverallSummary
                                            data={data as JournalLogAnalysisResult}
                                            isExpanded={true} // Luôn expanded khi view này active
                                            onToggle={() => {}} // Không cần toggle riêng ở đây nữa
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