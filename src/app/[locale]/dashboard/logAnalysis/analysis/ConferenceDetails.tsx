// src/app/[locale]/dashboard/logAnalysis/analysis/ConferenceDetails.tsx
import React, { useState } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { LogAnalysisResult } from '@/src/models/logAnalysis';
import { useConferenceTableManager } from '@/src/hooks/crawl/useConferenceTableManager';
import { ConferenceTableControls } from '../conferenceTable/ConferenceTableControls'; // Kiểm tra lại đường dẫn này
import { ConferenceTable } from '../conferenceTable/ConferenceTable'; // Kiểm tra lại đường dẫn này
import { useConferenceCrawl } from '@/src/hooks/crawl/useConferenceCrawl';
import ProcessActionModal from '../conferenceTable/ProcessActionModal'; // Kiểm tra lại đường dẫn này

interface ConferenceDetailsProps {
  logAnalysisResult: LogAnalysisResult | null | undefined;
}

const ConferenceDetails: React.FC<ConferenceDetailsProps> = ({
  logAnalysisResult
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { isCrawling: isGlobalProcessing } = useConferenceCrawl();

  const handleToggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  const tableManager = useConferenceTableManager({ logAnalysisResult });
  const hasData = tableManager.sortedData && tableManager.sortedData.length > 0;
  const rowSaveErrorsCount = Object.keys(tableManager.rowSaveErrors).length;

  // Kiểm tra xem có filter cột nào đang được áp dụng không
  const hasActiveColumnFilters = Object.values(tableManager.columnFilters).some(value => value && value.trim() !== '');

  return (
    <>
      <section className='bg-white shadow-xl rounded-lg p-4 md:p-6 border border-gray-200 mt-6 hover:bg-gray-5'> {/* Sửa hover:bg-gray-5 thành hover:bg-gray-5 */}
        <div
          className='flex flex-wrap items-center justify-between mb-4 pb-2 border-b border-gray-300 gap-4 cursor-pointer'
          onClick={handleToggleExpand}
        >
          <h2 className='text-xl font-semibold text-gray-800 whitespace-nowrap'>
            Detailed Conference Analysis
          </h2>
          <button
            className='rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none'
            aria-expanded={isExpanded}
            aria-controls='conference-details-content'
            title={isExpanded ? 'Collapse Details' : 'Expand Details'}
            onClick={e => {
              e.stopPropagation();
              handleToggleExpand();
            }}
          >
            {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
            <span className='sr-only'>{isExpanded ? 'Collapse' : 'Expand'}</span>
          </button>
        </div>

        {isExpanded && (
          <div id='conference-details-content'>
            {!logAnalysisResult?.conferenceAnalysis || Object.keys(logAnalysisResult.conferenceAnalysis).length === 0 ? (
              <p className='text-center text-gray-500 py-8'>
                No conference analysis data available.
              </p>
            ) : !hasData && (tableManager.searchQuery || hasActiveColumnFilters) ? ( // Kiểm tra cả searchQuery và columnFilters
              <>
                <ConferenceTableControls
                  selectedCount={tableManager.selectedRowIds.length}
                  isSaveEnabled={tableManager.isSaveEnabled}
                  mainSaveStatus={tableManager.mainSaveStatus}
                  rowSaveErrorsCount={rowSaveErrorsCount}
                  onSave={tableManager.handleBulkSave}
                  onProcessAgain={tableManager.handleProcessAgainClick}
                  isProcessing={isGlobalProcessing}
                  onSelectAll={tableManager.handleSelectAll}
                  onSelectNoError={tableManager.handleSelectNoError}
                  onSelectError={tableManager.handleSelectError}
                  onSelectWithoutWarningsOrErrors={tableManager.onSelectWithoutWarningsOrErrors}
                  onSelectWarning={tableManager.handleSelectWarning}
                  onDeselectAll={tableManager.handleDeselectAll}
                  searchTerm={tableManager.searchQuery}
                  onSearchChange={tableManager.setSearchQuery}
                />
                <p className='text-center text-gray-500 py-8'>
                  No conferences match your current filter criteria.
                  {tableManager.searchQuery && ` (Search: "${tableManager.searchQuery}")`}
                </p>
                 {/* Hiển thị ConferenceTable trống với header filter để người dùng có thể thay đổi filter */}
                <ConferenceTable
                  data={[]} // Truyền mảng rỗng
                  selectedRows={{}}
                  expandedRowUniqueId={null}
                  sortColumn={tableManager.sortColumn}
                  sortDirection={tableManager.sortDirection}
                  rowSaveStatus={{}}
                  rowSaveErrors={{}}
                  onSort={tableManager.handleSort}
                  onToggleExpand={tableManager.toggleExpand}
                  onSelectToggle={tableManager.handleRowSelectToggle}
                  columnFilters={tableManager.columnFilters} // <--- TRUYỀN VÀO
                  onColumnFilterChange={tableManager.handleColumnFilterChange} // <--- TRUYỀN VÀO
                />
              </>
            ) : (
              <>
                <ConferenceTableControls
                  selectedCount={tableManager.selectedRowIds.length}
                  isSaveEnabled={tableManager.isSaveEnabled}
                  mainSaveStatus={tableManager.mainSaveStatus}
                  rowSaveErrorsCount={rowSaveErrorsCount}
                  onSave={tableManager.handleBulkSave}
                  onProcessAgain={tableManager.handleProcessAgainClick}
                  isProcessing={isGlobalProcessing}
                  onSelectAll={tableManager.handleSelectAll}
                  onSelectNoError={tableManager.handleSelectNoError}
                  onSelectError={tableManager.handleSelectError}
                  onSelectWithoutWarningsOrErrors={tableManager.onSelectWithoutWarningsOrErrors}
                  onSelectWarning={tableManager.handleSelectWarning}
                  onDeselectAll={tableManager.handleDeselectAll}
                  searchTerm={tableManager.searchQuery}
                  onSearchChange={tableManager.setSearchQuery}
                />
                <ConferenceTable
                  data={tableManager.sortedData}
                  selectedRows={tableManager.selectedRows}
                  expandedRowUniqueId={tableManager.expandedRow}
                  sortColumn={tableManager.sortColumn}
                  sortDirection={tableManager.sortDirection}
                  rowSaveStatus={tableManager.rowSaveStatus}
                  rowSaveErrors={tableManager.rowSaveErrors}
                  onSort={tableManager.handleSort}
                  onToggleExpand={tableManager.toggleExpand}
                  onSelectToggle={tableManager.handleRowSelectToggle}
                  columnFilters={tableManager.columnFilters} // <--- TRUYỀN VÀO
                  onColumnFilterChange={tableManager.handleColumnFilterChange} // <--- TRUYỀN VÀO
                />
              </>
            )}
          </div>
        )}
      </section>

      <ProcessActionModal
        isOpen={tableManager.isProcessModalOpen}
        onClose={() => tableManager.setIsProcessModalOpen(false)}
        onConfirm={tableManager.handleConfirmProcessWithActionAndModels}
        itemsToProcess={tableManager.itemsToProcessFromTable}
      />
    </>
  );
};

export default ConferenceDetails;