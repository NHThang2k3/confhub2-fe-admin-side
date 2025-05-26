import React, { useState } from 'react';
import { FaArrowLeft, FaFileAlt, FaInfoCircle, FaListAlt, FaClipboardList } from 'react-icons/fa';
import NoDataDisplay from './NoDataDisplay';
import { LogAnalysisResult } from '@/src/models/logAnalysis';
import { useTranslations } from 'next-intl'; // Import useTranslations

type ActiveTab = 'summary' | 'details';

interface RequestDetailViewProps {
    data: LogAnalysisResult;
    activeRequestIdFilter: string | undefined;
    onClearFilter: () => void;
    OverallSummaryComponent: React.FC<any>;
    isSummaryExpandedOverall: boolean;
    onToggleSummaryOverall: () => void;
    ConferenceDetailsComponent: React.FC<any>;
    getNoDataMessage: () => string; // This message is handled by parent, so it's already localized
    hasOverallDataForDisplay: boolean;
    hasConferenceDetailsForDisplay: boolean;
    loading: boolean;
}

const RequestDetailView: React.FC<RequestDetailViewProps> = ({
    data,
    activeRequestIdFilter,
    onClearFilter,
    OverallSummaryComponent,
    isSummaryExpandedOverall,
    onToggleSummaryOverall,
    ConferenceDetailsComponent,
    getNoDataMessage, // This message is already localized in the parent component
    hasOverallDataForDisplay,
    hasConferenceDetailsForDisplay,
    loading,
}) => {
    // Khởi tạo t với namespace 'RequestDetailView'
    const t = useTranslations('RequestDetailView');

    const [activeTab, setActiveTab] = useState<ActiveTab>('summary');

    return (
        <div className="mt-6">
            {/* Header section: Back button, Analysis Details title, and Tab Navigation */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-gray-200 pb-4 mb-4">
                {/* Back to List Button and Analysis Details Title */}
                <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                    <button
                        onClick={onClearFilter}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FaArrowLeft className="mr-2" /> {t('backToListButton')} 
                    </button>
                </div>

                {/* Tab Navigation */}
                <nav className="flex-grow flex space-x-8 -mb-4 sm:-mb-px justify-start sm:justify-end" aria-label={t('tabsAriaLabel')}> 
                    <a
                        href="#"
                        onClick={() => setActiveTab('summary')}
                        className={`
                            ${activeTab === 'summary'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center
                        `}
                        aria-current={activeTab === 'summary' ? 'page' : undefined}
                    >
                        <FaListAlt className="mr-2" /> {t('tabs.overallSummary')} 
                    </a>
                    <a
                        href="#"
                        onClick={() => setActiveTab('details')}
                        className={`
                            ${activeTab === 'details'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center
                        `}
                        aria-current={activeTab === 'details' ? 'page' : undefined}
                    >
                        <FaClipboardList className="mr-2" /> {t('tabs.conferenceDetails')} 
                    </a>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'summary' && (
                    <>
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
                    </>
                )}

                {activeTab === 'details' && (
                    <>
                        {hasConferenceDetailsForDisplay ? (
                            <div className="mt-0">
                                <ConferenceDetailsComponent logAnalysisResult={data} />
                            </div>
                        ) : !loading && hasOverallDataForDisplay ? (
                            <NoDataDisplay
                                message={t('noDetailsMessage')} 
                                icon={<FaInfoCircle size={20} className="my-2 inline-block text-gray-400" />}
                                className="mt-4 text-center text-gray-500 bg-white p-4 rounded-lg shadow-md border border-gray-200"
                            />
                        ) : !loading && !hasOverallDataForDisplay && (
                            <NoDataDisplay
                                message={getNoDataMessage()}
                                icon={<FaInfoCircle size={24} className="mb-3 text-blue-500" />}
                                className="mt-6 text-center text-gray-600 bg-white p-6 rounded-lg shadow-md border border-gray-200"
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RequestDetailView;