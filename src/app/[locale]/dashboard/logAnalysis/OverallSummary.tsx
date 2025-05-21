// src/app/[locale]/dashboard/logAnalysis/OverallSummary.tsx
import React, { useMemo } from 'react';
import { LogAnalysisResult, GoogleSearchHealthData, ValidationStats } from '../../../../models/logAnalysis/logAnalysis'; // Adjust path
import { transformRecordToBarChart, BarChartData, transformObjectToPieChartData, PieChartItem } from './utils/chartUtils'; // Sửa tên hàm transformRecordForBarChart

import SummaryHeaderComponent from './overallSummary/SummaryHeader';
import NoDataMessage from './overallSummary/NoDataMessage';
import CollapsibleContent from './overallSummary/CollapsibleContent';

interface OverallSummaryProps {
  data: LogAnalysisResult;
  isExpanded: boolean;
  onToggle: () => void;
}

const OverallSummary: React.FC<OverallSummaryProps> = ({
  data,
  isExpanded,
  onToggle
}) => {
  const gSearchData = data?.googleSearch;
  const geminiApiData = data?.geminiApi;
  const validationStats = data?.validationStats; // Lấy validationStats

  // --- General Status ---
  const overallStatusData = useMemo<PieChartItem[]>(() => {
    if (!data?.overall) return [];
    const { completedTasks = 0, failedOrCrashedTasks = 0, processingTasks = 0, skippedTasks = 0 } = data.overall;
    return [
      { name: 'Completed', value: completedTasks },
      { name: 'Processing', value: processingTasks },
      { name: 'Failed/Crashed', value: failedOrCrashedTasks },
      { name: 'Skipped', value: skippedTasks }
    ].filter(item => item.value > 0);
  }, [data?.overall]);

  const playwrightLinkData = useMemo<PieChartItem[]>(() => {
    if (!data?.playwright?.linkProcessing) return [];
    const { successfulAccess = 0, failedAccess = 0, redirects = 0 } = data.playwright.linkProcessing;
    return [
      { name: 'Successful Access', value: successfulAccess },
      { name: 'Failed Access', value: failedAccess },
      { name: 'Redirects', value: redirects }
    ].filter(item => item.value > 0);
  }, [data?.playwright?.linkProcessing]);

  // --- Google Search Data ---
  const searchStatusData = useMemo<PieChartItem[]>(() => {
    if (!gSearchData) return [];
    const { successfulSearches = 0, failedSearches = 0, skippedSearches = 0, quotaErrorsEncountered = 0 } = gSearchData;
    return [
      { name: 'Successful', value: successfulSearches },
      { name: 'Failed', value: failedSearches },
      { name: 'Skipped', value: skippedSearches },
      { name: 'Quota Errors', value: quotaErrorsEncountered }
    ].filter(item => item.value > 0);
  }, [gSearchData]);

  const apiKeyUsageData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(gSearchData?.keyUsage, 0, false);
  }, [gSearchData?.keyUsage]);

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

  const googleSearchErrorsData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(gSearchData?.errorsByType, 5, true);
  }, [gSearchData?.errorsByType]);

  const googleSearchAttemptIssuesData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(gSearchData?.attemptIssueDetails, 5, true);
  }, [gSearchData?.attemptIssueDetails]);

  // --- Gemini API Data ---
  const geminiApiStatusData = useMemo<PieChartItem[]>(() => {
    if (!geminiApiData) return [];
    const { successfulCalls = 0, failedCalls = 0, blockedBySafety = 0, totalRetries = 0 } = geminiApiData;
    return [
      { name: 'Successful Calls', value: successfulCalls },
      { name: 'Failed Calls', value: failedCalls },
      { name: 'Safety Blocks', value: blockedBySafety },
      ...(totalRetries > 0 ? [{ name: 'Total Retries', value: totalRetries }] : [])
    ].filter(item => item.value > 0);
  }, [geminiApiData]);

  const totalGeminiCallsWithRetries = useMemo(() => {
    if (!geminiApiData) return 0;
    return (geminiApiData.totalCalls || 0) + (geminiApiData.totalRetries || 0);
  }, [geminiApiData]);

  const geminiModelUsageDetailedData = useMemo<BarChartData>(() => {
    if (!geminiApiData?.modelUsageByApiType) return { labels: [], values: [] };
    const combined: Record<string, number> = {};
    Object.entries(geminiApiData.modelUsageByApiType).forEach(([apiType, models]) => {
      Object.entries(models).forEach(([modelIdentifier, stats]) => {
        const key = `${apiType}: ${modelIdentifier.replace(/models\//, '')}`; // Rút gọn tên model
        combined[key] = (combined[key] || 0) + (stats.calls || 0) + (stats.retries || 0);
      });
    });
    return transformRecordToBarChart(combined, 0, true);
  }, [geminiApiData?.modelUsageByApiType]);

  const geminiFallbackSuccessRateData = useMemo<PieChartItem[]>(() => {
    if (!geminiApiData?.fallbackLogic) return [];
    const { attemptsWithFallbackModel = 0, successWithFallbackModel = 0 } = geminiApiData.fallbackLogic;
    if (attemptsWithFallbackModel === 0) return [];
    return [
      { name: 'Fallback Success', value: successWithFallbackModel },
      { name: 'Fallback Failure', value: attemptsWithFallbackModel - successWithFallbackModel }
    ].filter(item => item.value >= 0);
  }, [geminiApiData?.fallbackLogic]);

  const geminiConfigErrorsData = useMemo<BarChartData>(() => {
    if (!geminiApiData?.configErrors && !geminiApiData?.fewShotPreparation?.failures) return { labels: [], values: [] };
    const errors: Record<string, number> = {};
    if (geminiApiData?.configErrors?.modelListMissing ?? 0 > 0) {
      errors['Model List Missing'] = geminiApiData.configErrors!.modelListMissing;
    }
    if (geminiApiData?.fewShotPreparation?.failures?.oddPartsCount ?? 0 > 0) {
      errors['Few-Shot Odd Parts'] = geminiApiData.fewShotPreparation!.failures!.oddPartsCount;
    }
    if (geminiApiData?.fewShotPreparation?.failures?.processingError ?? 0 > 0) {
      errors['Few-Shot Proc. Error'] = geminiApiData.fewShotPreparation!.failures!.processingError;
    }
    return transformRecordToBarChart(errors, 0, true);
  }, [geminiApiData?.configErrors, geminiApiData?.fewShotPreparation?.failures]);

  const geminiCacheDetailedData = useMemo<PieChartItem[]>(() => {
    if (!geminiApiData) return [];
    return [
      { name: 'Context Hits', value: geminiApiData.cacheContextHits || 0 },
      { name: 'Creation Success', value: geminiApiData.cacheContextCreationSuccess || 0 },
      { name: 'Creation Failed', value: geminiApiData.cacheContextCreationFailed || 0 },
      { name: 'Invalidations', value: geminiApiData.cacheContextInvalidations || 0 },
    ].filter(item => item.value > 0);
  }, [geminiApiData]);

  const topGeminiErrorsData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(geminiApiData?.errorsByType, 5, true);
  }, [geminiApiData?.errorsByType]);

  // --- Validation & Normalization Data ---
  const warningsByFieldData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(validationStats?.warningsByField, 0, true);
  }, [validationStats?.warningsByField]);

  const warningsBySeverityData = useMemo<PieChartItem[]>(() => { // << MỚI
    if (!validationStats?.warningsBySeverity) return [];
    return transformObjectToPieChartData(validationStats.warningsBySeverity);
  }, [validationStats?.warningsBySeverity]);

  const topWarningMessagesData = useMemo<BarChartData>(() => { // << MỚI
    return transformRecordToBarChart(validationStats?.warningsByInsightMessage, 5, true); // Top 5 messages
  }, [validationStats?.warningsByInsightMessage]);

  const normalizationsByFieldData = useMemo<BarChartData>(() => { // << MỚI
    return transformRecordToBarChart(validationStats?.normalizationsByField, 0, true);
  }, [validationStats?.normalizationsByField]);

  const normalizationsByReasonData = useMemo<PieChartItem[]>(() => { // << MỚI
     if (!validationStats?.normalizationsByReason) return [];
     return transformObjectToPieChartData(validationStats.normalizationsByReason);
  }, [validationStats?.normalizationsByReason]);


  // --- Aggregated Errors ---
  const topErrorsData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(data?.errorsAggregated, 10, true);
  }, [data?.errorsAggregated]);

  // --- Summary Title & Data Check ---
  const summaryTitle = useMemo(() => {
    return data?.filterRequestId
      ? `Summary for Request: ${data.filterRequestId}`
      : "Overall Crawl Summary";
  }, [data?.filterRequestId]);

  const hasMeaningfulData = useMemo(() => {
    return (data?.overall && (
      (data.overall.processedConferencesCount || 0) > 0 ||
      (data.overall.totalConferencesInput || 0) > 0
    )) || (data.errorLogCount || 0) > 0 || (validationStats?.totalValidationWarnings || 0) > 0; // Thêm kiểm tra warning
  }, [data?.overall, data?.errorLogCount, validationStats]);

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
          // General
          overallStatusData={overallStatusData}
          playwrightLinkData={playwrightLinkData}
          topErrorsData={topErrorsData}
          // Google Search
          searchStatusData={searchStatusData}
          apiKeyUsageData={apiKeyUsageData}
          googleSearchHealthData={googleSearchHealthData}
          googleSearchErrorsData={googleSearchErrorsData}
          googleSearchAttemptIssuesData={googleSearchAttemptIssuesData}
          // Gemini API
          geminiApiStatusData={geminiApiStatusData}
          totalGeminiCallsWithRetries={totalGeminiCallsWithRetries}
          geminiModelUsageDetailedData={geminiModelUsageDetailedData}
          geminiFallbackSuccessRateData={geminiFallbackSuccessRateData}
          geminiConfigErrorsData={geminiConfigErrorsData}
          geminiCacheDetailedData={geminiCacheDetailedData}
          topGeminiErrorsData={topGeminiErrorsData}
          // Validation & Normalization << THÊM MỚI
          warningsByFieldData={warningsByFieldData}
          warningsBySeverityData={warningsBySeverityData}
          topWarningMessagesData={topWarningMessagesData}
          normalizationsByFieldData={normalizationsByFieldData}
          normalizationsByReasonData={normalizationsByReasonData}
        />
      )}
    </section>
  );
};

export default OverallSummary;