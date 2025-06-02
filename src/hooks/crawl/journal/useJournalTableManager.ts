// src/hooks/logAnalysis/useJournalTableManager.ts (File mới)

import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types'; // Adjust path
import { useJournalDataTransform } from './useJournalDataTransform';
import { useJournalTableSortingAndFiltering } from './useJournalTableSortingAndFiltering';
import { useJournalTableRowSelection } from './useJournalTableRowSelection';
import { useJournalTableActions } from './useJournalTableActions';
import { useJournalRowExpansion } from './useJournalRowExpansion';
import { UseJournalTableManagerProps } from './journalTableManagerTypes'; // Import types

// Export lại các type cần thiết từ journalTableManagerTypes.ts
export * from './journalTableManagerTypes';


/**
 * Hook tổng hợp quản lý toàn bộ logic cho bảng Journal Analysis.
 */
export const useJournalTableManager = ({
  logAnalysisResult
}: UseJournalTableManagerProps) => {
  const resetDependencies = [logAnalysisResult];

  // 1. Chuyển đổi và tính toán dữ liệu
  const { journalDataArray } = useJournalDataTransform({ logAnalysisResult });

  // 2. Sắp xếp và lọc
  const {
    sortedData,
    sortColumn,
    sortDirection,
    handleSort,
    searchQuery,
    setSearchQuery,
    columnFilters,
    handleColumnFilterChange,
    totalRowsCount,
  } = useJournalTableSortingAndFiltering({ data: journalDataArray, resetDependencies });

  // 3. Lựa chọn hàng
  const {
    selectedRows,
    selectedRowIds,
    handleRowSelectToggle,
    handleSelectAll,
    handleDeselectAll,
    handleSelectNoError, // Select journals with 0 errors
    handleSelectError,   // Select journals with >0 errors
    handleSelectBioxbioSuccess, // Ví dụ
    selectedRowsCount,
  } = useJournalTableRowSelection({ data: sortedData, resetDependencies });

  // 4. Hành động (Có thể đơn giản hơn cho journal)
  const {
    isReCrawlModalOpen,
    setIsReCrawlModalOpen,
    handleReCrawlSelectedClick,
    handleConfirmReCrawl,
    itemsToReCrawl,
  } = useJournalTableActions({
    selectedRowIds,
    allJournalData: journalDataArray,
    resetDependencies
  });

  // 5. Mở rộng hàng
  const { expandedRow, toggleExpand } = useJournalRowExpansion({ resetDependencies });

  return {
    // Data & Sorting & Filtering
    sortedData,
    sortColumn,
    sortDirection,
    handleSort,
    searchQuery,
    setSearchQuery,
    columnFilters,
    handleColumnFilterChange,
    totalRowsCount,

    // Selection
    selectedRows,
    selectedRowIds,
    handleRowSelectToggle,
    handleSelectAll,
    handleDeselectAll,
    handleSelectNoError,
    handleSelectError,
    handleSelectBioxbioSuccess,
    selectedRowsCount,

    // Expansion
    expandedRow,
    toggleExpand,

    // Actions
    isReCrawlModalOpen,
    setIsReCrawlModalOpen,
    handleReCrawlSelectedClick,
    handleConfirmReCrawl,
    itemsToReCrawl,
  };
};