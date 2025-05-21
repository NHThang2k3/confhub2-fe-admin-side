// src/app/[locale]/dashboard/logAnalysis/OverallSummary.tsx
import React, { useMemo } from 'react';
import { LogAnalysisResult, GoogleSearchAnalysis } from '../../../../models/logAnalysis/logAnalysis'; // Adjust path
import { transformRecordForBarChart, BarChartData } from './utils/chartUtils'; // Adjust path

import SummaryHeaderComponent from './overallSummary/SummaryHeader'; // Renamed to avoid conflict
import NoDataMessage from './overallSummary/NoDataMessage';
import CollapsibleContent from './overallSummary/CollapsibleContent'; // Assume this will be updated

interface OverallSummaryProps {
  data: LogAnalysisResult;
  isExpanded: boolean;
  onToggle: () => void;
}

// Interface for additional Google Search health metrics
interface GoogleSearchHealthData {
  rotationsSuccess: number;
  rotationsFailed: number;
  allKeysExhaustedOnGetNextKey: number;
  maxUsageLimitsReachedTotal: number;
  successfulSearchesWithNoItems: number;
}

const OverallSummary: React.FC<OverallSummaryProps> = ({
  data,
  isExpanded,
  onToggle
}) => {
  const gSearchData = data?.googleSearch; // Cache for convenience

  const overallStatusData = useMemo(() => {
    // ... (giữ nguyên)
    if (!data?.overall) return [];
    const completedOk = data.overall.completedTasks || 0;
    const failed = data.overall.failedOrCrashedTasks || 0;
    const processing = data.overall.processingTasks || 0;
    const skipped = data.overall.skippedTasks || 0;
    return [
      { name: 'Completed', value: completedOk },
      { name: 'Processing', value: processing },
      { name: 'Failed/Crashed', value: failed },
      { name: 'Skipped', value: skipped }
    ].filter(item => item.value > 0);
  }, [data?.overall]);


  const searchStatusData = useMemo(() => {
    if (!gSearchData) return [];
    return [
      { name: 'Successful', value: gSearchData.successfulSearches || 0 },
      { name: 'Failed', value: gSearchData.failedSearches || 0 },
      { name: 'Skipped', value: gSearchData.skippedSearches || 0 },
      // SỬA ĐỔI: Sử dụng quotaErrorsEncountered
      { name: 'Quota Errors Encountered', value: gSearchData.quotaErrorsEncountered || 0 }
    ].filter(item => item.value > 0);
  }, [gSearchData]);

  // BỔ SUNG: Dữ liệu về sức khỏe API Key của Google Search
  const googleSearchHealthData = useMemo<GoogleSearchHealthData | null>(() => {
    if (!gSearchData) return null;
    return {
      rotationsSuccess: gSearchData.apiKeyRotationsSuccess || 0,
      rotationsFailed: gSearchData.apiKeyRotationsFailed || 0,
      allKeysExhaustedOnGetNextKey: gSearchData.allKeysExhaustedEvents_GetNextKey || 0,
      maxUsageLimitsReachedTotal: gSearchData.apiKeyLimitsReached || 0,
      successfulSearchesWithNoItems: gSearchData.successfulSearchesWithNoItems || 0,
    };
  }, [gSearchData]);

  const apiStatusData = useMemo(() => {
    // ... (giữ nguyên)
    if (!data?.geminiApi) return [];
    const determineRetries = data.geminiApi.retriesByType?.['determine'] || 0;
    const extractRetries = data.geminiApi.retriesByType?.['extract'] || 0;
    const cfpRetries = data.geminiApi.retriesByType?.['cfp'] || 0;
    const retries = determineRetries + extractRetries + cfpRetries;
    return [
      { name: 'Successful', value: data.geminiApi.successfulCalls || 0 },
      { name: 'Failed', value: data.geminiApi.failedCalls || 0 },
      { name: 'Blocked', value: data.geminiApi.blockedBySafety || 0 },
      ...(retries > 0 ? [{ name: 'Retries', value: retries }] : [])
    ].filter(item => item.value > 0);
  }, [data?.geminiApi]);


  const totalGeminiCallsWithRetries = useMemo(() => {
    // ... (giữ nguyên)
    const apiData = data?.geminiApi;
    if (!apiData) return 0;
    return (apiData.totalCalls || 0) + (apiData.totalRetries || 0);
  }, [data?.geminiApi]);

  const cacheStatusData = useMemo(() => {
    // ... (giữ nguyên)
    if (!data?.geminiApi) return [];
    return [
      { name: 'Cache Hits', value: data.geminiApi.cacheContextHits || 0 },
      { name: 'Cache Misses', value: data.geminiApi.cacheContextMisses || 0 }
    ].filter(item => item.value > 0);
  }, [data?.geminiApi]);

  const playwrightLinkData = useMemo(() => {
    // ... (giữ nguyên)
    if (!data?.playwright?.linkProcessing) return [];
    return [
      { name: 'Successful Access', value: data.playwright.linkProcessing.successfulAccess || 0 },
      { name: 'Failed Access', value: data.playwright.linkProcessing.failedAccess || 0 },
      { name: 'Redirects', value: data.playwright.linkProcessing.redirects || 0 }
    ].filter(item => item.value > 0);
  }, [data?.playwright?.linkProcessing]);

  const callsByModelWithRetriesData = useMemo<BarChartData>(() => {
    // ... (giữ nguyên)
    const { callsByModel = {}, retriesByModel = {} } = data?.geminiApi ?? {};
    const combined: Record<string, number> = {};
    const allKeys = new Set([...Object.keys(callsByModel), ...Object.keys(retriesByModel)]);
    allKeys.forEach(model => {
      combined[model] = (callsByModel[model] || 0) + (retriesByModel[model] || 0);
    });
    return transformRecordForBarChart(combined, 0, false);
  }, [data?.geminiApi]);

  const apiKeyUsageData = useMemo<BarChartData>(() => {
    // Giữ nguyên, đã đúng
    return transformRecordForBarChart(gSearchData?.keyUsage, 0, false);
  }, [gSearchData?.keyUsage]);

  // BỔ SUNG: Dữ liệu chi tiết lỗi Google Search
  const googleSearchErrorsData = useMemo<BarChartData>(() => {
    return transformRecordForBarChart(gSearchData?.errorsByType, 5, true); // Top 5 lỗi
  }, [gSearchData?.errorsByType]);

  // BỔ SUNG: Dữ liệu chi tiết các vấn đề trong attempt của Google Search
  const googleSearchAttemptIssuesData = useMemo<BarChartData>(() => {
    return transformRecordForBarChart(gSearchData?.attemptIssueDetails, 5, true); // Top 5 vấn đề
  }, [gSearchData?.attemptIssueDetails]);


  const callsByTypeWithRetriesData = useMemo<BarChartData>(() => {
    // ... (giữ nguyên)
    const { callsByType = {}, retriesByType = {} } = data?.geminiApi ?? {};
    const combined: Record<string, number> = {};
    const allKeys = new Set([...Object.keys(callsByType), ...Object.keys(retriesByType)]);
    allKeys.forEach(type => {
      combined[type] = (callsByType[type] || 0) + (retriesByType[type] || 0);
    });
    return transformRecordForBarChart(combined, 0, false);
  }, [data?.geminiApi]);

  const topErrorsData = useMemo<BarChartData>(() => {
    // Giữ nguyên, là lỗi tổng hợp
    return transformRecordForBarChart(data?.errorsAggregated, 10, true);
  }, [data?.errorsAggregated]);

  const warningsByFieldData = useMemo<BarChartData>(() => {
    // ... (giữ nguyên)
    return transformRecordForBarChart(data?.validationStats?.warningsByField, 0, true);
  }, [data?.validationStats?.warningsByField]);

  const summaryTitle = useMemo(() => {
    // ... (giữ nguyên)
    return "Overall Crawl Summary";
  }, [data?.filterRequestId]);

  const hasMeaningfulData = useMemo(() => {
    // ... (giữ nguyên)
    return (data?.overall && (
        (data.overall.processedConferencesCount || 0) > 0 ||
        (data.overall.totalConferencesInput || 0) > 0
      )) || (data.errorLogCount || 0) > 0;
  }, [data?.overall, data?.errorLogCount]);

  if (!hasMeaningfulData && !isExpanded) {
    return null;
  }

  return (
    <section className='mb-8 rounded-lg border border-gray-100 bg-white shadow'>
      <SummaryHeaderComponent title={summaryTitle} isExpanded={isExpanded} onToggle={onToggle} />
      
      {isExpanded && !hasMeaningfulData && (
        <NoDataMessage filterRequestId={data.filterRequestId} />
      )}

      {hasMeaningfulData && (
        <CollapsibleContent
          isExpanded={isExpanded}
          data={data} // Truyền toàn bộ data gốc nếu CollapsibleContent cần các phần khác
          // --- Props giữ nguyên ---
          totalGeminiCallsWithRetries={totalGeminiCallsWithRetries}
          overallStatusData={overallStatusData}
          apiStatusData={apiStatusData}
          cacheStatusData={cacheStatusData}
          playwrightLinkData={playwrightLinkData}
          callsByModelWithRetriesData={callsByModelWithRetriesData}
          warningsByFieldData={warningsByFieldData}
          callsByTypeWithRetriesData={callsByTypeWithRetriesData}
          topErrorsData={topErrorsData}
          // --- Props liên quan đến Google Search ---
          searchStatusData={searchStatusData} // Đã cập nhật
          apiKeyUsageData={apiKeyUsageData} // Giữ nguyên
          // --- Props MỚI cho Google Search ---
          googleSearchHealthData={googleSearchHealthData}
          googleSearchErrorsData={googleSearchErrorsData}
          googleSearchAttemptIssuesData={googleSearchAttemptIssuesData}
        />
      )}
    </section>
  );
};

export default OverallSummary;