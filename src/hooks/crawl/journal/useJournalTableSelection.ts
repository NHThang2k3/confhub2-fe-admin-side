import { useState, useMemo, useCallback, useEffect } from 'react';
import { JournalWithStatus } from '@/src/models/logAnalysis/importJournalCrawl';

interface UseJournalTableSelectionProps {
  data: JournalWithStatus[];
  resetDependencies?: any[];
}

export const useJournalTableSelection = ({
  data,
  resetDependencies = []
}: UseJournalTableSelectionProps) => {
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  // Reset state when dependencies change
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
      newSelection[journal.Issn || `row-${data.indexOf(journal)}`] = true;
    });
    setSelectedRows(newSelection);
  }, [data]);

  const handleDeselectAll = useCallback(() => setSelectedRows({}), []);

  const handleSelectCrawled = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    data.forEach(journal => {
      if (journal.crawled) {
        newSelection[journal.Issn || `row-${data.indexOf(journal)}`] = true;
      }
    });
    setSelectedRows(newSelection);
  }, [data]);

  const handleSelectNotCrawled = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    data.forEach(journal => {
      if (!journal.crawled) {
        newSelection[journal.Issn || `row-${data.indexOf(journal)}`] = true;
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
    handleSelectCrawled,
    handleSelectNotCrawled,
    selectedRowsCount,
    anyRowsSelected,
  };
}; 