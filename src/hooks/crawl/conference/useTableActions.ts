// src/hooks/useTableActions.ts
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ConferenceTableData,
  MainSavingStatus,
  RowSaveStatus
} from './useConferenceTableManager';
import { useConferenceCrawl } from './useConferenceCrawl'; // Hook chính
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

  // --- THAY ĐỔI 1: LẤY CÁC HÀM VÀ CONFIG CẦN THIẾT ---
  const {
    processCrawlRequest, // Thay thế startCrawlItems
    enableChunking,      // Config cần thiết
    chunkSize,           // Config cần thiết
    chunkDelay,          // Config cần thiết
  } = useConferenceCrawl();

  useEffect(() => {
    setMainSaveStatus('idle');
    setRowSaveStatus({});
    setRowSaveErrors({});
    setIsProcessModalOpen(false);
    setItemsToProcessWithAction([]);
  }, [...resetDependencies]); // <--- THAY ĐỔI QUAN TRỌNG Ở ĐÂY


  const isSelectedWithProblem = useMemo(() => {
    if (selectedRowIds.length === 0) return false;
    const selectedOriginalData = allConferenceData.filter(
      conf => selectedRowIds.includes(conf.uniqueRowId)
    );
    return selectedOriginalData.some(
      conf => conf.unrecoveredErrorCount > 0 || conf.hasSignificantDataQualityIssues
    );
  }, [selectedRowIds, allConferenceData]);

  const isSaveEnabled = useMemo(() => {
    if (selectedRowIds.length === 0 || mainSaveStatus === 'saving') {
      return false;
    }
    const selectedConfs = allConferenceData.filter(conf => selectedRowIds.includes(conf.uniqueRowId));
    const anySelectedAlreadyPersisted = selectedConfs.some(conf => conf.persistedSaveStatus === 'SAVED_TO_DATABASE');
    return !isSelectedWithProblem && !anySelectedAlreadyPersisted;
  }, [selectedRowIds, isSelectedWithProblem, mainSaveStatus, allConferenceData]);


  const handleBulkSave = useCallback(async (onSaveSuccess?: () => void) => {
    if (!isSaveEnabled) return;
    setMainSaveStatus('saving');
    const initialRowStatus: Record<string, RowSaveStatus> = {};
    selectedRowIds.forEach(id => {
      initialRowStatus[id] = 'idle'; // Mark as pending/processing for UI
    });
    setRowSaveStatus(initialRowStatus);
    setRowSaveErrors({}); // Clear previous errors

    const conferencesToSave = allConferenceData.filter(
      conf => selectedRowIds.includes(conf.uniqueRowId)
    );

    const conferencePayloads: ConferenceToSavePayload[] = conferencesToSave.map(conf => ({
      acronym: conf.acronym,
      title: conf.title,
      // uniqueRowId: conf.uniqueRowId, // Pass if saveConferencesToDB uses it for mapping
      extractedData: conf.finalResultPreview || conf.finalResult,
    }));

    const dbSaveBatchResult = await saveConferencesToDB(conferencePayloads);

    const finalRowStatusUpdate: Record<string, RowSaveStatus> = {};
    const finalRowErrorsUpdate: Record<string, string> = {};
    let overallSuccess = dbSaveBatchResult.overallSuccess; // Start with API call success
    const successfullySavedItemsForPersistence: PersistSaveStatusPayload[] = [];

    // Process results from saveConferencesToDB
    dbSaveBatchResult.itemResults.forEach(itemResult => {
      // Find the original conference to get its uniqueRowId
      const originalConf = conferencesToSave.find(
        c => c.acronym === itemResult.acronym && c.title === itemResult.title
      );
      if (!originalConf) {
        console.warn("Could not map DB save result back to a table row:", itemResult);
        // This shouldn't happen if mapping logic in saveConferencesToDB is correct
        return;
      }
      const rowId = originalConf.uniqueRowId;

      if (itemResult.success) {
        finalRowStatusUpdate[rowId] = 'success';
        successfullySavedItemsForPersistence.push({
          batchRequestId: originalConf.requestId, // Assuming requestId is the batchRequestId
          acronym: itemResult.acronym,
          title: itemResult.title,
          status: 'SAVED_TO_DATABASE',
          clientTimestamp: new Date().toISOString(),
        });
      } else {
        overallSuccess = false; // If any item fails, the overall batch operation is not fully successful
        finalRowStatusUpdate[rowId] = 'error';
        finalRowErrorsUpdate[rowId] = itemResult.message || 'Save failed (unknown reason).';
      }
    });

    setRowSaveStatus(prev => ({ ...prev, ...finalRowStatusUpdate }));
    setRowSaveErrors(prev => ({ ...prev, ...finalRowErrorsUpdate }));

    // Persist save statuses
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
            // Optionally, update row status or add a specific warning if persistence fails
            // For now, we just log it. The main save status is already set.
          } else {
            console.log(`Successfully persisted save status for ${itemPersistResult.acronym} - ${itemPersistResult.title}`);
          }
        });
      } else {
        // Fallback to single persistence calls if batch is not enabled/ready
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

    // Determine final mainSaveStatus
    // If dbSaveBatchResult.overallSuccess is false, it means the API call itself failed, so it's an error.
    // If true, then check if all individual items were successful.
    const allItemsSucceeded = dbSaveBatchResult.itemResults.every(item => item.success);
    setMainSaveStatus(dbSaveBatchResult.overallSuccess && allItemsSucceeded ? 'success' : 'error');

    if (dbSaveBatchResult.overallSuccess && allItemsSucceeded && onSaveSuccess) {
      onSaveSuccess(); // e.g., deselect rows
    }

  }, [isSaveEnabled, selectedRowIds, allConferenceData, /* rowSaveStatus, rowSaveErrors removed as they are set inside */]);

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

  // --- THAY ĐỔI 2: CẬP NHẬT HÀM XỬ LÝ ---
  const handleConfirmProcessWithActionAndModels = useCallback(async (
    processedItemsFromModal: ConferenceForAction[],
    selectedModels: ApiModels,
    description?: string
  ) => {
    if (processedItemsFromModal.length > 0) {
      // Gọi trực tiếp processCrawlRequest với đầy đủ các tham số
      await processCrawlRequest(
        processedItemsFromModal,
        selectedModels,
        enableChunking, // Sử dụng config từ useConferenceCrawl
        chunkSize,      // Sử dụng config từ useConferenceCrawl
        chunkDelay,     // Sử dụng config từ useConferenceCrawl
        "Programmatic Re-Crawl from Table", // Mô tả nguồn
        description
      );
      // Sau khi gọi, một modal khác (ví dụ: modal tiến trình crawl) có thể sẽ hiển thị
      // hoặc người dùng sẽ thấy log messages được cập nhật.
    }
    setIsProcessModalOpen(false);
    setItemsToProcessWithAction([]);
  }, [
    processCrawlRequest,
    enableChunking,
    chunkSize,
    chunkDelay
  ]); // Thêm các phụ thuộc mới

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