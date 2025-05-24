'use client';

import { useTranslations } from 'next-intl';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ColDef, GridReadyEvent, ICellRendererParams, ModuleRegistry, IRowNode, RowSelectionModule } from 'ag-grid-community';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fromString } from 'any-date-parser';
ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

interface ConferenceDate {
  type?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
}

interface DatesTableProps {
  dates: ConferenceDate[];
  onDatesChange: (newDates: ConferenceDate[]) => void;
  onRefetch?: () => Promise<void>;
}

interface DateRow extends ConferenceDate {}

export default function DatesTable({ dates, onDatesChange, onRefetch }: DatesTableProps) {
  const t = useTranslations('conferencesPage');
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<DateRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Update rowData when dates prop changes
  useEffect(() => {
    if (dates) {
      const newRowData = dates.length > 0 
        ? dates.map(date => ({ ...date }))
        : [{ type: '', name: '', startDate: '', endDate: '' }];
      setRowData(newRowData);
    }
  }, [dates]);

  const handleCancel = async () => {
    if (onRefetch) {
      try {
        setIsLoading(true);
        await onRefetch();
      } catch (error) {
        console.error('Error refetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const columnDefs: ColDef[] = [
    {
      field: 'type',
      headerName: t('modal.editForm.dateType'),
      editable: true,
      flex: 1,
    },
    {
      field: 'name',
      headerName: t('modal.editForm.dateName'),
      editable: true,
      flex: 1,
    },
    {
      field: 'startDate',
      headerName: t('modal.editForm.startDate'),
      editable: true,
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      },
      valueParser: (params) => {
        if (!params.newValue) return '';
        try {
          const parsedDate = fromString(params.newValue);
          if (parsedDate) {
            return parsedDate.toISOString();
          }
        } catch (error) {
          console.error('Error parsing date:', error);
        }
        return params.newValue;
      }
    },
    {
      field: 'endDate',
      headerName: t('modal.editForm.endDate'),
      editable: true,
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      },
      valueParser: (params) => {
        if (!params.newValue) return '';
        try {
          const parsedDate = fromString(params.newValue);
          if (parsedDate) {
            return parsedDate.toISOString();
          }
        } catch (error) {
          console.error('Error parsing date:', error);
        }
        return params.newValue;
      }
    },
    {
      headerName: t('modal.editForm.remove'),
      width: 100,
      cellRenderer: (params: ICellRendererParams) => {
        const rowIndex = params.node?.rowIndex ?? 0;
        return (
          <button
            onClick={() => handleRemoveDate(rowIndex)}
            className="text-red-600 hover:text-red-900"
          >
            {t('modal.editForm.remove')}
          </button>
        );
      },
    },
  ];

  const handleRemoveDate = (index: number) => {
    const newRowData = rowData.filter((_, i) => i !== index);
    setRowData(newRowData);
    onDatesChange(newRowData);
  };

  const handleAddDate = () => {
    const newRowData = [...rowData, { type: '', name: '', startDate: '', endDate: '' }];
    setRowData(newRowData);
    onDatesChange(newRowData);
  };

  const onCellValueChanged = useCallback(() => {
    if (gridRef.current?.api) {
      const newDates = gridRef.current.api
        .getRenderedNodes()
        .map((node: IRowNode) => node.data as DateRow)
        .filter(date => date.type?.trim() !== '' || date.name?.trim() !== '' || 
                        date.startDate?.trim() !== '' || date.endDate?.trim() !== '');
      onDatesChange(newDates);
    }
  }, [onDatesChange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">{t('modal.editForm.dates')}</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
          onCellValueChanged={onCellValueChanged}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          animateRows={true}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </div>
  );
} 