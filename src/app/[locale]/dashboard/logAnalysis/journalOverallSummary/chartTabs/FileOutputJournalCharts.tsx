// src/app/[locale]/dashboard/logAnalysis/journalOverallSummary/chartTabs/FileOutputJournalCharts.tsx (File mới)
import React from 'react';
import ChartCard from '../../overallSummary/ChartCard';
import { getPieChartOption, BarChartData, PieChartItem } from '../../utils/chartUtils'; // getBarChartOption nếu cần
import { useTranslations } from 'next-intl';

interface FileOutputJournalChartsProps {
  // Dữ liệu được tính toán từ JournalOverallSummary.tsx
  jsonlWriteStatusData: PieChartItem[];
  clientCsvParseStatusData: PieChartItem[];
  // Thêm các props khác nếu có, ví dụ: errorsData cho file output
}

const FileOutputJournalCharts: React.FC<FileOutputJournalChartsProps> = ({
  jsonlWriteStatusData,
  clientCsvParseStatusData,
}) => {
  const t = useTranslations('FileOutputJournalCharts'); // Namespace mới

  return (
    <div className="space-y-6">
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <ChartCard
          option={getPieChartOption(t('jsonlWriteStatusTitle'), jsonlWriteStatusData, ['#91cc75', '#ee6666'])}
          dataExists={jsonlWriteStatusData.length > 0}
          noDataMessage={t('noJsonlWriteStatusData')}
        />
        {/* Chỉ hiển thị biểu đồ CSV nếu có dữ liệu */}
        {clientCsvParseStatusData.length > 0 && (
            <ChartCard
            option={getPieChartOption(t('clientCsvParseStatusTitle'), clientCsvParseStatusData, ['#5470c6', '#ff9f40'])}
            dataExists={clientCsvParseStatusData.length > 0}
            noDataMessage={t('noClientCsvParseStatusData')}
            />
        )}
      </div>
      {/* Thêm các biểu đồ khác cho File Output nếu cần, ví dụ: top file write errors */}
    </div>
  );
};

export default FileOutputJournalCharts;