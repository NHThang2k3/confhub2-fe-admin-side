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
  Table,
} from '@tanstack/react-table';
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getConferenceTableColumns } from './conferenceTable/conferenceTable.columns';
import GlobalActionControls from './conferenceTable/GlobalActionControls';
import TableFilters from './conferenceTable/TableFilters';
import TablePagination from './conferenceTable/TablePagination';
// Import hàm helper từ hook để đảm bảo tính nhất quán
import { getConferenceIdentifier } from '@/src/hooks/crawl/conference/useSelectionManager';

interface ConferenceSelectionStepProps {
  parsedData: Conference[];
  onSelectionChanged: (selectedRows: Conference[]) => void;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  onUpdateActionTypeForSelected: (actionType: 'crawl' | 'update', selectedRows: Conference[]) => void;
}

const LOG_PREFIX = '[ConferenceSelectionStep]';

const getConferenceRowId = (originalRow: Conference, index: number): string => {
  const id = getConferenceIdentifier(originalRow) || `unidentified-row-${index}`;
  // console.log(`${LOG_PREFIX} getRowId for row index ${index}: '${id}'`); // This can be very noisy, enable if needed
  return id;
};
const ConferenceSelectionStep: React.FC<ConferenceSelectionStepProps> = ({
  parsedData,
  onSelectionChanged,
  onNext,
  onPrev,
  canProceed,
  onUpdateActionTypeForSelected,
}) => {
  const t = useTranslations('ConferenceSelectionStep');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalActionType, setGlobalActionType] = useState<'crawl' | 'update'>('crawl');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const prevParsedDataRef = useRef<Conference[]>();

  console.log(`${LOG_PREFIX} Component Rendering...`);
  console.log(`${LOG_PREFIX} Current rowSelection state:`, rowSelection);

  const memoizedData = useMemo(() => {
    console.log(`${LOG_PREFIX} Rememoizing data. Data length: ${parsedData?.length || 0}`);
    return parsedData || [];
  }, [parsedData]);

  const handleUpdateActionTypeForRow = useCallback((actionType: 'crawl' | 'update', conference: Conference) => {
    console.log(`${LOG_PREFIX} handleUpdateActionTypeForRow called for row:`, getConferenceIdentifier(conference));
    onUpdateActionTypeForSelected(actionType, [conference]);
  }, [onUpdateActionTypeForSelected]);

  const columns = useMemo(
    () => getConferenceTableColumns(handleUpdateActionTypeForRow),
    [handleUpdateActionTypeForRow]
  );

  const table: Table<Conference> = useReactTable({
    data: memoizedData,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      console.log(`${LOG_PREFIX} onRowSelectionChange triggered.`);
      // `updater` can be a function, so we resolve it to get the new state
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      console.log(`${LOG_PREFIX} New selection state will be:`, newSelection);
      setRowSelection(newSelection);
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: getConferenceRowId,
  });

  useEffect(() => {
    console.log(`${LOG_PREFIX} useEffect[rowSelection] - Syncing selection to parent.`);
    const currentlySelectedOriginalRows = table.getSelectedRowModel().rows.map(row => row.original);
    onSelectionChanged(currentlySelectedOriginalRows);
  }, [rowSelection, table, onSelectionChanged]);

  useEffect(() => {
    console.log(`${LOG_PREFIX} useEffect[parsedData] - Checking if table state needs reset.`);

    const oldData = prevParsedDataRef.current;
    const newData = parsedData;

    // Điều kiện để reset:
    // 1. Dữ liệu cũ không tồn tại VÀ dữ liệu mới tồn tại (lần tải đầu tiên).
    // Chúng ta chỉ reset khi có sự thay đổi cấu trúc lớn, không phải update tại chỗ.
    const isNewFileLoad = oldData;

    if (isNewFileLoad) {
      console.log(`${LOG_PREFIX} New file detected (data length changed from ${oldData.length} to ${newData.length}). Resetting table state.`);
      setRowSelection({});
      setColumnFilters([]);
      setPagination(p => ({ ...p, pageIndex: 0 }));
    } else {
      console.log(`${LOG_PREFIX} Data updated, but it's an in-place update or initial load. No reset performed.`);
    }

    // Luôn cập nhật ref cho lần so sánh tiếp theo.
    prevParsedDataRef.current = parsedData;
  }, [parsedData]);

  const handleApplyGlobalActionToAllSelected = useCallback(() => {
    const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
    console.log(`${LOG_PREFIX} Applying global action '${globalActionType}' to all ${selectedRows.length} selected rows.`);
    if (selectedRows.length > 0) {
      onUpdateActionTypeForSelected(globalActionType, selectedRows);
    } else {
      alert(t('alerts.noConferenceSelectedForAction'));
    }
  }, [table, globalActionType, onUpdateActionTypeForSelected, t]);

  const handleApplyGlobalActionToPageSelected = useCallback(() => {
    const selectedOnPage = table.getRowModel().rows.filter(row => row.getIsSelected()).map(row => row.original);
    if (selectedOnPage.length > 0) {
      onUpdateActionTypeForSelected(globalActionType, selectedOnPage);
    } else {
      alert(t('alerts.noConferenceSelectedOnPage'));
    }
  }, [table, globalActionType, onUpdateActionTypeForSelected, t]);

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

  // Các biến đếm cho UI
  const totalSelectedRowCount = Object.keys(rowSelection).length;
  const pageRows = table.getRowModel().rows;
  const pageSelectedRowCount = pageRows.filter(row => row.getIsSelected()).length;
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const isAllFilteredDataSelected = filteredRowCount > 0 && filteredRowCount === totalSelectedRowCount;

  // Thêm một log cuối cùng trước khi render để xem trạng thái cuối cùng
  console.log(`${LOG_PREFIX} Final state before render. Total selected: ${totalSelectedRowCount}, Can proceed: ${canProceed}`);


  return (
    <div className="space-y-4 md:space-y-6 rounded-lg border border-gray-200 p-3 md:p-6 bg-white shadow">
      <h3 className="text-base md:text-lg font-medium leading-6 text-gray-900">{t('title')}</h3>
      <p className="text-xs md:text-sm text-gray-600">{t('description')}</p>

      <GlobalActionControls
        globalActionType={globalActionType}
        onGlobalActionTypeChange={setGlobalActionType}
        onApplyGlobalActionToAllSelected={handleApplyGlobalActionToAllSelected}
        onApplyGlobalActionToPageSelected={handleApplyGlobalActionToPageSelected}
        totalSelectedRowCount={totalSelectedRowCount}
        pageSelectedRowCount={pageSelectedRowCount}
        canApplyToPage={pageRows.length > 0}
        onSelectAllDataRows={handleSelectAllFilteredRows}
        onDeselectAllDataRows={handleDeselectAllDataRows}
        isAllDataSelected={isAllFilteredDataSelected}
        totalDataRowsCount={filteredRowCount}
      />

      <TableFilters table={table} />

      <div className="w-full rounded-lg border border-gray-200">
        {/* CHANGE: Thêm max-height và overflow-y-auto để tạo thanh cuộn dọc cho bảng */}
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <div className="inline-block min-w-full align-middle">
            <div>
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
                              {flexRender(header.column.columnDef.header, header.getContext())}
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
                      <tr key={row.id} className={`hover:bg-gray-20 transition-colors ${row.getIsSelected() ? 'bg-indigo-50' : ''}`}>
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            // CHANGE: Thêm `align-middle` để canh giữa nội dung theo chiều dọc
                            className="px-4 py-3 text-sm text-gray-900 align-middle"
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

      <p className="mt-2 text-xs md:text-sm text-gray-600">
        {t('selectionSummary.total', { count: totalSelectedRowCount })}
        {' '}
        {t('selectionSummary.onPage', { count: pageSelectedRowCount })}
      </p>

      <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="w-full sm:w-auto rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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

export default ConferenceSelectionStep;