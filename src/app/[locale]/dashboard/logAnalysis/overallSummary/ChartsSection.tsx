// src/app/[locale]/dashboard/logAnalysis/overallSummary/ChartsSection.tsx
import React from 'react';
import ChartCard from './ChartCard';
import {
  getBarChartOption,
  getPieChartOption,
  BarChartData
} from '../utils/chartUtils';
import { GoogleSearchHealthData } from '@/src/models/logAnalysis/logAnalysis'; // Đổi đường dẫn nếu cần
import { FaGoogle, FaBrain } from 'react-icons/fa';

interface PieChartItem { name: string; value: number; }

interface ChartsSectionProps {
  // General
  overallStatusData: PieChartItem[];
  playwrightLinkData: PieChartItem[];
  warningsByFieldData: BarChartData;
  topErrorsData: BarChartData;
  // Google Search
  searchStatusData: PieChartItem[];
  apiKeyUsageData: BarChartData;
  googleSearchHealthData: GoogleSearchHealthData | null;
  googleSearchErrorsData: BarChartData;
  googleSearchAttemptIssuesData: BarChartData;
  // Gemini API
  geminiApiStatusData: PieChartItem[];
  geminiModelUsageDetailedData: BarChartData;
  geminiFallbackSuccessRateData: PieChartItem[];
  geminiConfigErrorsData: BarChartData;
  geminiCacheDetailedData: PieChartItem[];
  topGeminiErrorsData: BarChartData;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({
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
  geminiModelUsageDetailedData,
  geminiFallbackSuccessRateData,
  geminiConfigErrorsData,
  geminiCacheDetailedData,
  topGeminiErrorsData,
}) => {
  const geminiPieColors = ['#80FFA5', '#FF6384', '#FFCD56', '#36A2EB', '#9966FF'];
  const geminiBarColors = ['#9A60B4', '#60B49A', '#B49A60', '#609AB4'];

  return (
    <div className="space-y-8">
      {/* --- General Charts --- */}
      <div>
        <div className='py-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <ChartCard
            option={getPieChartOption('Task Status Distribution', overallStatusData, ['#91cc75', '#5470c6', '#ee6666', '#fccb67', '#73c0de'])}
            dataExists={overallStatusData.length > 0}
            noDataMessage="No Task Status Data"
          />
          <ChartCard // Example of Playwright - keep or remove as needed
            option={getPieChartOption('Playwright Link Processing', playwrightLinkData, ['#91cc75', '#ee6666', '#73c0de'])}
            dataExists={playwrightLinkData.length > 0}
            noDataMessage="No Link Processing Data"
          />
           <ChartCard // Example of Validation - keep or remove as needed
            option={getBarChartOption('Validation Warnings by Field', warningsByFieldData.labels, warningsByFieldData.values, 'Warnings', '#f59e0b')}
            dataExists={warningsByFieldData.labels.length > 0}
            noDataMessage="No Validation Warnings"
          />
        </div>
      </div>

      {/* --- Gemini API Charts --- */}
      {(geminiApiStatusData.length > 0 || geminiModelUsageDetailedData.labels.length > 0 || topGeminiErrorsData.labels.length > 0) && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FaBrain className="mr-2 text-purple-500" /> Gemini API Analysis
          </h3>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <ChartCard
              option={getPieChartOption('Gemini API Call Status', geminiApiStatusData, geminiPieColors)}
              dataExists={geminiApiStatusData.length > 0}
              noDataMessage="No Gemini API Status Data"
            />
            <ChartCard
              option={getPieChartOption('Gemini Cache Details', geminiCacheDetailedData, ['#3ba272', '#fc8452', '#ee6666', '#fac858'])}
              dataExists={geminiCacheDetailedData.length > 0}
              noDataMessage="No Gemini Cache Data"
            />
            <ChartCard
              option={getPieChartOption('Gemini Fallback Success Rate', geminiFallbackSuccessRateData, ['#91cc75', '#ee6666'])}
              dataExists={geminiFallbackSuccessRateData.length > 0 && geminiFallbackSuccessRateData.some(d => d.value > 0)}
              noDataMessage="No Fallback Data or No Fallbacks Attempted"
            />
            <ChartCard // Biểu đồ cột cho Model Usage
              option={getBarChartOption('Gemini Model Usage (API Type: Model (Crawl Type))', geminiModelUsageDetailedData.labels, geminiModelUsageDetailedData.values, 'Total Attempts', geminiBarColors[0])}
              dataExists={geminiModelUsageDetailedData.labels.length > 0}
              noDataMessage="No Gemini Model Usage Data"
              className="md:col-span-2 lg:col-span-3" // Cho phép biểu đồ này rộng hơn
            />
             <ChartCard
              option={getBarChartOption('Top Gemini API Errors', topGeminiErrorsData.labels, topGeminiErrorsData.values, 'Count', '#FF6384')}
              dataExists={topGeminiErrorsData.labels.length > 0}
              noDataMessage="No Gemini API Error Data"
            />
            <ChartCard
              option={getBarChartOption('Gemini Configuration Errors', geminiConfigErrorsData.labels, geminiConfigErrorsData.values, 'Count', '#FF9F40')}
              dataExists={geminiConfigErrorsData.labels.length > 0}
              noDataMessage="No Gemini Configuration Errors"
            />
          </div>
        </div>
      )}

      {/* --- Google Search Charts --- */}
      {(searchStatusData.length > 0 || apiKeyUsageData.labels.length > 0 || googleSearchErrorsData.labels.length > 0 || googleSearchAttemptIssuesData.labels.length > 0) && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FaGoogle className="mr-2 text-blue-500" /> Google Search Analysis
          </h3>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'> {/* Layout 2 cột cho Google Search charts */}
            <ChartCard
              option={getPieChartOption(
                'Google Search Status', 
                searchStatusData, 
                ['#91cc75', '#ee6666', '#fccb67', '#73c0de'],
                // Thêm subtext nếu có successfulSearchesWithNoItems
                googleSearchHealthData && googleSearchHealthData.successfulSearchesWithNoItems > 0 
                ? `Successful (No Items): ${googleSearchHealthData.successfulSearchesWithNoItems}` 
                : undefined
              )}
              dataExists={searchStatusData.length > 0}
              noDataMessage="No Search Status Data"
            />
            <ChartCard
              option={getBarChartOption('Google API Key Usage', apiKeyUsageData.labels, apiKeyUsageData.values, 'Requests', '#ea7ccc')}
              dataExists={apiKeyUsageData.labels.length > 0}
              noDataMessage="No Key Usage Data"
            />
            <ChartCard
              option={getBarChartOption('Top Google Search Errors', googleSearchErrorsData.labels, googleSearchErrorsData.values, 'Count', '#ff6384')}
              dataExists={googleSearchErrorsData.labels.length > 0}
              noDataMessage="No Google Search Error Data"
              className="md:col-span-1" // Đảm bảo nó chiếm 1 cột trên md
            />
            <ChartCard
              option={getBarChartOption('Top Google Search Attempt Issues', googleSearchAttemptIssuesData.labels, googleSearchAttemptIssuesData.values, 'Count', '#ff9f40')}
              dataExists={googleSearchAttemptIssuesData.labels.length > 0}
              noDataMessage="No Google Search Attempt Issue Data"
              className="md:col-span-1" // Đảm bảo nó chiếm 1 cột trên md
            />
          </div>
        </div>
      )}

      {/* --- Aggregated Errors & Validation Charts --- */}
      {(topErrorsData.labels.length > 0 || warningsByFieldData.labels.length > 0) && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Aggregated Errors & Validation</h3>
          <div className='grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-2'> {/* Layout 2 cột */}
            <ChartCard
                option={getBarChartOption('Validation Warnings by Field', warningsByFieldData.labels, warningsByFieldData.values, 'Warnings', '#f59e0b')}
                dataExists={warningsByFieldData.labels.length > 0}
                noDataMessage="No Validation Warnings"
            />
            <ChartCard
              option={getBarChartOption('Top Aggregated Errors (All Sources)', topErrorsData.labels, topErrorsData.values, 'Count', '#ee6666')}
              dataExists={topErrorsData.labels.length > 0}
              noDataMessage="No Aggregated Errors"
              // className="md:col-span-2 lg:col-span-3" // Điều chỉnh nếu cần full width
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsSection;