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

    const { conferenceAnalysis, filterRequestId, analyzedRequestIds } =
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
      };
    });
  }, [logAnalysisResult]);

  return { conferenceDataArray };
};