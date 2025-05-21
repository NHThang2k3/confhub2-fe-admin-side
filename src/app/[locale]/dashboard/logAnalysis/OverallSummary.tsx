// src/app/[locale]/dashboard/logAnalysis/OverallSummary.tsx
import React, { useMemo } from 'react';
import { LogAnalysisResult, GoogleSearchHealthData } from '../../../../models/logAnalysis/logAnalysis'; // Adjust path
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



const OverallSummary: React.FC<OverallSummaryProps> = ({
  data,
  isExpanded,
  onToggle
}) => {
  const gSearchData = data?.googleSearch;
  const geminiApiData = data?.geminiApi; // Cache for convenience

  const overallStatusData = useMemo(() => {
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

  // --- Dữ liệu cho Gemini API ---
  const geminiApiStatusData = useMemo(() => { // Đổi tên từ apiStatusData để rõ ràng hơn
    if (!geminiApiData) return [];
    // Sử dụng successfulCalls và failedCalls đã có, đã bao gồm logic fallback
    return [
      { name: 'Successful Calls', value: geminiApiData.successfulCalls || 0 },
      { name: 'Failed Calls', value: geminiApiData.failedCalls || 0 },
      { name: 'Safety Blocks (Final)', value: geminiApiData.blockedBySafety || 0 },
      ...((geminiApiData.totalRetries || 0) > 0 ? [{ name: 'Total Retries', value: geminiApiData.totalRetries }] : [])
    ].filter(item => item.value > 0);
  }, [geminiApiData]);

  const totalGeminiCallsWithRetries = useMemo(() => {
    if (!geminiApiData) return 0;
    // totalCalls đã bao gồm các cuộc gọi ban đầu (primary/fallback)
    // totalRetries là tổng số lần retry
    return (geminiApiData.totalCalls || 0) + (geminiApiData.totalRetries || 0);
  }, [geminiApiData]);

  // Dữ liệu cho biểu đồ Gemini Model Usage (chi tiết theo apiType và crawlModel)
  const geminiModelUsageDetailedData = useMemo<BarChartData>(() => {
    if (!geminiApiData?.modelUsageByApiType) return { labels: [], values: [] };
    const combined: Record<string, number> = {};
    Object.entries(geminiApiData.modelUsageByApiType).forEach(([apiType, models]) => {
      Object.entries(models).forEach(([modelIdentifier, stats]) => {
        const key = `${apiType}: ${modelIdentifier}`;
        combined[key] = (combined[key] || 0) + (stats.calls || 0) + (stats.retries || 0);
      });
    });
    return transformRecordForBarChart(combined, 0, true); // Sắp xếp theo value giảm dần
  }, [geminiApiData?.modelUsageByApiType]);


  // Dữ liệu cho tỷ lệ thành công của Fallback
  const geminiFallbackSuccessRateData = useMemo(() => {
    if (!geminiApiData?.fallbackLogic) return [];
    const { attemptsWithFallbackModel = 0, successWithFallbackModel = 0 } = geminiApiData.fallbackLogic;
    if (attemptsWithFallbackModel === 0) return [];
    return [
      { name: 'Fallback Success', value: successWithFallbackModel },
      { name: 'Fallback Failure', value: attemptsWithFallbackModel - successWithFallbackModel }
    ].filter(item => item.value >= 0); // >=0 để hiển thị cả khi 0
  }, [geminiApiData?.fallbackLogic]);

  // Dữ liệu cho lỗi cấu hình Gemini
  const geminiConfigErrorsData = useMemo<BarChartData>(() => {
    if (!geminiApiData?.configErrors && !geminiApiData?.fewShotPreparation?.failures) return { labels: [], values: [] };
    const errors: Record<string, number> = {};
    if (geminiApiData?.configErrors?.modelListMissing > 0) {
      errors['Model List Missing'] = geminiApiData.configErrors.modelListMissing;
    }
    if (geminiApiData?.fewShotPreparation?.failures?.oddPartsCount > 0) {
      errors['Few-Shot Odd Parts'] = geminiApiData.fewShotPreparation.failures.oddPartsCount;
    }
    if (geminiApiData?.fewShotPreparation?.failures?.processingError > 0) {
      errors['Few-Shot Processing Error'] = geminiApiData.fewShotPreparation.failures.processingError;
    }
    // Thêm các lỗi config khác nếu có
    return transformRecordForBarChart(errors, 0, true);
  }, [geminiApiData?.configErrors, geminiApiData?.fewShotPreparation?.failures]);


  // Dữ liệu cho Gemini Cache - chi tiết hơn
  const geminiCacheDetailedData = useMemo(() => {
    if (!geminiApiData) return [];
    return [
      { name: 'Context Hits', value: geminiApiData.cacheContextHits || 0 },
      { name: 'Context Creation Success', value: geminiApiData.cacheContextCreationSuccess || 0 },
      { name: 'Context Creation Failed', value: geminiApiData.cacheContextCreationFailed || 0 },
      { name: 'Context Invalidations', value: geminiApiData.cacheContextInvalidations || 0 },
      // { name: 'Context Retrieval Failures', value: geminiApiData.cacheContextRetrievalFailures || 0 }, // Có thể gộp vào creation failed hoặc hiển thị riêng
    ].filter(item => item.value > 0);
  }, [geminiApiData]);

  const topGeminiErrorsData = useMemo<BarChartData>(() => {
    // Lọc ra các lỗi chỉ thuộc về Gemini từ errorsByType
    if (!geminiApiData?.errorsByType) return { labels: [], values: [] };
    // Bạn có thể có một danh sách các prefix hoặc keyword để xác định lỗi Gemini
    // Hoặc nếu errorsByType trong geminiApi CHỈ chứa lỗi Gemini thì dùng trực tiếp
    return transformRecordForBarChart(geminiApiData.errorsByType, 5, true); // Top 5 lỗi Gemini
  }, [geminiApiData?.errorsByType]);


  const cacheStatusData = useMemo(() => {
    if (!data?.geminiApi) return [];
    return [
      { name: 'Cache Hits', value: data.geminiApi.cacheContextHits || 0 },
      { name: 'Cache Misses', value: data.geminiApi.cacheContextMisses || 0 }
    ].filter(item => item.value > 0);
  }, [data?.geminiApi]);

  const playwrightLinkData = useMemo(() => {
    if (!data?.playwright?.linkProcessing) return [];
    return [
      { name: 'Successful Access', value: data.playwright.linkProcessing.successfulAccess || 0 },
      { name: 'Failed Access', value: data.playwright.linkProcessing.failedAccess || 0 },
      { name: 'Redirects', value: data.playwright.linkProcessing.redirects || 0 }
    ].filter(item => item.value > 0);
  }, [data?.playwright?.linkProcessing]);

  const callsByModelWithRetriesData = useMemo<BarChartData>(() => {
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
    return transformRecordForBarChart(data?.validationStats?.warningsByField, 0, true);
  }, [data?.validationStats?.warningsByField]);

  const summaryTitle = useMemo(() => {
    return "Overall Crawl Summary";
  }, [data?.filterRequestId]);

  const hasMeaningfulData = useMemo(() => {
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
          data={data}
          // --- Props giữ nguyên ---
          overallStatusData={overallStatusData}
          // --- Props Google Search (đã cập nhật tên biến) ---
          searchStatusData={searchStatusData}
          apiKeyUsageData={apiKeyUsageData}
          googleSearchHealthData={googleSearchHealthData}
          googleSearchErrorsData={googleSearchErrorsData}
          googleSearchAttemptIssuesData={googleSearchAttemptIssuesData}
          // --- Props MỚI cho Gemini API ---
          geminiApiStatusData={geminiApiStatusData} // Sửa tên
          totalGeminiCallsWithRetries={totalGeminiCallsWithRetries}
          geminiModelUsageDetailedData={geminiModelUsageDetailedData}
          geminiFallbackSuccessRateData={geminiFallbackSuccessRateData}
          geminiConfigErrorsData={geminiConfigErrorsData}
          geminiCacheDetailedData={geminiCacheDetailedData} // Thay thế cacheStatusData cũ
          topGeminiErrorsData={topGeminiErrorsData} // Lỗi chi tiết của Gemini
          // --- Props chung khác ---
          playwrightLinkData={playwrightLinkData}
          warningsByFieldData={warningsByFieldData}
          topErrorsData={topErrorsData} // Lỗi tổng hợp từ tất cả các nguồn
        />
      )}
    </section>
  );
};

export default OverallSummary;