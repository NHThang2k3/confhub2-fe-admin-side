// src/hooks/logAnalysis/journalTableManagerTypes.ts (File mới)

import { JournalAnalysisDetail, JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types'; // Adjust path
import { LogError } from '@/src/models/logAnalysis';

// Các cột có thể sort trong bảng journal
export type JournalSortableColumn =
  | 'journalTitle'
  | 'sourceId'
  | 'status'
  | 'durationSeconds'
  | 'errorCount' // Tổng số lỗi
  | 'batchRequestId'
  | 'dataSource';

export type SortDirection = 'asc' | 'desc'; // Giữ nguyên

// Filter cho các cột số lượng (ví dụ: error count)
export type CountFilterLevel = '0' | '1' | '2' | '3+' | 'any' | 'none' | ''; // Giữ nguyên

// State cho các filter cột
export interface JournalColumnFiltersState {
  journalTitle?: string;
  sourceId?: string;
  status?: string;
  batchRequestId?: string;
  dataSource?: 'scimago' | 'client' | '';
  errorCount?: CountFilterLevel;
  // Thêm các filter cho các bước nếu cần, ví dụ:
  // bioxbioSuccess?: 'true' | 'false' | '';
  // scimagoDetailsSuccess?: 'true' | 'false' | '';
  // imageSearchSuccess?: 'true' | 'false' | '';
}

// Dữ liệu cho mỗi hàng trong bảng journal
export interface JournalTableData extends Omit<JournalAnalysisDetail, 'errors' | 'steps' | 'finalResultPreview' | 'finalResult'> {
  uniqueRowId: string; // Sẽ là batchRequestId + journalTitle (hoặc sourceId)
  // journalTitle đã có
  // sourceId đã có
  // batchRequestId đã có
  // dataSource đã có
  // status đã có
  // durationSeconds đã có
  errorCount: number; // Tổng số lỗi
  errors: LogError[]; // Giữ lại để hiển thị chi tiết
  steps: JournalAnalysisDetail['steps']; // Giữ lại để hiển thị chi tiết
  // Các trường từ steps có thể được đưa lên cấp cao hơn để filter/sort dễ dàng
  bioxbioSuccess: boolean | null;
  scimagoDetailsSuccess: boolean | null;
  imageSearchSuccess: boolean | null;
  jsonlWriteSuccess: boolean | null;
}

// Props cho hook quản lý chính
export interface UseJournalTableManagerProps {
  logAnalysisResult: JournalLogAnalysisResult | null | undefined;
}