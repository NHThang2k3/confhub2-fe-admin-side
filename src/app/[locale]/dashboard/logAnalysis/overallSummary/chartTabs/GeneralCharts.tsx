import React from 'react';
import ChartCard from '../ChartCard';
import { getPieChartOption, getBarChartOption, BarChartData, PieChartItem } from '../../utils/chartUtils';

interface GeneralChartsProps {
  overallStatusData: PieChartItem[];
  playwrightLinkData: PieChartItem[];
  topErrorsData: BarChartData;
}

const GeneralCharts: React.FC<GeneralChartsProps> = ({
  overallStatusData,
  playwrightLinkData,
  topErrorsData,
}) => {
  return (
    <div className="space-y-6">
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
  );
};

export default GeneralCharts;