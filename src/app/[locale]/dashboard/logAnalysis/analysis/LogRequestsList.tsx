// src/app/[locale]/dashboard/logAnalysis/analysis/LogRequestsList.tsx
import React from 'react';
import { FaListAlt, FaChevronUp, FaChevronDown, FaInfoCircle } from 'react-icons/fa';
import RequestsTable from './RequestsTable';
import NoDataDisplay from './NoDataDisplay';
// *** THAY ĐỔI: Import RequestTimings từ LogAnalysisResultUnion nếu cần, hoặc để data.requests as ... ***
// import { RequestTimings } from '@/src/models/logAnalysis'; // Có thể không cần nếu ép kiểu trực tiếp
import { useTranslations } from 'next-intl';
// *** THAY ĐỔI: Import LogAnalysisResultUnion và CrawlerType ***
import { LogAnalysisResultUnion, CrawlerType } from '@/src/hooks/logAnalysis/useLogAnalysisData'; // Hoặc từ Analysis.tsx

interface LogRequestsListProps {
    isExpanded: boolean;
    onToggle: () => void;
    data: LogAnalysisResultUnion; // Đã là union type
    onSelectRequest: (requestId: string) => void;
    formatDateTime: (isoString: string | null | undefined) => string;
    getStatusChipClass: (status: string | undefined | null) => string;
    OverallSummaryComponent: React.FC<any>; // OverallSummary sẽ nhận data union và crawlerType
    isSummaryExpandedOverall: boolean;
    onToggleSummaryOverall: () => void;
    getNoDataMessage: () => string;
    hasOverallDataForDisplay: boolean;
    crawlerType: CrawlerType; // *** THÊM: Prop crawlerType ***
}

const LogRequestsList: React.FC<LogRequestsListProps> = ({
    isExpanded,
    onToggle,
    data,
    onSelectRequest,
    formatDateTime,
    getStatusChipClass,
    OverallSummaryComponent,
    isSummaryExpandedOverall,
    onToggleSummaryOverall,
    getNoDataMessage,
    hasOverallDataForDisplay,
    crawlerType, // *** NHẬN prop crawlerType ***
}) => {
    const t = useTranslations('LogRequestsList');

    const hasRequests = data.analyzedRequestIds && data.analyzedRequestIds.length > 0;

    // data.requests có thể là ConferenceLogAnalysisResult['requests'] hoặc JournalLogAnalysisResult['requests']
    // Cả hai đều có cấu trúc { [key: string]: RequestSummaryType }, RequestSummaryType có thể khác nhau một chút
    // nhưng các trường cơ bản cho RequestsTable (startTime, endTime, status, durationSeconds) nên giống nhau.
    // Nếu RequestTimings là một type chung cho cả hai, thì không cần ép kiểu phức tạp.
    // Giả sử RequestTimings là type chung hoặc các trường cần thiết có ở cả hai.
    const requestsDataForTable = data.requests as { [key: string]: { startTime: string | null; endTime: string | null; status: string | undefined | null; durationSeconds: number | null; /* các trường khác nếu RequestsTable cần */ } };


    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div
                className="flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-5"
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
                className={`transition-max-height duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[3500px] opacity-100 visible p-4 sm:p-6' : 'max-h-0 opacity-0 invisible'}`}
            >
                {hasRequests ? (
                    <RequestsTable
                        requestIds={data.analyzedRequestIds}
                        requestsData={requestsDataForTable} // Sử dụng biến đã ép kiểu (hoặc type an toàn hơn)
                        onSelectRequest={onSelectRequest}
                        formatDateTime={formatDateTime}
                        getStatusChipClass={getStatusChipClass}
                        crawlerType={crawlerType}
                    />
                ) : (
                     <NoDataDisplay message={getNoDataMessage()} icon={<FaInfoCircle size={20} className="mb-2 inline-block" />} />
                )}

                {hasOverallDataForDisplay && (
                    <div className="mt-6 border-t pt-4">
                        <OverallSummaryComponent
                            data={data} // Truyền data union
                            isExpanded={isSummaryExpandedOverall}
                            onToggle={onToggleSummaryOverall}
                            crawlerType={crawlerType} // *** TRUYỀN crawlerType xuống OverallSummary ***
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogRequestsList;