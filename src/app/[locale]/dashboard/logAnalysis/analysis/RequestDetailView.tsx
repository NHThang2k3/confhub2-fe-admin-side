import React from 'react';
import { FaArrowLeft, FaFileAlt, FaInfoCircle } from 'react-icons/fa';
// import { CrawlerType } from './Analysis';
import NoDataDisplay from './NoDataDisplay';
import { LogAnalysisResult } from '@/src/models/logAnalysis/logAnalysis';

interface RequestDetailViewProps {
    data: LogAnalysisResult;
    activeRequestIdFilter: string | undefined;
    onClearFilter: () => void;
    OverallSummaryComponent: React.FC<any>; // Consider more specific props
    isSummaryExpandedOverall: boolean;
    onToggleSummaryOverall: () => void;
    ConferenceDetailsComponent: React.FC<any>; // Consider more specific props
    getNoDataMessage: () => string;
    hasOverallDataForDisplay: boolean;
    hasConferenceDetailsForDisplay: boolean;
    loading: boolean;
    // activeCrawler: CrawlerType; // Needed if JournalDetails is added
}

const RequestDetailView: React.FC<RequestDetailViewProps> = ({
    data,
    activeRequestIdFilter,
    onClearFilter,
    OverallSummaryComponent,
    isSummaryExpandedOverall,
    onToggleSummaryOverall,
    ConferenceDetailsComponent,
    getNoDataMessage,
    hasOverallDataForDisplay,
    hasConferenceDetailsForDisplay,
    loading,
    // activeCrawler
}) => {
    return (
        <div className="mt-6">
            <button
                onClick={onClearFilter}
                className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <FaArrowLeft className="mr-2" /> Back to List of Requests
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaFileAlt className="mr-2 text-green-600" /> Analysis Details
                <span className='text-sm text-blue-600 ml-2'>
                    (Request ID: {activeRequestIdFilter})
                </span>
            </h2>

            {hasOverallDataForDisplay ? (
                <OverallSummaryComponent
                    data={data}
                    isExpanded={isSummaryExpandedOverall}
                    onToggle={onToggleSummaryOverall}
                />
            ) : !loading && (
                <NoDataDisplay
                    message={getNoDataMessage()}
                    icon={<FaInfoCircle size={24} className="mb-3 text-blue-500" />}
                    className="mt-6 text-center text-gray-600 bg-white p-6 rounded-lg shadow-md border border-gray-200"
                />
            )}

            {/* Assuming 'conference' is the primary/default focus for now */}
            {hasConferenceDetailsForDisplay && (
                // <ConferenceDetailsComponent logAnalysisResult={data} />
                // The original ConferenceDetails component expects `logAnalysisResult` which is `data` here.
                // Let's adjust if ConferenceDetails needs specific parts of data or if `data` is fine.
                // Original was: <ConferenceDetails logAnalysisResult={data} />
                // This should be okay.
                 <div className="mt-4"> {/* Added margin for spacing */}
                    <ConferenceDetailsComponent logAnalysisResult={data} />
                 </div>
            )}
            
            {/* Message if overall data exists, but no specific conference details for this request */}
            {!hasConferenceDetailsForDisplay && !loading && hasOverallDataForDisplay && (
                 <NoDataDisplay
                    message="No specific Conference analysis details available for this request."
                    icon={<FaInfoCircle size={20} className="my-2 inline-block text-gray-400" />}
                    className="mt-4 text-center text-gray-500 bg-white p-4 rounded-lg shadow-md border border-gray-200"
                />
            )}

            {/* Placeholder for JournalDetails if activeCrawler logic is reintroduced for details
            {activeCrawler === 'journal' && hasJournalDetailsForDisplay && (
                <JournalDetailsComponent logAnalysisResult={data} />
            )}
            */}
        </div>
    );
};

export default RequestDetailView;