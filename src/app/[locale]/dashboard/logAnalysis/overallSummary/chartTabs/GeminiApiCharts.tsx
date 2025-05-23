// src/app/[locale]/dashboard/logAnalysis/overallSummary/chartTabs/GeminiApiCharts.tsx
import React from 'react';
import ChartCard from '../ChartCard'; // Đảm bảo đường dẫn đúng
import { getPieChartOption, getBarChartOption, BarChartData, PieChartItem } from '../../utils/chartUtils'; // Đảm bảo đường dẫn đúng
import { FaExclamationCircle, FaCogs, FaRandom, FaShieldAlt, FaFileSignature, FaMemory } from 'react-icons/fa'; // Thêm icons

interface GeminiApiChartsProps {
  geminiApiStatusData: PieChartItem[];
  geminiModelUsageDetailedData: BarChartData; // Giữ lại, nhưng có thể cần điều chỉnh cách hiển thị
  geminiOrchestrationData: PieChartItem[]; // Mới: Primary/Fallback Success/Failure
  geminiFallbackSuccessRateData: PieChartItem[]; // Có thể bỏ nếu orchestrationData đủ
  geminiConfigErrorsData: BarChartData; // Mới: Tổng hợp các lỗi config
  geminiCacheDetailedData: PieChartItem[]; // Cập nhật để bao gồm nhiều chi tiết hơn
  geminiResponseProcessingData: BarChartData; // Mới: Các vấn đề trong xử lý response
  topGeminiErrorsData: BarChartData;
}

const GeminiApiCharts: React.FC<GeminiApiChartsProps> = ({
  geminiApiStatusData,
  geminiModelUsageDetailedData,
  geminiOrchestrationData,
  geminiFallbackSuccessRateData, // Xem xét có cần giữ lại không
  geminiConfigErrorsData,
  geminiCacheDetailedData,
  geminiResponseProcessingData,
  topGeminiErrorsData,
}) => {
  const geminiPieColors = ['#80FFA5', '#FF6384', '#FFCD56', '#36A2EB', '#9966FF', '#FF9F40'];
  const geminiBarColors = ['#9A60B4', '#60B49A', '#B49A60', '#609AB4', '#d48265', '#c23531'];

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
           {/* Có thể bỏ geminiFallbackSuccessRateData nếu geminiOrchestrationData đã đủ thông tin */}
           {geminiFallbackSuccessRateData.length > 0 && geminiFallbackSuccessRateData.some(d => d.value > 0) && (
            <ChartCard
                option={getPieChartOption('Fallback Model Success Rate (Standalone)', geminiFallbackSuccessRateData, ['#91cc75', '#ee6666'])}
                dataExists={true}
                noDataMessage="No Fallback Data or No Fallbacks Attempted"
            />
           )}
        </div>
      </div>

      {/* Section 2: Model Usage */}
      {geminiModelUsageDetailedData.labels.length > 0 && (
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-lg font-medium mb-3 text-gray-700 flex items-center">
            <FaRandom className="mr-2 text-green-500" /> Model Usage Breakdown
          </h4>
          <div className='grid grid-cols-1 gap-6'>
            <ChartCard
              option={getBarChartOption('Gemini Model Usage (Calls, Success, Fail, Retries)', geminiModelUsageDetailedData.labels, geminiModelUsageDetailedData.values, 'Count', geminiBarColors[0])} // Tăng chiều cao
              dataExists={geminiModelUsageDetailedData.labels.length > 0}
              noDataMessage="No Gemini Model Usage Data"
              className="md:col-span-1" // Cho phép nó chiếm toàn bộ chiều rộng nếu chỉ có 1 biểu đồ trong section này
              chartHeight="500px" // Explicit height
            />
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