// src/hooks/crawl/useConferenceTableManager.ts
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ConferenceAnalysisDetail, // Đảm bảo interface này đã có crawlType
  LogAnalysisResult,
  DataQualityInsight
} from '@/src/models/logAnalysis';
import { saveConferenceToJson } from '../../app/api/logAnalysis/saveConferences';
import { ConferenceForAction } from '@/src/models/logAnalysis/importConferenceCrawl';
import { useConferenceCrawl, ApiModels } from './useConferenceCrawl';
import { persistConferenceSaveStatus, PersistSaveStatusPayload } from '../../app/api/logAnalysis/persistSaveStatus'; // Điều chỉnh path



export type SortableColumn =
  | 'title'
  | 'acronym'
  | 'status'
  | 'durationSeconds'
  | 'errorCount'
  | 'dataQualityInsightCount'
  | 'requestId'
  | 'crawlType'; // <--- THÊM crawlType VÀO ĐÂY
export type SortDirection = 'asc' | 'desc';
export type MainSavingStatus = 'idle' | 'saving' | 'success' | 'error';
export type RowSaveStatus = 'idle' | 'success' | 'error';


export interface ConferenceTableData extends Omit<ConferenceAnalysisDetail, 'dataQualityInsights' | 'steps' | 'errors'> {
  // Lấy trực tiếp từ ConferenceAnalysisDetail
  crawlType: 'crawl' | 'update'; // <--- LẤY TỪ ConferenceAnalysisDetail
  steps: ConferenceAnalysisDetail['steps']; // Giữ lại steps để hiển thị
  errors: ConferenceAnalysisDetail['errors']; // Giữ lại errors để hiển thị

  persistedSaveStatus?: 'SAVED_TO_DATABASE' | string; // Thêm từ ConferenceAnalysisDetail
  persistedSaveTimestamp?: string; // Thêm từ ConferenceAnalysisDetail

  uniqueRowId: string;
  title: string;
  acronym: string;
  requestId: string;
  errorCount: number;
  dataQualityInsights?: DataQualityInsight[];
  dataQualityInsightCount: number;
  hasSignificantDataQualityIssues: boolean;
  link?: string;
  cfpLink?: string;
  impLink?: string;
}

export interface UseConferenceTableManagerProps {
  logAnalysisResult: LogAnalysisResult | null | undefined;
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
    startCrawlItems, // This function now expects ConferenceForAction[]
  } = useConferenceCrawl();

  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false); // Renamed for clarity
  // State to hold items prepared for re-processing, including their chosen action type
  const [itemsToProcessWithAction, setItemsToProcessWithAction] = useState<ConferenceForAction[]>([]);

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

      const insightsArray = data.dataQualityInsights || [];
      const insightCount = insightsArray.length;
      const hasSignificantIssues = insightsArray.some(
        insight => insight.insightType === 'ValidationWarning' && (insight.severity === 'High' || insight.severity === 'Medium')
      );

      // Lấy link từ finalResult nếu có, fallback về finalResultPreview
      const mainLink = data.finalResult?.mainLink || data.finalResult?.link || data.finalResultPreview?.mainLink || data.finalResultPreview?.link;
      const cfpLinkVal = data.finalResult?.cfpLink || data.finalResultPreview?.cfpLink;
      const impLinkVal = data.finalResult?.impLink || data.finalResultPreview?.impLink;


      return {
        ...data, // Bao gồm persistedSaveStatus, persistedSaveTimestamp từ ConferenceAnalysisDetail
        uniqueRowId,
        title: data.title || confKey.split(' - ')[1] || confKey,
        acronym: data.acronym || confKey.split(' - ')[0] || '',
        requestId: entryRequestId,
        errorCount: data.errors?.length || 0,
        dataQualityInsights: insightsArray, // Giữ lại để truyền cho row
        dataQualityInsightCount: insightCount,
        hasSignificantDataQualityIssues: hasSignificantIssues,
        link: mainLink, // Gán link đã lấy được
        cfpLink: cfpLinkVal,
        impLink: impLinkVal,
        // steps và errors sẽ được bao gồm từ ...data
      };
    });
  }, [logAnalysisResult]);

  useEffect(() => {
    setSelectedRows({});
    setMainSaveStatus('idle');
    setRowSaveStatus({});
    setRowSaveErrors({});
    setExpandedRow(null);
    setSearchQuery('');
  }, [logAnalysisResult]);



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
        case 'crawlType': // If added as a sortable column
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        case 'durationSeconds':
        case 'errorCount':
        case 'dataQualityInsightCount':
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
      // THAY ĐỔI Ở ĐÂY:
      if (conf.dataQualityInsightCount > 0) {
        newSelection[conf.uniqueRowId] = true;
      }
    });
    setSelectedRows(newSelection);
  }, [sortedData]);

  const handleSelectWithoutWarningsOrErrors = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    sortedData.forEach(conf => {
      // THAY ĐỔI Ở ĐÂY:
      if (conf.errorCount === 0 && conf.dataQualityInsightCount === 0) {
        newSelection[conf.uniqueRowId] = true;
      }
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
      conf => conf.errorCount > 0 || conf.hasSignificantDataQualityIssues
    );
  }, [selectedRowIds, selectedRows, conferenceDataArray]);

  const isSaveEnabled = useMemo(() => {
    if (selectedRowIds.length === 0 || mainSaveStatus === 'saving') {
      return false;
    }
    // Kiểm tra xem có item nào được chọn đã được lưu bền vững chưa
    const selectedConfs = conferenceDataArray.filter(conf => selectedRows[conf.uniqueRowId]);
    const anySelectedAlreadyPersisted = selectedConfs.some(conf => conf.persistedSaveStatus === 'SAVED_TO_DATABASE');

    // Chỉ enable nếu không có lỗi/warning VÀ chưa có item nào được chọn đã được lưu bền vững
    // HOẶC bạn có thể cho phép lưu lại, tùy theo logic nghiệp vụ
    return !isSelectedWithProblem && !anySelectedAlreadyPersisted;

  }, [selectedRowIds.length, isSelectedWithProblem, mainSaveStatus, selectedRows, conferenceDataArray]);

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

    // Mảng để lưu trữ các promise gọi API persist status
    const persistStatusPromises: Promise<any>[] = [];

    const results = await Promise.allSettled(
      itemsToSave.map(conf =>
        saveConferenceToJson(
          conf.acronym,
          conf.title,
          conf.finalResultPreview || conf.finalResult
        ).then(dbSaveResult => ({ // Trả về cả conf và kết quả để dùng sau
          conf,
          dbSaveResult
        }))
      )
    );

    const finalRowStatusUpdate: Record<string, RowSaveStatus> = {};
    const finalRowErrorsUpdate: Record<string, string> = {};
    let overallSuccess = true;

    results.forEach(settledResult => {
      if (settledResult.status === 'fulfilled') {
        const { conf, dbSaveResult } = settledResult.value; // Lấy conf và dbSaveResult
        const rowId = conf.uniqueRowId;

        if (dbSaveResult.success) {
          finalRowStatusUpdate[rowId] = 'success';

          // GỌI API ĐỂ LƯU STATUS BỀN VỮNG
          const persistPayload: PersistSaveStatusPayload = {
            batchRequestId: conf.requestId, // Đảm bảo requestId là batchRequestId
            acronym: conf.acronym,
            title: conf.title,
            status: 'SAVED_TO_DATABASE',
            clientTimestamp: new Date().toISOString(),
          };
          // Không await ở đây để không block vòng lặp, nhưng thu thập promise
          const persistPromise = persistConferenceSaveStatus(persistPayload)
            .then(persistResult => {
              if (!persistResult.success) {
                console.warn(`Failed to persist save status for ${conf.acronym}: ${persistResult.message}`);
                // Quyết định: có nên đánh dấu lỗi ở đây không?
                // Hiện tại, chỉ log warning, vì việc lưu vào DB đã thành công.
              } else {
                console.log(`Successfully persisted save status for ${conf.acronym}`);
              }
            });
          persistStatusPromises.push(persistPromise);

        } else {
          overallSuccess = false;
          finalRowStatusUpdate[rowId] = 'error';
          finalRowErrorsUpdate[rowId] = dbSaveResult.message || 'Save failed (unknown reason).';
        }
      } else { // Promise rejected (từ saveConferenceToJson, dù hàm này được thiết kế để luôn resolve)
        overallSuccess = false;
        // Cần xác định item nào gây lỗi nếu cấu trúc settledResult không cung cấp trực tiếp
        // Giả sử lỗi này không nên xảy ra nếu saveConferenceToJson luôn resolve
        console.error("Unexpected rejection in saveConferenceToJson promise:", settledResult.reason);
        // Cần một cách để map settledResult.reason về item cụ thể nếu cần
      }
    });

    setRowSaveStatus(prev => ({ ...prev, ...finalRowStatusUpdate }));
    setRowSaveErrors(prev => ({ ...prev, ...finalRowErrorsUpdate }));
    setMainSaveStatus(overallSuccess ? 'success' : 'error');

    if (overallSuccess) {
      handleDeselectAll();
    }

    // Đợi tất cả các lệnh persist status hoàn thành (không bắt buộc phải block UI)
    Promise.all(persistStatusPromises).then(() => {
      console.log("All persist save status calls have completed.");
    }).catch(err => {
      console.error("Error during persisting save statuses:", err);
    });
  };


  const handleProcessAgainClick = useCallback(() => {
    if (selectedRowIds.length === 0) {
      alert("No items selected to re-process.");
      return;
    }
    const itemsForModal: ConferenceForAction[] = conferenceDataArray
      .filter(conf => selectedRows[conf.uniqueRowId])
      .map(conf => ({
        id: conf.uniqueRowId,
        Title: conf.title,
        Acronym: conf.acronym,
        // Lấy crawlType hiện tại từ bảng làm mặc định cho modal
        // Hoặc bạn có thể để modal tự quyết định mặc định
        crawlType: conf.crawlType, // <--- Sử dụng crawlType hiện tại
        link: conf.link,
        cfpLink: conf.cfpLink,
        impLink: conf.impLink,
        originalRequestId: conf.requestId
      }));

    if (itemsForModal.length > 0) {
      setItemsToProcessWithAction(itemsForModal);
      setIsProcessModalOpen(true);
    }
  }, [selectedRowIds, conferenceDataArray, selectedRows]);

  // This function will be called by the modal after user selects action type and models
  const handleConfirmProcessWithActionAndModels = useCallback(async (
    processedItemsFromModal: ConferenceForAction[], // Items with crawlType set by modal
    selectedModels: ApiModels
  ) => {
    if (processedItemsFromModal.length > 0) {
      // `startCrawlItems` expects ConferenceForAction[] where crawlType determines the payload
      await startCrawlItems(processedItemsFromModal, selectedModels);
    }
    setIsProcessModalOpen(false);
    setItemsToProcessWithAction([]); // Clear the items
  }, [startCrawlItems]);


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
    onSelectWithoutWarningsOrErrors: handleSelectWithoutWarningsOrErrors,
    handleDeselectAll,
    expandedRow,
    toggleExpand,
    mainSaveStatus,
    isSaveEnabled,
    handleBulkSave,
    rowSaveStatus,
    rowSaveErrors,
    handleProcessAgainClick, // Renamed
    searchQuery,
    setSearchQuery,
    isProcessModalOpen, // Renamed
    setIsProcessModalOpen, // Renamed
    // Renamed for clarity, this now expects ConferenceForAction[] from the modal
    handleConfirmProcessWithActionAndModels,
    // itemsToProcessCount can be derived from itemsToProcessWithAction.length in the component
    itemsToProcessFromTable: itemsToProcessWithAction, // Pass the items to the modal
  };
};