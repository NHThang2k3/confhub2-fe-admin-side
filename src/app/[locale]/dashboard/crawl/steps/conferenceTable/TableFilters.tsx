// src/app/[locale]/dashboard/logAnalysis/steps/conferenceTable/TableFilters.tsx
import React from 'react';
import { Table } from '@tanstack/react-table';
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl'; // Import useTranslations

interface TableFiltersProps {
  table: Table<Conference>;
}

const FilterInput: React.FC<{
  columnId: string;
  placeholder: string;
  table: Table<Conference>;
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

const StatusFilterDropdown: React.FC<{ table: Table<Conference> }> = ({ table }) => {
  const t = useTranslations('ConferenceSelectionStep.filters'); // Or a more specific path if you have one
  const column = table.getColumn('status');
  if (!column) return null;

  const currentFilterValue = (column.getFilterValue() as string) ?? ""; // Default to empty string for "All"

  return (
    <div className="relative">
      {/* Optional: Add a label or integrate with existing styling */}
      {/* <label htmlFor="status-filter" className="sr-only">{t('statusFilterLabel')}</label> */}
      <select
        id="status-filter"
        value={currentFilterValue}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)} // Set to undefined if "" to clear filter
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      >
        <option value="">{t('allStatuses')}</option>
        <option value="NOT CRAWLED">{t('notCrawled')}</option>
        <option value="CRAWLED">{t('crawled')}</option>
        {/* Add other statuses if they exist and you want to filter by them */}
      </select>
    </div>
  );
};


const TableFilters: React.FC<TableFiltersProps> = ({ table }) => {
  const t = useTranslations('ConferenceSelectionStep.filters'); // For placeholders

  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <FilterInput columnId="acronym" placeholder={t('filterByAcronym')} table={table} />
      <FilterInput columnId="title" placeholder={t('filterByTitle')} table={table} />
      <StatusFilterDropdown table={table} />
    </div>
  );
};

export default TableFilters;