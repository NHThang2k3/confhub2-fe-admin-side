'use client';

import { useTranslations } from 'next-intl';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ColDef, GridReadyEvent, ICellRendererParams, ModuleRegistry, IRowNode, RowSelectionModule } from 'ag-grid-community';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useFieldArray, Control, UseFormWatch } from 'react-hook-form';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';

ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

export enum ConferenceDateType {
  CONFERENCE_DATE = 'conferenceDate',
  CAMERA_READY_DATE = 'cameraReadyDate',
  NOTIFICATION_DATE = 'notificationDate',
  SUBMISSION_DATE = 'submissionDate',
  REGISTRATION_DATE = 'registrationDate',
  OTHER_DATE = 'otherDate'
}

export interface ConferenceDate {
  id: string;
  type: ConferenceDateType | null;
  name: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface DatesTableProps {
  control: Control<any>;
  watch: UseFormWatch<any>;
  name: string;
  onRefetch?: () => Promise<void>;
}

interface DateRow extends ConferenceDate {}

export default function DatesTable({ control, watch, name, onRefetch }: DatesTableProps) {
  const t = useTranslations('conferencesPage');
  const gridRef = useRef<AgGridReact>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name
  });

  // Optimize cell value changes to prevent unnecessary re-renders
  const handleCellValueChanged = useCallback((params: any, fieldName: string) => {
    const index = fields.findIndex(field => field.id === params.data.id);
    if (index !== -1) {
      const updatedData = { ...params.data, [fieldName]: params.newValue || null };
      update(index, updatedData);
    }
  }, [fields, update]);

  // Memoize row data to prevent unnecessary re-renders
  const rowData = useMemo(() => fields, [fields]);

  const handleCancel = async () => {
    if (onRefetch) {
      try {
        setIsLoading(true);
        await onRefetch();
      } catch (error) {
        console.error('Error refetching data:', error);
        toast.error(t('modal.editForm.fetchError'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddDate = () => {
    append({
      id: crypto.randomUUID(),
      type: null,
      name: null,
      startDate: null,
      endDate: null
    });
  };

  const columnDefs: ColDef[] = useMemo(() => [
    {
      field: 'type',
      headerName: t('modal.editForm.dateType'),
      editable: true,
      flex: 1,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: Object.values(ConferenceDateType)
      },
      valueFormatter: (params) => {
        if (!params.value) return '';
        return params.value;
      },
      onCellValueChanged: (params) => {
        handleCellValueChanged(params, 'type');
      }
    },
    {
      field: 'name',
      headerName: t('modal.editForm.dateName'),
      editable: true,
      flex: 1,
      cellEditor: 'agTextCellEditor',
      cellEditorParams: {
        maxLength: 100
      },
      valueFormatter: (params) => {
        if (!params.value) return '';
        return params.value;
      },
      onCellValueChanged: (params) => {
        handleCellValueChanged(params, 'name');
      }
    },
    {
      field: 'startDate',
      headerName: t('modal.editForm.startDate'),
      editable: true,
      flex: 1,
      cellEditor: 'agDateCellEditor',
      cellEditorParams: {
        browserDatePicker: true
      },
      valueFormatter: (params) => {
        if (!params.value) return '';
        return dayjs(params.value).format('YYYY-MM-DD');
      },
      valueParser: (params) => {
        if (!params.newValue) return null;
        return dayjs(params.newValue).format('YYYY-MM-DD');
      },
      onCellValueChanged: (params) => {
        handleCellValueChanged(params, 'startDate');
      }
    },
    {
      field: 'endDate',
      headerName: t('modal.editForm.endDate'),
      editable: true,
      flex: 1,
      cellEditor: 'agDateCellEditor',
      cellEditorParams: {
        browserDatePicker: true
      },
      valueFormatter: (params) => {
        if (!params.value) return '';
        return dayjs(params.value).format('YYYY-MM-DD');
      },
      valueParser: (params) => {
        if (!params.newValue) return null;
        return dayjs(params.newValue).format('YYYY-MM-DD');
      },
      onCellValueChanged: (params) => {
        handleCellValueChanged(params, 'endDate');
      }
    },
    {
      headerName: t('modal.editForm.remove'),
      width: 100,
      cellRenderer: (params: ICellRendererParams) => {
        const index = fields.findIndex(field => field.id === params.data.id);
        if (index === -1) return null;
        return (
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-600 hover:text-red-900"
          >
            {t('modal.editForm.remove')}
          </button>
        );
      },
    },
  ], [t, fields, remove, handleCellValueChanged]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">{t('modal.editForm.dates')}</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-5  rounded hover:bg-gray-10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('modal.editForm.loading') : t('modal.editForm.cancel')}
          </button>
          <button
            type="button"
            onClick={handleAddDate}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('modal.editForm.addDate')}
          </button>
        </div>
      </div>
      <div className="ag-theme-alpine w-full" style={{ height: 400 }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          animateRows={false}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[20, 50, 100]}
          suppressScrollOnNewData={true}
          maintainColumnOrder={true}
          suppressColumnMoveAnimation={true}
          getRowId={(params) => params.data.id}
        />
      </div>
    </div>
  );
} 