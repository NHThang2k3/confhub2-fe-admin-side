// src/app/[locale]/dashboard/logAnalysis/journalTable/JournalTable.tsx (ADJUSTED)
import React from 'react';
import {
  JournalTableData,
  JournalSortableColumn,
  SortDirection,
  JournalColumnFiltersState,
  RowSaveStatus, // Import RowSaveStatus
} from '@/src/hooks/crawl/journal/useJournalTableManager';
import { JournalTableHeader } from './JournalTableHeader';
import { JournalTableRow } from './JournalTableRow';
import { useTranslations } from 'next-intl';

interface JournalTableProps {
  data: JournalTableData[];
  selectedRows: Record<string, boolean>; // Assuming this is a map of uniqueRowId to boolean
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
  formatDateTime: (isoString: string | null | undefined) => string;
  getStatusChipClass: (status: string | undefined | null) => string;

  // Props for save status
  rowSaveStatus: Record<string, RowSaveStatus>;
  rowSaveErrors: Record<string, string>;
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
  formatDateTime,
  getStatusChipClass,
  rowSaveStatus, // Destructure
  rowSaveErrors,  // Destructure
}) => {
  const t = useTranslations('JournalTable');

  // The number of columns defined in JournalTableHeader.tsx is 12
  // (Sel, Title, SourceID, DataSource, Status, Duration, Bioxbio, Scimago, Image, JSONL, Errors, Save)
  const noDataColSpan = 12;
  console.log('JournalTable data:', data);
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
                saveStatus={rowSaveStatus[uniqueId] || 'idle'} // Pass save status for the row
                saveError={rowSaveErrors[uniqueId]}         // Pass save error for the row
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