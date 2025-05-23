// src/app/[locale]/dashboard/logAnalysis/ConferenceTableHeader.tsx
import React from 'react';
import {
  FaSort, FaSortUp, FaSortDown, FaTimesCircle, FaSave, FaExclamationCircle, FaCogs
} from 'react-icons/fa';
import {
  SortableColumn,
  SortDirection
} from '@/src/hooks/crawl/useConferenceTableManager'; // Adjusted path
import { Rocket } from 'lucide-react';

interface ConferenceTableHeaderProps {
  sortColumn: SortableColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortableColumn) => void;
  isFilteredByRequest?: boolean;
}

export const ConferenceTableHeader: React.FC<ConferenceTableHeaderProps> = ({
  sortColumn,
  sortDirection,
  onSort,
  isFilteredByRequest
}) => {
  const renderSortIcon = (column: SortableColumn) => {
    if (sortColumn !== column) return <FaSort className='ml-1 inline-block text-gray-400' />;
    return sortDirection === 'asc' ? <FaSortUp className='ml-1 inline-block text-blue-600' /> : <FaSortDown className='ml-1 inline-block text-blue-600' />;
  };

  const SortButton: React.FC<{ column: SortableColumn, title: string, className?: string, children: React.ReactNode }> =
    ({ column, title, className = '', children }) => (
      <button
        className={`group flex w-full items-center text-left focus:outline-none ${className}`}
        onClick={() => onSort(column)}
        title={`Sort by ${title} ${sortColumn === column ? (sortDirection === 'asc' ? '(Ascending)' : '(Descending)') : ''}`}
      >
        {children}
        {renderSortIcon(column)}
      </button>
    );

  return (
    <thead className='bg-gray-100 sticky top-0 z-10'>
      <tr>
        <th scope='col' className='w-[3%] px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500'>Sel</th>
        <th scope='col' className='min-w-[200px] px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'><SortButton column='title' title='Title'>Title</SortButton></th> {/* Increased min-width for title */}

        {/* THÊM CỘT ACTION TYPE */}
        <th scope='col' className='w-[100px] px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
          <SortButton column='crawlType' title='Action Type'>
            <FaCogs size={14} className='mr-1 inline text-teal-600' /> Action
          </SortButton>
        </th>

        {isFilteredByRequest && (
          <th scope='col' className='min-w-[150px] px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'> {/* Increased min-width */}
            <SortButton column='requestId' title='Request ID'>
              <Rocket size={16} className='mr-1 inline text-purple-500' /> Request ID
            </SortButton>
          </th>
        )}

        <th scope='col' className='w-[100px] px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'><SortButton column='status' title='Status'>Status</SortButton></th>
        <th scope='col' className='w-[100px] px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'><SortButton column='durationSeconds' title='Duration'>Duration</SortButton></th>
        <th scope='col' className='w-[80px] px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500' title='Google Search'>Search</th>
        <th scope='col' className='w-[80px] px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500' title='HTML Save'>HTML</th>
        <th scope='col' className='w-[80px] px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500' title='Link Processing'>Links</th>
        <th scope='col' className='w-[80px] px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500' title='Gemini Determine'>Det.</th>
        <th scope='col' className='w-[80px] px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500' title='Gemini CFP'>CFP</th>
        <th scope='col' className='w-[80px] px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500' title='Gemini Extract'>Ext.</th>
        <th scope='col' className='w-[90px] px-3 pt-0.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
          {/* Sửa tên cột sortable */}
          <SortButton column='dataQualityInsightCount' title='Data Quality Insight Count' className='justify-center'>
            <FaExclamationCircle className='mr-1 inline text-amber-500' /> Warns
          </SortButton>
        </th>
        <th scope='col' className='w-[90px] px-3 pt-0.5 text-center text-xs font-medium uppercase tracking-wider text-gray-500'>
          <SortButton column='errorCount' title='Error Count' className='justify-center'>
            <FaTimesCircle className='mb-0.5 mr-1 inline text-red-500' /> Errors
          </SortButton>
        </th>
        <th scope='col' className='w-[80px] pr-4 pt-0.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500' title='Save Status'>
          <FaSave className='mr-1 inline' />Save
        </th>
      </tr>
    </thead>
  );
};