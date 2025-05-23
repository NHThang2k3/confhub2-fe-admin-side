// src/appp/[locale]/dashboard/logAnalysis/steps/ConferenceSelectionStep.tsx
import React, { useMemo, useState } from 'react'; // Import useCallback
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';
import {
  AllCommunityModule,
  ModuleRegistry,
  RowSelectionModule,
  GridOptions,
  ColDef,
  GetRowIdParams,
  ValueFormatterParams,
  SelectionChangedEvent // Import for onSelectionChanged
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

// // Import AG Grid CSS - Đảm bảo chúng có trong project của bạn
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

interface ConferenceSelectionStepProps {
  parsedData: Conference[];
  onSelectionChanged: (event: SelectionChangedEvent<Conference>) => void;
  selectedCsvRowsCount: number;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  // colDefs, gridOptions, getRowId can be passed as props
  // hoặc định nghĩa lại ở đây nếu chúng không thay đổi động
}

// --- Định nghĩa colDefs, gridOptions, getRowId ở đây HOẶC truyền từ props ---
const defaultColDefs: ColDef<Conference>[] = [
  {
    field: 'acronym', headerName: 'Acronym', sortable: true, filter: true,
    checkboxSelection: true, headerCheckboxSelection: true, width: 180,
  },
  { field: 'title', headerName: 'Title', sortable: true, filter: true, flex: 1 },
  {
    field: 'crawlType', // Cột này đã có trong code gốc của bạn
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
  // singleClickEdit: true, // Bật nếu muốn edit bằng 1 click
};

const getRowId = (params: GetRowIdParams<Conference>): string => {
  return params.data.id; // Đảm bảo 'id' là duy nhất và có trên Conference
};
// --- Kết thúc định nghĩa colDefs, gridOptions, getRowId ---


const ConferenceSelectionStep: React.FC<ConferenceSelectionStepProps> = ({
  parsedData,
  onSelectionChanged,
  selectedCsvRowsCount,
  onNext,
  onPrev,
  canProceed,
}) => {
  const [colDefs] = useState<ColDef<Conference>[]>(defaultColDefs); // Sử dụng colDefs đã định nghĩa
  const gridOptions = useMemo<GridOptions<Conference>>(() => defaultGridOptions, []); // Sử dụng gridOptions đã định nghĩa

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 p-6 bg-white shadow">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Step 2: Select Conferences and Action Type</h3>
      <p className="text-sm text-gray-600">
        Select conferences from the table below and specify the action type (Crawl or Update).
        For 'Update' actions, ensure the relevant link fields (Link, Imp Link, Cfp Link) are provided if needed.
      </p>

      <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 450px)', minHeight: '350px', width: '100%' }}>
        <AgGridReact<Conference>
          rowData={parsedData}
          columnDefs={colDefs}
          gridOptions={gridOptions}
          onSelectionChanged={onSelectionChanged}
          getRowId={getRowId}
          domLayout='normal'
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