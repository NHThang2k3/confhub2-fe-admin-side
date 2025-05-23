// src/app/[locale]/dashboard/logAnalysis/overallSummary/ChartCard.tsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface ChartCardProps {
  option: EChartsOption;
  dataExists: boolean;
  noDataMessage?: string;
  className?: string;
  chartHeight?: string; // << THÊM PROP MỚI
}

const ChartCard: React.FC<ChartCardProps> = ({
  option,
  dataExists,
  noDataMessage = "No Data Available",
  className = "",
  chartHeight = '300px' // << GIÁ TRỊ MẶC ĐỊNH
}) => {
  return (
    // Điều chỉnh min-h-[...] để phù hợp với chartHeight hoặc loại bỏ nếu chartHeight luôn được set
    // Ở đây, chúng ta sẽ để chartHeight quyết định chiều cao chính, nhưng giữ min-h cho trường hợp noData
    <div className={`rounded-lg border border-gray-100 bg-white p-4 shadow-sm ${className}`}>
      {dataExists ? (
        <ReactECharts
          option={option}
          style={{ height: chartHeight, width: '100%' }} // << SỬ DỤNG chartHeight
          notMerge
          lazyUpdate
        />
      ) : (
        // Đảm bảo noDataMessage cũng có chiều cao tương ứng nếu cần
        <div
          className='flex items-center justify-center text-gray-500'
          style={{ height: chartHeight }} // << ÁP DỤNG chartHeight CHO NO DATA
        >
          {noDataMessage}
        </div>
      )}
    </div>
  );
};

export default ChartCard;