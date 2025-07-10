// src/hooks/useConferenceDataTransform.ts

import { useMemo, useEffect } from 'react';
import {
  ConferenceAnalysisDetail,
  ConferenceLogAnalysisResult,
  DataQualityInsight,
  LogError
} from '@/src/models/logAnalysis';
import { ConferenceTableData } from './useConferenceTableManager';

interface UseConferenceDataTransformProps {
  logAnalysisResult: ConferenceLogAnalysisResult | null | undefined;
}

/**
 * Hook để chuyển đổi dữ liệu thô từ ConferenceLogAnalysisResult thành ConferenceTableData
 * và tính toán các thuộc tính phái sinh.
 */
export const useConferenceDataTransform = ({
  logAnalysisResult
}: UseConferenceDataTransformProps) => {
  const conferenceDataArray: ConferenceTableData[] = useMemo(() => {
    if (!logAnalysisResult?.conferenceAnalysis) return [];

    // --- LẤY THÊM `fileOutput` TỪ KẾT QUẢ PHÂN TÍCH ---
    const { conferenceAnalysis, fileOutput, filterRequestId, analyzedRequestIds } =
      logAnalysisResult;



    return Object.entries(conferenceAnalysis).map(([confKey, data]) => {
      const entryRequestId =
        data.batchRequestId ||
        filterRequestId ||
        (analyzedRequestIds?.length === 1 ? analyzedRequestIds[0] : 'N/A');
      const uniqueRowId = `${confKey}_${entryRequestId}`;

      const insightsArray = data.dataQualityInsights || [];
      const insightCount = insightsArray.length;
      const hasSignificantIssues = insightsArray.some(
        insight => insight.insightType === 'ValidationWarning' && (insight.severity === 'High' || insight.severity === 'Medium')
      );

      const unrecoveredErrors = (data.errors || []).filter(
        (err: LogError) => !err.isRecovered
      );
      const unrecoveredErrorCount = unrecoveredErrors.length;

      const mainLink = data.finalResult?.mainLink || data.finalResult?.link || data.finalResultPreview?.mainLink || data.finalResultPreview?.link;
      const cfpLinkVal = data.finalResult?.cfpLink || data.finalResultPreview?.cfpLink;
      const impLinkVal = data.finalResult?.impLink || data.finalResultPreview?.impLink;


      // --- TÌM TRẠNG THÁI CSV CHO CONFERENCE NÀY ---
      // Logic này giả định rằng `fileOutput` chứa thông tin cho toàn bộ request,
      // và chúng ta cần tìm conference tương ứng.
      // Tuy nhiên, `csvFileGenerated` thường ở cấp độ request, không phải conference.
      // Giả định đơn giản hơn: `csvFileGenerated` ở cấp độ request.
      // Chúng ta sẽ lấy nó từ `logAnalysisResult.fileOutput`.
      // Nhưng vì `conferenceAnalysis` là một mảng, chúng ta cần một cách để liên kết.
      // Giả định đơn giản nhất: `csvFileGenerated` áp dụng cho tất cả.
      // MỘT CÁCH TIẾP CẬN TỐT HƠN: `csvFileGenerated` nên nằm trong `requests[reqId]`.
      // Giả sử bạn đã có logic để đưa `csvFileGenerated` vào `requests[reqId]`.
      // Nếu chưa, chúng ta sẽ làm một cách đơn giản ở đây.

      // Lấy thông tin từ request cha của conference này
      const parentRequest = logAnalysisResult.requests[data.batchRequestId];
      // Giả sử `parentRequest` có trường `csvFileGenerated`
      const csvGeneratedForRequest = (parentRequest as any)?.csvFileGenerated ?? null;


      return {
        ...data,
        uniqueRowId,
        title: data.title || confKey.split(' - ')[1] || confKey,
        acronym: data.acronym || confKey.split(' - ')[0] || '',
        requestId: entryRequestId,
        unrecoveredErrorCount: unrecoveredErrorCount,
        dataQualityInsights: insightsArray,
        dataQualityInsightCount: insightCount,
        hasSignificantDataQualityIssues: hasSignificantIssues,
        link: mainLink,
        cfpLink: cfpLinkVal,
        impLink: impLinkVal,
        // --- GÁN GIÁ TRỊ MỚI ---
        // Lấy từ request cha, nếu không có thì lấy từ fileOutput tổng
        csvFileGenerated: csvGeneratedForRequest ?? fileOutput?.csvFileGenerated ?? null,
      };
    });
  }, [logAnalysisResult]);

  return { conferenceDataArray };
};
