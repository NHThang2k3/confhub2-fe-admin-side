// src/app/[locale]/dashboard/logAnalysis/overallSummary/ChartsSection.tsx

import React from 'react';
import ChartCard from './ChartCard';
import {
  getBarChartOption,
  getPieChartOption,
  BarChartData
} from '../utils/chartUtils';
import { GoogleSearchHealthData } from './CollapsibleContent'; // Import để lấy successfulSearchesWithNoItems
import { FaGoogle } from 'react-icons/fa';

interface PieChartItem { name: string; value: number; }

interface ChartsSectionProps {
  overallStatusData: PieChartItem[];
  searchStatusData: PieChartItem[];
  apiStatusData: PieChartItem[];
  cacheStatusData: PieChartItem[];
  playwrightLinkData: PieChartItem[];
  callsByModelWithRetriesData: BarChartData;
  warningsByFieldData: BarChartData;
  apiKeyUsageData: BarChartData;
  callsByTypeWithRetriesData: BarChartData;
  topErrorsData: BarChartData;
  googleSearchErrorsData: BarChartData;
  googleSearchAttemptIssuesData: BarChartData;
  googleSearchHealthData: GoogleSearchHealthData | null; // Thêm prop này để lấy successfulSearchesWithNoItems
}

const ChartsSection: React.FC<ChartsSectionProps> = ({
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
  googleSearchErrorsData,
  googleSearchAttemptIssuesData,
  googleSearchHealthData, // Nhận prop
}) => {
  return (
    <div className="space-y-8"> {/* Container chính với khoảng cách */}
      {/* --- General Charts --- */}
      <div>
        {/* Không cần tiêu đề riêng cho nhóm này nếu nó là nhóm đầu tiên */}
        <div className='py-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <ChartCard
            option={getPieChartOption('Task Status Distribution', overallStatusData, ['#91cc75', '#5470c6', '#ee6666', '#fccb67', '#73c0de'])}
            dataExists={overallStatusData.length > 0}
            noDataMessage="No Task Status Data"
          />
          <ChartCard
            option={getPieChartOption('Gemini API Call Status', apiStatusData, ['#91cc75', '#ee6666', '#fac858', '#5470c6'])}
            dataExists={apiStatusData.length > 0}
            noDataMessage="No API Status Data"
          />
          <ChartCard
            option={getPieChartOption('Gemini API Cache Usage', cacheStatusData, ['#3ba272', '#fc8452'])}
            dataExists={cacheStatusData.length > 0}
            noDataMessage="No Cache Data"
          />
          <ChartCard
            option={getPieChartOption('Playwright Link Processing', playwrightLinkData, ['#91cc75', '#ee6666', '#73c0de'])}
            dataExists={playwrightLinkData.length > 0}
            noDataMessage="No Link Processing Data"
          />
           <ChartCard
            option={getBarChartOption('Gemini Model Usage (incl. Retries)', callsByModelWithRetriesData.labels, callsByModelWithRetriesData.values, 'Calls', '#9a60b4')}
            dataExists={callsByModelWithRetriesData.labels.length > 0}
            noDataMessage="No Model Usage Data"
          />
          <ChartCard
            option={getBarChartOption('Gemini Calls by Type (incl. Retries)', callsByTypeWithRetriesData.labels, callsByTypeWithRetriesData.values, 'Calls', '#5470c6')}
            dataExists={callsByTypeWithRetriesData.labels.length > 0}
            noDataMessage="No Calls by Type Data"
          />
        </div>
      </div>

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