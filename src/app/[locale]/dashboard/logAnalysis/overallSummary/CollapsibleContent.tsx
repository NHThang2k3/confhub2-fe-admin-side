// src/app/[locale]/dashboard/logAnalysis/overallSummary/CollapsibleContent.tsx
import React from 'react';
import KpiSection from './KpiSection';
import ChartsSection from './ChartsSection'; // Sẽ được cập nhật ở bước sau
import LogProcessingErrorsDisplay from './LogProcessingErrorsDisplay';
import { BarChartData, PieChartItem } from '../utils/chartUtils';
import { LogAnalysisResult, GoogleSearchHealthData } from '@/src/models/logAnalysis/logAnalysis';

interface CollapsibleContentProps {
  isExpanded: boolean;
  data: LogAnalysisResult;

  // --- General Props ---
  overallStatusData: PieChartItem[];
  playwrightLinkData: PieChartItem[];
  topErrorsData: BarChartData;

  // --- Google Search Props ---
  searchStatusData: PieChartItem[];
  apiKeyUsageData: BarChartData;
  googleSearchHealthData: GoogleSearchHealthData | null;
  googleSearchErrorsData: BarChartData;
  googleSearchAttemptIssuesData: BarChartData;

  // --- Gemini API Props ---
  geminiApiStatusData: PieChartItem[];
  totalGeminiCallsWithRetries: number;
  geminiModelUsageDetailedData: BarChartData;
  geminiFallbackSuccessRateData: PieChartItem[];
  geminiConfigErrorsData: BarChartData;
  geminiCacheDetailedData: PieChartItem[];
  topGeminiErrorsData: BarChartData;

  // --- Validation & Normalization Props << THÊM MỚI ---
  warningsByFieldData: BarChartData;
  warningsBySeverityData: PieChartItem[];
  topWarningMessagesData: BarChartData;
  normalizationsByFieldData: BarChartData;
  normalizationsByReasonData: PieChartItem[];
}

const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  isExpanded,
  data,
  // General
  overallStatusData,
  playwrightLinkData,
  topErrorsData,
  // Google Search
  searchStatusData,
  apiKeyUsageData,
  googleSearchHealthData,
  googleSearchErrorsData,
  googleSearchAttemptIssuesData,
  // Gemini API
  geminiApiStatusData,
  totalGeminiCallsWithRetries,
  geminiModelUsageDetailedData,
  geminiFallbackSuccessRateData,
  geminiConfigErrorsData,
  geminiCacheDetailedData,
  topGeminiErrorsData,
  // Validation & Normalization << THÊM MỚI
  warningsByFieldData,
  warningsBySeverityData,
  topWarningMessagesData,
  normalizationsByFieldData,
  normalizationsByReasonData,
}) => {
  return (
    <div
      id='overall-summary-content-area'
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-[9000px] p-4 opacity-100 visible' : 'max-h-0 p-0 opacity-0 invisible' // Tăng max-h
      }`}
    >
      <KpiSection
        data={data}
        googleSearchHealthData={googleSearchHealthData}
        geminiApiData={data.geminiApi}
        totalGeminiCallsWithRetries={totalGeminiCallsWithRetries}
        validationStats={data.validationStats} // << THÊM validationStats cho KPI
      />
      <ChartsSection
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
      <LogProcessingErrorsDisplay
        logProcessingErrors={data.logProcessingErrors}
        parseErrors={data.parseErrors}
        totalLogEntries={data.totalLogEntries}
      />
    </div>
  );
};

export default CollapsibleContent;