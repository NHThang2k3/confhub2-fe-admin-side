// import { useState, useCallback, useMemo } from 'react';
// import { JournalWithStatus } from './useJournalCrawl';

// export type SortDirection = 'asc' | 'desc';
// export type SortableColumn = keyof JournalWithStatus;

// export interface JournalTableData extends JournalWithStatus {
//     uniqueRowId: string;
// }

// export interface ColumnFiltersState {
//     Title: string;
//     Issn: string;
//     Publisher: string;
//     Type: string;
//     lastUpdated: string;
//     message: string;
// }

// export const useJournalTableManager = (initialData: JournalWithStatus[]) => {
//     const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
//     const [expandedRowUniqueId, setExpandedRowUniqueId] = useState<string | null>(null);
//     const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null);
//     const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
//     const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>({
//         Title: '',
//         Issn: '',
//         Publisher: '',
//         Type: '',
//         lastUpdated: '',
//         message: '',
//     });

//     const handleSort = useCallback((column: SortableColumn) => {
//         setSortColumn((prevColumn) => {
//             if (prevColumn === column) {
//                 setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
//                 return column;
//             }
//             setSortDirection('asc');
//             return column;
//         });
//     }, []);

//     const handleToggleExpand = useCallback((uniqueRowId: string) => {
//         setExpandedRowUniqueId((prev) => (prev === uniqueRowId ? null : uniqueRowId));
//     }, []);

//     const handleSelectToggle = useCallback((uniqueRowId: string) => {
//         setSelectedRows((prev) => ({
//             ...prev,
//             [uniqueRowId]: !prev[uniqueRowId],
//         }));
//     }, []);

//     const handleColumnFilterChange = useCallback((column: keyof ColumnFiltersState, value: string) => {
//         setColumnFilters((prev) => ({
//             ...prev,
//             [column]: value,
//         }));
//     }, []);

//     const processedData = useMemo(() => {
//         return initialData.map((journal) => ({
//             ...journal,
//             uniqueRowId: journal.Issn,
//         }));
//     }, [initialData]);

//     const filteredData = useMemo(() => {
//         return processedData.filter((row) => {
//             return (
//                 row.Title.toLowerCase().includes(columnFilters.Title.toLowerCase()) &&
//                 row.Issn.toLowerCase().includes(columnFilters.Issn.toLowerCase()) &&
//                 row.Publisher.toLowerCase().includes(columnFilters.Publisher.toLowerCase()) &&
//                 row.Type.toLowerCase().includes(columnFilters.Type.toLowerCase())
//             );
//         });
//     }, [processedData, columnFilters]);

//     const handleSelectAll = useCallback(() => {
//         const allSelected = Object.values(selectedRows).every(Boolean);
//         const newSelectedRows: Record<string, boolean> = {};
        
//         filteredData.forEach((row) => {
//             newSelectedRows[row.uniqueRowId] = !allSelected;
//         });
        
//         setSelectedRows(newSelectedRows);
//     }, [selectedRows, filteredData]);

//     const sortedData = useMemo(() => {
//         if (!sortColumn) return filteredData;

//         return [...filteredData].sort((a, b) => {
//             const aValue = a[sortColumn];
//             const bValue = b[sortColumn];

//             if (aValue === bValue) return 0;
//             if (aValue === null || aValue === undefined) return 1;
//             if (bValue === null || bValue === undefined) return -1;

//             const comparison = String(aValue).localeCompare(String(bValue));
//             return sortDirection === 'asc' ? comparison : -comparison;
//         });
//     }, [filteredData, sortColumn, sortDirection]);

//     const selectedRowsCount = useMemo(() => {
//         return Object.values(selectedRows).filter(Boolean).length;
//     }, [selectedRows]);

//     return {
//         data: sortedData,
//         selectedRows,
//         expandedRowUniqueId,
//         sortColumn,
//         sortDirection,
//         columnFilters,
//         onSort: handleSort,
//         onToggleExpand: handleToggleExpand,
//         onSelectToggle: handleSelectToggle,
//         onColumnFilterChange: handleColumnFilterChange,
//         onSelectAll: handleSelectAll,
//         totalRowsCount: sortedData.length,
//         selectedRowsCount,
//     };
// }; 