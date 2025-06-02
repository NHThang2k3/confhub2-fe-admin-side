// src/app/[locale]/dashboard/logAnalysis/ConferenceTable.tsx
import React from 'react';
import {
    ConferenceTableData,
    SortableColumn,
    SortDirection,
    RowSaveStatus,
    ColumnFiltersState
} from '@/src/hooks/crawl/conference/useConferenceTableManager';
import { ConferenceTableHeader } from './ConferenceTableHeader';
import { ConferenceTableRow } from './ConferenceTableRow';
import { useTranslations } from 'next-intl'; // Import useTranslations

interface ConferenceTableProps {
    data: ConferenceTableData[];
    selectedRows: Record<string, boolean>;
    expandedRowUniqueId: string | null;
    sortColumn: SortableColumn | null;
    sortDirection: SortDirection;
    rowSaveStatus: Record<string, RowSaveStatus>;
    rowSaveErrors: Record<string, string>;
    onSort: (column: SortableColumn) => void;
    onToggleExpand: (uniqueRowId: string) => void;
    onSelectToggle: (uniqueRowId: string) => void;
    columnFilters: ColumnFiltersState;
    onColumnFilterChange: (column: keyof ColumnFiltersState, value: string) => void;
    totalRowsCount: number;
    selectedRowsCount: number;
    onSelectAll: () => void;
}

export const ConferenceTable: React.FC<ConferenceTableProps> = ({
    data,
    selectedRows,
    expandedRowUniqueId,
    sortColumn,
    sortDirection,
    rowSaveStatus,
    rowSaveErrors,
    onSort,
    onToggleExpand,
    onSelectToggle,
    columnFilters,
    onColumnFilterChange,
    totalRowsCount,
    selectedRowsCount,
    onSelectAll,
}) => {
    // Khai báo namespace 'ConferenceTable' cho component này
    const t = useTranslations('ConferenceTable');

    const shouldShowRequestIdColumn = data.some(d => d.requestId && d.requestId !== 'N/A');
    const baseColSpan = 14;
    const noDataColSpan = shouldShowRequestIdColumn ? baseColSpan + 1 : baseColSpan;

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <ConferenceTableHeader
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                    isFilteredByRequest={shouldShowRequestIdColumn}
                    columnFilters={columnFilters}
                    onColumnFilterChange={onColumnFilterChange}
                    totalRowsCount={totalRowsCount}
                    selectedRowsCount={selectedRowsCount}
                    onSelectAll={onSelectAll}
                />
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((confData) => {
                        const uniqueId = confData.uniqueRowId;
                        return (
                            <ConferenceTableRow
                                key={uniqueId}
                                confData={confData}
                                isSelected={!!selectedRows[uniqueId]}
                                isExpanded={expandedRowUniqueId === uniqueId}
                                onSelectToggle={onSelectToggle}
                                onToggleExpand={onToggleExpand}
                                saveStatus={rowSaveStatus[uniqueId] || 'idle'}
                                saveError={rowSaveErrors[uniqueId]}
                            />
                        );
                    })}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={noDataColSpan} className="px-6 py-12 text-center text-gray-500">
                                {t('noDataMessage')} {/* Thay thế chuỗi cứng */}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};