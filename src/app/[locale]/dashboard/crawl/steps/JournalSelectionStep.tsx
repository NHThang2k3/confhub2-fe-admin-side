import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { JournalWithStatus } from '@/src/hooks/crawl/journal/useJournalCrawl';
import { useJournalTableSelection } from '@/src/hooks/crawl/journal/useJournalTableSelection';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  Table,
  ColumnDef,
} from '@tanstack/react-table';
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface JournalSelectionStepProps {
  parsedData: JournalWithStatus[];
  onSelectionChanged: (selectedRows: JournalWithStatus[]) => void;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  onUpdateActionTypeForSelected: (actionType: 'crawl' | 'update', selectedRows: JournalWithStatus[]) => void;
}

const getJournalRowId = (originalRow: JournalWithStatus, index: number): string => {
  return originalRow.Issn || `row-${index}`;
};

const FilterInput: React.FC<{
  columnId: string;
  placeholder: string;
  table: Table<JournalWithStatus>;
}> = ({ columnId, placeholder, table }) => {
  const column = table.getColumn(columnId);
  if (!column) return null;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(e) => column.setFilterValue(e.target.value)}
        className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
    </div>
  );
};

const CrawledFilterDropdown: React.FC<{ table: Table<JournalWithStatus> }> = ({ table }) => {
  const column = table.getColumn('crawled');
  if (!column) return null;

  const currentFilterValue = (column.getFilterValue() as string) ?? "";

  return (
    <div className="relative">
      <select
        value={currentFilterValue}
        onChange={(e) => {
          const value = e.target.value;
          column.setFilterValue(value === "" ? undefined : value === "true");
        }}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      >
        <option value="">All</option>
        <option value="true">Crawled</option>
        <option value="false">Not Crawled</option>
      </select>
    </div>
  );
};

const JournalSelectionStep: React.FC<JournalSelectionStepProps> = ({
  parsedData,
  onSelectionChanged,
  onNext,
  onPrev,
  canProceed,
  onUpdateActionTypeForSelected,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    selectedRows,
    handleRowSelectToggle,
    handleSelectAll,
    handleDeselectAll,
    handleSelectCrawled,
    handleSelectNotCrawled,
    selectedRowsCount,
  } = useJournalTableSelection({
    data: parsedData || [],
    resetDependencies: [parsedData],
  });

  const columns = useMemo<ColumnDef<JournalWithStatus>[]>(() => [
    {
      id: 'select',
      header: () => {
        const allSelected = parsedData.length > 0 && parsedData.every(journal => 
          selectedRows[journal.Issn || `row-${parsedData.indexOf(journal)}`]
        );
        const someSelected = parsedData.some(journal => 
          selectedRows[journal.Issn || `row-${parsedData.indexOf(journal)}`]
        );

        return (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allSelected}
              ref={input => {
                if (input) {
                  input.indeterminate = someSelected && !allSelected;
                }
              }}
              onChange={() => {
                if (allSelected) {
                  handleDeselectAll();
                } else {
                  handleSelectAll();
                }
              }}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              aria-label="Select all rows"
            />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedRows[row.id]}
            onChange={() => handleRowSelectToggle(row.id)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            aria-label={`Select row ${row.id}`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 60,
    },
    {
      accessorKey: 'Title',
      header: 'Title',
      cell: ({ row }) => <div className="font-medium text-gray-900">{row.original.Title}</div>,
      size: 300,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'Issn',
      header: 'ISSN',
      cell: ({ row }) => <div className="text-gray-700">{row.original.Issn}</div>,
      size: 150,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'crawled',
      header: 'Crawled',
      cell: ({ row }) => (
        <div className={`font-medium ${row.original.crawled ? 'text-green-600' : 'text-yellow-600'}`}>
          {row.original.crawled ? 'Yes' : 'No'}
        </div>
      ),
      size: 100,
      filterFn: (row, id, value) => {
        if (value === undefined) return true;
        return row.original.crawled === value;
      },
    },
    {
      accessorKey: 'lastUpdated',
      header: 'Last Updated',
      cell: ({ row }) => (
        <div className="text-gray-700">{row.original.lastUpdated ? new Date(row.original.lastUpdated).toLocaleDateString() : 'N/A'}</div>
      ),
      size: 150,
    },
  ], [selectedRows, handleRowSelectToggle, handleSelectAll, handleDeselectAll, parsedData]);

  const memoizedData = useMemo(() => parsedData || [], [parsedData]);

  const table = useReactTable({
    data: memoizedData,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: getJournalRowId,
    manualPagination: false,
  });

  useEffect(() => {
    const selectedJournals = memoizedData.filter(journal => 
      selectedRows[journal.Issn || `row-${memoizedData.indexOf(journal)}`]
    );
    onSelectionChanged(selectedJournals);
  }, [selectedRows, memoizedData, onSelectionChanged]);

  const filteredRowCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-4 md:space-y-6 rounded-lg border border-gray-200 p-3 md:p-6 bg-white shadow">
      <h3 className="text-base md:text-lg font-medium leading-6 text-gray-900">Journal Selection</h3>
      <p className="text-xs md:text-sm text-gray-600">
        Select the journals you want to crawl or update. You can filter by title or ISSN.
      </p>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <FilterInput columnId="Title" placeholder="Filter by title..." table={table} />
        <FilterInput columnId="Issn" placeholder="Filter by ISSN..." table={table} />
        <CrawledFilterDropdown table={table} />
      </div>

      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleSelectAll}
            className="border-gray-300 text-gray-700 hover:bg-gray-10"
          >
            Select All
          </Button>
          <Button
            variant="outline"
            onClick={handleDeselectAll}
            className="border-gray-300 text-gray-700 hover:bg-gray-10"
          >
            Deselect All
          </Button>
          <Button
            variant="outline"
            onClick={handleSelectCrawled}
            className="border-gray-300 text-gray-700 hover:bg-gray-10"
          >
            Select Crawled
          </Button>
          <Button
            variant="outline"
            onClick={handleSelectNotCrawled}
            className="border-gray-300 text-gray-700 hover:bg-gray-10"
          >
            Select Not Crawled
          </Button>
        </div>
      </div>

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
                                onClick: header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined,
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
                      <tr 
                        key={row.id} 
                        className={`hover:bg-gray-10 transition-colors ${selectedRows[row.id] ? 'bg-blue-50' : ''}`}
                      >
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
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {selectedRowsCount} of {filteredRowCount} rows selected
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={onPrev}
            className="border-gray-300 text-gray-700 hover:bg-gray-10"
          >
            Previous
          </Button>
          <Button
            onClick={onNext}
            disabled={!canProceed || selectedRowsCount === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JournalSelectionStep; 