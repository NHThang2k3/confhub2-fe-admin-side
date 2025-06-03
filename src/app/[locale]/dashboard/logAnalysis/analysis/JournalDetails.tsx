// src/app/[locale]/dashboard/logAnalysis/analysis/JournalDetails.tsx (ADJUSTED)
import React, { useState } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types';
import { useJournalTableManager } from '@/src/hooks/crawl/journal/useJournalTableManager';
import { JournalTableControls } from '../journalTable/JournalTableControls';
import { JournalTable } from '../journalTable/JournalTable';
import { useTranslations } from 'next-intl';

interface JournalDetailsProps {
  logAnalysisResult: JournalLogAnalysisResult | null | undefined;
}

const JournalDetails: React.FC<JournalDetailsProps> = ({
  logAnalysisResult
}) => {
  const t = useTranslations('JournalDetailsPage');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  const tableManager = useJournalTableManager({ logAnalysisResult });

  const hasData = tableManager.sortedData && tableManager.sortedData.length > 0;
  const hasActiveColumnFilters = Object.values(tableManager.columnFilters).some(value => value && typeof value === 'string' && value.trim() !== '');

  const getDynamicStatusChipClass = (status: string | undefined | null): string => {
    if (!status) {
      return 'bg-gray-100 text-gray-700';
    }
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  // Helper for formatting date, can be moved to a utils file
  const formatDateTime = (isoString: string | null | undefined): string => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <>
      <section className='bg-white shadow-xl rounded-lg p-4 md:p-6 border border-gray-200 mt-6'>
        <div
          className='flex flex-wrap items-center justify-between mb-4 pb-2 border-b border-gray-300 gap-4 hover:bg-gray-50 cursor-pointer' // Added hover:bg-gray-50
          onClick={handleToggleExpand}
        >
          <h2 className='text-xl font-semibold text-gray-800 whitespace-nowrap'>
            {t('title')}
          </h2>
          <button
            className='rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none'
            aria-expanded={isExpanded}
            aria-controls='journal-details-content'
            title={isExpanded ? t('collapseDetailsTitle') : t('expandDetailsTitle')}
            onClick={e => {
              e.stopPropagation();
              handleToggleExpand();
            }}
          >
            {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
            <span className='sr-only'>{isExpanded ? t('srOnly.collapse') : t('srOnly.expand')}</span>
          </button>
        </div>

        {isExpanded && (
          <div id='journal-details-content'>
            {!logAnalysisResult?.journalAnalysis || Object.keys(logAnalysisResult.journalAnalysis).length === 0 ? (
              <p className='text-center text-gray-500 py-8'>
                {t('noDataMessage')}
              </p>
            ) : ( // Simplified the conditional rendering a bit
              <>
                <JournalTableControls
                  selectedCount={tableManager.selectedRowsCount} // Use selectedRowsCount for the count
                  onSelectAll={tableManager.handleSelectAll}
                  onSelectNoError={tableManager.handleSelectNoError}
                  onSelectError={tableManager.handleSelectError}
                  onDeselectAll={tableManager.handleDeselectAll}
                  searchTerm={tableManager.searchQuery}
                  onSearchChange={tableManager.setSearchQuery}
                  onReCrawlSelected={tableManager.handleReCrawlSelectedClick}
                  isReCrawlDisabled={tableManager.selectedRowsCount === 0} // Use selectedRowsCount
                  // Save related controls
                  mainSaveStatus={tableManager.mainSaveStatus}
                  isSaveEnabled={tableManager.isSaveEnabled}
                  onSaveSelected={tableManager.handleBulkSave} // Pass the save handler
                />
                <JournalTable
                  data={tableManager.sortedData} // Pass sortedData, could be empty if filters result in no matches
                  selectedRows={tableManager.selectedRows} // Pass the selectedRows object map
                  expandedRowUniqueId={tableManager.expandedRow}
                  sortColumn={tableManager.sortColumn}
                  sortDirection={tableManager.sortDirection}
                  onSort={tableManager.handleSort}
                  onToggleExpand={tableManager.toggleExpand}
                  onSelectToggle={tableManager.handleRowSelectToggle}
                  columnFilters={tableManager.columnFilters}
                  onColumnFilterChange={tableManager.handleColumnFilterChange}
                  totalRowsCount={tableManager.totalRowsCount}
                  selectedRowsCount={tableManager.selectedRowsCount}
                  onSelectAll={tableManager.handleSelectAll}
                  formatDateTime={formatDateTime}
                  getStatusChipClass={getDynamicStatusChipClass}
                  // Pass save status props
                  rowSaveStatus={tableManager.rowSaveStatus}
                  rowSaveErrors={tableManager.rowSaveErrors}
                />
                 {/* Conditional rendering for "No data matches your filters" */}
                 {(!hasData && (tableManager.searchQuery || hasActiveColumnFilters)) && (
                    <p className="text-center text-gray-500 py-8">
                        {t('noFilterMatchMessage')} {/* e.g., "No journals match your current filters." */}
                    </p>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* 
      <ReCrawlJournalModal
        isOpen={tableManager.isReCrawlModalOpen}
        onClose={() => tableManager.setIsReCrawlModalOpen(false)}
        onConfirm={tableManager.handleConfirmReCrawl}
        itemsToProcess={tableManager.itemsToReCrawl}
      /> 
      */}
    </>
  );
};

export default JournalDetails;