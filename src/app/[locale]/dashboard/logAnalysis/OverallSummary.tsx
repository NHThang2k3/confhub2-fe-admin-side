import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import {
  FaExclamationTriangle,
  FaChevronUp,
  FaChevronDown,
  FaClipboardCheck
} from 'react-icons/fa'
import {
  getBarChartOption,
  getPieChartOption,
  transformRecordForBarChart,
  BarChartData
} from './utils/chartUtils'
// --- CẬP NHẬT IMPORT TYPE ---
import { LogAnalysisResult } from '../../../../models/logAnalysis/logAnalysis' // Đảm bảo type này đã cập nhật processingTasks
import { formatDuration } from './utils/commonUtils'

interface OverallSummaryProps {
  data: LogAnalysisResult
  timeFilterOption: string
  isExpanded: boolean
  onToggle: () => void
}

const OverallSummary: React.FC<OverallSummaryProps> = ({
  data,
  timeFilterOption,
  isExpanded,
  onToggle
}) => {
  // --- CẬP NHẬT overallStatusData ---
  const overallStatusData = useMemo(() => {
    if (!data?.overall) return []
    const failedOrCrashedTasks = data.overall.totalConferencesInput - data.overall.processedConferencesCount || 0
    const processedConferencesCount = data.overall.processedConferencesCount || 0
    // --- THÊM processingTasks ---
    const processingTasks = data.overall.processingTasks || 0 // Lấy số lượng task đang xử lý
    const successfulExtractions = data.overall.successfulExtractions || 0

    // Phân loại processedConferencesCount dựa trên extraction success
    const completedWithExtractionOk = successfulExtractions
    // Các task completed nhưng extraction không thành công hoặc không có
    const completedWithoutExtractionOk = Math.max(
      0,
      processedConferencesCount - successfulExtractions
    )

    return [
      { name: 'Completed (Extraction OK)', value: completedWithExtractionOk },
      {
        name: 'Completed (No/Failed Extraction)',
        value: completedWithoutExtractionOk
      },
      // --- THÊM Processing Slice ---
      { name: 'Processing', value: processingTasks },
      { name: 'Failed/Crashed', value: failedOrCrashedTasks }
    ].filter(item => item.value > 0) // Chỉ hiển thị slice có giá trị
  }, [data?.overall])

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

  // --- Render ---
  // --- Render ---
  return (
    <section className='mb-8 rounded-lg border border-gray-100 bg-white shadow'>
      {/* Header Section */}
      <div className='flex items-center justify-between border-b border-gray-300 p-4'>
        <h2 className='text-xl font-semibold text-gray-700'>
          Overall Crawl Summary{' '}
          {timeFilterOption !== 'latest' &&
            `(${timeFilterOption.replace('_', ' ').replace('last ', 'Last ')})`}
        </h2>
        <button
          onClick={onToggle}
          className='rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300'
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
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] p-4 opacity-100' : 'max-h-0 p-0 opacity-0'}`}
      >
        {/* --- KPI Cards --- */}
        {/* CẬP NHẬT: Grid layout thành 5 cột trên màn hình lớn (lg) để chứa card mới */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6'>
          {/* Card 1: Duration */}
          <div className='flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-5 p-4 shadow-md transition-shadow duration-300 hover:shadow-lg'>
            <div className='rounded-full bg-blue-100 p-3 text-blue-600'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div>
              <p className='mb-1 text-sm text-gray-500'>Total Duration</p>
              <p className='text-xl font-semibold text-gray-800'>
                {formatDuration(data.overall?.durationSeconds)}
              </p>
            </div>
          </div>
          {/* Card 2: Conferences Processed */}
          <div className='flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-5 p-4 shadow-md transition-shadow duration-300 hover:shadow-lg'>
            <div className='rounded-full bg-green-100 p-3 text-green-600'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div>
              <p className='mb-1 text-sm text-gray-500'>
                Conferences Processed
              </p>
              <p className='text-xl font-semibold text-gray-800'>
                {data.overall?.processedConferencesCount ?? 0} /{' '}
                {data.overall?.totalConferencesInput ?? '?'}
              </p>
            </div>
          </div>
          {/* Card 3: Gemini API Calls */}
          <div className='flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-5 p-4 shadow-md transition-shadow duration-300 hover:shadow-lg'>
            <div className='rounded-full bg-purple-100 p-3 text-purple-600'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14.05 1.73 16.557 1 17.657 1s3.607.73 4.671 2C24.5 5 25 8 25 10c2 1 2.657 1.343 2.657 2.657A8 8 0 0117.657 18.657z'
                />
              </svg>{' '}
              {/* Placeholder icon */}
            </div>
            <div>
              <p className='mb-1 text-sm text-gray-500'>
                Gemini API Calls (retries incl.)
              </p>
              <p className='text-xl font-semibold text-gray-800'>
                {totalGeminiCallsWithRetries}
              </p>
            </div>
          </div>
          {/* --- CARD MỚI: Validation Warnings --- */}
          <div className='flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-5 p-4 shadow-md transition-shadow duration-300 hover:shadow-lg'>
            {/* Sử dụng màu vàng/cam cho warnings */}
            <div
              className={`rounded-full p-3 ${(data.validationStats?.totalValidationWarnings || 0) > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <FaClipboardCheck className='h-6 w-6' />{' '}
              {/* Icon kiểm tra/validation */}
            </div>
            <div>
              <p className='mb-1 text-sm text-gray-500'>Validation Warnings</p>
              <p
                className={`text-xl font-semibold ${(data.validationStats?.totalValidationWarnings || 0) > 0 ? 'text-amber-600' : 'text-gray-800'}`}
              >
                {data.validationStats?.totalValidationWarnings ?? 0}
              </p>
            </div>
          </div>
          {/* Card: CSV Output */}
          <div className='flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-5 p-4 shadow-md'>
            <div className={`rounded-full p-3 ${data.fileOutput?.csvFileGenerated === true ? 'bg-teal-100 text-teal-600' : data.fileOutput?.csvFileGenerated === false ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
              {/* Icon cho file/CSV */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <p className='mb-1 text-sm text-gray-500'>CSV Records Written</p>
              <p className='text-xl font-semibold text-gray-800'>
                {data.fileOutput?.csvRecordsSuccessfullyWritten ?? 0} / {data.fileOutput?.csvRecordsAttempted ?? 0}
              </p>
              {data.fileOutput?.csvFileGenerated === false && <p className="text-xs text-red-500">CSV Generation Failed</p>}
            </div>
          </div>
          {/* Card 5 (trước là 4): Total Errors */}
          <div className='flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-5 p-4 shadow-md transition-shadow duration-300 hover:shadow-lg'>
            <div
              className={`rounded-full p-3 ${(data.errorLogCount || 0) > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <FaExclamationTriangle className='h-6 w-6' />
            </div>
            <div>
              <p className='mb-1 text-sm text-gray-500'>Total Errors Logged</p>
              <p
                className={`text-xl font-semibold ${(data.errorLogCount || 0) > 0 ? 'text-red-600' : 'text-gray-800'}`}
              >
                {data.errorLogCount || 0}
              </p>
            </div>
          </div>
        </div>

        {/* --- Charts Grid --- */}
        {/* Giữ nguyên lg:grid-cols-3, chart mới sẽ làm hàng cuối không đều, hoặc điều chỉnh grid */}
        <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Chart: Overall Task Status */}
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow'>
            {overallStatusData.length > 0 ? (
              <ReactECharts
                option={getPieChartOption(
                  'Overall Task Status',
                  overallStatusData,
                  // Thêm màu cho Processing (ví dụ: xanh dương)
                  ['#91cc75', '#fccb67', '#5470c6', '#ee6666'] // Green, Yellow, Blue, Red
                )}
                style={{ height: '300px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className='flex h-[300px] items-center justify-center text-gray-500'>
                No Task Status Data
              </div>
            )}
          </div>
          {/* Các chart khác giữ nguyên */}
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow'>
            {searchStatusData.length > 0 ? (
              <ReactECharts
                option={getPieChartOption(
                  'Google Search Status',
                  searchStatusData,
                  ['#91cc75', '#ee6666', '#fccb67', '#73c0de']
                )}
                style={{ height: '300px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className='flex h-[300px] items-center justify-center text-gray-500'>
                No Search Status Data
              </div>
            )}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow'>
            {apiStatusData.length > 0 ? (
              <ReactECharts
                option={getPieChartOption(
                  'Gemini API Call Status',
                  apiStatusData,
                  ['#91cc75', '#ee6666', '#fac858', '#5470c6']
                )}
                style={{ height: '300px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className='flex h-[300px] items-center justify-center text-gray-500'>
                No API Status Data
              </div>
            )}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow'>
            {cacheStatusData.length > 0 ? (
              <ReactECharts
                option={getPieChartOption(
                  'Gemini API Cache Usage',
                  cacheStatusData,
                  ['#3ba272', '#fc8452']
                )}
                style={{ height: '300px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className='flex h-[300px] items-center justify-center text-gray-500'>
                No Cache Usage Data
              </div>
            )}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow'>
            {playwrightLinkData.length > 0 ? (
              <ReactECharts
                option={getPieChartOption(
                  'Playwright Link Processing',
                  playwrightLinkData,
                  ['#91cc75', '#ee6666', '#73c0de']
                )}
                style={{ height: '300px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className='flex h-[300px] items-center justify-center text-gray-500'>
                No Link Processing Data
              </div>
            )}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow'>
            {callsByModelWithRetriesData.labels.length > 0 ? (
              <ReactECharts
                option={getBarChartOption(
                  'Gemini Model Usage (incl. Retries)',
                  callsByModelWithRetriesData.labels,
                  callsByModelWithRetriesData.values,
                  'Calls',
                  '#9a60b4'
                )}
                style={{ height: '300px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className='flex h-[300px] items-center justify-center text-gray-500'>
                No Gemini Model Usage Data
              </div>
            )}
          </div>
          {/* --- CHART MỚI: Validation Warnings by Field --- */}
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow'>
            {warningsByFieldData.labels.length > 0 ? (
              <ReactECharts
                option={getBarChartOption(
                  'Validation Warnings by Field', // Title
                  warningsByFieldData.labels, // Labels (field names)
                  warningsByFieldData.values, // Values (counts)
                  'Warnings', // Value axis name
                  '#f59e0b' // Bar color (Amber/Orange)
                )}
                style={{ height: '300px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className='flex h-[300px] items-center justify-center text-gray-500'>
                No Validation Warnings Found
              </div>
            )}
          </div>
          {/* --- Các chart còn lại --- */}
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow lg:col-span-1'>
            {' '}
            {/* Điều chỉnh col-span nếu cần */}
            {apiKeyUsageData.labels.length > 0 ? (
              <ReactECharts
                option={getBarChartOption(
                  'Google API Key Usage',
                  apiKeyUsageData.labels,
                  apiKeyUsageData.values,
                  'Requests',
                  '#ea7ccc'
                )}
                style={{ height: '300px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className='flex h-[300px] items-center justify-center text-gray-500'>
                No API Key Usage Data
              </div>
            )}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow lg:col-span-1'>
            {' '}
            {/* Điều chỉnh col-span nếu cần */}
            {callsByTypeWithRetriesData.labels.length > 0 ? (
              <ReactECharts
                option={getBarChartOption(
                  'Gemini Calls by Type (incl. Retries)',
                  callsByTypeWithRetriesData.labels,
                  callsByTypeWithRetriesData.values,
                  'Calls',
                  '#5470c6'
                )}
                style={{ height: '300px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className='flex h-[300px] items-center justify-center text-gray-500'>
                No Gemini Calls by Type Data
              </div>
            )}
          </div>
          <div className='min-h-[340px] rounded-lg border border-gray-100 bg-white p-4 shadow md:col-span-2 lg:col-span-3'>
            {' '}
            {/* Thay đổi col-span cho Top Errors để cân đối layout */}
            {topErrorsData.labels.length > 0 ? (
              <ReactECharts
                option={getBarChartOption(
                  'Top Aggregated Errors',
                  topErrorsData.labels,
                  topErrorsData.values,
                  'Count',
                  '#ee6666'
                )}
                style={{ height: '300px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className='flex h-[300px] items-center justify-center text-gray-500'>
                No Aggregated Errors Found
              </div>
            )}
          </div>
        </div>

        {/* Log Processing Errors */}
        {data.logProcessingErrors && data.logProcessingErrors.length > 0 && (
          <div className='mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 shadow-sm'>
            <h3 className='text-md mb-2 flex items-center font-semibold text-yellow-800'>
              <FaExclamationTriangle className='mr-2' />
              Log Parsing Issues ({data.parseErrors} errors /{' '}
              {data.totalLogEntries} entries)
            </h3>
            <ul className='max-h-40 list-inside list-disc space-y-1 overflow-y-auto pl-4 text-sm text-yellow-700'>
              {data.logProcessingErrors.slice(0, 20).map((err, index) => (
                <li key={index} className='break-words'>
                  {err}
                </li>
              ))}
              {data.logProcessingErrors.length > 20 && (
                <li>... (and {data.logProcessingErrors.length - 20} more)</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export default OverallSummary
