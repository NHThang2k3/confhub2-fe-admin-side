import React from 'react';
import { FaListAlt, FaChevronUp, FaChevronDown, FaInfoCircle } from 'react-icons/fa';
import RequestsTable from './RequestsTable'; // Import the new table component
import NoDataDisplay from './NoDataDisplay';
import { LogAnalysisResult, RequestTimings } from '@/src/models/logAnalysis/logAnalysis';
interface LogRequestsListProps {
    isExpanded: boolean;
    onToggle: () => void;
    data: LogAnalysisResult;
    onSelectRequest: (requestId: string) => void;
    formatDateTime: (isoString: string | null | undefined) => string;
    getStatusChipClass: (status: string | undefined | null) => string;
    OverallSummaryComponent: React.FC<any>; // Consider more specific props for OverallSummary
    isSummaryExpandedOverall: boolean;
    onToggleSummaryOverall: () => void;
    getNoDataMessage: () => string;
    hasOverallDataForDisplay: boolean;
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
}) => {
    const hasRequests = data.analyzedRequestIds && data.analyzedRequestIds.length > 0;

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
                    <FaListAlt className="mr-2 text-blue-600" /> Available Log Analysis Requests
                </h2>
                <button
                    className="text-gray-500 hover:text-blue-600 focus:outline-none p-1 rounded-full"
                    aria-label={isExpanded ? "Collapse Log Requests" : "Expand Log Requests"}
                >
                    {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
                </button>
            </div>

            <div
                id="log-requests-content"
                className={`transition-max-height duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[3500px] opacity-100 visible p-4 sm:p-6' : 'max-h-0 opacity-0 invisible'}`}
            >
                {hasRequests ? (
                    <RequestsTable
                        requestIds={data.analyzedRequestIds}
                        requestsData={data.requests as { [key: string]: RequestTimings }} // Type assertion if needed
                        onSelectRequest={onSelectRequest}
                        formatDateTime={formatDateTime}
                        getStatusChipClass={getStatusChipClass}
                    />
                ) : (
                     <NoDataDisplay message={getNoDataMessage()} icon={<FaInfoCircle size={20} className="mb-2 inline-block" />} />
                )}

                {hasOverallDataForDisplay && ( // Show overall summary if there's overall data, even if no specific requests in current time filter
                    <div className="mt-6 border-t pt-4">
                        <OverallSummaryComponent
                            data={data}
                            isExpanded={isSummaryExpandedOverall}
                            onToggle={onToggleSummaryOverall}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogRequestsList;