// src/app/[locale]/dashboard/logAnalysis/steps/conferenceTable/TableFilters.tsx
import React from 'react';
import { Table } from '@tanstack/react-table';
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';
import { Search } from 'lucide-react';

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


const TableFilters: React.FC<TableFiltersProps> = ({ table }) => {
  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <FilterInput columnId="acronym" placeholder="Filter by acronym..." table={table} />
      <FilterInput columnId="title" placeholder="Filter by title..." table={table} />
      <FilterInput columnId="status" placeholder="Filter by status..." table={table} />
    </div>
  );
};

export default TableFilters;