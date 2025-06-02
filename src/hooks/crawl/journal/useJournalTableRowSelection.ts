// src/hooks/logAnalysis/useJournalTableRowSelection.ts (File mới)

import { useState, useMemo, useCallback, useEffect } from 'react';
import { JournalTableData } from './journalTableManagerTypes'; // Import type từ file mới

interface UseJournalTableRowSelectionProps {
  data: JournalTableData[]; // Dữ liệu đã được lọc và sắp xếp
  resetDependencies?: any[];
}

export const useJournalTableRowSelection = ({
  data,
  resetDependencies = []
}: UseJournalTableRowSelectionProps) => {
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

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
    data.forEach(journal => {
      newSelection[journal.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [data]);

  const handleDeselectAll = useCallback(() => setSelectedRows({}), []);

  // Các hàm select theo điều kiện có thể cần điều chỉnh cho journal
  const handleSelectNoError = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    data.forEach(journal => {
      if (journal.errorCount === 0) newSelection[journal.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [data]);

  const handleSelectError = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    data.forEach(journal => {
      if (journal.errorCount > 0) newSelection[journal.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [data]);

  // Ví dụ: Select các journal đã fetch Bioxbio thành công
  const handleSelectBioxbioSuccess = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    data.forEach(journal => {
      if (journal.bioxbioSuccess === true) newSelection[journal.uniqueRowId] = true;
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
    handleSelectBioxbioSuccess, // Ví dụ hàm select mới
    // Thêm các hàm select khác nếu cần
    selectedRowsCount,
    anyRowsSelected,
  };
};