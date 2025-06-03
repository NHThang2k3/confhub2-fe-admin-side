// src/app/[locale]/dashboard/logAnalysis/journalTable/JournalTableControls.tsx (ADJUSTED)
import React from 'react';
import {
  FaListUl, FaCheckDouble, FaTimesCircle, FaMinusCircle, FaSearch, FaRedo,
  FaSave, FaSpinner, // Added for Save button
} from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { MainSavingStatus } from '@/src/hooks/crawl/journal/useJournalTableManager'; // Import type

interface JournalTableControlsProps {
  selectedCount: number;
  onSelectAll: () => void;
  onSelectNoError: () => void;
  onSelectError: () => void;
  onDeselectAll: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;

  // Re-crawl props
  onReCrawlSelected?: () => void;
  isReCrawlDisabled?: boolean;

  // Save props
  mainSaveStatus: MainSavingStatus;
  isSaveEnabled: boolean;
  onSaveSelected: () => void;
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
  mainSaveStatus, // Destructure
  isSaveEnabled,   // Destructure
  onSaveSelected,  // Destructure
}) => {
  const t = useTranslations('JournalTableControls');

  const getSaveButtonContent = () => {
    switch (mainSaveStatus) {
      case 'saving':
        return (
          <>
            <FaSpinner className="mr-2 animate-spin" />
            {t('saveButton.saving')}
          </>
        );
      case 'success':
        return t('saveButton.saved'); // Or keep 'Save Selected' and rely on row status
      case 'error':
        return t('saveButton.saveError');
      default:
        return (
          <>
            <FaSave className="mr-2" />
            {t('saveButton.saveSelected', { count: selectedCount })}
          </>
        );
    }
  };

  return (
    <div className='mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
      {/* Search Input */}
      <div className='relative flex-grow md:max-w-xs lg:max-w-sm xl:max-w-md'> {/* Adjusted max-width */}
        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
          <FaSearch className='h-4 w-4 text-gray-400' aria-hidden='true' />
        </div>
        <input
          type='search'
          name='journalSearch'
          id='journalSearch'
          className='block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2'
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div className='flex flex-wrap items-center justify-start gap-2 md:justify-end'>
        {/* Selection Buttons */}
        <div className='flex items-center gap-1 rounded-md border border-gray-300 p-1 shadow-sm'> {/* Added shadow */}
          <button onClick={onSelectAll} title={t('selectAllTitle')} className='rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors'>
            <FaListUl />
          </button>
          <button onClick={onSelectNoError} title={t('selectNoErrorTitle')} className='rounded p-1.5 text-green-600 hover:bg-gray-100 hover:text-green-700 transition-colors'>
            <FaCheckDouble />
          </button>
          <button onClick={onSelectError} title={t('selectErrorTitle')} className='rounded p-1.5 text-red-600 hover:bg-gray-100 hover:text-red-700 transition-colors'>
            <FaTimesCircle />
          </button>
          <button onClick={onDeselectAll} title={t('deselectAllTitle')} className='rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-black transition-colors'>
            <FaMinusCircle />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Save Selected Button */}
          <button
            type="button"
            onClick={onSaveSelected}
            disabled={!isSaveEnabled || mainSaveStatus === 'saving'}
            className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
              ${(!isSaveEnabled || mainSaveStatus === 'saving') ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'}
              ${mainSaveStatus === 'error' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' : ''}
              ${mainSaveStatus === 'success' ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' : ''}
            `}
            title={!isSaveEnabled ? t('saveButton.disabledTooltip') : t('saveButton.tooltip')}
          >
            {getSaveButtonContent()}
          </button>

          {/* Re-crawl Button */}
          {onReCrawlSelected && (
            <button
              type='button'
              onClick={onReCrawlSelected}
              disabled={isReCrawlDisabled || mainSaveStatus === 'saving'} // Also disable if saving
              className={`inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                ${(isReCrawlDisabled || mainSaveStatus === 'saving') ? 'cursor-not-allowed opacity-60' : ''}`}
              title={isReCrawlDisabled ? t('reCrawlDisabledTitle') : t('reCrawlSelectedTitle', { count: selectedCount })}
            >
              <FaRedo className='mr-2' /> {t('reCrawlButtonText')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};