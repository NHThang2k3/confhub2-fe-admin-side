// src/app/[locale]/dashboard/logAnalysis/journalTable/JournalTableControls.tsx (File mới)
import React from 'react';
import {
  FaListUl, FaCheckDouble, FaTimesCircle, FaMinusCircle, FaSearch, FaRedo
} from 'react-icons/fa';
import { useTranslations } from 'next-intl';

interface JournalTableControlsProps {
  selectedCount: number;
  onSelectAll: () => void;
  onSelectNoError: () => void; // Select journals with 0 errors
  onSelectError: () => void;   // Select journals with >0 errors
  onDeselectAll: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  // Props cho các actions khác (ví dụ: re-crawl)
  onReCrawlSelected?: () => void;
  isReCrawlDisabled?: boolean;
}

export const JournalTableControls: React.FC<JournalTableControlsProps> = ({
  selectedCount,
  onSelectAll,
  onSelectNoError,
  onSelectError,
  onDeselectAll,
  searchTerm,
  onSearchChange,
  onReCrawlSelected,
  isReCrawlDisabled,
}) => {
  const t = useTranslations('JournalTableControls'); // Namespace mới

  return (
    <div className='mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
      {/* Search Input */}
      <div className='relative flex-grow md:max-w-sm lg:max-w-md'>
        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
          <FaSearch className='h-4 w-4 text-gray-400' aria-hidden='true' />
        </div>
        <input
          type='search'
          name='journalSearch'
          id='journalSearch'
          className='block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2'
          placeholder={t('searchPlaceholder')} // Ví dụ: "Search journals (title, source ID...)"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div className='flex flex-wrap items-center justify-start gap-2 md:justify-end'>
        {/* Selection Buttons */}
        <div className='flex items-center gap-1 rounded-md border border-gray-300 p-1'>
          <button onClick={onSelectAll} title={t('selectAllTitle')} className='rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-blue-600'>
            <FaListUl />
          </button>
          <button onClick={onSelectNoError} title={t('selectNoErrorTitle')} className='rounded p-1 text-green-600 hover:bg-gray-100 hover:text-green-700'>
            <FaCheckDouble />
          </button>
          <button onClick={onSelectError} title={t('selectErrorTitle')} className='rounded p-1 text-red-600 hover:bg-gray-100 hover:text-red-700'>
            <FaTimesCircle />
          </button>
          <button onClick={onDeselectAll} title={t('deselectAllTitle')} className='rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-black'>
            <FaMinusCircle />
          </button>
        </div>

        {/* Action Buttons (Ví dụ: Re-crawl) */}
        {onReCrawlSelected && (
          <button
            type='button'
            onClick={onReCrawlSelected}
            disabled={isReCrawlDisabled}
            className={`inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isReCrawlDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
            title={isReCrawlDisabled ? t('reCrawlDisabledTitle') : t('reCrawlSelectedTitle', { count: selectedCount })}
          >
            <FaRedo className='mr-2' /> {t('reCrawlButtonText')}
          </button>
        )}
      </div>
    </div>
  );
};