// src/app/[locale]/dashboard/logAnalysis/analysis/JournalDetails.tsx (File mới)
import React, { useState } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types'; // Adjust path
import { useJournalTableManager } from '@/src/hooks/crawl/journal/useJournalTableManager';
import { JournalTableControls } from '../journalTable/JournalTableControls';
import { JournalTable } from '../journalTable/JournalTable';         // Component mới
import { useTranslations } from 'next-intl';

interface JournalDetailsProps {
  logAnalysisResult: JournalLogAnalysisResult | null | undefined;
}

const JournalDetails: React.FC<JournalDetailsProps> = ({
  logAnalysisResult
}) => {
  const t = useTranslations('JournalDetailsPage'); // Namespace mới cho i18n
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  const tableManager = useJournalTableManager({ logAnalysisResult }); // Sử dụng hook quản lý bảng journal

  const hasData = tableManager.sortedData && tableManager.sortedData.length > 0;
  const hasActiveColumnFilters = Object.values(tableManager.columnFilters).some(value => value && typeof value === 'string' && value.trim() !== '');


  return (
    <>
      <section className='bg-white shadow-xl rounded-lg p-4 md:p-6 border border-gray-200 mt-6 hover:bg-gray-5'>
        <div
          className='flex flex-wrap items-center justify-between mb-4 pb-2 border-b border-gray-300 gap-4 cursor-pointer'
          onClick={handleToggleExpand}
        >
          <h2 className='text-xl font-semibold text-gray-800 whitespace-nowrap'>
            {t('title')} {/* Ví dụ: "Journal Crawl Details" */}
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
            {/* Kiểm tra dữ liệu journalAnalysis */}
            {!logAnalysisResult?.journalAnalysis || Object.keys(logAnalysisResult.journalAnalysis).length === 0 ? (
              <p className='text-center text-gray-500 py-8'>
                {t('noDataMessage')} {/* Ví dụ: "No journal analysis data found." */}
              </p>
            ) : !hasData && (tableManager.searchQuery || hasActiveColumnFilters) ? (
              // Trường hợp có filter/search nhưng không có kết quả
              <>
                <JournalTableControls
                  selectedCount={tableManager.selectedRowIds.length}
                  onSelectAll={tableManager.handleSelectAll}
                  onSelectNoError={tableManager.handleSelectNoError}
                  onSelectError={tableManager.handleSelectError}
                  onDeselectAll={tableManager.handleDeselectAll}
                  searchTerm={tableManager.searchQuery}
                  onSearchChange={tableManager.setSearchQuery}
                  // Các props khác cho controls nếu có (ví dụ: re-crawl)
                  onReCrawlSelected={tableManager.handleReCrawlSelectedClick}
                  isReCrawlDisabled={tableManager.selectedRowIds.length === 0} // Ví dụ
                />
                <JournalTable
                  data={[]} // Không có data để hiển thị
                  selectedRows={{}}
                  expandedRowUniqueId={null}
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
                  formatDateTime={ (isoString) => isoString ? new Date(isoString).toLocaleString() : 'N/A' } // Cung cấp hàm formatDateTime
                  getStatusChipClass={ (status) => status ? 'bg-gray-200' : 'bg-gray-100' } // Cung cấp hàm getStatusChipClass
                />
              </>
            ) : (
              // Trường hợp có dữ liệu để hiển thị
              <>
                <JournalTableControls
                  selectedCount={tableManager.selectedRowIds.length}
                  onSelectAll={tableManager.handleSelectAll}
                  onSelectNoError={tableManager.handleSelectNoError}
                  onSelectError={tableManager.handleSelectError}
                  onDeselectAll={tableManager.handleDeselectAll}
                  searchTerm={tableManager.searchQuery}
                  onSearchChange={tableManager.setSearchQuery}
                  onReCrawlSelected={tableManager.handleReCrawlSelectedClick}
                  isReCrawlDisabled={tableManager.selectedRowIds.length === 0}
                />
                <JournalTable
                  data={tableManager.sortedData}
                  selectedRows={tableManager.selectedRows}
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
                  formatDateTime={ (isoString) => isoString ? new Date(isoString).toLocaleString() : 'N/A' }
                  getStatusChipClass={ (status) => status ? 'bg-gray-200' : 'bg-gray-100' }
                />
              </>
            )}
          </div>
        )}
      </section>

      {/* Modal cho action re-crawl (nếu có) */}
      {/* <ReCrawlJournalModal
        isOpen={tableManager.isReCrawlModalOpen}
        onClose={() => tableManager.setIsReCrawlModalOpen(false)}
        onConfirm={tableManager.handleConfirmReCrawl}
        itemsToProcess={tableManager.itemsToReCrawl}
      /> */}
    </>
  );
};

export default JournalDetails;