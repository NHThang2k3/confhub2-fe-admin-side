// src/appp/[locale]/dashboard/logAnalysis/steps/ConferenceSelectionStep.tsx
import React, { useMemo, useState, useRef, useCallback } from 'react'; // Import useRef, useCallback
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';
import {
  AllCommunityModule,
  ModuleRegistry,
  RowSelectionModule,
  GridOptions,
  ColDef,
  GetRowIdParams,
  ValueFormatterParams,
  SelectionChangedEvent,
  GridApi, // Import GridApi
  PaginationNumberFormatterParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

interface ConferenceSelectionStepProps {
  parsedData: Conference[];
  onSelectionChanged: (event: SelectionChangedEvent<Conference>) => void;
  selectedCsvRowsCount: number;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  onUpdateActionTypeForSelected: (actionType: 'crawl' | 'update', gridApi: GridApi<Conference> | null) => void; // New prop
}

const defaultColDefs: ColDef<Conference>[] = [
  {
    field: 'acronym', 
    headerName: 'Acronym', 
    sortable: true, 
    filter: true,
    checkboxSelection: true, 
    headerCheckboxSelection: true, 
    width: 150,
    minWidth: 120,
  },
  { 
    field: 'title', 
    headerName: 'Title', 
    sortable: true, 
    filter: true, 
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'crawlType',
    headerName: 'Action Type',
    width: 130,
    minWidth: 120,
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: { values: ['crawl', 'update'] },
    cellClassRules: {
      'font-semibold text-blue-700': params => params.value === 'crawl',
      'font-semibold text-green-700': params => params.value === 'update',
    },
    valueFormatter: (params: ValueFormatterParams<Conference, 'crawl' | 'update'>) => {
      return params.value ? params.value.charAt(0).toUpperCase() + params.value.slice(1) : '';
    }
  },
  { 
    field: 'sources', 
    headerName: 'Sources', 
    sortable: true, 
    filter: true, 
    width: 130,
    minWidth: 120,
  },
  { 
    field: 'ranks', 
    headerName: 'Ranks', 
    sortable: true, 
    filter: true, 
    width: 100,
    minWidth: 90,
  },
  { 
    field: 'researchFields', 
    headerName: 'Research Fields', 
    sortable: true, 
    filter: true, 
    width: 180,
    minWidth: 150,
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    sortable: true, 
    filter: true, 
    width: 100,
    minWidth: 90,
  },
  {
    field: 'updatedAt', 
    headerName: 'Updated At', 
    sortable: true, 
    filter: true, 
    width: 180,
    minWidth: 150,
    valueFormatter: (params: ValueFormatterParams<Conference, string | number | Date | undefined>) =>
      params.value ? new Date(params.value).toLocaleString() : ''
  },
  {
    field: 'link', 
    headerName: 'Link (for Update)', 
    sortable: true, 
    filter: true, 
    width: 180,
    minWidth: 150,
    cellClassRules: { 'italic text-gray-500': params => !params.data || params.data.crawlType === 'crawl' }
  },
  {
    field: 'impLink', 
    headerName: 'Imp Link (for Update)', 
    sortable: true, 
    filter: true, 
    width: 180,
    minWidth: 150,
    cellClassRules: { 'italic text-gray-500': params => !params.data || params.data.crawlType === 'crawl' }
  },
  {
    field: 'cfpLink', 
    headerName: 'Cfp Link (for Update)', 
    sortable: true, 
    filter: true, 
    width: 180,
    minWidth: 150,
    cellClassRules: { 'italic text-gray-500': params => !params.data || params.data.crawlType === 'crawl' }
  }
];

const defaultGridOptions: GridOptions<Conference> = {
  rowSelection: 'multiple',
  suppressRowClickSelection: true,
  pagination: true,
  paginationPageSize: 10,
  paginationPageSizeSelector: [10, 20, 50, 100],
  domLayout: 'normal',
  // Enable this if you want the grid to re-render when rowData prop changes.
  // It's often true by default for React.
  // deltaRowDataMode: true, // Not strictly needed if you pass a new array to rowData
  // singleClickEdit: true, // Bật nếu muốn edit bằng 1 click
};

const getRowId = (params: GetRowIdParams<Conference>): string => {
  return params.data.id;
};

const ConferenceSelectionStep: React.FC<ConferenceSelectionStepProps> = ({
  parsedData,
  onSelectionChanged,
  selectedCsvRowsCount,
  onNext,
  onPrev,
  canProceed,
  onUpdateActionTypeForSelected,
}) => {
  const [colDefs] = useState<ColDef<Conference>[]>(defaultColDefs);
  const gridOptions = useMemo<GridOptions<Conference>>(() => ({
    ...defaultGridOptions,
    paginationNumberFormatter: (params: PaginationNumberFormatterParams) => {
      return '[' + params.value.toLocaleString() + ']';
    },
  }), []);
  const gridRef = useRef<AgGridReact<Conference>>(null); // Ref for AG Grid

  const [globalActionType, setGlobalActionType] = useState<'crawl' | 'update'>('crawl');

  const handleApplyGlobalActionType = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
        if (selectedCsvRowsCount > 0) {
            onUpdateActionTypeForSelected(globalActionType, gridRef.current.api);
        } else {
            alert("Please select at least one conference to apply the action type.");
        }
    } else {
        console.error("Grid API not available.");
    }
  }, [globalActionType, onUpdateActionTypeForSelected, selectedCsvRowsCount]);


  return (
    <div className="space-y-4 md:space-y-6 rounded-lg border border-gray-200 p-3 md:p-6 bg-white shadow">
      <h3 className="text-base md:text-lg font-medium leading-6 text-gray-900">Step 2: Select Conferences and Action Type</h3>
      <p className="text-xs md:text-sm text-gray-600">
        Select conferences from the table below and specify the action type (Crawl or Update).
        For &apos;Update&apos; actions, ensure the relevant link fields (Link, Imp Link, Cfp Link) are provided if needed.
      </p>

      {/* UI for global action type selection */}
      <div className="my-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-5 rounded-md border border-gray-200">
        <label htmlFor="globalActionType" className="block text-sm font-medium text-gray-700 whitespace-nowrap">
          Action Type for Selected:
        </label>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            id="globalActionType"
            name="globalActionType"
            value={globalActionType}
            onChange={(e) => setGlobalActionType(e.target.value as 'crawl' | 'update')}
            className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
          >
            <option value="crawl">Crawl</option>
            <option value="update">Update</option>
          </select>
          <button
            type="button"
            onClick={handleApplyGlobalActionType}
            disabled={selectedCsvRowsCount === 0}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Apply to {selectedCsvRowsCount} Selected
          </button>
        </div>
      </div>

      <div className="ag-theme-alpine w-full overflow-hidden" style={{ height: 'calc(100vh - 150px)', minHeight: '300px' }}>
        <AgGridReact<Conference>
          ref={gridRef}
          rowData={parsedData}
          columnDefs={colDefs}
          gridOptions={gridOptions}
          onSelectionChanged={onSelectionChanged}
          getRowId={getRowId}
          domLayout='normal'
          className="w-full"
        />
      </div>
      <p className="mt-2 text-xs md:text-sm text-gray-600">
        Selected {selectedCsvRowsCount} conference(s).
      </p>

      <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="w-full sm:w-auto rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Previous: Import File
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Configure & Process
        </button>
      </div>
    </div>
  );
};

export default ConferenceSelectionStep;