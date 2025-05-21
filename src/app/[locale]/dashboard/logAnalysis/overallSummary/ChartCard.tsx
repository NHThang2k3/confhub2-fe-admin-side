// src/app/[locale]/dashboard/logAnalysis/overallSummary/ChartCard.tsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts'; // Import EChartsOption type

interface ChartCardProps {
  option: EChartsOption; // Use the EChartsOption type
  dataExists: boolean;
  noDataMessage?: string;
  className?: string; // For additional styling like col-span
}

const ChartCard: React.FC<ChartCardProps> = ({
  option,
  dataExists,
  noDataMessage = "No Data Available",
  className = ""
}) => {
  return (
    <div className={`min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm ${className}`}>
      {dataExists ? (
        <ReactECharts
          option={option}
          style={{ height: '300px', width: '100%' }}
          notMerge
          lazyUpdate
        />
      ) : (
        <div className='flex h-[300px] items-center justify-center text-gray-500'>
          {noDataMessage}
        </div>
      )}
    </div>
  );
};

export default ChartCard;