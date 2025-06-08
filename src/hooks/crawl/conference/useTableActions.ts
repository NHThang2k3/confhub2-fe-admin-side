// src/hooks/useTableActions.ts

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ConferenceTableData,
  MainSavingStatus,
  RowSaveStatus
} from './useConferenceTableManager';
import { useConferenceCrawl } from './useConferenceCrawl';
import { ApiModels } from '@/src/models/logAnalysis/importConferenceCrawl';
import {
    saveConferencesToDB, // Updated import
    ConferenceToSavePayload,
    BatchSaveConferenceItemResult
} from '@/src/app/api/logAnalysis/saveConferences';
import {
    persistBatchConferenceSaveStatus, // Updated import
    persistSingleConferenceSaveStatus, // Keep for fallback or if backend not ready for batch
    PersistSaveStatusPayload,
    BatchPersistItemResult
} from '@/src/app/api/logAnalysis/persistSaveStatus';
import { ConferenceForAction } from '@/src/models/logAnalysis/importConferenceCrawl';

// A flag to control whether to use batch persistence.
// Set this to false if your backend /api/v1/log/conference-save-event doesn't support batch yet.
const USE_BATCH_PERSISTENCE = true; // <<<< IMPORTANT: Configure this

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

  const { startCrawlItems } = useConferenceCrawl();

  useEffect(() => {
    setMainSaveStatus('idle');
    setRowSaveStatus({});
    setRowSaveErrors({});
    setIsProcessModalOpen(false);
    setItemsToProcessWithAction([]);
  }, resetDependencies);

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

  // ... rest of the hook (handleProcessAgainClick, etc.) remains the same
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
    selectedModels: ApiModels
  ) => {
    if (processedItemsFromModal.length > 0) {
      await startCrawlItems(processedItemsFromModal, selectedModels);
    }
    setIsProcessModalOpen(false);
    setItemsToProcessWithAction([]);
  }, [startCrawlItems]);

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