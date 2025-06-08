import React from 'react';
import { JournalTableHeader } from './JournalTableHeader';
import { JournalTableRow } from './JournalTableRow';
import { useTranslations } from 'next-intl';
import { JournalWithStatus } from '@/src/models/logAnalysis/importJournalCrawl';

type SortableColumn = keyof JournalWithStatus;

interface JournalTableProps {
    data: JournalWithStatus[];
    selectedRows: Record<string, boolean>;
    expandedRowUniqueId: string | null;
    sortColumn: SortableColumn | null;
    sortDirection: 'asc' | 'desc';
    onSort: (column: SortableColumn) => void;
    onToggleExpand: (uniqueRowId: string) => void;
    onSelectToggle: (uniqueRowId: string) => void;
    columnFilters: Record<SortableColumn, string>;
    onColumnFilterChange: (column: SortableColumn, value: string) => void;
    totalRowsCount: number;
    selectedRowsCount: number;
    onSelectAll: () => void;
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
}) => {
    const t = useTranslations('JournalTable');

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
                        const uniqueId = journalData.Issn;
                        return (
                            <JournalTableRow
                                key={uniqueId}
                                journalData={journalData}
                                isSelected={!!selectedRows[uniqueId]}
                                isExpanded={expandedRowUniqueId === uniqueId}
                                onSelectToggle={onSelectToggle}
                                onToggleExpand={onToggleExpand}
                            />
                        );
                    })}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                {t('noDataMessage')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}; 