import React from 'react';
import ChartCard from '../ChartCard';
import { getPieChartOption, getBarChartOption, BarChartData, PieChartItem } from '../../utils/chartUtils';

interface GeminiApiChartsProps {
  geminiApiStatusData: PieChartItem[];
  geminiModelUsageDetailedData: BarChartData;
  geminiFallbackSuccessRateData: PieChartItem[];
  geminiConfigErrorsData: BarChartData;
  geminiCacheDetailedData: PieChartItem[];
  topGeminiErrorsData: BarChartData;
}

const GeminiApiCharts: React.FC<GeminiApiChartsProps> = ({
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
    <div className="space-y-6">
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
          className="md:col-span-2 lg:col-span-3" // Example: spanning multiple columns
        />

        <ChartCard
          option={getBarChartOption('Gemini Configuration Errors', geminiConfigErrorsData.labels, geminiConfigErrorsData.values, 'Count', '#FF9F40')}
          dataExists={geminiConfigErrorsData.labels.length > 0}
          noDataMessage="No Gemini Configuration Errors"
        />
        <ChartCard
          option={getBarChartOption('Top Gemini API Errors', topGeminiErrorsData.labels, topGeminiErrorsData.values, 'Count', '#FF6384')}
          dataExists={topGeminiErrorsData.labels.length > 0}
          noDataMessage="No Gemini API Error Data"
        />
      </div>
    </div>
  );
};

export default GeminiApiCharts;