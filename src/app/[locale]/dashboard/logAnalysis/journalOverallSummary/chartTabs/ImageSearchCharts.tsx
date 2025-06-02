// src/app/[locale]/dashboard/logAnalysis/journalOverallSummary/chartTabs/ImageSearchCharts.tsx (File mới)
import React from 'react';
import ChartCard from '../../overallSummary/ChartCard';
import { getPieChartOption, getBarChartOption, BarChartData, PieChartItem } from '../../utils/chartUtils';
import { useTranslations } from 'next-intl';
// Import GoogleSearchHealthData nếu bạn muốn hiển thị các KPI sức khỏe API key ở đây
// import { GoogleSearchHealthData } from '@/src/models/logAnalysis';

interface ImageSearchChartsProps {
  // Dữ liệu được tính toán từ JournalOverallSummary.tsx
  searchStatusData: PieChartItem[];
  // apiKeyUsageData: BarChartData;
  errorsData: BarChartData;
  // googleSearchHealthData?: GoogleSearchHealthData | null; // Tùy chọn
}

const ImageSearchCharts: React.FC<ImageSearchChartsProps> = ({
  searchStatusData,
  // apiKeyUsageData,
  errorsData,
  // googleSearchHealthData
}) => {
  const t = useTranslations('ImageSearchCharts'); // Namespace mới

  return (
    <div className="space-y-6">
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'> {/* Có thể điều chỉnh layout */}
        <ChartCard
          option={getPieChartOption(
            t('searchStatusTitle'),
            searchStatusData,
            ['#91cc75', '#ee6666', '#fccb67', '#73c0de'],
            // Thêm subtext nếu cần, ví dụ: số lượng search thành công nhưng không có kết quả
            // data.googleSearch?.successfulSearchesWithNoItems > 0 ? `(${data.googleSearch.successfulSearchesWithNoItems} successful with no items)` : undefined
          )}
          dataExists={searchStatusData.length > 0}
          noDataMessage={t('noSearchStatusData')}
        />
        {/* <ChartCard
          option={getBarChartOption(t('apiKeyUsageTitle'), apiKeyUsageData.labels, apiKeyUsageData.values, t('common.requests'), '#ea7ccc')}
          dataExists={apiKeyUsageData.labels.length > 0}
          noDataMessage={t('noApiKeyUsageData')}
        /> */}
        <ChartCard
          option={getBarChartOption(t('topErrorsTitle'), errorsData.labels, errorsData.values, t('common.count'), '#ff6384')}
          dataExists={errorsData.labels.length > 0}
          noDataMessage={t('noErrorsData')}
          className="md:col-span-2" // Cho biểu đồ lỗi rộng hơn
        />
      </div>
      {/* 
        Nếu bạn muốn hiển thị GoogleSearchHealthData (KPIs về API key rotations, etc.) 
        thì có thể thêm một section riêng ở đây hoặc tích hợp vào KpiSection.
      */}
    </div>
  );
};

export default ImageSearchCharts;