// src/hooks/logAnalysis/useJournalRowExpansion.ts (File mới)

import { useState, useCallback, useEffect } from 'react';

interface UseJournalRowExpansionProps {
  resetDependencies?: any[];
}

export const useJournalRowExpansion = ({ resetDependencies = [] }: UseJournalRowExpansionProps = {}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    setExpandedRow(null);
  }, resetDependencies);

  const toggleExpand = useCallback((uniqueRowId: string) => {
    setExpandedRow(prev => (prev === uniqueRowId ? null : uniqueRowId));
  }, []);

  return {
    expandedRow,
    toggleExpand,
  };
};