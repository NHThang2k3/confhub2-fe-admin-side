// src/hooks/crawl/useTableActions.ts

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ConferenceTableData,
  MainSavingStatus,
  RowSaveStatus
} from './useConferenceTableManager';
import { useConferenceCrawl } from './useConferenceCrawl';
import { ApiModels } from '@/src/models/logAnalysis/importConferenceCrawl';
import {
  saveConferencesToDB,
  ConferenceToSavePayload,
} from '@/src/app/api/logAnalysis/saveConferences';
import {
  persistBatchConferenceSaveStatus,
  persistSingleConferenceSaveStatus,
  PersistSaveStatusPayload,
} from '@/src/app/api/logAnalysis/persistSaveStatus';
import { ConferenceForAction } from '@/src/models/logAnalysis/importConferenceCrawl';

const USE_BATCH_PERSISTENCE = true;

interface UseTableActionsProps {
  selectedRowIds: string[];
  allConferenceData: ConferenceTableData[];
  resetDependencies?: any[];
}

export const useTableActions = ({
  selectedRowIds,
  allConferenceData,
  resetDependencies = []
}: UseTableActionsProps) => {
  const [mainSaveStatus, setMainSaveStatus] = useState<MainSavingStatus>('idle');
  const [rowSaveStatus, setRowSaveStatus] = useState<Record<string, RowSaveStatus>>({});
  const [rowSaveErrors, setRowSaveErrors] = useState<Record<string, string>>({});

  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [itemsToProcessWithAction, setItemsToProcessWithAction] = useState<ConferenceForAction[]>([]);

  const {
    processCrawlRequest,
    enableChunking,
    chunkSize,
    chunkDelay,
    recordFile,
  } = useConferenceCrawl();

  useEffect(() => {
    setMainSaveStatus('idle');
    setRowSaveStatus({});
    setRowSaveErrors({});
    setIsProcessModalOpen(false);
    setItemsToProcessWithAction([]);
  }, [...resetDependencies]);

  const isSelectedWithProblem = useMemo(() => {
    if (selectedRowIds.length === 0) return false;
    const selectedOriginalData = allConferenceData.filter(
      conf => selectedRowIds.includes(conf.uniqueRowId)
    );
    return selectedOriginalData.some(
      conf => conf.unrecoveredErrorCount > 0 || conf.hasSignificantDataQualityIssues
    );
  }, [selectedRowIds, allConferenceData]);

  // <<< THAY ĐỔI 1: Cập nhật logic isSaveEnabled >>>
  const isSaveEnabled = useMemo(() => {
    // Điều kiện cơ bản: phải có hàng được chọn và không đang trong quá trình lưu
    if (selectedRowIds.length === 0 || mainSaveStatus === 'saving') {
      return false;
    }

    const selectedConfs = allConferenceData.filter(conf => selectedRowIds.includes(conf.uniqueRowId));

    // Điều kiện 1: Không có hàng nào đã được lưu vào DB trước đó
    const anySelectedAlreadyPersisted = selectedConfs.some(conf => conf.persistedSaveStatus === 'SAVED_TO_DATABASE');
    
    // Điều kiện 2 (từ isSelectedWithProblem): Không có hàng nào có lỗi hoặc vấn đề chất lượng dữ liệu nghiêm trọng
    if (isSelectedWithProblem) {
      return false;
    }

    // Điều kiện 3 (MỚI): Tất cả các hàng được chọn phải có status là 'completed'
    const allSelectedAreCompleted = selectedConfs.every(conf => conf.status === 'completed');

    return !anySelectedAlreadyPersisted && allSelectedAreCompleted;

  }, [selectedRowIds, isSelectedWithProblem, mainSaveStatus, allConferenceData]);


  const handleBulkSave = useCallback(async (onSaveSuccess?: () => void) => {
    if (!isSaveEnabled) return;
    setMainSaveStatus('saving');
    const initialRowStatus: Record<string, RowSaveStatus> = {};
    selectedRowIds.forEach(id => {
      initialRowStatus[id] = 'idle';
    });
    setRowSaveStatus(initialRowStatus);
    setRowSaveErrors({});

    // <<< THAY ĐỔI 2: Thêm kiểm tra an toàn để chỉ lấy các hàng hợp lệ >>>
    // Lọc các hàng được chọn VÀ có status là 'completed'
    const conferencesToSave = allConferenceData.filter(
      conf => selectedRowIds.includes(conf.uniqueRowId) && conf.status === 'completed'
    );

    // Nếu sau khi lọc không còn hàng nào hợp lệ, hủy bỏ thao tác
    if (conferencesToSave.length === 0) {
      console.warn("Save operation aborted: No selected items meet the 'completed' status requirement.");
      setMainSaveStatus('idle');
      return;
    }

    const conferencePayloads: ConferenceToSavePayload[] = conferencesToSave.map(conf => ({
      acronym: conf.acronym,
      title: conf.title,
      extractedData: conf.finalResultPreview || conf.finalResult,
    }));

    const dbSaveBatchResult = await saveConferencesToDB(conferencePayloads);

    const finalRowStatusUpdate: Record<string, RowSaveStatus> = {};
    const finalRowErrorsUpdate: Record<string, string> = {};
    let overallSuccess = dbSaveBatchResult.overallSuccess;
    const successfullySavedItemsForPersistence: PersistSaveStatusPayload[] = [];

    dbSaveBatchResult.itemResults.forEach(itemResult => {
      const originalConf = conferencesToSave.find(
        c => c.acronym === itemResult.acronym && c.title === itemResult.title
      );
      if (!originalConf) {
        console.warn("Could not map DB save result back to a table row:", itemResult);
        return;
      }
      const rowId = originalConf.uniqueRowId;

      if (itemResult.success) {
        finalRowStatusUpdate[rowId] = 'success';
        successfullySavedItemsForPersistence.push({
          batchRequestId: originalConf.requestId,
          acronym: itemResult.acronym,
          title: itemResult.title,
          status: 'SAVED_TO_DATABASE',
          clientTimestamp: new Date().toISOString(),
        });
      } else {
        overallSuccess = false;
        finalRowStatusUpdate[rowId] = 'error';
        finalRowErrorsUpdate[rowId] = itemResult.message || 'Save failed (unknown reason).';
      }
    });

    setRowSaveStatus(prev => ({ ...prev, ...finalRowStatusUpdate }));
    setRowSaveErrors(prev => ({ ...prev, ...finalRowErrorsUpdate }));

    if (successfullySavedItemsForPersistence.length > 0) {
      console.log(`Attempting to persist status for ${successfullySavedItemsForPersistence.length} items.`);
      if (USE_BATCH_PERSISTENCE) {
        const persistBatchResult = await persistBatchConferenceSaveStatus(successfullySavedItemsForPersistence);
        if (!persistBatchResult.overallSuccess) {
          console.warn("Batch persistence of save statuses reported an overall failure:", persistBatchResult.overallMessage);
        }
        persistBatchResult.itemResults.forEach(itemPersistResult => {
          if (!itemPersistResult.success) {
            console.warn(`Failed to persist save status for ${itemPersistResult.acronym} - ${itemPersistResult.title}: ${itemPersistResult.message}`);
          } else {
            console.log(`Successfully persisted save status for ${itemPersistResult.acronym} - ${itemPersistResult.title}`);
          }
        });
      } else {
        console.log("Using single persistence calls as fallback.");
        const persistPromises = successfullySavedItemsForPersistence.map(payload =>
          persistSingleConferenceSaveStatus(payload).then(result => {
            if (!result.success) {
              console.warn(`Failed to persist save status for ${result.acronym}: ${result.message}`);
            } else {
              console.log(`Successfully persisted save status for ${result.acronym}`);
            }
          })
        );
        await Promise.allSettled(persistPromises);
      }
    }

    const allItemsSucceeded = dbSaveBatchResult.itemResults.every(item => item.success);
    setMainSaveStatus(dbSaveBatchResult.overallSuccess && allItemsSucceeded ? 'success' : 'error');

    if (dbSaveBatchResult.overallSuccess && allItemsSucceeded && onSaveSuccess) {
      onSaveSuccess();
    }

  }, [isSaveEnabled, selectedRowIds, allConferenceData]);


  const handleProcessAgainClick = useCallback(() => {
    if (selectedRowIds.length === 0) {
      alert("No items selected to re-process.");
      return;
    }
    const itemsForModal: ConferenceForAction[] = allConferenceData
      .filter(conf => selectedRowIds.includes(conf.uniqueRowId))
      .map(conf => ({
        id: conf.uniqueRowId,
        Title: conf.title,
        Acronym: conf.acronym,
        crawlType: conf.crawlType,
        link: conf.link,
        cfpLink: conf.cfpLink,
        impLink: conf.impLink,
        originalRequestId: conf.requestId
      }));

    if (itemsForModal.length > 0) {
      setItemsToProcessWithAction(itemsForModal);
      setIsProcessModalOpen(true);
    }
  }, [selectedRowIds, allConferenceData]);

  const handleConfirmProcessWithActionAndModels = useCallback(async (
    processedItemsFromModal: ConferenceForAction[],
    selectedModels: ApiModels,
    description: string | undefined,
    recordFileOverride: boolean
  ) => {
    if (processedItemsFromModal.length > 0) {
      await processCrawlRequest(
        processedItemsFromModal,
        selectedModels,
        enableChunking,
        chunkSize,
        chunkDelay,
        recordFileOverride,
        "Programmatic Re-Crawl from Table",
        description
      );
    }
    setIsProcessModalOpen(false);
    setItemsToProcessWithAction([]);
  }, [
    processCrawlRequest,
    enableChunking,
    chunkSize,
    chunkDelay,
  ]);

  return {
    mainSaveStatus,
    isSaveEnabled,
    handleBulkSave,
    rowSaveStatus,
    rowSaveErrors,
    isProcessModalOpen,
    setIsProcessModalOpen,
    handleProcessAgainClick,
    handleConfirmProcessWithActionAndModels,
    itemsToProcessFromTable: itemsToProcessWithAction,
  };
};