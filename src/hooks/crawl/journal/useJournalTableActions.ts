// src/hooks/logAnalysis/useJournalTableActions.ts (MODIFY EXISTING)

import { useState, useCallback, useEffect, useMemo } from 'react';
import { JournalTableData, MainSavingStatus, RowSaveStatus, JournalForAction } from './journalTableManagerTypes';
import { importJournalsFromLog, BackendImportResult } from '@/src/app/api/logAnalysis/saveJournals';

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
  }, []); // Sửa lại dependency cho đúng

  const isSelectedWithProblem = useMemo(() => {
    if (selectedRowIds.length === 0) return false;
    return allJournalData
      .filter(journal => selectedRowIds.includes(journal.uniqueRowId))
      .some(journal => journal.errorCount > 0);
  }, [selectedRowIds, allJournalData]);

  const isSaveEnabled = useMemo(() => {
    if (selectedRowIds.length === 0 || mainSaveStatus === 'saving') return false;
    const selectedJournals = allJournalData.filter(j => selectedRowIds.includes(j.uniqueRowId));
    // Chỉ cần kiểm tra xem có journal nào đã được lưu chưa
    const anyAlreadyPersisted = selectedJournals.some(j => j.persistedSaveStatus === 'SAVED_TO_DATABASE');
    return !isSelectedWithProblem && !anyAlreadyPersisted;
  }, [selectedRowIds, mainSaveStatus, allJournalData, isSelectedWithProblem]);

  // SỬA LẠI HOÀN TOÀN HÀM NÀY
  const handleBulkSave = useCallback(async (onSaveSuccess?: () => void) => {
    // Lấy batchRequestId từ item đầu tiên trong toàn bộ dữ liệu, không chỉ các item được chọn
    const batchRequestId = allJournalData.length > 0 ? allJournalData[0].batchRequestId : null;
    const imports = allJournalData
      .filter(journal => selectedRowIds.includes(journal.uniqueRowId))

    if (!isSaveEnabled || !batchRequestId) {
      console.error("Cannot save: Save is not enabled or batchRequestId is missing.");
      setMainSaveStatus('error');
      return;
    }

    setMainSaveStatus('saving');
    setRowSaveErrors({}); // Xóa lỗi cũ

    // Đặt trạng thái 'saving' cho tất cả các hàng chưa được lưu
    // Sử dụng functional update để tránh dependency vào state cũ
    setRowSaveStatus(currentStatus => {
      const nextStatus = { ...currentStatus };
      imports.forEach(journal => {
        if (journal.persistedSaveStatus !== 'SAVED_TO_DATABASE') {
          nextStatus[journal.uniqueRowId] = 'saving';
        }
      });
      return nextStatus;
    });

    try {
      const result = await importJournalsFromLog(batchRequestId, imports.map(j => ({
        title : j.journalTitle,
        issn : j.issn, // Giả sử có trường này
      })));

      // Cập nhật trạng thái dựa trên kết quả
      // Sử dụng functional update để không cần phụ thuộc vào state cũ trong mảng dependency của useCallback
      setRowSaveStatus(currentStatus => {
        const nextStatus = { ...currentStatus };
        result.results.forEach(itemResult => {
          // Khớp bằng sourceId - cách đáng tin cậy nhất
          const matchingJournal = imports.find(j => j.journalTitle === itemResult.data?.title && j.issn === itemResult.data?.issn);
          if (matchingJournal) {
            nextStatus[matchingJournal.uniqueRowId] = itemResult.success ? 'success' : 'error';
          }
        });
        return nextStatus;
      });

      setRowSaveErrors(currentErrors => {
        const nextErrors = { ...currentErrors };
        result.results.forEach(itemResult => {
          if (!itemResult.success) {
            const matchingJournal = allJournalData.find(j => j.sourceId === itemResult.sourceId);
            if (matchingJournal) {
              nextErrors[matchingJournal.uniqueRowId] = itemResult.message || 'Save failed.';
            }
          }
        });
        return nextErrors;
      });

      const overallSuccess = result.totalFailed === 0;
      setMainSaveStatus(overallSuccess ? 'success' : 'error');

      if (overallSuccess && onSaveSuccess) {
        onSaveSuccess();
      }

    } catch (error) {
      const err = error as Error;
      setMainSaveStatus('error');

      // Đặt lỗi cho tất cả các hàng đang 'saving'
      setRowSaveStatus(currentStatus => {
        const nextStatus = { ...currentStatus };
        Object.keys(nextStatus).forEach(key => {
          if (nextStatus[key] === 'saving') {
            nextStatus[key] = 'error';
          }
        });
        return nextStatus;
      });
      // Có thể set một lỗi chung cho tất cả
      // setRowSaveErrors(...);
      console.error("Bulk save failed:", err);
    }
  }, [isSaveEnabled, allJournalData]); // Giữ allJournalData vì cần nó để khớp

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