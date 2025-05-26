// src/app/[locale]/dashboard/logAnalysis/steps/ConferenceSelectionStep.tsx
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
  PaginationState,
} from '@tanstack/react-table';
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getConferenceTableColumns } from './conferenceTable/conferenceTable.columns';
import GlobalActionControls from './conferenceTable/GlobalActionControls';
import TableFilters from './conferenceTable/TableFilters';
import TablePagination from './conferenceTable/TablePagination';

interface ConferenceSelectionStepProps {
  parsedData: Conference[];
  onSelectionChanged: (selectedRows: Conference[]) => void;
  // No selectedCsvRowsCount prop needed here
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  onUpdateActionTypeForSelected: (actionType: 'crawl' | 'update', selectedRows: Conference[]) => void;
}

// Ensure this ID is stable and unique for each conference
const getConferenceRowId = (originalRow: Conference, index: number): string => {
  return originalRow.id || originalRow.acronym || `row-${index}`; // Prefer a dedicated 'id' if available
};

const ConferenceSelectionStep: React.FC<ConferenceSelectionStepProps> = ({
  parsedData,
  onSelectionChanged,
  onNext,
  onPrev,
  canProceed,
  onUpdateActionTypeForSelected,
}) => {
  // Khởi tạo t với namespace 'ConferenceSelectionStep'
  const t = useTranslations('ConferenceSelectionStep');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalActionType, setGlobalActionType] = useState<'crawl' | 'update'>('crawl');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleUpdateActionTypeForRow = useCallback((actionType: 'crawl' | 'update', conference: Conference) => {
    onUpdateActionTypeForSelected(actionType, [conference]);
  }, [onUpdateActionTypeForSelected]);

  const columns = useMemo(
    () => getConferenceTableColumns(handleUpdateActionTypeForRow),
    [handleUpdateActionTypeForRow]
  );

  const memoizedData = useMemo(() => parsedData || [], [parsedData]);

  const table = useReactTable({
    data: memoizedData,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting, // Handles sorting state updates
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // Enables client-side sorting
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: getConferenceRowId, // Crucial for stable row identity
    manualPagination: false, // TanStack Table handles pagination
    // No manualSorting: true, default is client-side sorting
  });

  useEffect(() => {
    const currentlySelectedOriginalRows = table.getSelectedRowModel().rows.map(row => row.original);
    onSelectionChanged(currentlySelectedOriginalRows);
  }, [rowSelection, table, onSelectionChanged]);

  const handleApplyGlobalActionToAllSelected = useCallback(() => {
    const selectedRowModels = table.getSelectedRowModel().rows;
    if (selectedRowModels.length > 0) {
      const conferencesToUpdate = selectedRowModels.map(row => row.original);
      onUpdateActionTypeForSelected(globalActionType, conferencesToUpdate);
    } else {
      alert("Please select at least one conference to apply the action type to all.");
    }
  }, [table, globalActionType, onUpdateActionTypeForSelected]);

  const handleApplyGlobalActionToPageSelected = useCallback(() => {
    const pageRows = table.getRowModel().rows;
    const selectedOnPage = pageRows.filter(row => row.getIsSelected()).map(row => row.original);

    if (selectedOnPage.length > 0) {
      onUpdateActionTypeForSelected(globalActionType, selectedOnPage);
    } else {
      alert("Please select at least one conference on the current page to apply the action type.");
    }
  }, [table, globalActionType, onUpdateActionTypeForSelected]);

  const prevParsedDataRef = useRef<Conference[]>();
  useEffect(() => {
    if (prevParsedDataRef.current !== parsedData) {
        if (!parsedData || parsedData.length === 0) {
            setRowSelection({});
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }
    }
    prevParsedDataRef.current = parsedData;
  }, [parsedData]);

  const totalSelectedRowCount = table.getSelectedRowModel().rows.length;
  const pageRows = table.getRowModel().rows;
  const pageSelectedRowCount = pageRows.filter(row => row.getIsSelected()).length;
  const canApplyToPage = pageRows.length > 0;

  return (
    <div className="space-y-4 md:space-y-6 rounded-lg border border-gray-200 p-3 md:p-6 bg-white shadow">
      <h3 className="text-base md:text-lg font-medium leading-6 text-gray-900">{t('title')}</h3> {/* Dùng t() */}
      <p className="text-xs md:text-sm text-gray-600">
        Select conferences from the table below and specify the action type (Crawl or Update).
        Use "Apply to Page" for current page selections or "Apply to All" for all selections across pages.
      </p>

      <GlobalActionControls
        globalActionType={globalActionType}
        onGlobalActionTypeChange={setGlobalActionType}
        onApplyGlobalActionToAllSelected={handleApplyGlobalActionToAllSelected}
        onApplyGlobalActionToPageSelected={handleApplyGlobalActionToPageSelected}
        totalSelectedRowCount={totalSelectedRowCount}
        pageSelectedRowCount={pageSelectedRowCount}
        canApplyToPage={canApplyToPage}
      />

      <TableFilters table={table} />

      <div className="w-full rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 480px)' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50 sticky top-0 z-10">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          className="border-b border-blue-100 px-4 py-3 text-left text-sm font-semibold text-blue-900 whitespace-nowrap"
                          style={{ width: header.column.columnDef.size !== undefined ? header.column.columnDef.size : 'auto' }}
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? 'cursor-pointer select-none flex items-center gap-2 hover:text-blue-700 transition-colors'
                                  : 'flex items-center gap-2',
                                onClick: header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() && (
                                <>
                                  {{
                                    asc: <ChevronUpIcon className="h-4 w-4 text-blue-600" />,
                                    desc: <ChevronDownIcon className="h-4 w-4 text-blue-600" />,
                                  }[header.column.getIsSorted() as string] ?? (
                                    <ChevronsUpDown className="h-4 w-4 text-blue-400 opacity-50" />
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className={`hover:bg-gray-50 transition-colors ${row.getIsSelected() ? 'bg-indigo-50' : ''}`}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap" style={{ width: cell.column.columnDef.size !== undefined ? cell.column.columnDef.size : 'auto' }}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                        <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                            No data available or matches your filters.
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {memoizedData && memoizedData.length > 0 && <TablePagination table={table} />}

      <p className="mt-2 text-xs md:text-sm text-gray-600">
        Total selected: {totalSelectedRowCount} conference(s). On this page: {pageSelectedRowCount} selected.
      </p>

      <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="w-full sm:w-auto rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {t('navigation.previousStep')} {/* Dùng t() */}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed || totalSelectedRowCount === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('navigation.nextStep')} {/* Dùng t() */}
        </button>
      </div>
    </div>
  );
};

export default ConferenceSelectionStep;