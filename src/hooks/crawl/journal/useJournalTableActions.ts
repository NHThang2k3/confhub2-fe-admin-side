// src/hooks/logAnalysis/useJournalTableActions.ts (MODIFY EXISTING)

import { useState, useCallback, useEffect, useMemo } from 'react';
import { JournalTableData, MainSavingStatus, RowSaveStatus, JournalForAction } from './journalTableManagerTypes';
import { saveJournalToDB } from '@/src/app/api/logAnalysis/saveJournals';
import { persistJournalSaveStatus, PersistJournalSaveStatusPayload } from '@/src/app/api/logAnalysis/persistJournalSaveStatus';

interface UseJournalTableActionsProps {
  selectedRowIds: string[];
  allJournalData: JournalTableData[];
  resetDependencies?: any[];
}

export const useJournalTableActions = ({
  selectedRowIds,
  allJournalData,
  resetDependencies = []
}: UseJournalTableActionsProps) => {
  const [mainSaveStatus, setMainSaveStatus] = useState<MainSavingStatus>('idle');
  const [rowSaveStatus, setRowSaveStatus] = useState<Record<string, RowSaveStatus>>({});
  const [rowSaveErrors, setRowSaveErrors] = useState<Record<string, string>>({});

  const [isReCrawlModalOpen, setIsReCrawlModalOpen] = useState(false);
  const [itemsToReCrawl, setItemsToReCrawl] = useState<JournalForAction[]>([]);

  useEffect(() => {
    setMainSaveStatus('idle');
    setRowSaveStatus({});
    setRowSaveErrors({});
    setIsReCrawlModalOpen(false);
    setItemsToReCrawl([]);
  }, resetDependencies);

  const isSelectedWithProblem = useMemo(() => {
    if (selectedRowIds.length === 0) return false;
    return allJournalData
      .filter(journal => selectedRowIds.includes(journal.uniqueRowId))
      .some(journal => journal.errorCount > 0);
  }, [selectedRowIds, allJournalData]);

  const isSaveEnabled = useMemo(() => {
    if (selectedRowIds.length === 0 || mainSaveStatus === 'saving') return false;
    const selectedJournals = allJournalData.filter(j => selectedRowIds.includes(j.uniqueRowId));
    const anyAlreadyPersisted = selectedJournals.some(j => j.persistedSaveStatus === 'SAVED_TO_DATABASE');
    return !isSelectedWithProblem && !anyAlreadyPersisted;
  }, [selectedRowIds, mainSaveStatus, allJournalData, isSelectedWithProblem]);

  const handleBulkSave = useCallback(async (onSaveSuccess?: () => void) => {
    if (!isSaveEnabled) return;

    setMainSaveStatus('saving');
    const currentSelection = [...selectedRowIds];
    const nextRowStatus: Record<string, RowSaveStatus> = {};
    const nextRowErrors: Record<string, string> = {};
    currentSelection.forEach(id => {
      nextRowStatus[id] = 'saving';
      delete nextRowErrors[id]; // Clear previous errors for these items
    });
    setRowSaveStatus(prev => ({ ...prev, ...nextRowStatus }));
    setRowSaveErrors(prev => { // More robust error clearing
        const updatedErrors = {...prev};
        currentSelection.forEach(id => delete updatedErrors[id]);
        return updatedErrors;
    });

    const itemsToSave = allJournalData.filter(
      journal => currentSelection.includes(journal.uniqueRowId) && journal.dataToSave && journal.batchRequestId
    );

    if (itemsToSave.length === 0 && currentSelection.length > 0) {
        setMainSaveStatus('error');
        currentSelection.forEach(id => {
            setRowSaveStatus(prev => ({...prev, [id]: "error"}));
            setRowSaveErrors(prev => ({...prev, [id]: "Missing data or batchRequestId."}));
        });
        console.error("No valid items to save from selection (missing dataToSave or batchRequestId).");
        return;
    }
    
    const persistStatusPromises: Promise<any>[] = [];
    const results = await Promise.allSettled(
      itemsToSave.map(journal =>
        saveJournalToDB(journal.sourceId, journal.journalTitle, journal.dataToSave)
          .then(dbSaveResult => ({ journal, dbSaveResult }))
      )
    );

    const finalRowStatusUpdate: Record<string, RowSaveStatus> = {};
    const finalRowErrorsUpdate: Record<string, string> = {};
    let overallSuccess = true;

    results.forEach(settledResult => {
      if (settledResult.status === 'fulfilled') {
        const { journal, dbSaveResult } = settledResult.value;
        if (dbSaveResult.success) {
          finalRowStatusUpdate[journal.uniqueRowId] = 'success';
          const persistPayload: PersistJournalSaveStatusPayload = {
            batchRequestId: journal.batchRequestId, // Assumes batchRequestId is on JournalTableData
            sourceId: journal.sourceId,
            journalTitle: journal.journalTitle,
            status: 'SAVED_TO_DATABASE',
            clientTimestamp: new Date().toISOString(),
          };
          persistStatusPromises.push(
            persistJournalSaveStatus(persistPayload).catch(err => {
              console.warn(`Failed to persist save status for journal ${journal.sourceId}:`, err);
            })
          );
        } else {
          overallSuccess = false;
          finalRowStatusUpdate[journal.uniqueRowId] = 'error';
          finalRowErrorsUpdate[journal.uniqueRowId] = dbSaveResult.message || 'Save failed.';
        }
      } else {
        overallSuccess = false;
        // Attempt to find which journal failed if possible, otherwise log general error
        console.error("Unexpected rejection in saveJournalToDb promise:", settledResult.reason);
        // For now, we can't easily map this back to a specific row ID without more info in reason
      }
    });

    setRowSaveStatus(prev => ({ ...prev, ...finalRowStatusUpdate }));
    setRowSaveErrors(prev => ({ ...prev, ...finalRowErrorsUpdate }));
    setMainSaveStatus(overallSuccess ? 'success' : 'error');

    if (overallSuccess && onSaveSuccess) {
      onSaveSuccess();
    }

    Promise.all(persistStatusPromises)
      .then(() => console.log("All persist journal save status calls completed."))
      .catch(err => console.error("Error during batch persisting journal save statuses:", err));

  }, [isSaveEnabled, selectedRowIds, allJournalData]); // Removed rowSaveStatus, rowSaveErrors from deps

  const handleReCrawlSelectedClick = useCallback(() => {
    if (selectedRowIds.length === 0) {
      alert("No journals selected to re-crawl.");
      return;
    }
    const items: JournalForAction[] = allJournalData
      .filter(j => selectedRowIds.includes(j.uniqueRowId))
      .map(j => ({
          id: j.uniqueRowId,
          journalTitle: j.journalTitle,
          sourceId: j.sourceId,
          originalRequestId: j.batchRequestId, // Map batchRequestId
      }));
    if (items.length > 0) {
      setItemsToReCrawl(items);
      setIsReCrawlModalOpen(true);
    }
  }, [selectedRowIds, allJournalData]);

  const handleConfirmReCrawl = useCallback(async () => {
    if (itemsToReCrawl.length > 0) {
      console.log("Simulating re-crawling journals:", itemsToReCrawl.map(j => j.journalTitle));
      // TODO: Implement actual re-crawl call using useJournalCrawl or a dedicated API
      // e.g., await journalCrawlHook.startCrawlItems(itemsToReCrawl, selectedModels);
    }
    setIsReCrawlModalOpen(false);
  }, [itemsToReCrawl]);

  return {
    mainSaveStatus,
    rowSaveStatus,
    rowSaveErrors,
    isSaveEnabled,
    handleBulkSave,
    isReCrawlModalOpen,
    setIsReCrawlModalOpen,
    handleReCrawlSelectedClick,
    handleConfirmReCrawl,
    itemsToReCrawl,
  };
};