// src/app/[locale]/dashboard/logAnalysis/ConferenceTable.tsx
import React from 'react';
import {
    ConferenceTableData,
    SortableColumn,
    SortDirection,
    RowSaveStatus
} from '../../../../../hooks/crawl/useConferenceTableManager'; // Adjust path
import { ConferenceTableHeader } from './ConferenceTableHeader'; // Adjust path
import { ConferenceTableRow } from './ConferenceTableRow'; // Adjust path

interface ConferenceTableProps {
    data: ConferenceTableData[];
    selectedRows: Record<string, boolean>; // Thay đổi từ selectedConferences
    expandedRowUniqueId: string | null;    // Thay đổi từ expandedConference
    sortColumn: SortableColumn | null;
    sortDirection: SortDirection;
    rowSaveStatus: Record<string, RowSaveStatus>;
    rowSaveErrors: Record<string, string>;
    onSort: (column: SortableColumn) => void;
    onToggleExpand: (uniqueRowId: string) => void; // Thay đổi tham số
    onSelectToggle: (uniqueRowId: string) => void; // Thay đổi tham số
    filterRequestId?: string | null; // Nhận prop mới

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
    // Logic mới để xác định có nên hiển thị cột Request ID không
    // Hiển thị nếu có ít nhất một dòng dữ liệu và dòng đầu tiên có requestId khác 'N/A'
    // HOẶC (tùy chọn) nếu có filterRequestId được set
    const shouldShowRequestIdColumn = data.length > 0 && data[0]?.requestId !== 'N/A';

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <ConferenceTableHeader
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                    // Thêm một prop để biết có đang filter theo requestId không, để ẩn/hiện cột requestId
                    // Sử dụng logic mới
                    isFilteredByRequest={shouldShowRequestIdColumn}
                />
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((confData) => {
                        // Sử dụng uniqueRowId làm key và để xác định trạng thái
                        const uniqueId = confData.uniqueRowId;
                        return (
                            <ConferenceTableRow
                                key={uniqueId} // Quan trọng: sử dụng uniqueId làm key
                                confData={confData}
                                isSelected={!!selectedRows[uniqueId]}
                                isExpanded={expandedRowUniqueId === uniqueId}
                                onSelectToggle={onSelectToggle} // Truyền uniqueId
                                onToggleExpand={onToggleExpand} // Truyền uniqueId
                                saveStatus={rowSaveStatus[uniqueId] || 'idle'}
                                saveError={rowSaveErrors[uniqueId]}

                            />
                        );
                    })}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={14} className="px-6 py-12 text-center text-gray-500"> {/* Điều chỉnh colSpan */}
                                No conference data matches the current filters.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};