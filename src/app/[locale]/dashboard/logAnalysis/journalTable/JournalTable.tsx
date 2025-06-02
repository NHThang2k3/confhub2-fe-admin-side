// src/app/[locale]/dashboard/logAnalysis/journalTable/JournalTable.tsx (File mới)
import React from 'react';
import {
  JournalTableData,
  JournalSortableColumn,
  SortDirection,
  JournalColumnFiltersState
} from '@/src/hooks/crawl/journal/useJournalTableManager'; // Import types từ hook journal
import { JournalTableHeader } from './JournalTableHeader'; // Component mới
import { JournalTableRow } from './JournalTableRow';     // Component mới
import { useTranslations } from 'next-intl';

interface JournalTableProps {
  data: JournalTableData[];
  selectedRows: Record<string, boolean>;
  expandedRowUniqueId: string | null;
  sortColumn: JournalSortableColumn | null;
  sortDirection: SortDirection;
  onSort: (column: JournalSortableColumn) => void;
  onToggleExpand: (uniqueRowId: string) => void;
  onSelectToggle: (uniqueRowId: string) => void;
  columnFilters: JournalColumnFiltersState;
  onColumnFilterChange: (column: keyof JournalColumnFiltersState, value: string) => void;
  totalRowsCount: number;
  selectedRowsCount: number;
  onSelectAll: () => void;
  // Thêm các props tiện ích nếu cần, ví dụ:
  formatDateTime: (isoString: string | null | undefined) => string;
  getStatusChipClass: (status: string | undefined | null) => string;
}

export const JournalTable: React.FC<JournalTableProps> = ({
  data,
  selectedRows,
  expandedRowUniqueId,
  sortColumn,
  sortDirection,
  onSort,
  onToggleExpand,
  onSelectToggle,
  columnFilters,
  onColumnFilterChange,
  totalRowsCount,
  selectedRowsCount,
  onSelectAll,
  formatDateTime, // Nhận hàm format
  getStatusChipClass, // Nhận hàm get class
}) => {
  const t = useTranslations('JournalTable'); // Namespace mới

  // Xác định số cột dựa trên cấu hình header (sẽ làm ở JournalTableHeader)
  // Tạm thời đặt một giá trị cố định, sau này sẽ lấy từ columnsConfig.length
  const noDataColSpan = 10; // Điều chỉnh cho phù hợp với số cột thực tế

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-x-auto border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <JournalTableHeader
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={onSort}
          columnFilters={columnFilters}
          onColumnFilterChange={onColumnFilterChange}
          totalRowsCount={totalRowsCount}
          selectedRowsCount={selectedRowsCount}
          onSelectAll={onSelectAll}
        />
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((journalData) => {
            const uniqueId = journalData.uniqueRowId;
            return (
              <JournalTableRow
                key={uniqueId}
                journalData={journalData}
                isSelected={!!selectedRows[uniqueId]}
                isExpanded={expandedRowUniqueId === uniqueId}
                onSelectToggle={onSelectToggle}
                onToggleExpand={onToggleExpand}
                formatDateTime={formatDateTime}
                getStatusChipClass={getStatusChipClass}
              />
            );
          })}
          {data.length === 0 && (
            <tr>
              <td colSpan={noDataColSpan} className="px-6 py-12 text-center text-gray-500">
                {t('noDataMessage')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};