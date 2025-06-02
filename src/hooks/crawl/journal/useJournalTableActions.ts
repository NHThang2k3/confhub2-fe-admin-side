// src/hooks/logAnalysis/useJournalTableActions.ts (File mới)

import { useState, useCallback, useEffect, useMemo } from 'react';
import { JournalTableData } from './journalTableManagerTypes'; // Import type từ file mới
// Nếu có actions gọi API, import các hàm API và types liên quan ở đây

interface UseJournalTableActionsProps {
  selectedRowIds: string[];
  allJournalData: JournalTableData[]; // Dữ liệu gốc, đã transform
  resetDependencies?: any[];
}

/**
 * Hook để quản lý các hành động trên bảng journal.
 * Hiện tại, hook này sẽ đơn giản hơn, có thể không có save hoặc process again.
 * Có thể mở rộng sau này.
 */
export const useJournalTableActions = ({
  selectedRowIds,
  allJournalData,
  resetDependencies = []
}: UseJournalTableActionsProps) => {
  // Ví dụ: State cho một modal re-crawl (nếu cần)
  const [isReCrawlModalOpen, setIsReCrawlModalOpen] = useState(false);
  const [itemsToReCrawl, setItemsToReCrawl] = useState<JournalTableData[]>([]);

  useEffect(() => {
    setIsReCrawlModalOpen(false);
    setItemsToReCrawl([]);
  }, resetDependencies);

  const handleReCrawlSelectedClick = useCallback(() => {
    if (selectedRowIds.length === 0) {
      alert("No journals selected to re-crawl."); // Hoặc dùng toast/notification
      return;
    }
    const items = allJournalData.filter(journal => selectedRowIds.includes(journal.uniqueRowId));
    if (items.length > 0) {
      setItemsToReCrawl(items);
      setIsReCrawlModalOpen(true);
    }
  }, [selectedRowIds, allJournalData]);

  const handleConfirmReCrawl = useCallback(async (
    // Tham số cho việc re-crawl, ví dụ: options, flags
  ) => {
    if (itemsToReCrawl.length > 0) {
      console.log("Re-crawling journals:", itemsToReCrawl.map(j => j.journalTitle));
      // Gọi API để trigger re-crawl ở backend
      // await triggerReCrawlApi(itemsToReCrawl);
    }
    setIsReCrawlModalOpen(false);
    setItemsToReCrawl([]);
  }, [itemsToReCrawl /*, triggerReCrawlApi */]);


  // Các actions khác có thể được thêm vào đây (ví dụ: export selected data)

  return {
    isReCrawlModalOpen,
    setIsReCrawlModalOpen,
    handleReCrawlSelectedClick,
    handleConfirmReCrawl,
    itemsToReCrawl,
    // Không có mainSaveStatus, rowSaveStatus cho journal ở phiên bản này
  };
};