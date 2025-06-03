// src/hooks/logAnalysis/useJournalTableManager.ts (MODIFIED)
import { useJournalDataTransform } from './useJournalDataTransform';
import { useJournalTableSortingAndFiltering } from './useJournalTableSortingAndFiltering';
import { useJournalTableRowSelection } from './useJournalTableRowSelection';
import { useJournalTableActions } from './useJournalTableActions';
import { useJournalRowExpansion } from './useJournalRowExpansion';
export * from './journalTableManagerTypes';
import { UseJournalTableManagerProps } from './journalTableManagerTypes';

export const useJournalTableManager = ({
  logAnalysisResult
}: UseJournalTableManagerProps) => {
  const resetDependencies = [logAnalysisResult];

  const { journalDataArray } = useJournalDataTransform({ logAnalysisResult });

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

  const {
    selectedRows, // <<< Ensure this is returned from useJournalTableRowSelection
    selectedRowIds,
    handleRowSelectToggle,
    handleSelectAll,
    handleDeselectAll,
    handleSelectNoError,
    handleSelectError,
    handleSelectBioxbioSuccess,
    selectedRowsCount,
    // anyRowsSelected, // You might want to return this too
  } = useJournalTableRowSelection({ data: sortedData, resetDependencies });

  const {
    mainSaveStatus,
    rowSaveStatus,
    rowSaveErrors,
    isSaveEnabled,
    handleBulkSave,
    isReCrawlModalOpen,
    setIsReCrawlModalOpen,
    handleReCrawlSelectedClick,
    handleConfirmReCrawl,
    itemsToReCrawl,
  } = useJournalTableActions({
    selectedRowIds, // useJournalTableActions uses the array of IDs
    allJournalData: journalDataArray,
    resetDependencies
  });

  const { expandedRow, toggleExpand } = useJournalRowExpansion({ resetDependencies });

  const handleBulkSaveAndDeselect = async () => {
    await handleBulkSave(handleDeselectAll);
  };

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
    selectedRows, // <<< Now returning the object map
    selectedRowIds,
    handleRowSelectToggle,
    handleSelectAll,
    handleDeselectAll,
    handleSelectNoError,
    handleSelectError,
    handleSelectBioxbioSuccess,
    selectedRowsCount,
    // anyRowsSelected,

    // Expansion
    expandedRow,
    toggleExpand,

    // Actions
    mainSaveStatus,
    rowSaveStatus,
    rowSaveErrors,
    isSaveEnabled,
    handleBulkSave: handleBulkSaveAndDeselect,
    isReCrawlModalOpen,
    setIsReCrawlModalOpen,
    handleReCrawlSelectedClick,
    handleConfirmReCrawl,
    itemsToReCrawl,
  };
};