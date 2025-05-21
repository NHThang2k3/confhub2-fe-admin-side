// src/app/[locale]/dashboard/logAnalysis/overallSummary/CollapsibleContent.tsx

import React from 'react';
import KpiSection from './KpiSection';
import ChartsSection from './ChartsSection';
import LogProcessingErrorsDisplay from './LogProcessingErrorsDisplay';
import { BarChartData } from '../utils/chartUtils'; // Adjust path
import { LogAnalysisResult } from '@/src/models/logAnalysis/logAnalysis';

interface PieChartItem { name: string; value: number; }

// Đảm bảo interface này được định nghĩa hoặc import
export interface GoogleSearchHealthData {
  rotationsSuccess: number;
  rotationsFailed: number;
  allKeysExhaustedOnGetNextKey: number;
  maxUsageLimitsReachedTotal: number;
  successfulSearchesWithNoItems: number;
}

interface CollapsibleContentProps {
  isExpanded: boolean;
  data: LogAnalysisResult;
  totalGeminiCallsWithRetries: number;
  // Chart data props
  overallStatusData: PieChartItem[];
  searchStatusData: PieChartItem[]; // Sẽ được cập nhật
  apiStatusData: PieChartItem[];
  cacheStatusData: PieChartItem[];
  playwrightLinkData: PieChartItem[];
  callsByModelWithRetriesData: BarChartData;
  warningsByFieldData: BarChartData;
  apiKeyUsageData: BarChartData;
  callsByTypeWithRetriesData: BarChartData;
  topErrorsData: BarChartData;
  
  // --- Props MỚI cho Google Search chi tiết ---
  googleSearchHealthData: GoogleSearchHealthData | null;
  googleSearchErrorsData: BarChartData;
  googleSearchAttemptIssuesData: BarChartData;
}

const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  isExpanded,
  data,
  totalGeminiCallsWithRetries,
  overallStatusData,
  searchStatusData,
  apiStatusData,
  cacheStatusData,
  playwrightLinkData,
  callsByModelWithRetriesData,
  warningsByFieldData,
  apiKeyUsageData,
  callsByTypeWithRetriesData,
  topErrorsData,
  // --- Destructure props MỚI ---
  googleSearchHealthData,
  googleSearchErrorsData,
  googleSearchAttemptIssuesData,
}) => {
  return (
    <div
      id='overall-summary-content-area'
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-[5000px] p-4 opacity-100 visible' : 'max-h-0 p-0 opacity-0 invisible'
      }`}
    >
      <KpiSection 
        data={data} 
        totalGeminiCallsWithRetries={totalGeminiCallsWithRetries}
        // --- Truyền GoogleSearchHealthData vào KpiSection ---
        googleSearchHealthData={googleSearchHealthData}
      />
      <ChartsSection
        overallStatusData={overallStatusData}
        searchStatusData={searchStatusData} // Pie chart chính
        apiStatusData={apiStatusData}
        cacheStatusData={cacheStatusData}
        playwrightLinkData={playwrightLinkData}
        callsByModelWithRetriesData={callsByModelWithRetriesData}
        warningsByFieldData={warningsByFieldData}
        apiKeyUsageData={apiKeyUsageData} // Bar chart sử dụng key
        callsByTypeWithRetriesData={callsByTypeWithRetriesData}
        topErrorsData={topErrorsData}
        // --- Truyền BarChartData mới vào ChartsSection ---
        googleSearchErrorsData={googleSearchErrorsData}
        googleSearchAttemptIssuesData={googleSearchAttemptIssuesData}
                googleSearchHealthData={googleSearchHealthData} // << TRUYỀN XUỐNG ĐÂY

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