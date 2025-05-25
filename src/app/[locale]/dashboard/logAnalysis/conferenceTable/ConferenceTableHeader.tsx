

// src/app/[locale]/dashboard/logAnalysis/ConferenceTableHeader.tsx
import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { SortableColumn, SortDirection, ColumnFiltersState } from '@/src/hooks/crawl/useConferenceTableManager';
import { SeverityFilterLevel } from '@/src/hooks/crawl/useConferenceTableManager';


interface ConferenceTableHeaderProps {
  sortColumn: SortableColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortableColumn) => void;
  isFilteredByRequest: boolean;
  columnFilters: ColumnFiltersState;
  onColumnFilterChange: (column: keyof ColumnFiltersState, value: string) => void;
  // Thêm props cho checkbox "Select All"
  totalRowsCount: number;
  selectedRowsCount: number;
  onSelectAll: () => void;
}

const ThWithSort: React.FC<{
  column: SortableColumn;
  title: string;
  currentSortColumn: SortableColumn | null;
  currentSortDirection: SortDirection;
  onSort: (column: SortableColumn) => void;
  className?: string;
}> = ({ column, title, currentSortColumn, currentSortDirection, onSort, className }) => (
  <th
    scope="col"
    className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className || ''}`}
    onClick={() => onSort(column)}
  >
    <div className="flex items-center">
      {title}
      {currentSortColumn === column && (
        currentSortDirection === 'asc' ? <FaArrowUp className="ml-1.5 h-3 w-3" /> : <FaArrowDown className="ml-1.5 h-3 w-3" />
      )}
    </div>
  </th>
);

const FilterInput: React.FC<{
  columnKey: keyof ColumnFiltersState;
  value: string | undefined;
  onChange: (column: keyof ColumnFiltersState, value: string) => void;
  placeholder?: string;
}> = ({ columnKey, value, onChange, placeholder }) => (
  <input
    type="text"
    className="block w-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md p-1.5 text-xs"
    placeholder={placeholder || `Filter ${columnKey}...`}
    value={value || ''}
    onChange={(e) => onChange(columnKey, e.target.value)}
    onClick={(e) => e.stopPropagation()}
  />
);

const SeverityFilterSelect: React.FC<{
  columnKey: 'unrecoveredErrorCount' | 'dataQualityInsightCount';
  value: SeverityFilterLevel | undefined;
  onChange: (column: keyof ColumnFiltersState, value: string) => void;
}> = ({ columnKey, value, onChange }) => (
  <select
    className="block w-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md p-1.5 text-xs"
    value={value || ''}
    onChange={(e) => onChange(columnKey, e.target.value)}
    onClick={(e) => e.stopPropagation()}
    title={`Filter by ${columnKey === 'unrecoveredErrorCount' ? 'Unrecovered Errors' : 'Warnings'} Level`}
  >
    <option value="">All</option>
    <option value="0">0</option>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3+">3+</option>
    <option value="any">Any (1+)</option>
    <option value="none">None (0)</option>
  </select>
);


export const ConferenceTableHeader: React.FC<ConferenceTableHeaderProps> = ({
  sortColumn,
  sortDirection,
  onSort,
  isFilteredByRequest,
  columnFilters,
  onColumnFilterChange,
  totalRowsCount, // Nhận prop
  selectedRowsCount, // Nhận prop
  onSelectAll, // Nhận prop
}) => {
  const columnsConfig = [
    { key: 'sel', title: 'Sel', sortable: false, filterable: false, className: 'w-12 text-center' },
    { key: 'title', title: 'Title/Acronym', sortable: true, sortKey: 'title' as SortableColumn, filterable: true, filterKey: 'title' as keyof ColumnFiltersState, className: 'min-w-[200px]' },
    { key: 'crawlType', title: 'Action', sortable: true, sortKey: 'crawlType' as SortableColumn, filterable: true, filterKey: 'crawlType' as keyof ColumnFiltersState, className: 'min-w-[20px] max-w-[60px]' },
    { key: 'status', title: 'Status', sortable: true, sortKey: 'status' as SortableColumn, filterable: true, filterKey: 'status' as keyof ColumnFiltersState, className: 'min-w-[80px]' },
    { key: 'durationSeconds', title: 'Duration', sortable: true, sortKey: 'durationSeconds' as SortableColumn, filterable: false, className: 'min-w-[90px] text-center' },
    { key: 'search', title: 'Search', sortable: false, filterable: false, className: 'min-w-[90px] text-left' },
    { key: 'html', title: 'Html', sortable: false, filterable: false, className: 'min-w-[90px] text-left' },
    { key: 'link', title: 'Link', sortable: false, filterable: false, className: 'min-w-[90px] text-left' },
    { key: 'g_det', title: 'Det', sortable: false, filterable: false, className: 'min-w-[90px] text-left' },
    { key: 'g_cfp', title: 'Cfp', sortable: false, filterable: false, className: 'min-w-[90px] text-left' },
    { key: 'g_ext', title: 'Ext', sortable: false, filterable: false, className: 'min-w-[90px] text-left' },
    { key: 'dataQualityInsightCount', title: 'Warns', sortable: true, sortKey: 'dataQualityInsightCount' as SortableColumn, filterable: true, filterKey: 'dataQualityInsightCount' as keyof ColumnFiltersState, filterType: 'level', className: 'min-w-[60px] text-center' },
    { key: 'unrecoveredErrorCount', title: 'Unrecovered Errors', sortable: true, sortKey: 'unrecoveredErrorCount' as SortableColumn, filterable: true, filterKey: 'unrecoveredErrorCount' as keyof ColumnFiltersState, filterType: 'level', className: 'min-w-[60px] text-center' }, // Cập nhật sortKey và filterKey
    { key: 'save', title: 'Save', sortable: false, filterable: false, className: 'min-w-[60px] text-center' },
  ];


  return (
    <thead className="bg-gray-5 text-gray-500">
      <tr>
        {columnsConfig.map(col => {
          if (col.sortable) {
            return (
              <ThWithSort
                key={col.key}
                column={col.sortKey!}
                title={col.title}
                currentSortColumn={sortColumn}
                currentSortDirection={sortDirection}
                onSort={onSort}
                className={col.className}
              />
            );
          }
          return (
            <th key={col.key} scope="col" className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider ${col.className || ''}`}>
              {col.title}
            </th>
          );
        })}
      </tr>
      {/* Hàng cho Filter Inputs */}
      <tr className="bg-gray-5">
        {columnsConfig.map(col => (
          <th key={`${col.key}-filter`} className="px-1 py-1 align-top">
            {col.filterable && col.filterKey ? (
              col.filterType === 'level' ? (
                <SeverityFilterSelect
                  columnKey={col.filterKey as 'unrecoveredErrorCount' | 'dataQualityInsightCount'}
                  value={columnFilters[col.filterKey] as SeverityFilterLevel}
                  onChange={onColumnFilterChange}
                />
              ) : (
                <FilterInput
                  columnKey={col.filterKey}
                  value={columnFilters[col.filterKey]}
                  onChange={onColumnFilterChange}
                  placeholder={`${col.title}...`}
                />
              )
            ) : (
              // Ô trống cho các cột không có filter hoặc cột "Sel"
              <div className="h-[30px] flex items-center justify-center">
                {col.key === 'sel' && (
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={selectedRowsCount === totalRowsCount && totalRowsCount > 0} // Logic "Select All"
                    onChange={onSelectAll} // Gọi hàm onSelectAll
                    title="Select All / Deselect All"
                  />
                )}
              </div>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
};