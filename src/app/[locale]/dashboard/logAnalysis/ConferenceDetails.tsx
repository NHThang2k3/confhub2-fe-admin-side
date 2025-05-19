// src/components/ConferenceDetails.tsx
import React from 'react';
// Import LogAnalysisResult để truyền vào hook
import { LogAnalysisResult, ConferenceAnalysisDetail } from '@/src/models/logAnalysis/logAnalysis'; // Adjust path
import { useConferenceTableManager } from '@/src/hooks/crawl/useConferenceTableManager'; // Adjust path
import { ConferenceTableControls } from './conferenceTable/ConferenceTableControls'; // Adjust path
import { ConferenceTable } from './conferenceTable/ConferenceTable'; // Adjust path

interface ConferenceDetailsProps {
    // Nhận toàn bộ logAnalysisResult
    logAnalysisResult: LogAnalysisResult | null | undefined;
}

const ConferenceDetails: React.FC<ConferenceDetailsProps> = ({ logAnalysisResult }) => {
    // Truyền logAnalysisResult vào hook
    const tableManager = useConferenceTableManager({ logAnalysisResult });

    // Kiểm tra dựa trên sortedData từ tableManager (đã được xử lý)
    if (!tableManager.sortedData || tableManager.sortedData.length === 0) {
        return (
            <section className="p-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">
                    Detailed Conference Analysis
                    {logAnalysisResult?.filterRequestId && (
                        <span className="text-sm text-blue-600 ml-2">(Request ID: {logAnalysisResult.filterRequestId})</span>
                    )}
                </h2>
                <p className="text-center text-gray-500 py-8">
                    No conference analysis data available for the current filter.
                </p>
            </section>
        );
    }

    const rowSaveErrorsCount = Object.keys(tableManager.rowSaveErrors).length;

    return (
        <section className="bg-white shadow-xl rounded-lg p-4 md:p-6 border border-gray-200 mt-6">
            <div className="flex flex-wrap items-center justify-between mb-4 pb-2 border-b border-gray-300 gap-4">
                <h2 className="text-xl font-semibold text-gray-800 whitespace-nowrap">
                    Detailed Conference Analysis
                </h2>
            </div>

            <ConferenceTableControls
                selectedCount={tableManager.selectedRowIds.length} // Sử dụng selectedRowIds
                isSaveEnabled={tableManager.isSaveEnabled}
                mainSaveStatus={tableManager.mainSaveStatus}
                rowSaveErrorsCount={rowSaveErrorsCount}
                onSave={tableManager.handleBulkSave}
                onCrawl={tableManager.handleCrawlAgain}
                onSelectAll={tableManager.handleSelectAll}
                onSelectNoError={tableManager.handleSelectNoError}
                onSelectError={tableManager.handleSelectError}
                onSelectNoWarning={tableManager.handleSelectNoWarning}
                onSelectWarning={tableManager.handleSelectWarning}
                onDeselectAll={tableManager.handleDeselectAll}
            />

            <ConferenceTable
                data={tableManager.sortedData}
                selectedRows={tableManager.selectedRows} // Sử dụng selectedRows
                expandedRowUniqueId={tableManager.expandedRow} // Sử dụng expandedRow
                sortColumn={tableManager.sortColumn}
                sortDirection={tableManager.sortDirection}
                rowSaveStatus={tableManager.rowSaveStatus}
                rowSaveErrors={tableManager.rowSaveErrors}
                onSort={tableManager.handleSort}
                onToggleExpand={tableManager.toggleExpand} // Hàm này giờ nhận uniqueRowId
                onSelectToggle={tableManager.handleRowSelectToggle} // Hàm này giờ nhận uniqueRowId
                // Truyền thông tin filterRequestId
                filterRequestId={logAnalysisResult?.filterRequestId}
        
            />
        </section>
    );
};

export default ConferenceDetails;