// src/app/[locale]/dashboard/logAnalysis/overallSummary/CollapsibleContent.tsx
import React from 'react';
import KpiSection from './KpiSection';
import ChartsSection from './ChartsSection';
import LogProcessingErrorsDisplay from './LogProcessingErrorsDisplay';
import { BarChartData } from '../utils/chartUtils';
import { LogAnalysisResult, GoogleSearchHealthData } from '@/src/models/logAnalysis/logAnalysis'; // Import GoogleSearchHealthData

interface PieChartItem { name: string; value: number; }

interface CollapsibleContentProps {
  isExpanded: boolean;
  data: LogAnalysisResult;
  
  // --- General Props ---
  overallStatusData: PieChartItem[];
  playwrightLinkData: PieChartItem[];
  warningsByFieldData: BarChartData;
  topErrorsData: BarChartData; // Lỗi tổng hợp

  // --- Google Search Props ---
  searchStatusData: PieChartItem[];
  apiKeyUsageData: BarChartData;
  googleSearchHealthData: GoogleSearchHealthData | null;
  googleSearchErrorsData: BarChartData;
  googleSearchAttemptIssuesData: BarChartData;

  // --- Gemini API Props ---
  geminiApiStatusData: PieChartItem[]; // Status chung của Gemini
  totalGeminiCallsWithRetries: number;
  geminiModelUsageDetailedData: BarChartData; // Chi tiết model usage
  geminiFallbackSuccessRateData: PieChartItem[]; // Tỷ lệ fallback
  geminiConfigErrorsData: BarChartData; // Lỗi config Gemini
  geminiCacheDetailedData: PieChartItem[]; // Chi tiết cache Gemini
  topGeminiErrorsData: BarChartData; // Top lỗi của Gemini
}

const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  isExpanded,
  data,
  // General
  overallStatusData,
  playwrightLinkData,
  warningsByFieldData,
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
}) => {
  return (
    <div
      id='overall-summary-content-area'
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-[7000px] p-4 opacity-100 visible' : 'max-h-0 p-0 opacity-0 invisible' // Tăng max-h nếu cần
      }`}
    >
      <KpiSection 
        data={data} 
        googleSearchHealthData={googleSearchHealthData}
        // --- Props MỚI cho Gemini KPIs ---
        geminiApiData={data.geminiApi} // Truyền toàn bộ geminiApi data để KpiSection tự lấy
        totalGeminiCallsWithRetries={totalGeminiCallsWithRetries}
      />
      <ChartsSection
        // General
        overallStatusData={overallStatusData}
        playwrightLinkData={playwrightLinkData}
        warningsByFieldData={warningsByFieldData}
        topErrorsData={topErrorsData} // Lỗi tổng hợp
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