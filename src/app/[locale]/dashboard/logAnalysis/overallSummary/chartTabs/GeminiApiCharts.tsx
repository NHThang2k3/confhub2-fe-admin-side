// src/app/[locale]/dashboard/logAnalysis/overallSummary/chartTabs/GeminiApiCharts.tsx
import React from 'react';
import ChartCard from '../ChartCard';
import { getPieChartOption, getBarChartOption, BarChartData, PieChartItem } from '../../utils/chartUtils';
import { FaExclamationCircle, FaCogs, FaRandom, FaShieldAlt, FaFileSignature, FaMemory } from 'react-icons/fa';
import { GeminiApiAnalysis } from '@/src/models/logAnalysis';

interface GeminiApiChartsProps {
  geminiApiStatusData: PieChartItem[];
  geminiModelUsageRawData: GeminiApiAnalysis['modelUsageByApiType'];
  geminiOrchestrationData: PieChartItem[];
  geminiFallbackSuccessRateData: PieChartItem[];
  geminiConfigErrorsData: BarChartData;
  geminiCacheDetailedData: PieChartItem[];
  geminiResponseProcessingData: BarChartData;
  topGeminiErrorsData: BarChartData;
}

const GeminiApiCharts: React.FC<GeminiApiChartsProps> = ({
  geminiApiStatusData,
  geminiModelUsageRawData,
  geminiOrchestrationData,
  geminiFallbackSuccessRateData,
  geminiConfigErrorsData,
  geminiCacheDetailedData,
  geminiResponseProcessingData,
  topGeminiErrorsData,
}) => {
  const geminiPieColors = ['#80FFA5', '#FF6384', '#FFCD56', '#36A2EB', '#9966FF', '#FF9F40'];
  const geminiBarColors = ['#9A60B4', '#60B49A', '#B49A60', '#609AB4', '#d48265', '#c23531'];

  // Helper để kiểm tra xem có dữ liệu sử dụng model nào không
  const hasModelUsageData = Object.keys(geminiModelUsageRawData).some(apiType =>
    Object.keys(geminiModelUsageRawData[apiType]).length > 0
  );

  // --- Tính toán tổng cộng cho bảng ---
  const totals = React.useMemo(() => {
    let totalCalls = 0;
    let totalSuccesses = 0;
    let totalFailures = 0;
    let totalRetries = 0;
    let totalTokens = 0;
    let totalSafetyBlocks = 0;

    Object.values(geminiModelUsageRawData).forEach(models => {
      Object.values(models).forEach(stats => {
        totalCalls += stats.calls || 0;
        totalSuccesses += stats.successes || 0;
        totalFailures += stats.failures || 0;
        totalRetries += stats.retries || 0;
        totalTokens += stats.tokens || 0;
        totalSafetyBlocks += stats.safetyBlocks || 0;
      });
    });

    return {
      totalCalls,
      totalSuccesses,
      totalFailures,
      totalRetries,
      totalTokens,
      totalSafetyBlocks,
    };
  }, [geminiModelUsageRawData]);

  return (
    <div className="space-y-8">
      {/* Section 1: Call Status & Orchestration */}
      <div>
        <h4 className="text-lg font-medium mb-3 text-gray-700 flex items-center">
          <FaCogs className="mr-2 text-blue-500" /> Call Status & Orchestration
        </h4>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <ChartCard
            option={getPieChartOption('Gemini API Call Status (Overall)', geminiApiStatusData, geminiPieColors)}
            dataExists={geminiApiStatusData.length > 0}
            noDataMessage="No Overall API Status Data"
          />
          <ChartCard
            option={getPieChartOption('Primary vs Fallback Outcomes', geminiOrchestrationData, ['#91cc75', '#ee6666', '#5470c6', '#fac858'])}
            dataExists={geminiOrchestrationData.length > 0}
            noDataMessage="No Orchestration Data"
          />
           {geminiFallbackSuccessRateData.length > 0 && geminiFallbackSuccessRateData.some(d => d.value > 0) && (
            <ChartCard
                option={getPieChartOption('Fallback Model Success Rate (Standalone)', geminiFallbackSuccessRateData, ['#91cc75', '#ee6666'])}
                dataExists={true}
                noDataMessage="No Fallback Data or No Fallbacks Attempted"
            />
           )}
        </div>
      </div>

      {/* Section 2: Model Usage Breakdown (Dạng bảng) */}
      {hasModelUsageData && (
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-lg font-medium mb-3 text-gray-700 flex items-center">
            <FaRandom className="mr-2 text-green-500" /> Model Usage Breakdown
          </h4>
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase  dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">API Type</th>
                  <th scope="col" className="px-6 py-3">Model</th>
                  <th scope="col" className="px-6 py-3 text-center">Calls</th>
                  <th scope="col" className="px-6 py-3 text-center">Successes</th>
                  <th scope="col" className="px-6 py-3 text-center">Failures</th>
                  <th scope="col" className="px-6 py-3 text-center">Retries</th>
                  <th scope="col" className="px-6 py-3 text-center">Tokens</th>
                  <th scope="col" className="px-6 py-3 text-center">Safety Blocks</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(geminiModelUsageRawData).map(([apiType, models]) => (
                  Object.entries(models as GeminiApiAnalysis['modelUsageByApiType'][string]).map(([modelIdentifier, stats]) => (
                    <tr key={`${apiType}-${modelIdentifier}`} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-5 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {apiType}
                      </td>
                      <td className="px-6 py-4">
                        {modelIdentifier.replace(/models\//, '')}
                      </td>
                      <td className="px-6 py-4 text-center">{stats.calls}</td>
                      <td className="px-6 py-4 text-center">{stats.successes}</td>
                      <td className="px-6 py-4 text-center">{stats.failures}</td>
                      <td className="px-6 py-4 text-center">{stats.retries}</td>
                      <td className="px-6 py-4 text-center">{stats.tokens}</td>
                      <td className="px-6 py-4 text-center">{stats.safetyBlocks}</td>
                    </tr>
                  ))
                ))}
              </tbody>
              {/* --- Dòng tổng cộng --- */}
              <tfoot>
                <tr className="font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700">
                  <th scope="row" colSpan={2} className="px-6 py-3 text-base">Total</th>
                  <td className="px-6 py-3 text-center">{totals.totalCalls}</td>
                  <td className="px-6 py-3 text-center">{totals.totalSuccesses}</td>
                  <td className="px-6 py-3 text-center">{totals.totalFailures}</td>
                  <td className="px-6 py-3 text-center">{totals.totalRetries}</td>
                  <td className="px-6 py-3 text-center">{totals.totalTokens}</td>
                  <td className="px-6 py-3 text-center">{totals.totalSafetyBlocks}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Section 3: Errors & Configuration */}
      {(topGeminiErrorsData.labels.length > 0 || geminiConfigErrorsData.labels.length > 0) && (
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-lg font-medium mb-3 text-gray-700 flex items-center">
            <FaExclamationCircle className="mr-2 text-red-500" /> Errors & Configuration Issues
          </h4>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <ChartCard
              option={getBarChartOption('Top Gemini API Errors', topGeminiErrorsData.labels, topGeminiErrorsData.values, 'Count', geminiBarColors[1])}
              dataExists={topGeminiErrorsData.labels.length > 0}
              noDataMessage="No Gemini API Error Data"
            />
            <ChartCard
              option={getBarChartOption('Gemini Configuration & Setup Issues', geminiConfigErrorsData.labels, geminiConfigErrorsData.values, 'Count', geminiBarColors[2])}
              dataExists={geminiConfigErrorsData.labels.length > 0}
              noDataMessage="No Gemini Configuration Errors"
            />
          </div>
        </div>
      )}

      {/* Section 4: Cache & Response Processing */}
      {(geminiCacheDetailedData.length > 0 || geminiResponseProcessingData.labels.length > 0) && (
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-lg font-medium mb-3 text-gray-700 flex items-center">
            <FaMemory className="mr-2 text-teal-500" /> Cache Performance & Response Handling
          </h4>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <ChartCard
              option={getPieChartOption('Gemini Cache Details', geminiCacheDetailedData, geminiPieColors.slice(0, geminiCacheDetailedData.length))}
              dataExists={geminiCacheDetailedData.length > 0}
              noDataMessage="No Gemini Cache Data"
            />
            <ChartCard
              option={getBarChartOption('Response Processing Steps/Issues', geminiResponseProcessingData.labels, geminiResponseProcessingData.values, 'Count', geminiBarColors[3])}
              dataExists={geminiResponseProcessingData.labels.length > 0}
              noDataMessage="No Response Processing Data"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiApiCharts;