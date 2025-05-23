import React from 'react';
import {
    ConferenceTableData,
    SortableColumn,
    SortDirection,
    RowSaveStatus
} from '@/src/hooks/crawl/useConferenceTableManager'; // Adjust path
import { ConferenceTableHeader } from './ConferenceTableHeader';
import { ConferenceTableRow } from './ConferenceTableRow';

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
    // filterRequestId?: string | null; // Prop này không còn dùng trực tiếp ở đây
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
}) => {
    // Hiển thị cột Request ID nếu có ít nhất một dòng có requestId khác 'N/A'
    const shouldShowRequestIdColumn = data.some(d => d.requestId && d.requestId !== 'N/A');

    // Tính colSpan cho hàng "No data"
    // Sel (1) + Title (1) + ActionType (1) + RequestID (0 or 1) + Status (1) + Duration (1) + 6 step icons (6) + Warns (1) + Errors (1) + Save (1) = 14 or 15
    const baseColSpan = 14;
    const noDataColSpan = shouldShowRequestIdColumn ? baseColSpan + 1 : baseColSpan;


    return (
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <ConferenceTableHeader
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                    isFilteredByRequest={shouldShowRequestIdColumn} // Truyền trạng thái hiển thị cột Request ID
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
                                No conference data matches the current filters.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};