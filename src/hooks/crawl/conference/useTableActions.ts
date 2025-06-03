// src/hooks/useTableActions.ts

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ConferenceTableData,
  MainSavingStatus,
  RowSaveStatus
} from './useConferenceTableManager'; // Import types
import { ApiModels, useConferenceCrawl } from './useConferenceCrawl'; // Import useConferenceCrawl và types liên quan
import { saveConferenceToDB } from '@/src/app/api/logAnalysis/saveConferences';
import { persistConferenceSaveStatus, PersistSaveStatusPayload } from '@/src/app/api/logAnalysis/persistSaveStatus';
import { ConferenceForAction } from '@/src/models/logAnalysis/importConferenceCrawl';

interface UseTableActionsProps {
  selectedRowIds: string[];
  allConferenceData: ConferenceTableData[]; // Dữ liệu gốc, không phải đã lọc/sắp xếp
  resetDependencies?: any[]; // Để reset state khi logAnalysisResult thay đổi
}

/**
 * Hook để quản lý các hành động trên bảng như lưu trữ và xử lý lại.
 */
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

  // Reset state khi dependencies thay đổi (ví dụ: logAnalysisResult mới)
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
    const nextRowStatus = { ...rowSaveStatus };
    const nextRowErrors = { ...rowSaveErrors };
    selectedRowIds.forEach(id => {
      nextRowStatus[id] = 'idle';
      delete nextRowErrors[id];
    });
    setRowSaveStatus(nextRowStatus);
    setRowSaveErrors(nextRowErrors);

    const itemsToSave = allConferenceData.filter(
      conf => selectedRowIds.includes(conf.uniqueRowId)
    );

    const persistStatusPromises: Promise<any>[] = [];

    const results = await Promise.allSettled(
      itemsToSave.map(conf =>
        saveConferenceToDB(
          conf.acronym,
          conf.title,
          conf.finalResultPreview || conf.finalResult
        ).then(dbSaveResult => ({
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
        const { conf, dbSaveResult } = settledResult.value;
        const rowId = conf.uniqueRowId;

        if (dbSaveResult.success) {
          finalRowStatusUpdate[rowId] = 'success';

          const persistPayload: PersistSaveStatusPayload = {
            batchRequestId: conf.requestId,
            acronym: conf.acronym,
            title: conf.title,
            status: 'SAVED_TO_DATABASE',
            clientTimestamp: new Date().toISOString(),
          };
          const persistPromise = persistConferenceSaveStatus(persistPayload)
            .then(persistResult => {
              if (!persistResult.success) {
                console.warn(`Failed to persist save status for ${conf.acronym}: ${persistResult.message}`);
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
      } else {
        overallSuccess = false;
        console.error("Unexpected rejection in saveConferenceToDB promise:", settledResult.reason);
      }
    });

    setRowSaveStatus(prev => ({ ...prev, ...finalRowStatusUpdate }));
    setRowSaveErrors(prev => ({ ...prev, ...finalRowErrorsUpdate }));
    setMainSaveStatus(overallSuccess ? 'success' : 'error');

    if (overallSuccess && onSaveSuccess) {
      // Trigger callback to deselect all if save is successful
      onSaveSuccess();
    }

    Promise.all(persistStatusPromises).then(() => {
      console.log("All persist save status calls have completed.");
    }).catch(err => {
      console.error("Error during persisting save statuses:", err);
    });
  }, [isSaveEnabled, selectedRowIds, allConferenceData, rowSaveStatus, rowSaveErrors]);

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