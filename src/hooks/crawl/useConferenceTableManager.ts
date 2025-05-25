// src/hooks/crawl/useConferenceTableManager.ts

import { ConferenceAnalysisDetail, LogAnalysisResult, DataQualityInsight } from '@/src/models/logAnalysis';
// Import các sub-hooks mới
import { useConferenceDataTransform } from './useConferenceDataTransform';
import { useTableSortingAndFiltering } from './useTableSortingAndFiltering';
import { useTableRowSelection } from './useTableRowSelection';
import { useTableActions } from './useTableActions';
import { useRowExpansion } from './useRowExpansion';

// Export lại các type cần thiết từ đây để các component vẫn có thể import dễ dàng
export type SortableColumn =
  | 'title'
  | 'acronym'
  | 'status'
  | 'durationSeconds'
  | 'unrecoveredErrorCount'
  | 'dataQualityInsightCount'
  | 'requestId'
  | 'crawlType';
export type SortDirection = 'asc' | 'desc';
export type MainSavingStatus = 'idle' | 'saving' | 'success' | 'error';
export type RowSaveStatus = 'idle' | 'success' | 'error';

export type SeverityFilterLevel = '0' | '1' | '2' | '3+' | 'any' | 'none' | '';

export interface ColumnFiltersState {
  title?: string;
  acronym?: string;
  status?: string;
  requestId?: string;
  crawlType?: string;
  dataQualityInsightCount?: SeverityFilterLevel;
  unrecoveredErrorCount?: SeverityFilterLevel;
}

export interface ConferenceTableData extends Omit<ConferenceAnalysisDetail, 'dataQualityInsights' | 'steps' | 'errors'> {
  crawlType: 'crawl' | 'update';
  steps: ConferenceAnalysisDetail['steps'];
  errors: ConferenceAnalysisDetail['errors'];
  persistedSaveStatus?: 'SAVED_TO_DATABASE' | string;
  persistedSaveTimestamp?: string;
  uniqueRowId: string;
  title: string;
  acronym: string;
  requestId: string;
  unrecoveredErrorCount: number;
  dataQualityInsights?: DataQualityInsight[];
  dataQualityInsightCount: number;
  hasSignificantDataQualityIssues: boolean;
  link?: string;
  cfpLink?: string;
  impLink?: string;
}

export interface UseConferenceTableManagerProps {
  logAnalysisResult: LogAnalysisResult | null | undefined;
}

/**
 * Hook tổng hợp quản lý toàn bộ logic cho bảng Conference Analysis.
 * Phối hợp các sub-hooks chuyên biệt để đạt được sự phân tách trách nhiệm.
 */
export const useConferenceTableManager = ({
  logAnalysisResult
}: UseConferenceTableManagerProps) => {
  // resetDependencies dùng để reset trạng thái của các sub-hooks khi dữ liệu gốc thay đổi
  const resetDependencies = [logAnalysisResult];

  // 1. Chuyển đổi và tính toán dữ liệu
  const { conferenceDataArray } = useConferenceDataTransform({ logAnalysisResult });

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
    totalRowsCount, // Đây là số hàng sau khi lọc và sắp xếp
  } = useTableSortingAndFiltering({ data: conferenceDataArray, resetDependencies });

  // 3. Lựa chọn hàng
  const {
    selectedRows,
    selectedRowIds,
    handleRowSelectToggle,
    handleSelectAll,
    handleDeselectAll,
    handleSelectNoError,
    handleSelectError,
    handleSelectWarning,
    handleSelectWithoutWarningsOrErrors,
    selectedRowsCount, // Đây là số hàng đang được chọn
  } = useTableRowSelection({ data: sortedData, resetDependencies }); // data ở đây là sortedData để các hàm select theo điều kiện hoạt động trên dữ liệu hiển thị

  // 4. Hành động (Save, Process Again)
  const {
    mainSaveStatus,
    isSaveEnabled,
    handleBulkSave,
    rowSaveStatus,
    rowSaveErrors,
    isProcessModalOpen,
    setIsProcessModalOpen,
    handleProcessAgainClick,
    handleConfirmProcessWithActionAndModels,
    itemsToProcessFromTable,
  } = useTableActions({
    selectedRowIds,
    allConferenceData: conferenceDataArray, // allConferenceData là dữ liệu gốc đã được transform
    resetDependencies
  });

  // 5. Mở rộng hàng
  const { expandedRow, toggleExpand } = useRowExpansion({ resetDependencies });

  // Callback để truyền xuống useTableActions, giúp deselect khi lưu thành công
  const handleBulkSaveAndDeselect = async () => {
    await handleBulkSave(handleDeselectAll);
  };


  return {
    sortedData,
    sortColumn,
    sortDirection,
    handleSort,
    selectedRows,
    selectedRowIds,
    handleRowSelectToggle,
    handleSelectAll,
    handleDeselectAll,
    handleSelectNoError,
    handleSelectError,
    handleSelectWarning,
    onSelectWithoutWarningsOrErrors: handleSelectWithoutWarningsOrErrors, // Đổi tên cho nhất quán với tên ban đầu nếu cần
    expandedRow,
    toggleExpand,
    mainSaveStatus,
    isSaveEnabled,
    handleBulkSave: handleBulkSaveAndDeselect, // Sử dụng hàm wrapper để deselect
    rowSaveStatus,
    rowSaveErrors,
    handleProcessAgainClick,
    searchQuery,
    setSearchQuery,
    columnFilters,
    handleColumnFilterChange,
    isProcessModalOpen,
    setIsProcessModalOpen,
    handleConfirmProcessWithActionAndModels,
    itemsToProcessFromTable,
    totalRowsCount,
    selectedRowsCount,
  };
};