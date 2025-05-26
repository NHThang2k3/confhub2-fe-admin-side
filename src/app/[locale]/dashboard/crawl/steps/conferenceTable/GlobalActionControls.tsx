// src/app/[locale]/dashboard/logAnalysis/steps/conferenceTable/GlobalActionControls.tsx
import React from 'react';

interface GlobalActionControlsProps {
  globalActionType: 'crawl' | 'update';
  onGlobalActionTypeChange: (actionType: 'crawl' | 'update') => void;
  onApplyGlobalActionToAllSelected: () => void; // Renamed for clarity
  onApplyGlobalActionToPageSelected: () => void; // New prop
  totalSelectedRowCount: number;
  pageSelectedRowCount: number; // New prop: count of selected items on the current page
  canApplyToPage: boolean; // New prop: to enable/disable page-specific apply
}

const GlobalActionControls: React.FC<GlobalActionControlsProps> = ({
  globalActionType,
  onGlobalActionTypeChange,
  onApplyGlobalActionToAllSelected,
  onApplyGlobalActionToPageSelected,
  totalSelectedRowCount,
  pageSelectedRowCount,
  canApplyToPage,
}) => {
  return (
    <div className="my-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-5 rounded-md border border-gray-200">
      <label htmlFor="globalActionType" className="block text-sm font-medium text-gray-700 whitespace-nowrap shrink-0">
        Action for Selected:
      </label>
      <div className="flex flex-col sm:flex-row gap-3 w-full items-center">
        <select
          id="globalActionType"
          name="globalActionType"
          value={globalActionType}
          onChange={(e) => onGlobalActionTypeChange(e.target.value as 'crawl' | 'update')}
          className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
        >
          <option value="crawl">Crawl</option>
          <option value="update">Update</option>
        </select>
        <button
          type="button"
          onClick={onApplyGlobalActionToPageSelected}
          disabled={!canApplyToPage || pageSelectedRowCount === 0}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-sky-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          title={`Apply to ${pageSelectedRowCount} selected on this page`}
        >
          Apply to Page ({pageSelectedRowCount})
        </button>
        <button
          type="button"
          onClick={onApplyGlobalActionToAllSelected}
          disabled={totalSelectedRowCount === 0}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          title={`Apply to all ${totalSelectedRowCount} selected conferences`}
        >
          Apply to All ({totalSelectedRowCount})
        </button>
      </div>
    </div>
  );
};

export default GlobalActionControls;