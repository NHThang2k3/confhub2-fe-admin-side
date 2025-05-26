import React from 'react';
import ChartCard from '../ChartCard';
import { getPieChartOption, getBarChartOption, BarChartData, PieChartItem } from '../../utils/chartUtils';
import { FaBroom } from 'react-icons/fa';
import { useTranslations } from 'next-intl'; // Import useTranslations

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
  // Khởi tạo t với namespace 'ValidationQualityCharts'
  const t = useTranslations('ValidationQualityCharts');
  const tCommon = useTranslations('Common'); // Có thể sử dụng namespace chung cho các chuỗi như 'Count', 'Warnings'

  const validationPieColors = ['#FF6384', '#FF9F40', '#FFCD56'];
  const normalizationPieColors = ['#4BC0C0', '#36A2EB', '#9966FF'];

  const hasNormalizationData = normalizationsByFieldData.labels.length > 0 ||
                               normalizationsByReasonData.length > 0;

  return (
    <div className="space-y-6">
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <ChartCard
            option={getBarChartOption(t('warningsByField.title'), warningsByFieldData.labels, warningsByFieldData.values, tCommon('warnings'), '#f59e0b')}
            dataExists={warningsByFieldData.labels.length > 0}
            noDataMessage={t('warningsByField.noDataMessage')}
        />
        <ChartCard
            option={getPieChartOption(t('warningsBySeverity.title'), warningsBySeverityData, validationPieColors)}
            dataExists={warningsBySeverityData.length > 0}
            noDataMessage={t('warningsBySeverity.noDataMessage')}
        />
         <ChartCard
            option={getBarChartOption(t('topWarningMessages.title'), topWarningMessagesData.labels, topWarningMessagesData.values, tCommon('count'), '#fdba74')}
            dataExists={topWarningMessagesData.labels.length > 0}
            noDataMessage={t('topWarningMessages.noDataMessage')}
        />
      </div>
      {hasNormalizationData && (
        <>
          <h4 className="text-lg font-medium mt-8 mb-3 text-gray-700 flex items-center">
            <FaBroom className="mr-2 text-sky-500" /> {t('dataNormalizations.title')}
          </h4>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'>
            <ChartCard
                option={getBarChartOption(t('normalizationsByField.title'), normalizationsByFieldData.labels, normalizationsByFieldData.values, tCommon('count'), '#38bdf8')}
                dataExists={normalizationsByFieldData.labels.length > 0}
                noDataMessage={t('normalizationsByField.noDataMessage')}
            />
            <ChartCard
                option={getPieChartOption(t('normalizationsByReason.title'), normalizationsByReasonData, normalizationPieColors)}
                dataExists={normalizationsByReasonData.length > 0}
                noDataMessage={t('normalizationsByReason.noDataMessage')}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ValidationQualityCharts;