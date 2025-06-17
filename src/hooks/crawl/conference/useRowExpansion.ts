// src/hooks/useRowExpansion.ts

import { useState, useCallback, useEffect } from 'react';

interface UseRowExpansionProps {
  resetDependencies?: any[]; // Để reset state khi logAnalysisResult thay đổi
}

/**
 * Hook để quản lý trạng thái mở rộng/thu gọn của hàng.
 */
export const useRowExpansion = ({ resetDependencies = [] }: UseRowExpansionProps = {}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Reset state khi dependencies thay đổi (ví dụ: logAnalysisResult mới)
  useEffect(() => {
    setExpandedRow(null);
  }, [...resetDependencies]); // <--- THAY ĐỔI QUAN TRỌNG Ở ĐÂY

  const toggleExpand = useCallback((uniqueRowId: string) => {
    setExpandedRow(prev => (prev === uniqueRowId ? null : uniqueRowId));
  }, []);

  return {
    expandedRow,
    toggleExpand,
  };
};