// src/app/[locale]/dashboard/logAnalysis/journalOverallSummary/chartTabs/ScimagoCharts.tsx (File mới)
import React from 'react';
import ChartCard from '../../overallSummary/ChartCard';
import { getPieChartOption, getBarChartOption, BarChartData, PieChartItem } from '../../utils/chartUtils'; // Tái sử dụng
import { useTranslations } from 'next-intl';

interface ScimagoChartsProps {
  // Dữ liệu được tính toán từ JournalOverallSummary.tsx
  detailPageStatusData: PieChartItem[];
  // listPageStatusData: PieChartItem[]; // Thêm nếu có phân tích list page
  errorsData: BarChartData;
  // Thêm các props khác nếu cần, ví dụ: lastPageDeterminationStatusData
}

const ScimagoCharts: React.FC<ScimagoChartsProps> = ({
  detailPageStatusData,
  // listPageStatusData,
  errorsData,
}) => {
  const t = useTranslations('ScimagoCharts'); // Namespace mới

  return (
    <div className="space-y-6">
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <ChartCard
          option={getPieChartOption(t('detailPageStatusTitle'), detailPageStatusData, ['#91cc75', '#ee6666', '#fccb67'])}
          dataExists={detailPageStatusData.length > 0}
          noDataMessage={t('noDetailPageStatusData')}
        />

        {/* Biểu đồ cho List Pages nếu có */}
        {/* {listPageStatusData && listPageStatusData.length > 0 && (
          <ChartCard
            option={getPieChartOption(t('listPageStatusTitle'), listPageStatusData, ['#5470c6', '#ee6666'])}
            dataExists={listPageStatusData.length > 0}
            noDataMessage={t('noListPageStatusData')}
          />
        )} */}

        <ChartCard
          option={getBarChartOption(t('topErrorsTitle'), errorsData.labels, errorsData.values, t('common.count'), '#ee6666')}
          dataExists={errorsData.labels.length > 0}
          noDataMessage={t('noErrorsData')}
          // Điều chỉnh col-span nếu listPageStatusData không tồn tại
          // className={(!listPageStatusData || listPageStatusData.length === 0) ? "md:col-span-2 lg:col-span-1" : ""}
        />
      </div>
      {/* Thêm các biểu đồ khác cho Scimago nếu cần */}
    </div>
  );
};

export default ScimagoCharts;