import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { JournalWithStatus } from '@/src/hooks/crawl/useJournalCrawl';
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
  Table,
} from '@tanstack/react-table';
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getJournalTableColumns } from './journalTable/journalTable.columns';
import TableFilters from './journalTable/TableFilters';
import TablePagination from './journalTable/TablePagination';

interface JournalSelectionStepProps {
  parsedData: JournalWithStatus[];
  onSelectionChanged: (selectedRows: JournalWithStatus[]) => void;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
}

const getJournalRowId = (originalRow: JournalWithStatus, index: number): string => {
  return originalRow.Issn || `row-${index}`;
};

const JournalSelectionStep: React.FC<JournalSelectionStepProps> = ({
  parsedData,
  onSelectionChanged,
  onNext,
  onPrev,
  canProceed,
}) => {
  const t = useTranslations('JournalSelectionStep');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo(() => getJournalTableColumns(), []);

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
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: getJournalRowId,
  });

  useEffect(() => {
    const currentlySelectedOriginalRows = table.getSelectedRowModel().rows.map(row => row.original);
    onSelectionChanged(currentlySelectedOriginalRows);
  }, [rowSelection, table, onSelectionChanged]);

  const handleSelectAllFilteredRows = useCallback(() => {
    const filteredRowIds = table.getFilteredRowModel().rows.reduce((acc, row) => {
      acc[row.id] = true;
      return acc;
    }, {} as RowSelectionState);
    table.setRowSelection(filteredRowIds);
  }, [table]);

  const handleDeselectAllDataRows = useCallback(() => {
    table.setRowSelection({});
  }, [table]);

  const prevParsedDataRef = useRef<JournalWithStatus[]>();
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
  const filteredRows = table.getFilteredRowModel().rows;
  const filteredRowCount = filteredRows.length;
  const isAllFilteredDataSelected = filteredRowCount > 0 && filteredRows.every(row => row.getIsSelected());

  return (
    <div className="space-y-4 md:space-y-6 rounded-lg border border-gray-200 p-3 md:p-6 bg-white shadow">
      <h3 className="text-base md:text-lg font-medium leading-6 text-gray-900">{t('title')}</h3>
      <p className="text-xs md:text-sm text-gray-600">
        {t('description')}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAllFilteredRows}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Select All
          </button>
          <button
            onClick={handleDeselectAllDataRows}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Deselect All
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {totalSelectedRowCount} of {filteredRowCount} selected
        </div>
      </div>

      <TableFilters table={table} />

      <div className="w-full rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 520px)' }}>
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-blue-50 sticky top-0 z-10">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          className="border-b border-blue-100 px-4 py-3 text-left text-sm font-semibold text-blue-900 whitespace-nowrap"
                          style={{ width: header.getSize() ? `${header.getSize()}px` : 'auto' }}
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
                      <tr key={row.id} className={`hover:bg-gray-5 transition-colors ${row.getIsSelected() ? 'bg-indigo-50' : ''}`}>
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            className="px-4 py-3 text-sm text-gray-900"
                            style={{ width: cell.column.getSize() ? `${cell.column.getSize()}px` : 'auto' }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                        {t('noDataMessage')}
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

      <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="w-full sm:w-auto rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {t('navigation.previousStep')}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed || totalSelectedRowCount === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('navigation.nextStep')}
        </button>
      </div>
    </div>
  );
};

export default JournalSelectionStep; 