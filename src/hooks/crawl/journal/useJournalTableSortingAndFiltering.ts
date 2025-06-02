// src/hooks/logAnalysis/useJournalTableSortingAndFiltering.ts (File mới)

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  JournalTableData,
  JournalSortableColumn,
  SortDirection,
  CountFilterLevel,
  JournalColumnFiltersState
} from './journalTableManagerTypes'; // Import types từ file mới

interface UseJournalTableSortingAndFilteringProps {
  data: JournalTableData[];
  resetDependencies?: any[];
}

export const useJournalTableSortingAndFiltering = ({
  data,
  resetDependencies = []
}: UseJournalTableSortingAndFilteringProps) => {
  const [sortColumn, setSortColumn] = useState<JournalSortableColumn | null>('journalTitle');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState<JournalColumnFiltersState>({});

  useEffect(() => {
    setSortColumn('journalTitle');
    setSortDirection('asc');
    setSearchQuery('');
    setColumnFilters({});
  }, resetDependencies);

  const handleColumnFilterChange = useCallback(
    (column: keyof JournalColumnFiltersState, value: string) => {
      setColumnFilters(prev => ({
        ...prev,
        [column]: value, // Type của value sẽ được ép kiểu trong switch-case nếu cần
      }));
    },
    []
  );

  const filteredData = useMemo(() => {
    let dataToFilter = [...data];

    // Global search query
    if (searchQuery.trim()) {
      const lowercasedQuery = searchQuery.toLowerCase();
      dataToFilter = dataToFilter.filter(
        journal =>
          journal.journalTitle.toLowerCase().includes(lowercasedQuery) ||
          (journal.sourceId && journal.sourceId.toLowerCase().includes(lowercasedQuery)) ||
          (journal.status && journal.status.toLowerCase().includes(lowercasedQuery)) ||
          (journal.batchRequestId && journal.batchRequestId.toLowerCase().includes(lowercasedQuery)) ||
          (journal.dataSource && journal.dataSource.toLowerCase().includes(lowercasedQuery))
      );
    }

    // Column-specific filters
    const activeColumnFilters = Object.entries(columnFilters).filter(
      ([, value]) => value !== undefined && value !== ''
    );

    if (activeColumnFilters.length > 0) {
      dataToFilter = dataToFilter.filter(journal => {
        return activeColumnFilters.every(([key, filterValue]) => {
          const filterValStr = String(filterValue).toLowerCase();
          switch (key as keyof JournalColumnFiltersState) {
            case 'journalTitle':
              return journal.journalTitle.toLowerCase().includes(filterValStr);
            case 'sourceId':
              return journal.sourceId ? journal.sourceId.toLowerCase().includes(filterValStr) : false;
            case 'status':
              return journal.status?.toLowerCase().includes(filterValStr);
            case 'batchRequestId':
              return journal.batchRequestId?.toLowerCase().includes(filterValStr);
            case 'dataSource':
              return journal.dataSource?.toLowerCase() === filterValStr;
            case 'errorCount': {
              const count = journal.errorCount;
              switch (filterValue as CountFilterLevel) {
                case '0': return count === 0;
                case '1': return count === 1;
                case '2': return count === 2;
                case '3+': return count >= 3;
                case 'any': return count > 0;
                case 'none': return count === 0; // Giống '0'
                default: return true;
              }
            }
            // Thêm case cho filter theo bước (bioxbioSuccess, etc.) nếu cần
            // case 'bioxbioSuccess':
            //   if (filterValue === 'true') return journal.bioxbioSuccess === true;
            //   if (filterValue === 'false') return journal.bioxbioSuccess === false;
            //   return true; // '' hoặc undefined không filter
            default:
              return true;
          }
        });
      });
    }
    return dataToFilter;
  }, [data, searchQuery, columnFilters]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];
      const handleNull = (val: any) => val === null || val === undefined;

      if (handleNull(aValue) && handleNull(bValue)) return 0;
      if (handleNull(aValue)) return sortDirection === 'asc' ? 1 : -1;
      if (handleNull(bValue)) return sortDirection === 'asc' ? -1 : 1;

      switch (sortColumn) {
        case 'journalTitle':
        case 'sourceId':
        case 'status':
        case 'batchRequestId':
        case 'dataSource':
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        case 'durationSeconds':
        case 'errorCount':
          aValue = Number(aValue);
          bValue = Number(bValue);
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        default:
          return 0;
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  const handleSort = useCallback(
    (column: JournalSortableColumn) => {
      if (sortColumn === column) {
        setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
    },
    [sortColumn]
  );

  return {
    sortedData,
    sortColumn,
    sortDirection,
    handleSort,
    searchQuery,
    setSearchQuery,
    columnFilters,
    handleColumnFilterChange,
    totalRowsCount: sortedData.length,
  };
};