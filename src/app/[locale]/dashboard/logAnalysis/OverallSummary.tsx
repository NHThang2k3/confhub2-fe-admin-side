// src/app/[locale]/dashboard/logAnalysis/OverallSummary.tsx
import React, { useMemo } from 'react';
import { LogAnalysisResult, GoogleSearchHealthData, ValidationStats, GeminiApiAnalysis } from '../../../../models/logAnalysis';
import { transformRecordToBarChart, BarChartData, transformObjectToPieChartData, PieChartItem } from './utils/chartUtils';

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
  const validationStats = data?.validationStats;

  // --- Các useMemo hooks cũ giữ nguyên ---
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

  const searchStatusData = useMemo<PieChartItem[]>(() => {
    if (!gSearchData) return [];
    const { successfulSearches = 0, failedSearches = 0, skippedSearches = 0, quotaErrors = 0 } = gSearchData;
    return [
      { name: 'Successful', value: successfulSearches },
      { name: 'Failed', value: failedSearches },
      { name: 'Skipped', value: skippedSearches },
      { name: 'Quota Errors', value: quotaErrors }
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

  // --- Gemini API Data - Cập nhật và Bổ sung ---
  const geminiApiStatusData = useMemo<PieChartItem[]>(() => {
    if (!geminiApiData) return [];
    const { successfulCalls = 0, failedCalls = 0, blockedBySafety = 0 } = geminiApiData;
    return [
      { name: 'Successful Calls', value: successfulCalls },
      { name: 'Failed Calls', value: failedCalls },
      { name: 'Safety Blocks', value: blockedBySafety },
    ].filter(item => item.value > 0);
  }, [geminiApiData]);

  const totalGeminiCallsWithRetries = useMemo(() => {
    if (!geminiApiData) return 0;
    return (geminiApiData.totalCalls || 0) + (geminiApiData.totalRetries || 0);
  }, [geminiApiData]);

  // THÊM: Dữ liệu raw cho bảng Model Usage
  const geminiModelUsageRawData = useMemo<GeminiApiAnalysis['modelUsageByApiType']>(() => {
    return geminiApiData?.modelUsageByApiType || {};
  }, [geminiApiData?.modelUsageByApiType]);


  const geminiOrchestrationData = useMemo<PieChartItem[]>(() => {
    if (!geminiApiData) return [];
    const { primaryModelStats, fallbackModelStats } = geminiApiData;
    const data: PieChartItem[] = [];
    if (primaryModelStats?.successes > 0) data.push({ name: 'Primary Success', value: primaryModelStats.successes });
    if (primaryModelStats?.failures > 0) data.push({ name: 'Primary Failure', value: primaryModelStats.failures });
    if (fallbackModelStats?.successes > 0) data.push({ name: 'Fallback Success', value: fallbackModelStats.successes });
    if (fallbackModelStats?.failures > 0) data.push({ name: 'Fallback Failure', value: fallbackModelStats.failures });
    return data.filter(item => item.value > 0);
  }, [geminiApiData]);

  const geminiFallbackSuccessRateData = useMemo<PieChartItem[]>(() => {
    if (!geminiApiData?.fallbackModelStats) return [];
    const { attempts = 0, successes = 0 } = geminiApiData.fallbackModelStats;
    if (attempts === 0) return [];
    return [
      { name: 'Fallback Success', value: successes },
      { name: 'Fallback Failure', value: attempts - successes }
    ].filter(item => item.value >= 0);
  }, [geminiApiData?.fallbackModelStats]);


  const geminiConfigErrorsData = useMemo<BarChartData>(() => {
    if (!geminiApiData) return { labels: [], values: [] };
    const errors: Record<string, number> = {};
    const { configErrors, fewShotPreparation, apiKeyManagement, rateLimiterSetup, serviceInitialization, modelPreparationStats } = geminiApiData;

    if (configErrors?.modelListMissing > 0) errors['Model List Missing'] = configErrors.modelListMissing;
    if (configErrors?.apiTypeConfigMissing > 0) errors['API Type Cfg Missing'] = configErrors.apiTypeConfigMissing;
    if (fewShotPreparation?.failures?.oddPartsCount > 0) errors['FS: Odd Parts'] = fewShotPreparation.failures.oddPartsCount;
    if (fewShotPreparation?.failures?.processingError > 0) errors['FS: Proc. Error'] = fewShotPreparation.failures.processingError;
    if (apiKeyManagement?.unhandledApiTypeSelections > 0) errors['APIKey: Unhandled Type'] = apiKeyManagement.unhandledApiTypeSelections;
    if (apiKeyManagement?.noKeysAvailableSelections > 0) errors['APIKey: No Keys'] = apiKeyManagement.noKeysAvailableSelections;
    if (rateLimiterSetup?.creationFailures > 0) errors['RL: Creation Fail'] = rateLimiterSetup.creationFailures;
    if (serviceInitialization?.noApiKeysConfigured > 0) errors['Init: No API Keys'] = serviceInitialization.noApiKeysConfigured;
    if (serviceInitialization?.noClientsInitializedOverall > 0) errors['Init: No Clients'] = serviceInitialization.noClientsInitializedOverall;
    if (modelPreparationStats?.failures > 0) errors['ModelPrep: Fail'] = modelPreparationStats.failures;
    if (modelPreparationStats?.criticalFailures > 0) errors['ModelPrep: Critical'] = modelPreparationStats.criticalFailures;

    return transformRecordToBarChart(errors, 0, true);
  }, [geminiApiData]);

  const geminiCacheDetailedData = useMemo<PieChartItem[]>(() => {
    if (!geminiApiData) return [];
    const { cacheContextHits = 0, cacheContextCreationSuccess = 0, cacheContextRetrievalSuccess = 0, cacheContextCreationFailed = 0, cacheContextInvalidations = 0, cacheDecisionStats } = geminiApiData;
    return [
      { name: 'Context Hits', value: cacheContextHits },
      { name: 'New Cache Created', value: cacheContextCreationSuccess },
      { name: 'Existing Cache Used (Retrieved)', value: cacheContextRetrievalSuccess },
      { name: 'Creation/Retrieval Failed', value: cacheContextCreationFailed },
      { name: 'Invalidations', value: cacheContextInvalidations },
      { name: 'Cache Explicitly Disabled', value: cacheDecisionStats?.cacheExplicitlyDisabled || 0 },
    ].filter(item => item.value > 0);
  }, [geminiApiData]);

  const geminiResponseProcessingData = useMemo<BarChartData>(() => {
    if (!geminiApiData?.responseProcessingStats) return { labels: [], values: [] };
    const { markdownStripped, jsonValidationsSucceededInternal, jsonValidationFailedInternal, jsonCleaningSuccessesPublic, emptyAfterProcessingInternal, trailingCommasFixed, blockedBySafetyInResponseHandler } = geminiApiData.responseProcessingStats;
    const data: Record<string, number> = {};
    if (markdownStripped > 0) data['Markdown Stripped'] = markdownStripped;
    if (jsonValidationsSucceededInternal > 0) data['Internal JSON Valid'] = jsonValidationsSucceededInternal;
    if (jsonValidationFailedInternal > 0) data['Internal JSON Invalid'] = jsonValidationFailedInternal;
    if (jsonCleaningSuccessesPublic > 0) data['Public Clean Success'] = jsonCleaningSuccessesPublic;
    if (emptyAfterProcessingInternal > 0) data['Empty After Proc.'] = emptyAfterProcessingInternal;
    if (trailingCommasFixed > 0) data['Trailing Commas Fixed'] = trailingCommasFixed;
    if (blockedBySafetyInResponseHandler > 0) data['Safety Block (RespHandler)'] = blockedBySafetyInResponseHandler;
    return transformRecordToBarChart(data, 0, true);
  }, [geminiApiData?.responseProcessingStats]);


  const topGeminiErrorsData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(geminiApiData?.errorsByType, 5, true);
  }, [geminiApiData?.errorsByType]);

  // --- Validation & Normalization - Giữ nguyên ---
  const warningsByFieldData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(validationStats?.warningsByField, 0, true);
  }, [validationStats?.warningsByField]);

  const warningsBySeverityData = useMemo<PieChartItem[]>(() => {
    if (!validationStats?.warningsBySeverity) return [];
    return transformObjectToPieChartData(validationStats.warningsBySeverity);
  }, [validationStats?.warningsBySeverity]);

  const topWarningMessagesData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(validationStats?.warningsByInsightMessage, 5, true);
  }, [validationStats?.warningsByInsightMessage]);

  const normalizationsByFieldData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(validationStats?.normalizationsByField, 0, true);
  }, [validationStats?.normalizationsByField]);

  const normalizationsByReasonData = useMemo<PieChartItem[]>(() => {
     if (!validationStats?.normalizationsByReason) return [];
     return transformObjectToPieChartData(validationStats.normalizationsByReason);
  }, [validationStats?.normalizationsByReason]);

  const topErrorsData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(data?.errorsAggregated, 10, true);
  }, [data?.errorsAggregated]);

  const summaryTitle = useMemo(() => {
    return data?.filterRequestId
      ? `Summary for Request: ${data.filterRequestId}`
      : "Overall Crawl Summary";
  }, [data?.filterRequestId]);

  const hasMeaningfulData = useMemo(() => {
    return (data?.overall && (
      (data.overall.processedConferencesCount || 0) > 0 ||
      (data.overall.totalConferencesInput || 0) > 0
    )) || (data.errorLogCount || 0) > 0 || (validationStats?.totalValidationWarnings || 0) > 0;
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
          // Gemini API - Truyền các props mới
          geminiApiStatusData={geminiApiStatusData}
          totalGeminiCallsWithRetries={totalGeminiCallsWithRetries}
          // geminiModelUsageDetailedData={geminiModelUsageDetailedData} // Loại bỏ
          geminiModelUsageRawData={geminiModelUsageRawData} // TRUYỀN DỮ LIỆU RAW
          geminiOrchestrationData={geminiOrchestrationData}
          geminiFallbackSuccessRateData={geminiFallbackSuccessRateData}
          geminiConfigErrorsData={geminiConfigErrorsData}
          geminiCacheDetailedData={geminiCacheDetailedData}
          geminiResponseProcessingData={geminiResponseProcessingData}
          topGeminiErrorsData={topGeminiErrorsData}
          // Validation & Normalization
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