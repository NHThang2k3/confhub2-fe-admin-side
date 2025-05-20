import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  FaExclamationTriangle,
  FaChevronUp,
  FaChevronDown,
  FaClipboardCheck,
  FaInfoCircle // Thêm icon này
} from 'react-icons/fa';
import {
  getBarChartOption,
  getPieChartOption,
  transformRecordForBarChart,
  BarChartData
} from './utils/chartUtils'; // Đảm bảo đường dẫn đúng
import { LogAnalysisResult } from '../../../../models/logAnalysis/logAnalysis'; // Đảm bảo đường dẫn và type đúng
import { formatDuration } from './utils/commonUtils'; // Đảm bảo đường dẫn đúng

interface OverallSummaryProps {
  data: LogAnalysisResult;
  // timeFilterOption không còn thực sự cần thiết ở đây nếu data đã được lọc theo thời gian ở cấp cao hơn
  // Tuy nhiên, giữ lại nếu bạn vẫn muốn hiển thị nó trong tiêu đề.
  // timeFilterOption: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const OverallSummary: React.FC<OverallSummaryProps> = ({
  data,
  // timeFilterOption,
  isExpanded,
  onToggle
}) => {
  // --- Các useMemo tính toán dữ liệu biểu đồ (GIỮ NGUYÊN LOGIC BÊN TRONG) ---
  // Chúng sẽ tự động phản ánh dữ liệu đã được lọc (theo thời gian hoặc requestId)
  // vì `data` prop đã được lọc ở component cha.

  const overallStatusData = useMemo(() => {
    if (!data?.overall) return [];
    // --- CẬP NHẬT CÁCH TÍNH ---
    // completedTasks: Số task đã có CSV thành công (được set bởi handler)
    // failedOrCrashedTasks: Số task lỗi hoặc crash (được set bởi handler)
    // processingTasks: Số task đang xử lý (cập nhật bởi calculateFinalMetrics)
    // skippedTasks: Số task bị bỏ qua (được set bởi handler)

    const completedOk = data.overall.completedTasks || 0; // CSV success
    const failed = data.overall.failedOrCrashedTasks || 0;
    const processing = data.overall.processingTasks || 0;
    const skipped = data.overall.skippedTasks || 0; // Thêm skipped

    // Logic phân tách "Completed" dựa trên "successfulExtractions" có thể vẫn hữu ích nếu muốn
    // Tuy nhiên, các trạng thái chính từ `data.overall` (completedTasks, failedOrCrashedTasks, processingTasks)
    // nên là nguồn chính xác nhất.
    // Nếu bạn muốn giữ logic extraction:
    // const successfulExtractions = data.overall.successfulExtractions || 0;
    // const completedWithExtractionOk = Math.min(completedOk, successfulExtractions); // Không thể nhiều hơn completedOk
    // const completedWithoutExtractionOk = Math.max(0, completedOk - completedWithExtractionOk);
    // return [
    //     { name: 'Completed (Extraction OK)', value: completedWithExtractionOk },
    //     { name: 'Completed (No/Failed Extraction)', value: completedWithoutExtractionOk },
    //     { name: 'Processing', value: processing },
    //     { name: 'Failed/Crashed', value: failed },
    //     { name: 'Skipped', value: skipped }
    // ].filter(item => item.value > 0);

    // Sử dụng các trạng thái chính trực tiếp:
    return [
      { name: 'Completed', value: completedOk },
      { name: 'Processing', value: processing },
      { name: 'Failed/Crashed', value: failed },
      { name: 'Skipped', value: skipped }
    ].filter(item => item.value > 0);

  }, [data?.overall]);

  const searchStatusData = useMemo(() => {
    if (!data?.googleSearch) return []
    return [
      { name: 'Successful', value: data.googleSearch.successfulSearches || 0 },
      { name: 'Failed', value: data.googleSearch.failedSearches || 0 },
      { name: 'Skipped', value: data.googleSearch.skippedSearches || 0 },
      { name: 'Quota Errors', value: data.googleSearch.quotaErrors || 0 }
    ].filter(item => item.value > 0)
  }, [data?.googleSearch])

  const apiStatusData = useMemo(() => {
    if (!data?.geminiApi) return []
    const determineRetries = data.geminiApi.retriesByType?.['determine'] || 0
    const extractRetries = data.geminiApi.retriesByType?.['extract'] || 0
    const cfpRetries = data.geminiApi.retriesByType?.['cfp'] || 0

    const retries = determineRetries + extractRetries + cfpRetries
    return [
      { name: 'Successful', value: data.geminiApi.successfulCalls || 0 },
      { name: 'Failed', value: data.geminiApi.failedCalls || 0 },
      { name: 'Blocked', value: data.geminiApi.blockedBySafety || 0 },
      ...(retries > 0 ? [{ name: 'Retries', value: retries }] : [])
    ].filter(item => item.value > 0)
  }, [data?.geminiApi])

  const totalGeminiCallsWithRetries = useMemo(() => {
    const apiData = data?.geminiApi;
    if (!apiData) return 0;
    // Sử dụng totalCalls (lần gọi ban đầu) + totalRetries (tổng số lần thử lại)
    return (apiData.totalCalls || 0) + (apiData.totalRetries || 0);
  }, [data?.geminiApi]);

  const cacheStatusData = useMemo(() => {
    if (!data?.geminiApi) return []
    return [
      { name: 'Cache Hits', value: data.geminiApi.cacheContextHits || 0 },
      { name: 'Cache Misses', value: data.geminiApi.cacheContextMisses || 0 }
    ].filter(item => item.value > 0)
  }, [data?.geminiApi])

  const playwrightLinkData = useMemo(() => {
    if (!data?.playwright?.linkProcessing) return []
    return [
      {
        name: 'Successful Access',
        value: data.playwright.linkProcessing.successfulAccess || 0
      },
      {
        name: 'Failed Access',
        value: data.playwright.linkProcessing.failedAccess || 0
      },
      {
        name: 'Redirects',
        value: data.playwright.linkProcessing.redirects || 0
      }
    ].filter(item => item.value > 0)
  }, [data?.playwright?.linkProcessing])

  const callsByModelWithRetriesData = useMemo<BarChartData>(() => {
    const { callsByModel = {}, retriesByModel = {} } = data?.geminiApi ?? {}
    const combined: Record<string, number> = {}
    const allKeys = new Set([
      ...Object.keys(callsByModel),
      ...Object.keys(retriesByModel)
    ])
    allKeys.forEach(model => {
      combined[model] =
        (callsByModel[model] || 0) + (retriesByModel[model] || 0)
    })
    return transformRecordForBarChart(combined, 0, false)
  }, [data?.geminiApi])

  const apiKeyUsageData = useMemo<BarChartData>(() => {
    return transformRecordForBarChart(data?.googleSearch?.keyUsage, 0, false)
  }, [data?.googleSearch?.keyUsage])

  const callsByTypeWithRetriesData = useMemo<BarChartData>(() => {
    const { callsByType = {}, retriesByType = {} } = data?.geminiApi ?? {}
    const combined: Record<string, number> = {}
    const allKeys = new Set([
      ...Object.keys(callsByType),
      ...Object.keys(retriesByType)
    ])
    allKeys.forEach(type => {
      combined[type] = (callsByType[type] || 0) + (retriesByType[type] || 0)
    })
    return transformRecordForBarChart(combined, 0, false)
  }, [data?.geminiApi])

  const topErrorsData = useMemo<BarChartData>(() => {
    return transformRecordForBarChart(data?.errorsAggregated, 10, true)
  }, [data?.errorsAggregated])

  // --- DỮ LIỆU MỚI CHO VALIDATION CHART ---
  const warningsByFieldData = useMemo<BarChartData>(() => {
    // Sử dụng transformRecordForBarChart để chuyển đổi dữ liệu
    // Tham số thứ 2 (limit) là 0 để hiển thị tất cả các field
    // Tham số thứ 3 (sort) là true để sắp xếp giảm dần theo số lượng warnings
    return transformRecordForBarChart(
      data?.validationStats?.warningsByField,
      0,
      true
    )
  }, [data?.validationStats?.warningsByField])

  // --- Tiêu đề động ---
  const summaryTitle = useMemo(() => {
    // if (data?.filterRequestId) {
    //   return `Summary for Request ID: ${data.filterRequestId}`;
    // }
    return "Overall Crawl Summary";
    // Nếu bạn vẫn muốn thêm thông tin timeFilter:
    // if (timeFilterOption !== 'latest') {
    //     return `${baseTitle} (${timeFilterOption.replace('_', ' ').replace('last ', 'Last ')})`;
    // }
  }, [data?.filterRequestId /*, timeFilterOption */]);

  // --- Kiểm tra xem có dữ liệu để hiển thị không ---
  // Điều này quan trọng khi lọc theo requestId mà không tìm thấy request đó.
  const hasMeaningfulData = data?.overall && (
    data.overall.processedConferencesCount > 0 ||
    data.overall.totalConferencesInput > 0 ||
    data.errorLogCount > 0
  );
  if (!data || !hasMeaningfulData) {
    if (!isExpanded) return null; // Nếu không mở rộng và không có data, không render gì
    return (
      <section className='mb-8 rounded-lg border border-gray-100 bg-white shadow'>
        <div className='flex items-center justify-between border-b border-gray-300 p-4'>
          <h2 className='text-xl font-semibold text-gray-700'>{summaryTitle}</h2>
          <button
            onClick={onToggle}
            className='rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300'
            title={isExpanded ? 'Collapse Summary' : 'Expand Summary'}
          >
            {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
          </button>
        </div>
        {isExpanded && (
          <div className="p-4 text-center text-gray-500 flex flex-col items-center">
            <FaInfoCircle size={24} className="mb-2 text-blue-500" />
            No summary data available for the current filter.
            {data?.filterRequestId && ` (Request ID: ${data.filterRequestId})`}
          </div>
        )}
      </section>
    );
  }


  // --- Render ---
  return (
    <section className='mb-8 rounded-lg border border-gray-100 bg-white shadow'>
      {/* Header Section */}
      <div className='flex items-center justify-between border-b border-gray-300 p-4 cursor-pointer hover:bg-gray-5' onClick={onToggle}>
        <h2 className='text-xl font-semibold text-gray-700'>
          {summaryTitle}
        </h2>
        <button
          className='rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none'
          aria-expanded={isExpanded}
          aria-controls='overall-summary-content'
          title={isExpanded ? 'Collapse Summary' : 'Expand Summary'}
        >
          {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
          <span className='sr-only'>{isExpanded ? 'Collapse' : 'Expand'}</span>
        </button>
      </div>

      {/* Collapsible Content Area */}
      <div
        id='overall-summary-content'
        className={`overflow-hidden transition-max-height duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] p-4 opacity-100 visible' : 'max-h-0 p-0 opacity-0 invisible'}`}
      >
        {/* --- KPI Cards --- */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'> {/* Adjusted to 6 cols for xl */}
          {/* Card 1: Duration */}
          <div className='flex items-center space-x-3 rounded-lg border border-gray-200  p-4 shadow-sm hover:shadow-md transition-shadow'>
            <div className='rounded-full bg-blue-100 p-3 text-blue-600'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
            </div>
            <div>
              <p className='mb-1 text-sm text-gray-500'>Total Duration</p>
              <p className='text-xl font-semibold text-gray-800'>
                {formatDuration(data.overall?.durationSeconds)}
              </p>
            </div>
          </div>
          {/* Card 2: Conferences Processed (or Tasks for a single request) */}
          <div className='flex items-center space-x-3 rounded-lg border border-gray-200  p-4 shadow-sm hover:shadow-md transition-shadow'>
            <div className='rounded-full bg-green-100 p-3 text-green-600'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
            </div>
            <div>
              <p className='mb-1 text-sm text-gray-500'>
                {data.filterRequestId ? 'Tasks in Request' : 'Conferences Processed'}
              </p>
              <p className='text-xl font-semibold text-gray-800'>
                {/* If filtered by requestId, totalConferencesInput might represent tasks for that request */}
                {data.overall?.processedConferencesCount ?? 0}
                {data.filterRequestId ? '' : ` / ${data.overall?.totalConferencesInput ?? '?'}`}
              </p>
            </div>
          </div>
          {/* Card 3: Gemini API Calls */}
          <div className='flex items-center space-x-3 rounded-lg border border-gray-200  p-4 shadow-sm hover:shadow-md transition-shadow'>
            <div className='rounded-full bg-purple-100 p-3 text-purple-600'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14.05 1.73 16.557 1 17.657 1s3.607.73 4.671 2C24.5 5 25 8 25 10c2 1 2.657 1.343 2.657 2.657A8 8 0 0117.657 18.657z' /></svg>
            </div>
            <div>
              <p className='mb-1 text-sm text-gray-500'>Gemini Calls (incl. Retries)</p>
              <p className='text-xl font-semibold text-gray-800'>{totalGeminiCallsWithRetries}</p>
            </div>
          </div>
          {/* Card 4: Validation Warnings */}
          <div className='flex items-center space-x-3 rounded-lg border border-gray-200  p-4 shadow-sm hover:shadow-md transition-shadow'>
            <div className={`rounded-full p-3 ${(data.validationStats?.totalValidationWarnings || 0) > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
              <FaClipboardCheck className='h-6 w-6' />
            </div>
            <div>
              <p className='mb-1 text-sm text-gray-500'>Validation Warnings</p>
              <p className={`text-xl font-semibold ${(data.validationStats?.totalValidationWarnings || 0) > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
                {data.validationStats?.totalValidationWarnings ?? 0}
              </p>
            </div>
          </div>
          {/* Card 5: CSV Output */}
          <div className='flex items-center space-x-3 rounded-lg border border-gray-200  p-4 shadow-sm hover:shadow-md transition-shadow'>
            <div className={`rounded-full p-3 ${data.fileOutput?.csvFileGenerated === true ? 'bg-teal-100 text-teal-600' : data.fileOutput?.csvFileGenerated === false ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <p className='mb-1 text-sm text-gray-500'>CSV Records Written</p>
              <p className='text-xl font-semibold text-gray-800'>
                {data.fileOutput?.csvRecordsSuccessfullyWritten ?? 0} / {data.fileOutput?.csvRecordsAttempted ?? 0}
              </p>
              {data.fileOutput?.csvFileGenerated === false && <p className="text-xs text-red-500 mt-0.5">CSV Generation Failed</p>}
            </div>
          </div>
          {/* Card 6: Total Errors */}
          <div className='flex items-center space-x-3 rounded-lg border border-gray-200  p-4 shadow-sm hover:shadow-md transition-shadow'>
            <div className={`rounded-full p-3 ${(data.errorLogCount || 0) > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
              <FaExclamationTriangle className='h-6 w-6' />
            </div>
            <div>
              <p className='mb-1 text-sm text-gray-500'>Errors Logged</p>
              <p className={`text-xl font-semibold ${(data.errorLogCount || 0) > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                {data.errorLogCount || 0}
              </p>
            </div>
          </div>
        </div>

        {/* --- Charts Grid --- */}
        <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Chart: Overall Task Status */}
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm'>
            {overallStatusData.length > 0 ? (
              <ReactECharts
                option={getPieChartOption(
                  'Task Status Distribution', // General title
                  overallStatusData,
                  ['#91cc75', '#5470c6', '#ee6666', '#fccb67', '#73c0de'] // Completed, Processing, Failed, Skipped, (other if any)
                )}
                style={{ height: '300px', width: '100%' }} notMerge lazyUpdate
              />
            ) : (<div className='flex h-[300px] items-center justify-center text-gray-500'>No Task Status Data</div>)}
          </div>
          {/* Các chart khác giữ nguyên, chúng sẽ tự động hiển thị dữ liệu đã lọc */}
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm'>
            {searchStatusData.length > 0 ? (<ReactECharts option={getPieChartOption('Google Search Status', searchStatusData, ['#91cc75', '#ee6666', '#fccb67', '#73c0de'])} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />) : (<div className='flex h-[300px] items-center justify-center text-gray-500'>No Search Data</div>)}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm'>
            {apiStatusData.length > 0 ? (<ReactECharts option={getPieChartOption('Gemini API Call Status', apiStatusData, ['#91cc75', '#ee6666', '#fac858', '#5470c6'])} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />) : (<div className='flex h-[300px] items-center justify-center text-gray-500'>No API Status Data</div>)}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm'>
            {cacheStatusData.length > 0 ? (<ReactECharts option={getPieChartOption('Gemini API Cache Usage', cacheStatusData, ['#3ba272', '#fc8452'])} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />) : (<div className='flex h-[300px] items-center justify-center text-gray-500'>No Cache Data</div>)}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm'>
            {playwrightLinkData.length > 0 ? (<ReactECharts option={getPieChartOption('Playwright Link Processing', playwrightLinkData, ['#91cc75', '#ee6666', '#73c0de'])} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />) : (<div className='flex h-[300px] items-center justify-center text-gray-500'>No Link Processing Data</div>)}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm'>
            {callsByModelWithRetriesData.labels.length > 0 ? (<ReactECharts option={getBarChartOption('Gemini Model Usage (incl. Retries)', callsByModelWithRetriesData.labels, callsByModelWithRetriesData.values, 'Calls', '#9a60b4')} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />) : (<div className='flex h-[300px] items-center justify-center text-gray-500'>No Model Usage Data</div>)}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm'>
            {warningsByFieldData.labels.length > 0 ? (<ReactECharts option={getBarChartOption('Validation Warnings by Field', warningsByFieldData.labels, warningsByFieldData.values, 'Warnings', '#f59e0b')} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />) : (<div className='flex h-[300px] items-center justify-center text-gray-500'>No Validation Warnings</div>)}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm'>
            {apiKeyUsageData.labels.length > 0 ? (<ReactECharts option={getBarChartOption('Google API Key Usage', apiKeyUsageData.labels, apiKeyUsageData.values, 'Requests', '#ea7ccc')} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />) : (<div className='flex h-[300px] items-center justify-center text-gray-500'>No Key Usage Data</div>)}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm'>
            {callsByTypeWithRetriesData.labels.length > 0 ? (<ReactECharts option={getBarChartOption('Gemini Calls by Type (incl. Retries)', callsByTypeWithRetriesData.labels, callsByTypeWithRetriesData.values, 'Calls', '#5470c6')} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />) : (<div className='flex h-[300px] items-center justify-center text-gray-500'>No Calls by Type Data</div>)}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow-sm md:col-span-2 lg:col-span-3'>
            {topErrorsData.labels.length > 0 ? (<ReactECharts option={getBarChartOption('Top Aggregated Errors', topErrorsData.labels, topErrorsData.values, 'Count', '#ee6666')} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />) : (<div className='flex h-[300px] items-center justify-center text-gray-500'>No Aggregated Errors</div>)}
          </div>
        </div>

        {/* Log Processing Errors */}
        {data.logProcessingErrors && data.logProcessingErrors.length > 0 && (
          <div className='mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 shadow-sm'>
            <h3 className='text-md mb-2 flex items-center font-semibold text-yellow-800'>
              <FaExclamationTriangle className='mr-2' />
              Log Parsing Issues ({data.parseErrors} errors / {data.totalLogEntries} entries)
            </h3>
            <ul className='max-h-40 list-inside list-disc space-y-1 overflow-y-auto pl-4 text-sm text-yellow-700'>
              {data.logProcessingErrors.slice(0, 20).map((err, index) => (<li key={index} className='break-words'>{err}</li>))}
              {data.logProcessingErrors.length > 20 && (<li>... (and {data.logProcessingErrors.length - 20} more)</li>)}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default OverallSummary;