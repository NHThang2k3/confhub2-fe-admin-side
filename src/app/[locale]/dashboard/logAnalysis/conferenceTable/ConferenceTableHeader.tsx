// ConferenceTableHeader.tsx
import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { SortableColumn, SortDirection, ColumnFiltersState } from '@/src/hooks/crawl/useConferenceTableManager'; // Adjust path

interface ConferenceTableHeaderProps {
  sortColumn: SortableColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortableColumn) => void;
  isFilteredByRequest: boolean; // Giữ lại prop này nếu vẫn dùng để quyết định hiển thị cột Request ID
  columnFilters: ColumnFiltersState;
  onColumnFilterChange: (column: keyof ColumnFiltersState, value: string) => void;
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
  type?: 'text' | 'number';
}> = ({ columnKey, value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    className="block w-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md p-1.5 text-xs"
    placeholder={placeholder || `Filter ${columnKey}...`}
    value={value || ''}
    onChange={(e) => onChange(columnKey, e.target.value)}
    onClick={(e) => e.stopPropagation()} // Ngăn sort khi click vào input
  />
);


export const ConferenceTableHeader: React.FC<ConferenceTableHeaderProps> = ({
  sortColumn,
  sortDirection,
  onSort,
  isFilteredByRequest, // Sử dụng prop này để quyết định có hiển thị cột Request ID hay không
  columnFilters,
  onColumnFilterChange
}) => {
  // Cấu hình các cột, bao gồm cả việc có hiển thị cột Request ID hay không
  const columnsConfig = [
    { key: 'sel', title: 'Sel', sortable: false, filterable: false, className: 'w-12' },
    { key: 'title', title: 'Title/Acronym', sortable: true, sortKey: 'title' as SortableColumn, filterable: true, filterKey: 'title' as keyof ColumnFiltersState, className: 'min-w-[250px]' },
    { key: 'crawlType', title: 'Action Type', sortable: true, sortKey: 'crawlType' as SortableColumn, filterable: true, filterKey: 'crawlType' as keyof ColumnFiltersState, className: 'min-w-[120px]' },
    ...(isFilteredByRequest ? [{ key: 'requestId', title: 'Request ID', sortable: true, sortKey: 'requestId' as SortableColumn, filterable: true, filterKey: 'requestId' as keyof ColumnFiltersState, className: 'min-w-[150px]' }] : []),
    { key: 'status', title: 'Status', sortable: true, sortKey: 'status' as SortableColumn, filterable: true, filterKey: 'status' as keyof ColumnFiltersState, className: 'min-w-[100px]' },
    { key: 'durationSeconds', title: 'Duration', sortable: true, sortKey: 'durationSeconds' as SortableColumn, filterable: false, className: 'min-w-[90px] text-center' },
    { key: 'search', title: 'Search', sortable: false, filterable: false, className: 'text-center' },
    { key: 'link', title: 'Link', sortable: false, filterable: false, className: 'text-center' },
    { key: 'html', title: 'Html', sortable: false, filterable: false, className: 'text-center' },
    { key: 'g_det', title: 'Det', sortable: false, filterable: false, className: 'text-center' },
    { key: 'g_cfp', title: 'Cfp', sortable: false, filterable: false, className: 'text-center' },
    { key: 'g_ext', title: 'Ext', sortable: false, filterable: false, className: 'text-center' },
    { key: 'dataQualityInsightCount', title: 'Warns', sortable: true, sortKey: 'dataQualityInsightCount' as SortableColumn, filterable: true, filterKey: 'dataQualityInsightCount' as keyof ColumnFiltersState, inputType: 'number' as 'number', className: 'min-w-[80px] text-center' },
    { key: 'errorCount', title: 'Errors', sortable: true, sortKey: 'errorCount' as SortableColumn, filterable: true, filterKey: 'errorCount' as keyof ColumnFiltersState, inputType: 'number' as 'number', className: 'min-w-[80px] text-center' },
    { key: 'save', title: 'Save', sortable: false, filterable: false, className: 'text-center' },
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
              <FilterInput
                columnKey={col.filterKey}
                value={columnFilters[col.filterKey]}
                onChange={onColumnFilterChange}
                placeholder={`${col.title}...`}
                type={col.inputType || 'text'}
              />
            ) : (
              // Ô trống cho các cột không có filter
              <div className="h-[30px]"></div> // Đảm bảo chiều cao bằng với input
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
};