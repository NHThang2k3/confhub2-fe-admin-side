// src/app/[locale]/dashboard/logAnalysis/journalTable/JournalTableHeader.tsx (File mới)
import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import {
  JournalSortableColumn,
  SortDirection,
  JournalColumnFiltersState,
  CountFilterLevel
} from '@/src/hooks/crawl/journal/useJournalTableManager'; // Import types từ hook journal
import { useTranslations } from 'next-intl';

// Các component ThWithSort, FilterInput, CountFilterSelect có thể tái sử dụng từ conference
// hoặc tạo bản sao và đổi tên nếu cần tùy chỉnh nhiều.
// Giả sử tái sử dụng cấu trúc tương tự.

interface ThWithSortProps {
  column: JournalSortableColumn;
  title: string;
  currentSortColumn: JournalSortableColumn | null;
  currentSortDirection: SortDirection;
  onSort: (column: JournalSortableColumn) => void;
  className?: string;
  t: (key: string, values?: Record<string, any>) => string; // Cho phép đối số thứ hai là optional object
}

const ThWithSort: React.FC<ThWithSortProps> = ({ column, title, currentSortColumn, currentSortDirection, onSort, className, t }) => (
  <th
    scope="col"
    className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className || ''}`}
    onClick={() => onSort(column)}
    title={t('sortTooltip', { column: title })}
  >
    <div className="flex items-center">
      {title}
      {currentSortColumn === column && (
        currentSortDirection === 'asc' ? <FaArrowUp className="ml-1.5 h-3 w-3" /> : <FaArrowDown className="ml-1.5 h-3 w-3" />
      )}
    </div>
  </th>
);

interface FilterInputProps {
  columnKey: keyof JournalColumnFiltersState;
  value: string | undefined;
  onChange: (column: keyof JournalColumnFiltersState, value: string) => void;
  placeholder?: string;
}
const FilterInput: React.FC<FilterInputProps> = ({ columnKey, value, onChange, placeholder }) => (
  <input
    type="text"
    className="block w-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md p-1.5 text-xs"
    placeholder={placeholder}
    value={value || ''}
    onChange={(e) => onChange(columnKey, e.target.value)}
    onClick={(e) => e.stopPropagation()} // Ngăn sort khi click vào input filter
  />
);

interface CountFilterSelectProps {
  columnKey: 'errorCount'; // Chỉ có errorCount cho journal ban đầu
  value: CountFilterLevel | undefined;
  onChange: (column: keyof JournalColumnFiltersState, value: string) => void;
  t: (key: string, values?: Record<string, any>) => string;
}
const CountFilterSelect: React.FC<CountFilterSelectProps> = ({ columnKey, value, onChange, t }) => (
  <select
    className="block w-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md p-1.5 text-xs"
    value={value || ''}
    onChange={(e) => onChange(columnKey, e.target.value)}
    onClick={(e) => e.stopPropagation()}
    title={t('filterByCountLevelTitle', { field: t(`columnTitles.${columnKey}`) })}
  >
    <option value="">{t('filterOptions.all')}</option>
    <option value="0">0</option>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3+">3+</option>
    <option value="any">{t('filterOptions.any')}</option>
    <option value="none">{t('filterOptions.none')}</option>
  </select>
);

interface DataSourceFilterSelectProps {
  columnKey: 'dataSource';
  value: 'scimago' | 'client' | '' | undefined;
  onChange: (column: keyof JournalColumnFiltersState, value: string) => void;
  t: (key: string) => string;
}
const DataSourceFilterSelect: React.FC<DataSourceFilterSelectProps> = ({ columnKey, value, onChange, t }) => (
  <select
    className="block w-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md p-1.5 text-xs"
    value={value || ''}
    onChange={(e) => onChange(columnKey, e.target.value)}
    onClick={(e) => e.stopPropagation()}
    title={t('filterByDataSourceTitle')}
  >
    <option value="">{t('filterOptions.all')}</option>
    <option value="scimago">{t('dataSourceOptions.scimago')}</option>
    <option value="client">{t('dataSourceOptions.client')}</option>
  </select>
);


interface JournalTableHeaderProps {
  sortColumn: JournalSortableColumn | null;
  sortDirection: SortDirection;
  onSort: (column: JournalSortableColumn) => void;
  columnFilters: JournalColumnFiltersState;
  onColumnFilterChange: (column: keyof JournalColumnFiltersState, value: string) => void;
  totalRowsCount: number;
  selectedRowsCount: number;
  onSelectAll: () => void;
}

export const JournalTableHeader: React.FC<JournalTableHeaderProps> = ({
  sortColumn,
  sortDirection,
  onSort,
  columnFilters,
  onColumnFilterChange,
  totalRowsCount,
  selectedRowsCount,
  onSelectAll,
}) => {
  const t = useTranslations('JournalTableHeader'); // Namespace mới

  // Cấu hình các cột cho bảng Journal
  const columnsConfig = [
    { key: 'sel', title: t('columnTitles.select'), sortable: false, filterable: false, className: 'w-12 text-center' },
    { key: 'journalTitle', title: t('columnTitles.journalTitle'), sortable: true, sortKey: 'journalTitle' as JournalSortableColumn, filterable: true, filterKey: 'journalTitle' as keyof JournalColumnFiltersState, className: 'min-w-[250px]' },
    // { key: 'sourceId', title: t('columnTitles.sourceId'), sortable: true, sortKey: 'sourceId' as JournalSortableColumn, filterable: true, filterKey: 'sourceId' as keyof JournalColumnFiltersState, className: 'min-w-[100px] max-w-[150px]' },
    // { key: 'batchRequestId', title: t('columnTitles.batchRequestId'), sortable: true, sortKey: 'batchRequestId' as JournalSortableColumn, filterable: true, filterKey: 'batchRequestId' as keyof JournalColumnFiltersState, className: 'min-w-[180px]' },
    { key: 'dataSource', title: t('columnTitles.dataSource'), sortable: true, sortKey: 'dataSource' as JournalSortableColumn, filterable: true, filterKey: 'dataSource' as keyof JournalColumnFiltersState, filterType: 'dataSource', className: 'min-w-[120px]' },
    { key: 'status', title: t('columnTitles.status'), sortable: true, sortKey: 'status' as JournalSortableColumn, filterable: true, filterKey: 'status' as keyof JournalColumnFiltersState, className: 'min-w-[60px] max-w-[80px]' },
    // { key: 'durationSeconds', title: t('columnTitles.duration'), sortable: true, sortKey: 'durationSeconds' as JournalSortableColumn, filterable: false, className: 'min-w-[80px] text-center' },
    { key: 'bioxbio', title: t('columnTitles.bioxbio'), sortable: false, filterable: false, className: 'min-w-[100px] text-left' }, // Filter theo boolean có thể thêm sau
    { key: 'scimago', title: t('columnTitles.scimagoDetails'), sortable: false, filterable: false, className: 'min-w-[120px] text-left' },
    { key: 'image', title: t('columnTitles.imageSearch'), sortable: false, filterable: false, className: 'min-w-[100px] text-left' },
    { key: 'jsonl', title: t('columnTitles.jsonlWrite'), sortable: false, filterable: false, className: 'min-w-[100px] text-left' },
    { key: 'errorCount', title: t('columnTitles.errors'), sortable: true, sortKey: 'errorCount' as JournalSortableColumn, filterable: true, filterKey: 'errorCount' as keyof JournalColumnFiltersState, filterType: 'count', className: 'min-w-[80px] text-center' },
    { key: 'save', title: t('columnTitles.save'), sortable: false, filterable: false, className: 'min-w-[80px] text-center' },

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
                t={t} // Pass translation
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
              col.filterType === 'count' ? (
                <CountFilterSelect
                  columnKey={col.filterKey as 'errorCount'}
                  value={columnFilters[col.filterKey] as CountFilterLevel}
                  onChange={onColumnFilterChange}
                  t={t}
                />
              ) : col.filterType === 'dataSource' ? (
                <DataSourceFilterSelect
                  columnKey={col.filterKey as 'dataSource'}
                  value={columnFilters[col.filterKey] as 'scimago' | 'client' | ''}
                  onChange={onColumnFilterChange}
                  t={t}
                />
              ) : (
                <FilterInput
                  columnKey={col.filterKey}
                  value={columnFilters[col.filterKey]}
                  onChange={onColumnFilterChange}
                  placeholder={t('filterPlaceholder', { column: col.title })}
                />
              )
            ) : (
              <div className="h-[30px] flex items-center justify-center">
                {col.key === 'sel' && (
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={selectedRowsCount === totalRowsCount && totalRowsCount > 0}
                    onChange={onSelectAll}
                    disabled={totalRowsCount === 0}
                    title={t('selectAllTooltip')}
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