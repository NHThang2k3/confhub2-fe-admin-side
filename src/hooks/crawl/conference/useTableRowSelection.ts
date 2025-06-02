// src/hooks/useTableRowSelection.ts

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ConferenceTableData } from './useConferenceTableManager'; // Import type

interface UseTableRowSelectionProps {
  data: ConferenceTableData[]; // Dữ liệu đã được lọc và sắp xếp
  resetDependencies?: any[]; // Để reset state khi logAnalysisResult thay đổi
}

/**
 * Hook để quản lý trạng thái lựa chọn hàng trong bảng.
 */
export const useTableRowSelection = ({
  data,
  resetDependencies = []
}: UseTableRowSelectionProps) => {
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  // Reset state khi dependencies thay đổi (ví dụ: logAnalysisResult mới)
  useEffect(() => {
    setSelectedRows({});
  }, resetDependencies);

  const selectedRowIds = useMemo(() => {
    return Object.entries(selectedRows)
      .filter(([, isSelected]) => isSelected)
      .map(([uniqueRowId]) => uniqueRowId);
  }, [selectedRows]);

  const handleRowSelectToggle = useCallback((uniqueRowId: string) => {
    setSelectedRows(prev => ({ ...prev, [uniqueRowId]: !prev[uniqueRowId] }));
  }, []);

  const handleSelectAll = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    data.forEach(conf => {
      newSelection[conf.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [data]);

  const handleDeselectAll = useCallback(() => setSelectedRows({}), []);

  const handleSelectNoError = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    data.forEach(conf => {
      if (conf.unrecoveredErrorCount === 0) newSelection[conf.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [data]);

  const handleSelectError = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    data.forEach(conf => {
      if (conf.unrecoveredErrorCount > 0) newSelection[conf.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [data]);

  const handleSelectWarning = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    data.forEach(conf => {
      if (conf.dataQualityInsightCount > 0) {
        newSelection[conf.uniqueRowId] = true;
      }
    });
    setSelectedRows(newSelection);
  }, [data]);

  const handleSelectWithoutWarningsOrErrors = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    data.forEach(conf => {
      if (conf.unrecoveredErrorCount === 0 && conf.dataQualityInsightCount === 0) {
        newSelection[conf.uniqueRowId] = true;
      }
    });
    setSelectedRows(newSelection);
  }, [data]);

  const selectedRowsCount = selectedRowIds.length;
  const anyRowsSelected = selectedRowsCount > 0;

  return {
    selectedRows,
    selectedRowIds,
    handleRowSelectToggle,
    handleSelectAll,
    handleDeselectAll,
    handleSelectNoError,
    handleSelectError,
    handleSelectWarning,
    handleSelectWithoutWarningsOrErrors,
    selectedRowsCount,
    anyRowsSelected,
  };
};