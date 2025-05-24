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
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

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
    field: 'acronym', headerName: 'Acronym', sortable: true, filter: true,
    checkboxSelection: true, headerCheckboxSelection: true, width: 180,
  },
  { field: 'title', headerName: 'Title', sortable: true, filter: true, flex: 1 },
  {
    field: 'crawlType',
    headerName: 'Action Type',
    width: 150,
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
  { field: 'sources', headerName: 'Sources', sortable: true, filter: true, width: 150 },
  { field: 'ranks', headerName: 'Ranks', sortable: true, filter: true, width: 120 },
  { field: 'researchFields', headerName: 'Research Fields', sortable: true, filter: true, width: 200 },
  { field: 'status', headerName: 'Status', sortable: true, filter: true, width: 120 },
  {
    field: 'updatedAt', headerName: 'Updated At', sortable: true, filter: true, width: 200,
    valueFormatter: (params: ValueFormatterParams<Conference, string | number | Date | undefined>) =>
      params.value ? new Date(params.value).toLocaleString() : ''
  },
  {
    field: 'link', headerName: 'Link (for Update)', sortable: true, filter: true, width: 200,
    cellClassRules: { 'italic text-gray-500': params => !params.data || params.data.crawlType === 'crawl' }
  },
  {
    field: 'impLink', headerName: 'Imp Link (for Update)', sortable: true, filter: true, width: 200,
    cellClassRules: { 'italic text-gray-500': params => !params.data || params.data.crawlType === 'crawl' }
  },
  {
    field: 'cfpLink', headerName: 'Cfp Link (for Update)', sortable: true, filter: true, width: 200,
    cellClassRules: { 'italic text-gray-500': params => !params.data || params.data.crawlType === 'crawl' }
  }
];

const defaultGridOptions: GridOptions<Conference> = {
  rowSelection: 'multiple',
  suppressRowClickSelection: true,
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
  onUpdateActionTypeForSelected, // Destructure new prop
}) => {
  const [colDefs] = useState<ColDef<Conference>[]>(defaultColDefs);
  const gridOptions = useMemo<GridOptions<Conference>>(() => defaultGridOptions, []);
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
    <div className="space-y-6 rounded-lg border border-gray-200 p-6 bg-white shadow">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Step 2: Select Conferences and Action Type</h3>
      <p className="text-sm text-gray-600">
        Select conferences from the table below and specify the action type (Crawl or Update).
        For 'Update' actions, ensure the relevant link fields (Link, Imp Link, Cfp Link) are provided if needed.
      </p>

      {/* UI for global action type selection */}
      <div className="my-4 flex items-center space-x-3 p-3 bg-gray-5 rounded-md border border-gray-200">
        <label htmlFor="globalActionType" className="block text-sm font-medium text-gray-700">
          Action Type for Selected:
        </label>
        <select
          id="globalActionType"
          name="globalActionType"
          value={globalActionType}
          onChange={(e) => setGlobalActionType(e.target.value as 'crawl' | 'update')}
          className="block w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
        >
          <option value="crawl">Crawl</option>
          <option value="update">Update</option>
        </select>
        <button
          type="button"
          onClick={handleApplyGlobalActionType}
          disabled={selectedCsvRowsCount === 0}
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply to {selectedCsvRowsCount} Selected
        </button>
      </div>

      <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 500px)', minHeight: '350px', width: '100%' }}> {/* Adjusted height for new UI */}
        <AgGridReact<Conference>
          ref={gridRef} // Assign ref
          rowData={parsedData}
          columnDefs={colDefs}
          gridOptions={gridOptions}
          onSelectionChanged={onSelectionChanged}
          getRowId={getRowId}
          domLayout='normal'
          // Ensure AG Grid re-renders when rowData changes by reference
          // This is usually default behavior in React AG Grid
        />
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Selected {selectedCsvRowsCount} conference(s).
      </p>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Previous: Import File
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Configure & Process
        </button>
      </div>
    </div>
  );
};

export default ConferenceSelectionStep;