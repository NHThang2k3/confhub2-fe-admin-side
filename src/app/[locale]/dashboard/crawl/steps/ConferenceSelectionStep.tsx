// src/app/[locale]/dashboard/logAnalysis/steps/ConferenceSelectionStep.tsx
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel, // Quan trọng: đảm bảo đã import và sử dụng
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
import TableFilters from './conferenceTable/TableFilters'; // Component này sẽ chứa dropdown status
import TablePagination from './conferenceTable/TablePagination';

interface ConferenceSelectionStepProps {
  parsedData: Conference[];
  onSelectionChanged: (selectedRows: Conference[]) => void;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  onUpdateActionTypeForSelected: (actionType: 'crawl' | 'update', selectedRows: Conference[]) => void;
}

const getConferenceRowId = (originalRow: Conference, index: number): string => {
  // Đảm bảo ID này ổn định và duy nhất cho mỗi dòng
  return originalRow.id || originalRow.acronym || `row-${index}`;
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
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({}); // Lưu trữ { rowId: true } cho các dòng được chọn
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
    onRowSelectionChange: setRowSelection, // Để table quản lý trạng thái lựa chọn
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Rất quan trọng để truy cập dữ liệu đã lọc
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: getConferenceRowId,
    manualPagination: false, // Giả sử phân trang phía client
    // debugTable: true, // Hữu ích khi phát triển
  });

  // Effect để thông báo cho component cha về thay đổi lựa chọn
  useEffect(() => {
    const currentlySelectedOriginalRows = table.getSelectedRowModel().rows.map(row => row.original);
    onSelectionChanged(currentlySelectedOriginalRows);
  }, [rowSelection, table, onSelectionChanged]); // Kích hoạt khi rowSelection hoặc table instance thay đổi

  // Hành động cho "Apply to All Selected" (áp dụng cho tất cả các dòng hiện đang được chọn, bất kể trang hay bộ lọc)
  const handleApplyGlobalActionToAllSelected = useCallback(() => {
    const selectedRowModels = table.getSelectedRowModel().rows;
    if (selectedRowModels.length > 0) {
      const conferencesToUpdate = selectedRowModels.map(row => row.original);
      onUpdateActionTypeForSelected(globalActionType, conferencesToUpdate);
    } else {
      alert(t('alerts.noConferenceSelectedForAction'));
    }
  }, [table, globalActionType, onUpdateActionTypeForSelected, t]);

  // Hành động cho "Apply to Page Selected" (áp dụng cho các dòng được chọn trên trang hiện tại)
  const handleApplyGlobalActionToPageSelected = useCallback(() => {
    const pageRows = table.getRowModel().rows; // Đây là các dòng đã được lọc VÀ phân trang
    const selectedOnPage = pageRows.filter(row => row.getIsSelected()).map(row => row.original);

    if (selectedOnPage.length > 0) {
      onUpdateActionTypeForSelected(globalActionType, selectedOnPage);
    } else {
      alert(t('alerts.noConferenceSelectedOnPage'));
    }
  }, [table, globalActionType, onUpdateActionTypeForSelected, t]);

  // NEW: Chọn tất cả các dòng *đã được lọc*
  const handleSelectAllFilteredRows = useCallback(() => {
    const filteredRowIds = table.getFilteredRowModel().rows.reduce((acc, row) => {
      acc[row.id] = true; // row.id là ID được trả về từ getRowId
      return acc;
    }, {} as RowSelectionState);
    table.setRowSelection(filteredRowIds);
  }, [table]);

  // Bỏ chọn TẤT CẢ các dòng (xóa tất cả lựa chọn)
  const handleDeselectAllDataRows = useCallback(() => {
    table.setRowSelection({}); // Cách trực tiếp hơn để xóa lựa chọn
  }, [table]);

  // Reset lựa chọn và phân trang nếu parsedData thay đổi đáng kể (ví dụ: file mới)
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

  // Các biến đếm cho UI
  const totalSelectedRowCount = table.getSelectedRowModel().rows.length;
  const pageRows = table.getRowModel().rows; // Các dòng đã lọc và phân trang cho view hiện tại
  const pageSelectedRowCount = pageRows.filter(row => row.getIsSelected()).length;
  const canApplyToPage = pageRows.length > 0;

  // NEW: Logic cho "is all filtered data selected" và số lượng dòng đã lọc
  const filteredRows = table.getFilteredRowModel().rows;
  const filteredRowCount = filteredRows.length;
  const isAllFilteredDataSelected = filteredRowCount > 0 && filteredRows.every(row => row.getIsSelected());

  return (
    <div className="space-y-4 md:space-y-6 rounded-lg border border-gray-200 p-3 md:p-6 bg-white shadow">
      <h3 className="text-base md:text-lg font-medium leading-6 text-gray-900">{t('title')}</h3>
      <p className="text-xs md:text-sm text-gray-600">
        {t('description')}
      </p>

      <GlobalActionControls
        globalActionType={globalActionType}
        onGlobalActionTypeChange={setGlobalActionType}
        onApplyGlobalActionToAllSelected={handleApplyGlobalActionToAllSelected}
        onApplyGlobalActionToPageSelected={handleApplyGlobalActionToPageSelected}
        totalSelectedRowCount={totalSelectedRowCount}
        pageSelectedRowCount={pageSelectedRowCount}
        canApplyToPage={canApplyToPage}
        onSelectAllDataRows={handleSelectAllFilteredRows} // CHANGED: Sử dụng handler mới
        onDeselectAllDataRows={handleDeselectAllDataRows}
        isAllDataSelected={isAllFilteredDataSelected} // CHANGED: Sử dụng state mới
        totalDataRowsCount={filteredRowCount} // CHANGED: Đây là tổng số dòng *đã lọc*
      />

      <TableFilters table={table} /> {/* Component này sẽ xử lý dropdown status */}

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
                  {/* table.getRowModel().rows là các dòng đã được lọc và phân trang */}
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

      <p className="mt-2 text-xs md:text-sm text-gray-600">
        {t('selectionSummary.total', { count: totalSelectedRowCount })}
        {' '}
        {t('selectionSummary.onPage', { count: pageSelectedRowCount })}
      </p>

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

export default ConferenceSelectionStep;