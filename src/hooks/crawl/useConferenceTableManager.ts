// src/hooks/crawl/useConferenceTableManager.ts
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ConferenceAnalysisDetail,
  LogAnalysisResult
} from '@/src/models/logAnalysis/logAnalysis';
import { saveConferenceToJson } from '../../app/api/logAnalysis/saveConferences';
import { useConferenceCrawl, ApiModels } from './useConferenceCrawl'; // Import ApiModels
import { SendToCrawlConference } from '@/src/models/logAnalysis/importConferenceCrawl';

export type SortableColumn =
  | 'title'
  | 'acronym'
  | 'status'
  | 'durationSeconds'
  | 'errorCount'
  | 'validationWarningCount'
  | 'requestId';
export type SortDirection = 'asc' | 'desc';
export type MainSavingStatus = 'idle' | 'saving' | 'success' | 'error';
export type RowSaveStatus = 'idle' | 'success' | 'error';


export interface ConferenceTableData extends ConferenceAnalysisDetail {
  uniqueRowId: string;
  title: string;
  acronym: string;
  requestId: string;
  errorCount: number;
  validationWarningCount: number;
  hasValidationWarnings: boolean;
  validationWarnings?: ConferenceAnalysisDetail['validationIssues'];
}

export interface UseConferenceTableManagerProps {
  logAnalysisResult: LogAnalysisResult | null | undefined;
  // To pass the shared crawl functionality and model selection
  // Alternatively, useConferenceCrawl can be instantiated directly inside useConferenceTableManager
  // For simplicity, let's assume it's available (e.g. via context or direct instantiation)
}



export const useConferenceTableManager = ({
  logAnalysisResult
}: UseConferenceTableManagerProps) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortColumn, setSortColumn] =
    useState<SortableColumn | null>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [mainSaveStatus, setMainSaveStatus] =
    useState<MainSavingStatus>('idle');
  const [rowSaveStatus, setRowSaveStatus] = useState<
    Record<string, RowSaveStatus>
  >({});
  const [rowSaveErrors, setRowSaveErrors] = useState<Record<string, string>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState('');

  const {
    startCrawlItems,
    // apiModels: globalApiModels, // If you had a global default for the 3 API models
  } = useConferenceCrawl();


  const [isCrawlModelModalOpen, setIsCrawlModelModalOpen] = useState(false);
  const [itemsToCrawlWithSelectedModel, setItemsToCrawlWithSelectedModel] = useState<SendToCrawlConference[]>([]);

  const conferenceDataArray: ConferenceTableData[] = useMemo(() => {
    if (!logAnalysisResult?.conferenceAnalysis) return [];

    const { conferenceAnalysis, filterRequestId, analyzedRequestIds } =
      logAnalysisResult;

    return Object.entries(conferenceAnalysis).map(([confKey, data]) => {
      const entryRequestId =
        data.batchRequestId ||
        filterRequestId ||
        (analyzedRequestIds?.length === 1 ? analyzedRequestIds[0] : 'N/A');
      const uniqueRowId = `${confKey}_${entryRequestId}`;

      const validationIssuesArray = data.validationIssues || [];
      const validationWarningCount = validationIssuesArray.length;
      const hasValidationWarnings = validationWarningCount > 0;

      return {
        ...data,
        uniqueRowId,
        title: data.title || confKey.split(' - ')[1] || confKey,
        acronym: data.acronym || confKey.split(' - ')[0] || '',
        requestId: entryRequestId,
        errorCount: data.errors?.length || 0,
        validationWarningCount,
        hasValidationWarnings,
        validationWarnings: validationIssuesArray
      };
    });
  }, [logAnalysisResult]);

  useEffect(() => {
    const initialStatus: Record<string, RowSaveStatus> = {};
    conferenceDataArray.forEach(conf => {
      initialStatus[conf.uniqueRowId] = 'idle';
    });
    setRowSaveStatus(initialStatus);
    setRowSaveErrors({});
    setSelectedRows({});
    setMainSaveStatus('idle');
    setExpandedRow(null);
    setSearchQuery('');
  }, [conferenceDataArray]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return conferenceDataArray;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return conferenceDataArray.filter(
      conf =>
        conf.title.toLowerCase().includes(lowercasedQuery) ||
        conf.acronym.toLowerCase().includes(lowercasedQuery) ||
        (conf.status && conf.status.toLowerCase().includes(lowercasedQuery))
    );
  }, [conferenceDataArray, searchQuery]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];
      const handleNull = (val: any) => val === null || val === undefined;
      if (handleNull(aValue) && handleNull(bValue)) return 0;
      if (handleNull(aValue)) return sortDirection === 'asc' ? 1 : -1;
      if (handleNull(bValue)) return sortDirection === 'asc' ? -1 : 1;

      switch (sortColumn) {
        case 'acronym':
        case 'title':
        case 'status':
        case 'requestId':
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        case 'durationSeconds':
        case 'errorCount':
        case 'validationWarningCount':
          aValue = Number(aValue);
          bValue = Number(bValue);
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        default:
          return 0;
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  const handleSort = useCallback(
    (column: SortableColumn) => {
      if (sortColumn === column) {
        setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
    },
    [sortColumn]
  );

  const selectedRowIds = useMemo(() => {
    return Object.entries(selectedRows)
      .filter(([, isSelected]) => isSelected)
      .map(([uniqueRowId]) => uniqueRowId);
  }, [selectedRows]);

  const handleRowSelectToggle = useCallback((uniqueRowId: string) => {
    setSelectedRows(prev => ({ ...prev, [uniqueRowId]: !prev[uniqueRowId] }));
  }, []);

  const handleSelectAll = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    sortedData.forEach(conf => {
      newSelection[conf.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [sortedData]);

  const handleDeselectAll = useCallback(() => setSelectedRows({}), []);

  const handleSelectNoError = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    sortedData.forEach(conf => { 
      if (conf.errorCount === 0) newSelection[conf.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [sortedData]);

  const handleSelectError = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    sortedData.forEach(conf => {
      if (conf.errorCount > 0) newSelection[conf.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [sortedData]);

  const handleSelectWarning = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    sortedData.forEach(conf => {
      if (conf.hasValidationWarnings) newSelection[conf.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [sortedData]);

  const handleSelectNoWarning = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    sortedData.forEach(conf => {
      if (!conf.hasValidationWarnings) newSelection[conf.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [sortedData]);

  const toggleExpand = useCallback((uniqueRowId: string) => {
    setExpandedRow(prev => (prev === uniqueRowId ? null : uniqueRowId));
  }, []);

  const isSelectedWithProblem = useMemo(() => {
    if (selectedRowIds.length === 0) return false;
    const selectedOriginalData = conferenceDataArray.filter(
      conf => selectedRows[conf.uniqueRowId]
    );
    return selectedOriginalData.some(
      conf => conf.errorCount > 0 || conf.hasValidationWarnings
    );
  }, [selectedRowIds, selectedRows, conferenceDataArray]);

  const isSaveEnabled = useMemo(() => {
    return (
      selectedRowIds.length > 0 &&
      !isSelectedWithProblem &&
      mainSaveStatus !== 'saving'
    );
  }, [selectedRowIds.length, isSelectedWithProblem, mainSaveStatus]);

  useEffect(() => {
    if (mainSaveStatus === 'error' || mainSaveStatus === 'success') {
      // Optional: setTimeout(() => setMainSaveStatus('idle'), 3000);
    }
  }, [mainSaveStatus]);

  const handleBulkSave = async () => {
    if (!isSaveEnabled) return;
    setMainSaveStatus('saving');
    const nextRowStatus = { ...rowSaveStatus };
    const nextRowErrors = { ...rowSaveErrors };
    selectedRowIds.forEach(id => {
      nextRowStatus[id] = 'idle';
      delete nextRowErrors[id];
    });
    setRowSaveStatus(nextRowStatus);
    setRowSaveErrors(nextRowErrors);

    const itemsToSave = conferenceDataArray.filter(
      conf => selectedRows[conf.uniqueRowId]
    );

    const savePromises = itemsToSave.map(conf =>
      saveConferenceToJson(
        conf.acronym,
        conf.title,
        conf.finalResultPreview || conf.finalResult
      )
    );

    const results = await Promise.allSettled(savePromises);
    const finalRowStatusUpdate: Record<string, RowSaveStatus> = {};
    const finalRowErrorsUpdate: Record<string, string> = {};
    let overallSuccess = true;

    results.forEach((settledResult, index) => {
      const item = itemsToSave[index];
      const rowId = item.uniqueRowId;

      if (settledResult.status === 'fulfilled') {
        const apiResult = settledResult.value;
        if (apiResult.success) {
          finalRowStatusUpdate[rowId] = 'success';
        } else {
          overallSuccess = false;
          finalRowStatusUpdate[rowId] = 'error';
          finalRowErrorsUpdate[rowId] =
            apiResult.message || 'Save failed (unknown reason).';
        }
      } else {
        overallSuccess = false;
        finalRowStatusUpdate[rowId] = 'error';
        finalRowErrorsUpdate[rowId] =
          (settledResult.reason as Error)?.message ||
          'Promise rejected unexpectedly.';
      }
    });

    setRowSaveStatus(prev => ({ ...prev, ...finalRowStatusUpdate }));
    setRowSaveErrors(prev => ({ ...prev, ...finalRowErrorsUpdate }));
    setMainSaveStatus(overallSuccess ? 'success' : 'error');
    if (overallSuccess) {
      handleDeselectAll();
    }
  };


  const handleCrawlAgainClick = useCallback(() => {
    if (selectedRowIds.length === 0) {
      alert("No items selected to re-crawl.");
      return;
    }
    const itemsToReCrawl: SendToCrawlConference[] = conferenceDataArray
      .filter(conf => selectedRows[conf.uniqueRowId])
      .map(conf => ({
        Title: conf.title,
        Acronym: conf.acronym,
        originalRequestId: conf.requestId
      }));

    if (itemsToReCrawl.length > 0) {
      setItemsToCrawlWithSelectedModel(itemsToReCrawl);
      setIsCrawlModelModalOpen(true);
    }
  }, [selectedRowIds, conferenceDataArray, selectedRows]);

  // Updated to accept ApiModels
  const handleConfirmCrawlWithModels = useCallback(async (selectedModels: ApiModels) => {
    if (itemsToCrawlWithSelectedModel.length > 0) {
      const modelDesc = `DL:${selectedModels.determineLinks}, EI:${selectedModels.extractInfo}, EC:${selectedModels.extractCfp}`;
      console.log(`Triggering crawl again for ${itemsToCrawlWithSelectedModel.length} item(s) using models ${modelDesc}:`, itemsToCrawlWithSelectedModel);
      await startCrawlItems(itemsToCrawlWithSelectedModel, selectedModels);
      // Resetting state after crawl is optional and depends on desired UX
      // setItemsToCrawlWithSelectedModel([]);
      // handleDeselectAll(); 
    }
    setIsCrawlModelModalOpen(false);
  }, [itemsToCrawlWithSelectedModel, startCrawlItems /*, handleDeselectAll */]);


  return {
    sortedData,
    sortColumn,
    sortDirection,
    handleSort,
    selectedRows,
    selectedRowIds,
    handleRowSelectToggle,
    handleSelectAll,
    handleSelectNoError,
    handleSelectError,
    handleSelectWarning,
    handleSelectNoWarning,
    handleDeselectAll,
    expandedRow,
    toggleExpand,
    mainSaveStatus,
    isSaveEnabled,
    handleBulkSave,
    rowSaveStatus,
    rowSaveErrors,
    handleCrawlAgainClick,
    searchQuery,
    setSearchQuery,
    isCrawlModelModalOpen,
    setIsCrawlModelModalOpen,
    handleConfirmCrawlWithModels, // Renamed for clarity
    itemsToCrawlCount: itemsToCrawlWithSelectedModel.length,
    // globalCrawlModelForModal is removed as model selection is now more complex
  };
};