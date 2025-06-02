// src/app/[locale]/dashboard/logAnalysis/journalOverallSummary/chartTabs/GeneralJournalCharts.tsx (File mới)
import React from 'react';
import ChartCard from '../../overallSummary/ChartCard'; // Tái sử dụng
import { getPieChartOption, getBarChartOption, BarChartData, PieChartItem } from '../../utils/chartUtils'; // Tái sử dụng
import { useTranslations } from 'next-intl';

interface GeneralJournalChartsProps {
  overallJournalStatusData: PieChartItem[];
  dataSourceDistributionData: PieChartItem[];
  playwrightJournalData: PieChartItem[]; // Giả sử có
  topAggregatedErrorsData: BarChartData;
}

const GeneralJournalCharts: React.FC<GeneralJournalChartsProps> = ({
  overallJournalStatusData,
  dataSourceDistributionData,
  playwrightJournalData,
  topAggregatedErrorsData,
}) => {
  const t = useTranslations('GeneralJournalCharts'); // Namespace mới

  return (
    <div className="space-y-6">
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <ChartCard
          option={getPieChartOption(t('overallStatusTitle'), overallJournalStatusData, ['#91cc75', '#ee6666', '#fccb67'])}
          dataExists={overallJournalStatusData.length > 0}
          noDataMessage={t('noOverallStatusData')}
        />
        <ChartCard
          option={getPieChartOption(t('dataSourceTitle'), dataSourceDistributionData, ['#5470c6', '#73c0de'])}
          dataExists={dataSourceDistributionData.length > 0}
          noDataMessage={t('noDataSourceData')}
        />
        {/* Biểu đồ Playwright có thể thêm ở đây nếu playwrightJournalData có ý nghĩa */}
        {playwrightJournalData.length > 0 && (
            <ChartCard
                option={getPieChartOption(t('playwrightAccessTitle'), playwrightJournalData, ['#91cc75', '#ee6666'])}
                dataExists={playwrightJournalData.length > 0}
                noDataMessage={t('noPlaywrightData')}
            />
        )}
        <ChartCard
          option={getBarChartOption(t('topErrorsTitle'), topAggregatedErrorsData.labels, topAggregatedErrorsData.values, t('common.count'), '#ee6666')}
          dataExists={topAggregatedErrorsData.labels.length > 0}
          noDataMessage={t('noAggregatedErrorsData')}
          className={playwrightJournalData.length === 0 ? "md:col-span-1" : "md:col-span-2 lg:col-span-3"} // Điều chỉnh span nếu playwright chart không có
        />
      </div>
    </div>
  );
};

export default GeneralJournalCharts;