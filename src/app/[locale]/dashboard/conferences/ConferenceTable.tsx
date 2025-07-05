// FILE: /components/ConferenceTable.tsx

'use client';

import { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, ICellRendererParams, ModuleRegistry, AllCommunityModule, RowSelectionModule } from 'ag-grid-community';
import { useTranslations } from 'next-intl';
import { Conference } from './utils/types'; // Điều chỉnh đường dẫn
import { TagRenderer } from './TagRenderer'; // Điều chỉnh đường dẫn
import { ActionDropdown } from './ActionDropdown'; // Điều chỉnh đường dẫn

ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

interface ConferenceTableProps {
  rowData: Conference[];
  loading: boolean;
  onViewHistory: (conference: Conference) => void;
  onDelete: (conference: Conference) => void;
}

export const ConferenceTable = ({ rowData, loading, onViewHistory, onDelete }: ConferenceTableProps) => {
  const t = useTranslations('conferencesPage');

  const columnDefs: ColDef[] = useMemo(() => [
    {
      field: 'title',
      headerName: t('columnHeaders.title'),
      flex: 2,
      filter: 'agTextColumnFilter',
      minWidth: 200,
    },
    {
      field: 'acronym',
      headerName: t('columnHeaders.acronym'),
      flex: 1,
      filter: 'agTextColumnFilter',
      minWidth: 120,
    },
    {
      field: 'sources',
      headerName: t('columnHeaders.sources'),
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex flex-wrap gap-1">
          {params.value?.map((source: string) => (
            <TagRenderer key={source} value={source} color="bg-blue-100 text-blue-800" />
          ))}
        </div>
      ),
    },
    {
      field: 'researchFields',
      headerName: t('columnHeaders.researchFields'),
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex flex-wrap gap-1">
          {params.value?.map((field: string) => (
            <TagRenderer key={field} value={field} color="bg-green-100 text-green-800" />
          ))}
        </div>
      ),
    },
    {
      field: 'ranks',
      headerName: t('columnHeaders.ranks'),
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex flex-wrap gap-1">
          {params.value?.map((rank: string) => (
            <TagRenderer key={rank} value={rank} color="bg-purple-100 text-purple-800" />
          ))}
        </div>
      ),
    },
    {
      field: 'status',
      headerName: t('columnHeaders.status'),
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <TagRenderer
          value={params.value}
          color={params.value === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
        />
      ),
    },
    {
      headerName: t('columnHeaders.actions'),
      width: 80,
      minWidth: 80,
      maxWidth: 80,
      resizable: false,
      sortable: false,
      filter: false,
      cellClass: 'actions-cell',
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex items-center justify-center h-full">
          <ActionDropdown
            onViewHistory={() => onViewHistory(params.data)}
            onDelete={() => {
              console.log('Delete button clicked for conference:', params.data);
              onDelete(params.data);
              console.log('Dialog should open now, deleteDialogOpen set to true');
            }}
          />
        </div>
      ),
    },
  ], [t, onViewHistory, onDelete]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
  }), []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <>
      <div className="w-full h-[600px]">
        <AgGridReact
          className='ag-theme-alpine'
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          loading={loading}
          rowModelType="clientSide"
          getRowId={(params) => params.data.id}
          rowSelection="single"
          animateRows={true}
          suppressPaginationPanel={true}
          rowHeight={60}
        />
      </div>
      <style jsx global>{`
        /* Giữ nguyên các style này */
        .ag-theme-alpine .actions-cell { display: flex !important; align-items: center !important; justify-content: center !important; padding: 0 !important; overflow: visible !important; }
        .ag-theme-alpine .ag-cell { display: flex; align-items: center; overflow: visible; }
        .ag-theme-alpine .ag-row { border-bottom: 1px solid #e5e7eb; overflow: visible; }
        .ag-theme-alpine .ag-row:hover { background-color: #f9fafb; z-index: 1; }
        .ag-theme-alpine .ag-center-cols-container { overflow: visible; }
        .ag-theme-alpine .ag-center-cols-viewport { overflow: visible; }
        .ag-theme-alpine .ag-body-viewport { overflow-x: auto; overflow-y: auto; }
        .ag-theme-alpine .ag-header { background-color: #f8fafc; border-bottom: 2px solid #e5e7eb; }
        .ag-theme-alpine .ag-header-cell { font-weight: 600; color: #374151; }
        .ag-theme-alpine .ag-cell-focus { z-index: 2; }
      `}</style>
    </>
  );
};