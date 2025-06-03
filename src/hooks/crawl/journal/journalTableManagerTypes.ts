// src/hooks/crawl/journal/journalTableManagerTypes.ts (REVISED)

import { JournalAnalysisDetail, JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types'; // Adjust path as needed
import { LogError } from '@/src/models/logAnalysis'; // Assuming LogError is a shared type

export type JournalSortableColumn =
  | 'journalTitle'
  | 'sourceId'
  | 'batchRequestId'
  | 'dataSource'
  | 'status'
  | 'durationSeconds'
  | 'errorCount';

export type SortDirection = 'asc' | 'desc';

export type MainSavingStatus = 'idle' | 'saving' | 'success' | 'error';
export type RowSaveStatus = 'idle' | 'saving' | 'success' | 'error'; // 'saving' was added in previous step, ensure it's here

export type CountFilterLevel = '0' | '1' | '2' | '3+' | 'any' | 'none' | '';

export interface JournalColumnFiltersState {
  journalTitle?: string;
  sourceId?: string;
  batchRequestId?: string;
  dataSource?: 'scimago' | 'client' | '' | undefined;
  status?: string;
  errorCount?: CountFilterLevel;
}

// Dữ liệu cho mỗi hàng trong bảng journal
export interface JournalTableData extends Omit<JournalAnalysisDetail, 'errors' | 'steps' | 'finalResultPreview' | 'finalResult'> {
  uniqueRowId: string; // e.g., `${batchRequestId}-${sourceId || journalTitle}`

  errors: LogError[];          // Detailed errors for expansion view
  errorCount: number;          // Total number of errors for quick view and filtering
  steps: JournalAnalysisDetail['steps'] & { // Keep detailed steps for expansion, and add specific success flags
    bioxbio_success: boolean | null;        // Promoted for easier access / potential direct display
    bioxbio_attempted: boolean;
    bioxbio_cache_used?: boolean | null;
    scimago_details_success: boolean | null; // Promoted
    scimago_details_attempted: boolean;
    image_search_success: boolean | null;    // Promoted
    image_search_attempted: boolean;
    jsonl_write_success: boolean | null;     // Promoted
    // jsonl_content?: any; // This might be part of steps or finalResult, and is used to populate dataToSave
  };

  // Fields for save status and functionality
  persistedSaveStatus?: 'SAVED_TO_DATABASE' | string; // Status from persistent log
  persistedSaveTimestamp?: string;                    // Timestamp from persistent log
  dataToSave?: any;                                   // The actual structured data object to send to the main DB import API
                                                      // This should be populated in useJournalDataTransform,
                                                      // likely derived from the original full finalResult or jsonl_content.
}

export interface UseJournalTableManagerProps {
  logAnalysisResult: JournalLogAnalysisResult | null | undefined;
}

// Data structure for re-crawl actions
export interface JournalForAction {
    id: string; // uniqueRowId
    journalTitle: string;
    sourceId: string;
    originalRequestId?: string; // Typically batchRequestId from JournalTableData
    // Add other fields if needed for re-crawl, e.g., specific links if re-crawling an update
}