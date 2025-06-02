// src/hooks/logAnalysis/useJournalDataTransform.ts (File mới)

import { useMemo } from 'react';
import {
  JournalAnalysisDetail,
  JournalLogAnalysisResult,
} from '@/src/models/logAnalysis/logAnalysisJournal.types'; // Adjust path
import { JournalTableData } from './journalTableManagerTypes'; // Import type từ file mới

interface UseJournalDataTransformProps {
  logAnalysisResult: JournalLogAnalysisResult | null | undefined;
}

/**
 * Hook để chuyển đổi dữ liệu thô từ JournalLogAnalysisResult thành JournalTableData
 * và tính toán các thuộc tính phái sinh.
 */
export const useJournalDataTransform = ({
  logAnalysisResult
}: UseJournalDataTransformProps) => {
  const journalDataArray: JournalTableData[] = useMemo(() => {
    if (!logAnalysisResult?.journalAnalysis) return [];

    const { journalAnalysis, filterRequestId, analyzedRequestIds } = logAnalysisResult;

    return Object.entries(journalAnalysis).map(([journalKey, data]) => {
      // journalKey thường là "batchRequestId - journalTitle (sourceId)"
      // Chúng ta cần trích xuất lại batchRequestId, journalTitle, sourceId nếu cần
      // Hoặc sử dụng trực tiếp từ data object nếu đã có sẵn.
      const entryRequestId = data.batchRequestId || filterRequestId || (analyzedRequestIds?.length === 1 ? analyzedRequestIds[0] : 'N/A');
      const uniqueRowId = journalKey; // journalKey đã là unique

      const errorCount = (data.errors || []).length;

      return {
        // Spread các trường từ JournalAnalysisDetail mà JournalTableData kế thừa
        batchRequestId: entryRequestId,
        journalTitle: data.journalTitle,
        sourceId: data.sourceId,
        dataSource: data.dataSource,
        originalInput: data.originalInput,
        status: data.status,
        startTime: data.startTime,
        endTime: data.endTime,
        durationSeconds: data.durationSeconds,
        // Các trường mới hoặc được tính toán
        uniqueRowId,
        errorCount,
        errors: data.errors || [], // Giữ lại mảng errors gốc
        steps: data.steps,       // Giữ lại object steps gốc
        // Đưa các bước quan trọng lên cấp cao hơn để dễ truy cập
        bioxbioSuccess: data.steps.bioxbio_success,
        scimagoDetailsSuccess: data.steps.scimago_details_success,
        imageSearchSuccess: data.steps.image_search_success,
        jsonlWriteSuccess: data.steps.jsonl_write_success,
      };
    });
  }, [logAnalysisResult]);

  return { journalDataArray };
};