// src/app/[locale]/dashboard/logAnalysis/journalOverallSummary/JournalOverallSummary.tsx (File mới)
import React, { useMemo } from 'react';
import { JournalLogAnalysisResult } from '@/src/models/logAnalysis/logAnalysisJournal.types'; // Adjust path
import { transformRecordToBarChart, BarChartData, transformObjectToPieChartData, PieChartItem } from '../utils/chartUtils'; // Tái sử dụng utils

import SummaryHeaderComponent from '../overallSummary/SummaryHeader'; // Tái sử dụng
import NoDataMessage from '../overallSummary/NoDataMessage';       // Tái sử dụng
import JournalCollapsibleContent from './JournalCollapsibleContent'; // Component mới

interface JournalOverallSummaryProps {
  data: JournalLogAnalysisResult;
  isExpanded: boolean;
  onToggle: () => void;
  // crawlerType: 'journal'; // Có thể không cần nếu component này chỉ dùng cho journal
}

const JournalOverallSummary: React.FC<JournalOverallSummaryProps> = ({
  data,
  isExpanded,
  onToggle
}) => {
  // --- Tính toán dữ liệu cho biểu đồ ---

  // 1. Overall Journal Status
  const overallJournalStatusData = useMemo<PieChartItem[]>(() => {
    if (!data?.overall) return [];
    const { totalJournalsProcessed = 0, totalJournalsFailed = 0, totalJournalsSkipped = 0 } = data.overall;
    // Giả sử không có 'processing' ở mức overall này, chỉ có completed, failed, skipped
    return [
      { name: 'Processed', value: totalJournalsProcessed },
      { name: 'Failed', value: totalJournalsFailed },
      { name: 'Skipped', value: totalJournalsSkipped }
    ].filter(item => item.value > 0);
  }, [data?.overall]);

  // 2. Data Source Distribution
  const dataSourceDistributionData = useMemo<PieChartItem[]>(() => {
    if (!data?.overall?.dataSourceCounts) return [];
    return transformObjectToPieChartData(data.overall.dataSourceCounts);
  }, [data?.overall?.dataSourceCounts]);

  // 3. Playwright (nếu có thông tin tương tự conference)
  // Giả sử Playwright của journal cũng có linkProcessing hoặc các thông tin khác
  const playwrightJournalData = useMemo<PieChartItem[]>(() => {
    if (!data?.playwright) return []; // Hoặc data.playwright.someSpecificJournalField
    // Ví dụ: nếu playwright được dùng để mở trang scimago hoặc trang journal
    // Đây là ví dụ, cần điều chỉnh theo cấu trúc playwright của journal
    const { successfulAccess = 0, failedAccess = 0 } = data.playwright.pagesCreateSuccess ? { successfulAccess: 1, failedAccess: 0 } : { successfulAccess: 0, failedAccess: 1 }; // Placeholder
    return [
      { name: 'Page Access Success', value: successfulAccess },
      { name: 'Page Access Failed', value: failedAccess },
    ].filter(item => item.value > 0);
  }, [data?.playwright]);


  // 4. Google Search (cho Image Search)
  const imageSearchStatusData = useMemo<PieChartItem[]>(() => {
    if (!data?.googleSearch) return [];
    const { totalSearchesSucceeded = 0, totalSearchesFailedAfterRetries = 0, totalQuotaErrorsEncountered = 0 } = data.googleSearch;
    return [
      { name: 'Successful Image Searches', value: totalSearchesSucceeded },
      { name: 'Failed Image Searches', value: totalSearchesFailedAfterRetries },
      { name: 'Quota Errors (Image)', value: totalQuotaErrorsEncountered }
    ].filter(item => item.value > 0);
  }, [data?.googleSearch]);

  // const imageSearchApiKeyUsageData = useMemo<BarChartData>(() => {
  //   // Giả sử googleSearch.keyUsage tồn tại và có cấu trúc tương tự conference
  //   return transformRecordToBarChart(data?.googleSearch?.keyUsage || {}, 0, false);
  // }, [data?.googleSearch?.keyUsage]);

  // Cho imageSearchErrorsData
  const imageSearchErrorsFormatted = useMemo(() => {
    if (!data?.googleSearch?.apiErrors) return {};
    const formatted: Record<string, number> = {};
    for (const key in data.googleSearch.apiErrors) {
      formatted[key] = data.googleSearch.apiErrors[key].count;
    }
    return formatted;
  }, [data?.googleSearch?.apiErrors]);

  const imageSearchErrorsData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(imageSearchErrorsFormatted, 5, true);
  }, [imageSearchErrorsFormatted]);


  // 5. Bioxbio
  const bioxbioFetchStatusData = useMemo<PieChartItem[]>(() => {
    if (!data?.bioxbio) return [];
    const { totalFetchesSucceeded = 0, totalFetchesFailed = 0 } = data.bioxbio;
    return [
      { name: 'Bioxbio Success', value: totalFetchesSucceeded },
      { name: 'Bioxbio Failed', value: totalFetchesFailed },
    ].filter(item => item.value > 0);
  }, [data?.bioxbio]);

  const bioxbioCacheData = useMemo<PieChartItem[]>(() => {
    if (!data?.bioxbio) return [];
    const { cacheHits = 0, cacheMisses = 0 } = data.bioxbio;
    return [
      { name: 'Bioxbio Cache Hits', value: cacheHits },
      { name: 'Bioxbio Cache Misses', value: cacheMisses },
    ].filter(item => item.value > 0);
  }, [data?.bioxbio]);

  // Tương tự cho bioxbioErrorsData
  const bioxbioErrorsFormatted = useMemo(() => {
    if (!data?.bioxbio?.errorDetails) return {};
    const formatted: Record<string, number> = {};
    for (const key in data.bioxbio.errorDetails) {
      formatted[key] = data.bioxbio.errorDetails[key].count;
    }
    return formatted;
  }, [data?.bioxbio?.errorDetails]);

  const bioxbioErrorsData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(bioxbioErrorsFormatted, 5, true);
  }, [bioxbioErrorsFormatted]);


  // 6. Scimago
  const scimagoDetailPageStatusData = useMemo<PieChartItem[]>(() => {
    if (!data?.scimago) return [];
    const { scimagoDetailPagesSucceeded = 0, scimagoDetailPagesFailed = 0, scimagoDetailPagesSkippedNullUrl = 0 } = data.scimago;
    return [
      { name: 'Scimago Detail Success', value: scimagoDetailPagesSucceeded },
      { name: 'Scimago Detail Failed', value: scimagoDetailPagesFailed },
      { name: 'Scimago Detail Skipped (No URL)', value: scimagoDetailPagesSkippedNullUrl },
    ].filter(item => item.value > 0);
  }, [data?.scimago]);

  // Tương tự cho scimagoErrorsData
  const scimagoErrorsFormatted = useMemo(() => {
    if (!data?.scimago?.errorDetails) return {};
    const formatted: Record<string, number> = {};
    for (const key in data.scimago.errorDetails) {
      formatted[key] = data.scimago.errorDetails[key].count;
    }
    return formatted;
  }, [data?.scimago?.errorDetails]);

  const scimagoErrorsData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(scimagoErrorsFormatted, 5, true);
  }, [scimagoErrorsFormatted]);
  // 7. File Output
  const jsonlWriteStatusData = useMemo<PieChartItem[]>(() => {
    if (!data?.fileOutput) return [];
    const { jsonlRecordsSuccessfullyWritten = 0, jsonlWriteErrors = 0 } = data.fileOutput;
    return [
      { name: 'JSONL Write Success', value: jsonlRecordsSuccessfullyWritten },
      { name: 'JSONL Write Errors', value: jsonlWriteErrors },
    ].filter(item => item.value > 0);
  }, [data?.fileOutput]);

  const clientCsvParseStatusData = useMemo<PieChartItem[]>(() => {
    if (!data?.fileOutput) return [];
    const { clientCsvParseSuccess = 0, clientCsvParseFailed = 0 } = data.fileOutput;
    if ((clientCsvParseSuccess + clientCsvParseFailed) === 0) return []; // Chỉ hiển thị nếu có attempt
    return [
      { name: 'Client CSV Parse Success', value: clientCsvParseSuccess },
      { name: 'Client CSV Parse Failed', value: clientCsvParseFailed },
    ].filter(item => item.value >= 0); // Để hiển thị cả trường hợp 0 value nếu có attempt
  }, [data?.fileOutput]);


  // 8. Top Aggregated Errors (chung)
  const topAggregatedErrorsData = useMemo<BarChartData>(() => {
    return transformRecordToBarChart(data?.errorsAggregated || {}, 10, true);
  }, [data?.errorsAggregated]);


  // --- Quyết định hiển thị ---
  const summaryTitle = useMemo(() => {
    return data?.filterRequestId
      ? `Journal Summary for Request: ${data.filterRequestId}`
      : "Overall Journal Crawl Summary";
  }, [data?.filterRequestId]);

  const hasMeaningfulData = useMemo(() => {
    // Điều kiện để coi là có dữ liệu ý nghĩa cho journal
    return (data?.overall && (
      (data.overall.totalJournalsInput || 0) > 0 ||
      (data.overall.totalJournalsProcessed || 0) > 0
    )) || (data.errorLogCount || 0) > 0 ||
      (data.bioxbio && data.bioxbio.totalFetchesAttempted > 0) ||
      (data.scimago && data.scimago.scimagoDetailPagesAttempted > 0);
  }, [data]);


  if (!hasMeaningfulData && !isExpanded) {
    return null; // Không render gì nếu không expand và không có data
  }

  return (
    <section className='mb-8 rounded-lg border border-gray-100 bg-white shadow'>
      <SummaryHeaderComponent title={summaryTitle} isExpanded={isExpanded} onToggle={onToggle} />

      {isExpanded && !hasMeaningfulData && (
        <NoDataMessage filterRequestId={data.filterRequestId} />
      )}

      {hasMeaningfulData && (
        <JournalCollapsibleContent
          isExpanded={isExpanded}
          data={data}
          // Truyền các props dữ liệu đã tính toán
          overallJournalStatusData={overallJournalStatusData}
          dataSourceDistributionData={dataSourceDistributionData}
          playwrightJournalData={playwrightJournalData}
          imageSearchStatusData={imageSearchStatusData}
          // imageSearchApiKeyUsageData={imageSearchApiKeyUsageData}
          imageSearchErrorsData={imageSearchErrorsData}
          bioxbioFetchStatusData={bioxbioFetchStatusData}
          bioxbioCacheData={bioxbioCacheData}
          bioxbioErrorsData={bioxbioErrorsData}
          scimagoDetailPageStatusData={scimagoDetailPageStatusData}
          scimagoErrorsData={scimagoErrorsData}
          jsonlWriteStatusData={jsonlWriteStatusData}
          clientCsvParseStatusData={clientCsvParseStatusData}
          topAggregatedErrorsData={topAggregatedErrorsData}
        />
      )}
    </section>
  );
};

export default JournalOverallSummary;