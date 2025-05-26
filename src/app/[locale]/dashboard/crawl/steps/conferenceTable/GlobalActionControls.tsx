// src/app/[locale]/dashboard/logAnalysis/steps/conferenceTable/GlobalActionControls.tsx
import React from 'react';
import { useTranslations } from 'next-intl';

interface GlobalActionControlsProps {
  globalActionType: 'crawl' | 'update';
  onGlobalActionTypeChange: (actionType: 'crawl' | 'update') => void;
  onApplyGlobalActionToAllSelected: () => void;
  onApplyGlobalActionToPageSelected: () => void;
  totalSelectedRowCount: number;
  pageSelectedRowCount: number;
  canApplyToPage: boolean;
  onSelectAllDataRows: () => void; // This will now select all *filtered* rows
  onDeselectAllDataRows: () => void;
  isAllDataSelected: boolean; // This now means all *filtered* rows are selected
  totalDataRowsCount: number; // This is now the count of *filtered* rows
}

const GlobalActionControls: React.FC<GlobalActionControlsProps> = ({
  globalActionType,
  onGlobalActionTypeChange,
  onApplyGlobalActionToAllSelected,
  onApplyGlobalActionToPageSelected,
  totalSelectedRowCount,
  pageSelectedRowCount,
  canApplyToPage,
  onSelectAllDataRows,
  onDeselectAllDataRows,
  isAllDataSelected,
  totalDataRowsCount, // This is now total *filtered* rows
}) => {
  const t = useTranslations('ConferenceSelectionStep.globalActions');

  return (
    <div className="my-4 flex flex-col gap-4 p-3 bg-gray-5 rounded-md border border-gray-200">
      {/* Selection Management Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <span className="block text-sm font-medium text-gray-700 whitespace-nowrap shrink-0">
          {t('manageSelectionLabel')}:
        </span>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
          <button
            type="button"
            onClick={onSelectAllDataRows}
            // isAllDataSelected now means all *filtered* are selected
            // totalDataRowsCount is now *filtered* rows count
            disabled={isAllDataSelected || totalDataRowsCount === 0}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            title={t('selectAllFilteredTooltip', { count: totalDataRowsCount })} // Consider updating tooltip translation key
          >
            {/* totalDataRowsCount is now filtered count */}
            {t('selectAllDataButton', { count: totalDataRowsCount })}
          </button>
          <button
            type="button"
            onClick={onDeselectAllDataRows}
            disabled={totalSelectedRowCount === 0}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-yellow-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            title={t('deselectAllTooltip', { count: totalSelectedRowCount })}
          >
            {t('deselectAllButton', { count: totalSelectedRowCount })}
          </button>
        </div>
      </div>

      {/* Action Type Application Controls (remains the same) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label htmlFor="globalActionType" className="block text-sm font-medium text-gray-700 whitespace-nowrap shrink-0">
          {t('actionForSelectedLabel')}:
        </label>
        <div className="flex flex-col sm:flex-row gap-3 w-full items-center">
          <select
            id="globalActionType"
            name="globalActionType"
            value={globalActionType}
            onChange={(e) => onGlobalActionTypeChange(e.target.value as 'crawl' | 'update')}
            className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
          >
            <option value="crawl">{t('crawlAction')}</option>
            <option value="update">{t('updateAction')}</option>
          </select>
          <button
            type="button"
            onClick={onApplyGlobalActionToPageSelected}
            disabled={!canApplyToPage || pageSelectedRowCount === 0}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-sky-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            title={t('applyToPageTooltip', { count: pageSelectedRowCount })}
          >
            {t('applyToPageButton', { count: pageSelectedRowCount })}
          </button>
          <button
            type="button"
            onClick={onApplyGlobalActionToAllSelected}
            disabled={totalSelectedRowCount === 0}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            title={t('applyToAllSelectedTooltip', { count: totalSelectedRowCount })}
          >
            {t('applyToAllSelectedButton', { count: totalSelectedRowCount })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalActionControls;