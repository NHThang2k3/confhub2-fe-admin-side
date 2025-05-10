// src/app/[locale]/dashboard/logAnalysis/ConferenceTable.tsx
import React from 'react';
// --- IMPORT TYPES TỪ HOOK ---
import {
    ConferenceTableData,
    SortableColumn, // <-- Import từ hook
    SortDirection,  // <-- Import từ hook (nếu đã export)
    RowSaveStatus   // <-- Import từ hook (nếu đã export)
} from '../../../../../hooks/crawl/useConferenceTableManager'; // Điều chỉnh đường dẫn nếu cần
import { ConferenceTableHeader } from './ConferenceTableHeader';
import { ConferenceTableRow } from './ConferenceTableRow';

interface ConferenceTableProps {
    data: ConferenceTableData[];
    selectedConferences: Record<string, boolean>;
    expandedConference: string | null;
    sortColumn: SortableColumn | null; // <-- Giờ sử dụng kiểu đã import
    sortDirection: SortDirection;      // <-- Giờ sử dụng kiểu đã import/định nghĩa
    rowSaveStatus: Record<string, RowSaveStatus>; // <-- Giờ sử dụng kiểu đã import/định nghĩa
    rowSaveErrors: Record<string, string>;
    // Callback giờ sẽ tương thích vì dùng cùng type SortableColumn
    onSort: (column: SortableColumn) => void;
    onToggleExpand: (title: string) => void;
    onSelectToggle: (title: string) => void;
}

export const ConferenceTable: React.FC<ConferenceTableProps> = ({
    data,
    selectedConferences,
    expandedConference,
    sortColumn,
    sortDirection,
    rowSaveStatus,
    rowSaveErrors,
    onSort, // Hàm onSort này giờ có kiểu đúng
    onToggleExpand,
    onSelectToggle,
}) => {
    return (
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <ConferenceTableHeader
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                />
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((confData) => {
                        const title = confData.title;
                        return (
                            <ConferenceTableRow
                                key={title}
                                confData={confData}
                                isSelected={!!selectedConferences[title]}
                                isExpanded={expandedConference === title}
                                onSelectToggle={onSelectToggle}
                                onToggleExpand={onToggleExpand}
                                // Pass the specific status and error for this row
                                saveStatus={rowSaveStatus[title] || 'idle'} // Default to 'idle' if not found
                                saveError={rowSaveErrors[title]}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};