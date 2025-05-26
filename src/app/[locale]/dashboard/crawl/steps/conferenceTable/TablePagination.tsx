// src/app/[locale]/dashboard/logAnalysis/steps/conferenceTable/TablePagination.tsx
import React from 'react';
import { Table } from '@tanstack/react-table';
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTranslations } from 'next-intl'; // Import useTranslations

interface TablePaginationProps {
  table: Table<Conference>;
}

const TablePagination: React.FC<TablePaginationProps> = ({ table }) => {
  // Khai báo namespace 'Pagination' để nhóm các bản dịch liên quan
  const t = useTranslations('Pagination'); 

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 mt-1">
      <div className="flex items-center gap-2">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          // Có thể thêm tooltip cho nút nếu cần
          title={t('firstPage')} 
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('previousPage')}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="flex items-center gap-1 text-sm text-gray-700">
          {/* Sử dụng placeholders cho chuỗi "Page X of Y" để dễ dịch hơn */}
          <strong className="text-gray-900">
            {t('pageInfo', { 
              current: table.getState().pagination.pageIndex + 1, 
              total: table.getPageCount() 
            })}
          </strong>
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('nextPage')}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('lastPage')}
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">{t('rowsPerPage')}</span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value));
          }}
          className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label={t('selectRowsPerPage')} // Thêm aria-label cho khả năng truy cập
        >
          {[10, 20, 50, 100].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TablePagination;