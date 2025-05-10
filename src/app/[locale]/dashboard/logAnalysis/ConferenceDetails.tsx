// src/components/ConferenceDetails.tsx (Or wherever it resides)
import React from 'react';
import { ConferenceAnalysisDetail } from '@/src/models/logAnalysis/logAnalysis';
import { useConferenceTableManager } from '@/src/hooks/crawl/useConferenceTableManager';
import { ConferenceTableControls } from './conferenceTable/ConferenceTableControls';
import { ConferenceTable } from './conferenceTable/ConferenceTable';

interface ConferenceDetailsProps {
    conferenceAnalysis: Record<string, ConferenceAnalysisDetail> | null | undefined;
}

const ConferenceDetails: React.FC<ConferenceDetailsProps> = ({ conferenceAnalysis }) => {
    // Hook useConferenceTableManager giờ đã trả về handleSelectNoWarning và handleSelectWarning
    const tableManager = useConferenceTableManager({ initialData: conferenceAnalysis });

    if (!conferenceAnalysis || Object.keys(conferenceAnalysis).length === 0) {
        return (
             <section className="p-4">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">Detailed Conference Analysis</h2>
                  <p className="text-center text-gray-500">No conference analysis data available to display.</p>
             </section>
         );
    }

    const rowSaveErrorsCount = Object.keys(tableManager.rowSaveErrors).length;

    return (
        <section>
             <div className="flex flex-wrap items-center justify-between mb-4 pb-2 border-b border-gray-300 gap-4">
                 <h2 className="text-xl font-semibold text-gray-700 whitespace-nowrap">Detailed Conference Analysis</h2>
             </div>

            <ConferenceTableControls
                selectedCount={tableManager.selectedTitles.length}
                isSaveEnabled={tableManager.isSaveEnabled}
                mainSaveStatus={tableManager.mainSaveStatus}
                rowSaveErrorsCount={rowSaveErrorsCount}
                onSave={tableManager.handleBulkSave}
                onCrawl={tableManager.handleCrawlAgain}
                onSelectAll={tableManager.handleSelectAll}
                onSelectNoError={tableManager.handleSelectNoError}
                onSelectError={tableManager.handleSelectError}
                // --- TRUYỀN CÁC PROPS CÒN THIẾU ---
                onSelectNoWarning={tableManager.handleSelectNoWarning} // <-- Thêm dòng này
                onSelectWarning={tableManager.handleSelectWarning}     // <-- Thêm dòng này
                // ---------------------------------
                onDeselectAll={tableManager.handleDeselectAll}
            />

            <ConferenceTable
                data={tableManager.sortedData}
                selectedConferences={tableManager.selectedConferences}
                expandedConference={tableManager.expandedConference}
                sortColumn={tableManager.sortColumn}
                sortDirection={tableManager.sortDirection}
                rowSaveStatus={tableManager.rowSaveStatus}
                rowSaveErrors={tableManager.rowSaveErrors}
                onSort={tableManager.handleSort}
                onToggleExpand={tableManager.toggleExpand}
                onSelectToggle={tableManager.handleRowSelectToggle}
            />
        </section>
    );
};

export default ConferenceDetails;