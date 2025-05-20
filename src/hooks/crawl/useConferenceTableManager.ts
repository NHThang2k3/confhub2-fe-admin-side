// src/hooks/crawl/useConferenceTableManager.ts
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ConferenceAnalysisDetail,
  LogAnalysisResult
} from '@/src/models/logAnalysis/logAnalysis'; // Adjust path
import { saveConferenceToJson } from '../../app/api/logAnalysis/saveConferences'; // Adjust path
import { useConferenceCrawl, CrawlModelType } from './useConferenceCrawl'; // Import the crawl hook
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
  const [searchQuery, setSearchQuery] = useState(''); // --- NEW: Search query state ---

  // ++ Instantiate useConferenceCrawl
  const {
    startCrawlItems, // Hàm này sẽ nhận model làm tham số
    crawlModel: globalCrawlModel, // Model đang được chọn ở global/CSV crawl context
    // isCrawling, // Có thể dùng để disable nút "Crawl Again" nếu đang có crawl khác chạy
  } = useConferenceCrawl();


  // ++ NEW STATE for modal
  const [isCrawlModelModalOpen, setIsCrawlModelModalOpen] = useState(false);
  const [itemsToCrawlWithSelectedModel, setItemsToCrawlWithSelectedModel] = useState<SendToCrawlConference[]>([]);


  const conferenceDataArray: ConferenceTableData[] = useMemo(() => {
    if (!logAnalysisResult?.conferenceAnalysis) return [];

    const { conferenceAnalysis, filterRequestId, analyzedRequestIds } =
      logAnalysisResult;

    return Object.entries(conferenceAnalysis).map(([confKey, data]) => {
      const entryRequestId =
        data.requestId ||
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
    setSearchQuery(''); // --- NEW: Reset search query when data changes ---
  }, [conferenceDataArray]);

  // --- NEW: Filtered data based on search query ---
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
    if (!sortColumn) return filteredData; // --- MODIFIED: Use filteredData ---
    return [...filteredData].sort((a, b) => { // --- MODIFIED: Use filteredData ---
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
  }, [filteredData, sortColumn, sortDirection]); // --- MODIFIED: Depend on filteredData ---

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

  // Important: Selection handlers should operate on the currently visible (filtered and sorted) data
  // or on the complete dataset if that's the desired behavior.
  // Current implementation of handleSelectAll etc. uses `sortedData`, which is now filtered.
  // This means "Select All" will select all *filtered* items. This is usually the expected behavior.

  const handleSelectAll = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    sortedData.forEach(conf => { // sortedData is already filtered
      newSelection[conf.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [sortedData]);

  const handleDeselectAll = useCallback(() => setSelectedRows({}), []);

  const handleSelectNoError = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    sortedData.forEach(conf => { // sortedData is already filtered
      if (conf.errorCount === 0) newSelection[conf.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [sortedData]);

  const handleSelectError = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    sortedData.forEach(conf => { // sortedData is already filtered
      if (conf.errorCount > 0) newSelection[conf.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [sortedData]);

  const handleSelectWarning = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    sortedData.forEach(conf => { // sortedData is already filtered
      if (conf.hasValidationWarnings) newSelection[conf.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [sortedData]);

  const handleSelectNoWarning = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    sortedData.forEach(conf => { // sortedData is already filtered
      if (!conf.hasValidationWarnings) newSelection[conf.uniqueRowId] = true;
    });
    setSelectedRows(newSelection);
  }, [sortedData]);

  const toggleExpand = useCallback((uniqueRowId: string) => {
    setExpandedRow(prev => (prev === uniqueRowId ? null : uniqueRowId));
  }, []);

  const isSelectedWithProblem = useMemo(() => {
    if (selectedRowIds.length === 0) return false;
    // Check against the original conferenceDataArray or filteredData based on your needs for this logic.
    // Here, we check against the master list (conferenceDataArray) to find the selected items' original data.
    const selectedOriginalData = conferenceDataArray.filter(
      conf => selectedRows[conf.uniqueRowId]
    );
    return selectedOriginalData.some(
      conf => conf.errorCount > 0 || conf.hasValidationWarnings
    );
  }, [selectedRowIds, selectedRows, conferenceDataArray]); // Use conferenceDataArray for truth

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

    // Items to save should be from the master list, identified by selectedRowIds
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

  const handleCrawlAgainClick = useCallback(() => { // Đổi tên hàm để rõ ràng hơn là click
    if (selectedRowIds.length === 0) {
      alert("No items selected to re-crawl.");
      return;
    }

    const itemsToReCrawl: SendToCrawlConference[] = conferenceDataArray
      .filter(conf => selectedRows[conf.uniqueRowId])
      .map(conf => ({
        Title: conf.title,
        Acronym: conf.acronym,
        originalRequestId: conf.requestId // Quan trọng!
      }));

    if (itemsToReCrawl.length > 0) {
      setItemsToCrawlWithSelectedModel(itemsToReCrawl);
      setIsCrawlModelModalOpen(true); // Mở modal
    }
  }, [selectedRowIds, conferenceDataArray, selectedRows]);

  const handleConfirmCrawlWithModel = useCallback(async (selectedModel: CrawlModelType) => {
    if (itemsToCrawlWithSelectedModel.length > 0) {
      console.log(`Triggering crawl again for ${itemsToCrawlWithSelectedModel.length} item(s) using ${selectedModel} model:`, itemsToCrawlWithSelectedModel);
      await startCrawlItems(itemsToCrawlWithSelectedModel, selectedModel); // Truyền model đã chọn
      // Reset state sau khi crawl (tùy chọn)
      // setItemsToCrawlWithSelectedModel([]);
      // handleDeselectAll(); // Có thể bỏ chọn các item đã crawl
    }
    setIsCrawlModelModalOpen(false); // Đóng modal
  }, [itemsToCrawlWithSelectedModel, startCrawlItems /*, handleDeselectAll */]);


  return {
    sortedData, // This is now filtered and sorted
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
    handleCrawlAgainClick, // ++ EXPOSE NEW HANDLER
    searchQuery, // --- NEW: Expose search query ---
    setSearchQuery,
    isCrawlModelModalOpen, // ++ EXPOSE MODAL STATE
    setIsCrawlModelModalOpen, // ++ EXPOSE MODAL SETTER
    handleConfirmCrawlWithModel, // ++ EXPOSE CONFIRM HANDLER
    itemsToCrawlCount: itemsToCrawlWithSelectedModel.length, // ++ EXPOSE COUNT FOR MODAL
    globalCrawlModelForModal: globalCrawlModel, // ++ EXPOSE GLOBAL MODEL FOR MODAL DEFAULT
  };
};