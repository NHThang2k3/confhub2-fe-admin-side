// src/appp/[locale]/dashboard/logAnalysis/steps/ConferenceSelectionStep.tsx
import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
  PaginationState,
  TableMeta,
} from '@tanstack/react-table';
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { useTranslations } from 'next-intl'; // Import useTranslations

interface ConferenceSelectionStepProps {
  parsedData: Conference[];
  onSelectionChanged: (selectedRows: Conference[]) => void;
  selectedCsvRowsCount: number;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  onUpdateActionTypeForSelected: (actionType: 'crawl' | 'update', selectedRows: Conference[]) => void;
}

// Add type definition for table meta
type TableMetaType = TableMeta<Conference> & {
  updateData: (rowIndex: number, columnId: string, value: any) => void;
};

const ConferenceSelectionStep: React.FC<ConferenceSelectionStepProps> = ({
  parsedData,
  onSelectionChanged,
  selectedCsvRowsCount,
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

  // Memoize the selection change handler
  const handleRowSelectionChange = useCallback((updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
    setRowSelection(updater);
  }, []);

  // Memoize the columns to prevent unnecessary re-renders
  const columns = useMemo<ColumnDef<Conference>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'acronym',
      header: t('tableHeaders.acronym'), // Dùng t()
      cell: ({ row }) => <div className="font-medium">{row.getValue('acronym')}</div>,
    },
    {
      accessorKey: 'title',
      header: t('tableHeaders.title'), // Dùng t()
      cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
    },
    {
      accessorKey: 'crawlType',
      header: t('tableHeaders.actionType'), // Dùng t()
      cell: ({ row }) => {
        const crawlType = row.getValue('crawlType') as 'crawl' | 'update';
        return (
          <select
            value={crawlType}
            onChange={(e) => {
              const newValue = e.target.value as 'crawl' | 'update';
              if (newValue !== crawlType) {
                onUpdateActionTypeForSelected(newValue, [row.original]);
              }
            }}
            className={`font-semibold ${
              crawlType === 'crawl' ? 'text-blue-700' : 'text-green-700'
            } bg-transparent border-none focus:ring-0`}
          >
            <option value="crawl">{t('actionType.crawl')}</option> {/* Dùng t() */}
            <option value="update">{t('actionType.update')}</option> {/* Dùng t() */}
          </select>
        );
      },
    },
    {
      accessorKey: 'sources',
      header: t('tableHeaders.sources'), // Dùng t()
    },
    {
      accessorKey: 'ranks',
      header: t('tableHeaders.ranks'), // Dùng t()
    },
    {
      accessorKey: 'researchFields',
      header: t('tableHeaders.researchFields'), // Dùng t()
    },
    {
      accessorKey: 'status',
      header: t('tableHeaders.status'), // Dùng t()
    },
    {
      accessorKey: 'updatedAt',
      header: t('tableHeaders.updatedAt'), // Dùng t()
      cell: ({ row }) => {
        const date = row.getValue('updatedAt');
        return date ? new Date(date as string).toLocaleString() : '';
      },
    },
    {
      accessorKey: 'link',
      header: t('tableHeaders.linkForUpdate'), // Dùng t()
      cell: ({ row }) => {
        const crawlType = row.getValue('crawlType') as 'crawl' | 'update';
        return (
          <div className={crawlType === 'crawl' ? 'italic text-gray-500' : ''}>
            {row.getValue('link')}
          </div>
        );
      },
    },
    {
      accessorKey: 'impLink',
      header: t('tableHeaders.impLinkForUpdate'), // Dùng t()
      cell: ({ row }) => {
        const crawlType = row.getValue('crawlType') as 'crawl' | 'update';
        return (
          <div className={crawlType === 'crawl' ? 'italic text-gray-500' : ''}>
            {row.getValue('impLink')}
          </div>
        );
      },
    },
    {
      accessorKey: 'cfpLink',
      header: t('tableHeaders.cfpLinkForUpdate'), // Dùng t()
      cell: ({ row }) => {
        const crawlType = row.getValue('crawlType') as 'crawl' | 'update';
        return (
          <div className={crawlType === 'crawl' ? 'italic text-gray-500' : ''}>
            {row.getValue('cfpLink')}
          </div>
        );
      },
    },
  ], [onUpdateActionTypeForSelected, t]); // Thêm t vào dependency array

  const table = useReactTable({
    data: parsedData || [],
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil((parsedData?.length || 0) / pagination.pageSize),
  });

  // Update parent component when selection changes
  useEffect(() => {
    const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
    onSelectionChanged(selectedRows);
  }, [table, onSelectionChanged]);

  const handleGlobalActionTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as 'crawl' | 'update';
    if (newValue !== globalActionType) {
      setGlobalActionType(newValue);

      const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
      if (selectedRows.length > 0) {
        onUpdateActionTypeForSelected(newValue, selectedRows);
      }
    }
  }, [table, onUpdateActionTypeForSelected, globalActionType]);

  // Reset selection when parsedData changes
  useEffect(() => {
    if (parsedData) {
      setRowSelection({});
    }
  }, [parsedData]);

  return (
    <div className="space-y-4 md:space-y-6 rounded-lg border border-gray-200 p-3 md:p-6 bg-white shadow">
      <h3 className="text-base md:text-lg font-medium leading-6 text-gray-900">{t('title')}</h3> {/* Dùng t() */}
      <p className="text-xs md:text-sm text-gray-600">
        {t('description')} {/* Dùng t() */}
      </p>

      {/* UI for global action type selection */}
      <div className="my-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
        <label htmlFor="globalActionType" className="block text-sm font-medium text-gray-700 whitespace-nowrap">
          {t('globalActionTypeLabel')} {/* Dùng t() */}
        </label>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            id="globalActionType"
            name="globalActionType"
            value={globalActionType}
            onChange={handleGlobalActionTypeChange}
            className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
          >
            <option value="crawl">{t('actionType.crawl')}</option> {/* Dùng t() */}
            <option value="update">{t('actionType.update')}</option> {/* Dùng t() */}
          </select>
          <button
            type="button"
            onClick={() => {
              const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
              if (selectedRows.length > 0) {
                onUpdateActionTypeForSelected(globalActionType, selectedRows);
              } else {
                alert(t('alert.selectAtLeastOneConference')); // Dùng t()
              }
            }}
            disabled={selectedCsvRowsCount === 0}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {t('applyToActionSelected', { count: selectedCsvRowsCount })} {/* Dùng t() với placeholder */}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('filter.acronymPlaceholder')} // Dùng t()
            value={(table.getColumn('acronym')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('acronym')?.setFilterValue(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('filter.titlePlaceholder')} // Dùng t()
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('title')?.setFilterValue(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('filter.statusPlaceholder')} // Dùng t()
            value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('status')?.setFilterValue(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="w-full rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50 sticky top-0 z-10">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="border-b border-blue-100 px-4 py-3 text-left text-sm font-semibold text-blue-900 whitespace-nowrap"
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? 'cursor-pointer select-none flex items-center gap-2 hover:text-blue-700 transition-colors'
                                  : '',
                                onClick: header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: <ChevronUpIcon className="h-4 w-4 text-blue-600" />,
                                desc: <ChevronDownIcon className="h-4 w-4 text-blue-600" />,
                              }[header.column.getIsSorted() as string] ?? (
                                header.column.getCanSort() ? (
                                  <ChevronsUpDown className="h-4 w-4 text-blue-400" />
                                ) : null
                              )}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="flex items-center gap-1 text-sm text-gray-700">
            <div>{t('pagination.page')}</div> {/* Dùng t() */}
            <strong className="text-gray-900">
              {table.getState().pagination.pageIndex + 1} {t('pagination.of')}{' '} {/* Dùng t() */}
              {table.getPageCount()}
            </strong>
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">{t('pagination.rowsPerPage')}</span> {/* Dùng t() */}
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
            className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {[10, 20, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-2 text-xs md:text-sm text-gray-600">
        {t('summary.selectedConferences', { count: selectedCsvRowsCount })} {/* Dùng t() với placeholder */}
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
          disabled={!canProceed}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('navigation.nextStep')} {/* Dùng t() */}
        </button>
      </div>
    </div>
  );
};

export default ConferenceSelectionStep;