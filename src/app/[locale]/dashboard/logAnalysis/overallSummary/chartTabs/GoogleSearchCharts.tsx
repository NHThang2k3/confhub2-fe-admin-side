import React from 'react';
import ChartCard from '../ChartCard';
import { getPieChartOption, getBarChartOption, BarChartData, PieChartItem } from '../../utils/chartUtils';
import { GoogleSearchHealthData } from '@/src/models/logAnalysis/logAnalysis';


interface GoogleSearchChartsProps {
  searchStatusData: PieChartItem[];
  apiKeyUsageData: BarChartData;
  googleSearchHealthData: GoogleSearchHealthData | null;
  googleSearchErrorsData: BarChartData;
  googleSearchAttemptIssuesData: BarChartData;
}

const GoogleSearchCharts: React.FC<GoogleSearchChartsProps> = ({
  searchStatusData,
  apiKeyUsageData,
  googleSearchHealthData,
  googleSearchErrorsData,
  googleSearchAttemptIssuesData,
}) => {
  return (
    <div className="space-y-6">
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'>
        <ChartCard
          option={getPieChartOption(
            'Google Search Status',
            searchStatusData,
            ['#91cc75', '#ee6666', '#fccb67', '#73c0de'],
            googleSearchHealthData && googleSearchHealthData.successfulSearchesWithNoItems > 0
            ? `Successful (No Items): ${googleSearchHealthData.successfulSearchesWithNoItems}`
            : undefined
          )}
          dataExists={searchStatusData.length > 0}
          noDataMessage="No Search Status Data"
        />
        <ChartCard
          option={getBarChartOption('Google API Key Usage', apiKeyUsageData.labels, apiKeyUsageData.values, 'Requests', '#ea7ccc')}
          dataExists={apiKeyUsageData.labels.length > 0}
          noDataMessage="No Key Usage Data"
        />
        <ChartCard
          option={getBarChartOption('Top Google Search Errors', googleSearchErrorsData.labels, googleSearchErrorsData.values, 'Count', '#ff6384')}
          dataExists={googleSearchErrorsData.labels.length > 0}
          noDataMessage="No Google Search Error Data"
          className="md:col-span-1"
        />
        <ChartCard
          option={getBarChartOption('Top Google Search Attempt Issues', googleSearchAttemptIssuesData.labels, googleSearchAttemptIssuesData.values, 'Count', '#ff9f40')}
          dataExists={googleSearchAttemptIssuesData.labels.length > 0}
          noDataMessage="No Google Search Attempt Issue Data"
          className="md:col-span-1"
        />
      </div>
    </div>
  );
};

export default GoogleSearchCharts;