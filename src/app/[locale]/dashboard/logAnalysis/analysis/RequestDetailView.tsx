// src/app/[locale]/dashboard/logAnalysis/analysis/RequestDetailView.tsx
import React, { useState } from 'react';
import { FaArrowLeft, FaInfoCircle, FaListAlt, FaClipboardList } from 'react-icons/fa';
import NoDataDisplay from './NoDataDisplay';
import { ConferenceLogAnalysisResult } from '@/src/models/logAnalysis';
import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types';
import { useTranslations } from 'next-intl';
import { LogAnalysisResultUnion, CrawlerType } from '@/src/hooks/logAnalysis/useLogAnalysisData';

import ConferenceDetails from './ConferenceDetails';
import JournalDetails from './JournalDetails';

// *** IMPORT CÁC COMPONENT SUMMARY RIÊNG BIỆT ***
import ConferenceOverallSummary from '../overallSummary/ConferenceOverallSummary'; // Giả sử đây là bản cho Conference
import JournalOverallSummary from '../journalOverallSummary/JournalOverallSummary'; // Bản mới cho Journal

type ActiveTab = 'summary' | 'details';

interface RequestDetailViewProps {
    activeCrawler: CrawlerType;
    data: LogAnalysisResultUnion;
    activeRequestIdFilter: string | undefined;
    onClearFilter: () => void;
    // *** BỎ OverallSummaryComponent PROP ***
    // OverallSummaryComponent: React.FC<any>;
    isSummaryExpandedOverall: boolean; // Vẫn nhận từ Analysis.tsx nếu state được quản lý ở đó
    onToggleSummaryOverall: () => void; // Vẫn nhận từ Analysis.tsx
    getNoDataMessage: () => string;
    hasOverallDataForDisplay: boolean;
    hasItemDetailsForDisplay: boolean;
    loading: boolean;
}

const RequestDetailView: React.FC<RequestDetailViewProps> = ({
    activeCrawler,
    data,
    activeRequestIdFilter,
    onClearFilter,
    // OverallSummaryComponent, // Bỏ
    isSummaryExpandedOverall,   // Giữ lại
    onToggleSummaryOverall,     // Giữ lại
    getNoDataMessage,
    hasOverallDataForDisplay,
    hasItemDetailsForDisplay,
    loading,
}) => {
    const t = useTranslations('RequestDetailView');
    const [activeTab, setActiveTab] = useState<ActiveTab>('summary');

    const detailsTabName = activeCrawler === 'conference'
        ? t('tabs.conferenceDetails')
        : t('tabs.journalDetails');

    return (
        <div className="mt-6">
            {/* Header và Nav giữ nguyên */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-gray-200 pb-4 mb-4">
                {/* ... Back button ... */}
                <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                    <button
                        onClick={onClearFilter}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FaArrowLeft className="mr-2" /> {t('backToListButton')}
                    </button>
                </div>
                {/* ... Tabs ... */}
                <nav className="flex-grow flex space-x-8 -mb-4 sm:-mb-px justify-start sm:justify-end" aria-label={t('tabsAriaLabel')}>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveTab('summary'); }}
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
                        onClick={(e) => { e.preventDefault(); setActiveTab('details'); }}
                        className={`
                            ${activeTab === 'details'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center
                        `}
                        aria-current={activeTab === 'details' ? 'page' : undefined}
                    >
                        <FaClipboardList className="mr-2" /> {detailsTabName}
                    </a>
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'summary' && (
                    <>
                        {hasOverallDataForDisplay ? (
                            // *** RENDER SUMMARY COMPONENT CỤ THỂ ***
                            activeCrawler === 'conference' ? (
                                <ConferenceOverallSummary
                                    data={data as ConferenceLogAnalysisResult}
                                    isExpanded={isSummaryExpandedOverall}
                                    onToggle={onToggleSummaryOverall}
                                />
                            ) : ( // activeCrawler === 'journal'
                                <JournalOverallSummary
                                    data={data as JournalLogAnalysisResult}
                                    isExpanded={isSummaryExpandedOverall}
                                    onToggle={onToggleSummaryOverall}
                                />
                            )
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
                    // ... Phần details giữ nguyên ...
                    <>
                        {hasItemDetailsForDisplay ? (
                            <div className="mt-0">
                                {activeCrawler === 'conference' && data && (
                                    <ConferenceDetails logAnalysisResult={data as ConferenceLogAnalysisResult} />
                                )}
                                {activeCrawler === 'journal' && data && (
                                    <JournalDetails logAnalysisResult={data as JournalLogAnalysisResult} />
                                )}
                            </div>
                        ) : !loading && hasOverallDataForDisplay ? (
                            <NoDataDisplay
                                message={activeCrawler === 'conference' ? t('noDetailsMessageConference') : t('noDetailsMessageJournal')}
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