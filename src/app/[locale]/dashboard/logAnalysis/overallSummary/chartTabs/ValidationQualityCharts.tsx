import React from 'react';
import ChartCard from '../ChartCard';
import { getPieChartOption, getBarChartOption, BarChartData, PieChartItem } from '../../utils/chartUtils';
import { FaBroom } from 'react-icons/fa'; // Assuming you use this icon

interface ValidationQualityChartsProps {
  warningsByFieldData: BarChartData;
  warningsBySeverityData: PieChartItem[];
  topWarningMessagesData: BarChartData;
  normalizationsByFieldData: BarChartData;
  normalizationsByReasonData: PieChartItem[];
}

const ValidationQualityCharts: React.FC<ValidationQualityChartsProps> = ({
  warningsByFieldData,
  warningsBySeverityData,
  topWarningMessagesData,
  normalizationsByFieldData,
  normalizationsByReasonData,
}) => {
  const validationPieColors = ['#FF6384', '#FF9F40', '#FFCD56'];
  const normalizationPieColors = ['#4BC0C0', '#36A2EB', '#9966FF'];

  const hasNormalizationData = normalizationsByFieldData.labels.length > 0 ||
                               normalizationsByReasonData.length > 0;

  return (
    <div className="space-y-6">
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <ChartCard
            option={getBarChartOption('Validation Warnings by Field', warningsByFieldData.labels, warningsByFieldData.values, 'Warnings', '#f59e0b')}
            dataExists={warningsByFieldData.labels.length > 0}
            noDataMessage="No Validation Warnings by Field"
        />
        <ChartCard
            option={getPieChartOption('Validation Warnings by Severity', warningsBySeverityData, validationPieColors)}
            dataExists={warningsBySeverityData.length > 0}
            noDataMessage="No Warnings by Severity"
        />
         <ChartCard
            option={getBarChartOption('Top Validation Messages', topWarningMessagesData.labels, topWarningMessagesData.values, 'Count', '#fdba74')}
            dataExists={topWarningMessagesData.labels.length > 0}
            noDataMessage="No Top Warning Messages"
        />
      </div>
      {hasNormalizationData && (
        <>
          <h4 className="text-lg font-medium mt-8 mb-3 text-gray-700 flex items-center">
            <FaBroom className="mr-2 text-sky-500" /> Data Normalizations
          </h4>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'>
            <ChartCard
                option={getBarChartOption('Normalizations by Field', normalizationsByFieldData.labels, normalizationsByFieldData.values, 'Count', '#38bdf8')}
                dataExists={normalizationsByFieldData.labels.length > 0}
                noDataMessage="No Normalizations by Field"
            />
            <ChartCard
                option={getPieChartOption('Normalizations by Reason', normalizationsByReasonData, normalizationPieColors)}
                dataExists={normalizationsByReasonData.length > 0}
                noDataMessage="No Normalizations by Reason"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ValidationQualityCharts;