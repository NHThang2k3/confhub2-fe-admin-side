'use client';

import { useTranslations } from 'next-intl';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ColDef, GridReadyEvent, ICellRendererParams, ModuleRegistry, IRowNode, RowSelectionModule } from 'ag-grid-community';
import { useCallback, useEffect, useRef, useState } from 'react';
ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

interface TopicsTableProps {
  topics: string[];
  onTopicsChange: (newTopics: string[]) => void;
  disabled?: boolean;
}

interface TopicRow {
  topic: string;
}

export default function TopicsTable({ topics, onTopicsChange, disabled = false }: TopicsTableProps) {
  const t = useTranslations('conferencesPage');
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<TopicRow[]>([]);

  // Update rowData when topics prop changes
  useEffect(() => {
    if (topics) {
      const newRowData = topics.length > 0 
        ? topics.map(topic => ({ topic }))
        : [{ topic: '' }];
      setRowData(newRowData);
    }
  }, [topics]);

  const columnDefs: ColDef[] = [
    {
      field: 'topic',
      headerName: t('modal.editForm.topicPlaceholder'),
      editable: true,
      flex: 1,
    },
    {
      headerName: t('modal.editForm.remove'),
      width: 100,
      cellRenderer: (params: ICellRendererParams) => {
        const rowIndex = params.node?.rowIndex ?? 0;
        return (
          <button
            onClick={() => handleRemoveTopic(rowIndex)}
            className="text-red-600 hover:text-red-900"
          >
            {t('modal.editForm.remove')}
          </button>
        );
      },
    },
  ];

  const handleRemoveTopic = (index: number) => {
    const newRowData = rowData.filter((_, i) => i !== index);
    setRowData(newRowData);
    onTopicsChange(newRowData.map(row => row.topic));
  };

  const handleAddTopic = () => {
    const newRowData = [...rowData, { topic: '' }];
    setRowData(newRowData);
    onTopicsChange(newRowData.map(row => row.topic));
  };

  const onCellValueChanged = useCallback(() => {
    if (gridRef.current?.api) {
      const newTopics = gridRef.current.api
        .getRenderedNodes()
        .map((node: IRowNode) => (node.data as TopicRow).topic)
        .filter(topic => topic.trim() !== ''); // Filter out empty topics
      onTopicsChange(newTopics);
    }
  }, [onTopicsChange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">{t('modal.editForm.topics')}</label>
        {!disabled && (
          <button
            type="button"
            onClick={handleAddTopic}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('modal.editForm.addTopic')}
          </button>
        )}
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
          animateRows={false}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          pagination={true}
          paginationPageSize={10}
          suppressScrollOnNewData={true}
          maintainColumnOrder={true}
          suppressColumnMoveAnimation={true}
        />
      </div>
    </div>
  );
} 