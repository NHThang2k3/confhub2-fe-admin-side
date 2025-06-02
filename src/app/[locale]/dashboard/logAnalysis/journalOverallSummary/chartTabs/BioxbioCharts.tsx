// src/app/[locale]/dashboard/logAnalysis/journalOverallSummary/chartTabs/BioxbioCharts.tsx (File mới)
import React from 'react';
import ChartCard from '../../overallSummary/ChartCard';
import { getPieChartOption, getBarChartOption, BarChartData, PieChartItem } from '../../utils/chartUtils';
import { useTranslations } from 'next-intl';

interface BioxbioChartsProps {
  fetchStatusData: PieChartItem[];
  cacheData: PieChartItem[];
  errorsData: BarChartData;
}

const BioxbioCharts: React.FC<BioxbioChartsProps> = ({
  fetchStatusData,
  cacheData,
  errorsData,
}) => {
  const t = useTranslations('BioxbioCharts'); // Namespace mới

  return (
    <div className="space-y-6">
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <ChartCard
          option={getPieChartOption(t('fetchStatusTitle'), fetchStatusData, ['#91cc75', '#ee6666'])}
          dataExists={fetchStatusData.length > 0}
          noDataMessage={t('noFetchStatusData')}
        />
        <ChartCard
          option={getPieChartOption(t('cacheStatusTitle'), cacheData, ['#5470c6', '#fccb67'])}
          dataExists={cacheData.length > 0}
          noDataMessage={t('noCacheStatusData')}
        />
        <ChartCard
          option={getBarChartOption(t('topErrorsTitle'), errorsData.labels, errorsData.values, t('common.count'), '#ee6666')}
          dataExists={errorsData.labels.length > 0}
          noDataMessage={t('noErrorsData')}
        />
      </div>
    </div>
  );
};

export default BioxbioCharts;