// src/hooks/useTableSortingAndFiltering.ts

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ConferenceTableData,
  SortableColumn,
  SortDirection,
  SeverityFilterLevel,
  ColumnFiltersState
} from '../crawl/useConferenceTableManager'; // Import types

interface UseTableSortingAndFilteringProps {
  data: ConferenceTableData[];
  resetDependencies?: any[]; // Để reset state khi logAnalysisResult thay đổi
}

/**
 * Hook để quản lý logic sắp xếp và lọc dữ liệu bảng.
 */
export const useTableSortingAndFiltering = ({
  data,
  resetDependencies = []
}: UseTableSortingAndFilteringProps) => {
  const [sortColumn, setSortColumn] = useState<SortableColumn | null>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>({});

  // Reset state khi dependencies thay đổi (ví dụ: logAnalysisResult mới)
  useEffect(() => {
    setSortColumn('title');
    setSortDirection('asc');
    setSearchQuery('');
    setColumnFilters({});
  }, resetDependencies);

  const handleColumnFilterChange = useCallback(
    (column: keyof ColumnFiltersState, value: string) => {
      setColumnFilters(prev => ({
        ...prev,
        [column]: value as SeverityFilterLevel,
      }));
    },
    []
  );

  const filteredData = useMemo(() => {
    let dataToFilter = [...data];

    if (searchQuery.trim()) {
      const lowercasedQuery = searchQuery.toLowerCase();
      dataToFilter = dataToFilter.filter(
        conf =>
          conf.title.toLowerCase().includes(lowercasedQuery) ||
          conf.acronym.toLowerCase().includes(lowercasedQuery) ||
          (conf.status && conf.status.toLowerCase().includes(lowercasedQuery)) ||
          (conf.requestId && conf.requestId.toLowerCase().includes(lowercasedQuery)) ||
          (conf.crawlType && conf.crawlType.toLowerCase().includes(lowercasedQuery))
      );
    }

    const activeColumnFilters = Object.entries(columnFilters).filter(
      ([, value]) => value !== undefined && value !== ''
    );

    if (activeColumnFilters.length > 0) {
      dataToFilter = dataToFilter.filter(conf => {
        return activeColumnFilters.every(([key, filterValue]) => {
          const filterValLower = (filterValue as string).toLowerCase();
          switch (key as keyof ColumnFiltersState) {
            case 'title':
              return conf.title.toLowerCase().includes(filterValLower);
            case 'acronym':
              return conf.acronym.toLowerCase().includes(filterValLower);
            case 'status':
              return conf.status?.toLowerCase().includes(filterValLower);
            case 'requestId':
              return conf.requestId && conf.requestId !== 'N/A' && conf.requestId.toLowerCase().includes(filterValLower);
            case 'crawlType':
              return conf.crawlType?.toLowerCase().includes(filterValLower);
            case 'dataQualityInsightCount': {
              const count = conf.dataQualityInsightCount;
              switch (filterValue as SeverityFilterLevel) {
                case '0': return count === 0;
                case '1': return count === 1;
                case '2': return count === 2;
                case '3+': return count >= 3;
                case 'any': return count > 0;
                case 'none': return count === 0;
                default: return true;
              }
            }
            case 'unrecoveredErrorCount': {
              const count = conf.unrecoveredErrorCount;
              switch (filterValue as SeverityFilterLevel) {
                case '0': return count === 0;
                case '1': return count === 1;
                case '2': return count === 2;
                case '3+': return count >= 3;
                case 'any': return count > 0;
                case 'none': return count === 0;
                default: return true;
              }
            }
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
        case 'acronym':
        case 'title':
        case 'status':
        case 'requestId':
        case 'crawlType':
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        case 'durationSeconds':
        case 'dataQualityInsightCount':
          aValue = Number(aValue);
          bValue = Number(bValue);
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        case 'unrecoveredErrorCount':
          aValue = Number(a.unrecoveredErrorCount);
          bValue = Number(b.unrecoveredErrorCount);
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        default:
          return 0;
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  const handleSort = useCallback(
    (column: SortableColumn) => {
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