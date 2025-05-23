// src/app/[locale]/dashboard/logAnalysis/overallSummary/ChartsSection.tsx
import React from 'react';
import ChartCard from './ChartCard';
import {
  getBarChartOption,
  getPieChartOption,
  BarChartData,
  PieChartItem // << IMPORT PieChartItem
} from '../utils/chartUtils';
import { GoogleSearchHealthData } from '@/src/models/logAnalysis';
import { FaGoogle, FaBrain, FaShieldAlt, FaBroom } from 'react-icons/fa'; // Thêm icon

interface ChartsSectionProps {
  // General
  overallStatusData: PieChartItem[];
  playwrightLinkData: PieChartItem[];
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
  // Validation & Normalization << THÊM MỚI
  warningsByFieldData: BarChartData;
  warningsBySeverityData: PieChartItem[];
  topWarningMessagesData: BarChartData;
  normalizationsByFieldData: BarChartData;
  normalizationsByReasonData: PieChartItem[];
}

const ChartsSection: React.FC<ChartsSectionProps> = ({
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
  const geminiPieColors = ['#80FFA5', '#FF6384', '#FFCD56', '#36A2EB', '#9966FF'];
  const geminiBarColors = ['#9A60B4', '#60B49A', '#B49A60', '#609AB4'];
  const validationPieColors = ['#FF6384', '#FF9F40', '#FFCD56']; // High, Medium, Low for warnings
  const normalizationPieColors = ['#4BC0C0', '#36A2EB', '#9966FF'];


  const hasValidationData = warningsByFieldData.labels.length > 0 ||
                            warningsBySeverityData.length > 0 ||
                            topWarningMessagesData.labels.length > 0;

  const hasNormalizationData = normalizationsByFieldData.labels.length > 0 ||
                               normalizationsByReasonData.length > 0;

  return (
    <div className="space-y-8">
      {/* --- General Charts (Bao gồm Top Aggregated Errors) --- */}
      <div className="pt-6"> {/* Removed border-t for the first section */}
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Overall Status & Errors</h3>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <ChartCard
            option={getPieChartOption('Task Status Distribution', overallStatusData, ['#91cc75', '#5470c6', '#ee6666', '#fccb67', '#73c0de'])}
            dataExists={overallStatusData.length > 0}
            noDataMessage="No Task Status Data"
          />
          <ChartCard
            option={getPieChartOption('Playwright Link Processing', playwrightLinkData, ['#91cc75', '#ee6666', '#73c0de'])}
            dataExists={playwrightLinkData.length > 0}
            noDataMessage="No Link Processing Data"
          />
          <ChartCard
            option={getBarChartOption('Top Aggregated Errors (All Sources)', topErrorsData.labels, topErrorsData.values, 'Count', '#ee6666')}
            dataExists={topErrorsData.labels.length > 0}
            noDataMessage="No Aggregated Errors"
          />
        </div>
      </div>


      {/* --- Data Validation & Normalization Charts --- */}
      {(hasValidationData || hasNormalizationData) && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FaShieldAlt className="mr-2 text-orange-500" /> Data Validation & Quality
          </h3>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <ChartCard
                option={getBarChartOption('Validation Warnings by Field', warningsByFieldData.labels, warningsByFieldData.values, 'Warnings', '#f59e0b')}
                dataExists={warningsByFieldData.labels.length > 0}
                noDataMessage="No Validation Warnings by Field"
            />
            <ChartCard
                option={getPieChartOption('Validation Warnings by Severity', warningsBySeverityData, validationPieColors)}
                dataExists={warningsBySeverityData.length > 0}
                noDataMessage="No Warnings by Severity"
            />
             <ChartCard
                option={getBarChartOption('Top Validation Messages', topWarningMessagesData.labels, topWarningMessagesData.values, 'Count', '#fdba74')}
                dataExists={topWarningMessagesData.labels.length > 0}
                noDataMessage="No Top Warning Messages"
            />
          </div>
          {hasNormalizationData && (
            <>
              <h4 className="text-lg font-medium mt-8 mb-3 text-gray-700 flex items-center">
                <FaBroom className="mr-2 text-sky-500" /> Data Normalizations
              </h4>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'> {/* Can adjust grid for normalizations */}
                <ChartCard
                    option={getBarChartOption('Normalizations by Field', normalizationsByFieldData.labels, normalizationsByFieldData.values, 'Count', '#38bdf8')}
                    dataExists={normalizationsByFieldData.labels.length > 0}
                    noDataMessage="No Normalizations by Field"
                />
                <ChartCard
                    option={getPieChartOption('Normalizations by Reason', normalizationsByReasonData, normalizationPieColors)}
                    dataExists={normalizationsByReasonData.length > 0}
                    noDataMessage="No Normalizations by Reason"
                />
              </div>
            </>
          )}
        </div>
      )}


      {/* --- Gemini API Charts --- */}
      {/* ... (Giữ nguyên, không thay đổi) ... */}
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
            <ChartCard
              option={getBarChartOption('Gemini Model Usage', geminiModelUsageDetailedData.labels, geminiModelUsageDetailedData.values, 'Total Attempts', geminiBarColors[0])}
              dataExists={geminiModelUsageDetailedData.labels.length > 0}
              noDataMessage="No Gemini Model Usage Data"
              className="md:col-span-2 lg:col-span-3"
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
      {/* ... (Giữ nguyên, không thay đổi) ... */}
      {(searchStatusData.length > 0 || apiKeyUsageData.labels.length > 0 || googleSearchErrorsData.labels.length > 0 || googleSearchAttemptIssuesData.labels.length > 0) && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FaGoogle className="mr-2 text-blue-500" /> Google Search Analysis
          </h3>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'>
            <ChartCard
              option={getPieChartOption(
                'Google Search Status',
                searchStatusData,
                ['#91cc75', '#ee6666', '#fccb67', '#73c0de'],
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
              className="md:col-span-1"
            />
            <ChartCard
              option={getBarChartOption('Top Google Search Attempt Issues', googleSearchAttemptIssuesData.labels, googleSearchAttemptIssuesData.values, 'Count', '#ff9f40')}
              dataExists={googleSearchAttemptIssuesData.labels.length > 0}
              noDataMessage="No Google Search Attempt Issue Data"
              className="md:col-span-1"
            />
          </div>
        </div>
      )}

       {/* PHẦN AGGREGATED ERRORS ĐÃ ĐƯỢC CHUYỂN LÊN TRÊN CÙNG */}
    </div>
  );
};

export default ChartsSection;