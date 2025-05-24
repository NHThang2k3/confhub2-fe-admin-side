import React from 'react';
import { FaChevronDown, FaChevronUp, FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaWrench, FaLink, FaCogs } from 'react-icons/fa'; // Thêm FaLink, FaCogs
import { ConferenceTableData, RowSaveStatus } from '@/src/hooks/crawl/useConferenceTableManager'; // Điều chỉnh path nếu cần
import { DataQualityInsight } from '@/src/models/logAnalysis';
import { StatusIcon } from '../StatusIcon';
import { formatDuration } from '../utils/commonUtils';

interface ConferenceTableRowProps {
  confData: ConferenceTableData;
  isSelected: boolean;
  isExpanded: boolean;
  onSelectToggle: (uniqueRowId: string) => void;
  onToggleExpand: (uniqueRowId: string) => void;
  saveStatus: RowSaveStatus;
  saveError?: string;
}

const getSeverityClass = (severity?: 'Low' | 'Medium' | 'High'): string => {
  switch (severity) {
    case 'High': return 'text-red-600 bg-red-100 border-red-300';
    case 'Medium': return 'text-amber-600 bg-amber-100 border-amber-300';
    case 'Low': return 'text-blue-600 bg-blue-100 border-blue-300';
    default: return 'text-gray-600 bg-gray-100 border-gray-300';
  }
};

const getInsightIcon = (type: DataQualityInsight['insightType']) => {
  switch (type) {
    case 'ValidationWarning': return <FaExclamationTriangle className="mr-1.5 inline-block text-amber-600" />;
    case 'NormalizationApplied': return <FaWrench className="mr-1.5 inline-block text-sky-600" />;
    case 'DataCorrection': return <FaInfoCircle className="mr-1.5 inline-block text-purple-600" />;
    default: return <FaInfoCircle className="mr-1.5 inline-block text-gray-500" />;
  }
};

export const ConferenceTableRow: React.FC<ConferenceTableRowProps> = ({
  confData, isSelected, isExpanded, onSelectToggle, onToggleExpand, saveStatus, saveError
}) => {
  const {
    uniqueRowId, title, acronym, status, durationSeconds, steps, errors, finalResult,
    errorCount,
    dataQualityInsights, dataQualityInsightCount, hasSignificantDataQualityIssues,
    requestId,
    crawlType, // <--- Lấy crawlType
    link, cfpLink, impLink, // <--- Lấy các link
    persistedSaveStatus, // Lấy trạng thái lưu trữ bền vững
  } = confData;

  const hasErrors = errorCount > 0;

  let rowBgClass = 'hover:bg-gray-5';
  let statusPulseClass = '';

  if (hasErrors) {
    rowBgClass = isSelected ? 'bg-red-100 hover:bg-red-200' : 'bg-red-50 hover:bg-red-100';
  } else if (hasSignificantDataQualityIssues) {
    rowBgClass = isSelected ? 'bg-amber-100 hover:bg-amber-200' : 'bg-amber-50 hover:bg-amber-100';
  } else if (isSelected) {
    rowBgClass = 'bg-blue-50 hover:bg-blue-100';
  } else {
    if (status === 'failed') rowBgClass = 'bg-red-50 hover:bg-red-100';
    else if (status === 'processing') {
      rowBgClass = 'bg-blue-50 hover:bg-blue-100';
      statusPulseClass = 'animate-pulse';
    } else if (status === 'completed') rowBgClass = 'bg-white hover:bg-green-50';
    else rowBgClass = 'bg-white hover:bg-gray-5';
  }

  let statusBadgeClass = 'bg-gray-100 text-gray-800'
  switch (status) {
    case 'completed':
      statusBadgeClass = 'bg-green-100 text-green-800'
      break
    case 'failed':
      statusBadgeClass = 'bg-red-100 text-red-800'
      break
    case 'processing':
      statusBadgeClass = `bg-blue-100 text-blue-800 ${statusPulseClass}`
      break
    case 'unknown':
      statusBadgeClass = 'bg-yellow-100 text-yellow-800'
      break
  }

  const linkAttemptedCount = steps?.link_processing_attempted_count ?? 0;
  const linkSuccessCount = steps?.link_processing_success_count ?? 0;

  let linkIconSuccess: boolean | null = null; // Khởi tạo là null
  let linkIconAttempted: boolean = false; // Khởi tạo là false
  let linkIconHasAttempts: boolean = false; // Khởi tạo là false

  if (linkAttemptedCount > 0) {
    linkIconAttempted = true;
    if (linkSuccessCount === linkAttemptedCount) {
      linkIconSuccess = true;
    } else if (linkSuccessCount > 0) {
      linkIconSuccess = null; // null cho trạng thái partially successful
      linkIconHasAttempts = true;
    } else {
      linkIconSuccess = false;
    }
  }


  const showRequestIdColumn = confData.requestId !== 'N/A';
  // Cập nhật colSpan dựa trên số cột hiện tại
  // Sel (1) + Title (1) + Action (1)  + Status (1) + Duration (1) + 6 step icons (6) + Warns (1) + Errors (1) + Save (1) = 14 or 15
  const colSpanBase = 14; // Đếm lại số cột cố định
  const colSpan = showRequestIdColumn ? colSpanBase + 1 : colSpanBase;

  // KIỂM TRA GIÁ TRỊ CỦA crawlType TRƯỚC KHI THỰC HIỆN THAO TÁC CHUỖI
  const crawlTypeDisplay = crawlType && typeof crawlType === 'string' && crawlType.length > 0
    ? crawlType.charAt(0).toUpperCase() + crawlType.slice(1)
    : 'N/A'; // Hoặc một giá trị mặc định khác nếu crawlType không hợp lệ

  const crawlTypeColor = crawlType === 'update' ? 'text-sky-700 bg-sky-100' : 'text-teal-700 bg-teal-100';


  return (
    <React.Fragment>
      <tr className={`${rowBgClass} transition-colors duration-150`}>
        <td className='whitespace-nowrap px-3 py-2 text-center text-sm'>
          <input type='checkbox' className='h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
            checked={isSelected} onChange={() => onSelectToggle(uniqueRowId)} aria-label={`Select ${title}`} />
        </td>

        <td
          className='px-3 py-2 text-sm font-medium text-gray-900 max-w-[200px] cursor-pointer group'
          title={`${title} (Click to ${isExpanded ? 'collapse' : 'expand'})`}
          onClick={() => onToggleExpand(uniqueRowId)}
        >
          <div className="flex items-center">
            {isExpanded
              ? <FaChevronUp className='mr-2 text-blue-600 group-hover:text-blue-800 flex-shrink-0' />
              : <FaChevronDown className='mr-2 text-blue-600 group-hover:text-blue-800 flex-shrink-0' />}
            <span className="truncate">
              {acronym} - <span className="text-gray-500">{title}</span>
            </span>
          </div>
        </td>

        {/* Ô HIỂN THỊ ACTION */}
        <td className='whitespace-nowrap px-3 py-2 text-sm'>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${crawlTypeColor}`}>
            {crawlType === 'update' ? <FaLink className="mr-1.5" /> : <FaCogs className="mr-1.5" />}
            {crawlTypeDisplay}
          </span>
        </td>

        {/* {showRequestIdColumn && (
          <td className='px-3 py-2 text-sm text-gray-500 max-w-[150px] truncate' title={requestId}>
            {requestId}
          </td>
        )} */}

        <td className='whitespace-nowrap px-3 py-2 text-sm'>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${statusBadgeClass}`}>
            {status || 'N/A'}
          </span>
        </td>
        <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-500 text-center'>{formatDuration(durationSeconds)}</td>
        <td className='whitespace-nowrap px-2 py-2 text-right text-lg'><StatusIcon success={steps?.search_success} attempted={steps?.search_attempted} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-right text-lg'>
          <StatusIcon
            success={linkIconSuccess}
            attempted={linkIconAttempted}
            hasAttempts={linkIconHasAttempts}
          />
        </td>
        <td className='whitespace-nowrap px-2 py-2 text-right text-lg'><StatusIcon success={steps?.html_save_success} attempted={steps?.html_save_attempted} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-right text-lg'><StatusIcon success={steps?.gemini_determine_success} attempted={steps?.gemini_determine_attempted} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-right text-lg'><StatusIcon success={steps?.gemini_cfp_success} attempted={steps?.gemini_cfp_attempted} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-right text-lg'><StatusIcon success={steps?.gemini_extract_success} attempted={steps?.gemini_extract_attempted} /></td>
        <td className={`whitespace-nowrap px-3 py-2 text-center text-sm font-medium ${hasSignificantDataQualityIssues ? 'text-amber-600' : 'text-gray-500'}`}>
          {dataQualityInsightCount > 0 && (
            <FaInfoCircle
              className={`mb-0.5 mr-1 inline ${hasSignificantDataQualityIssues ? 'text-amber-500' : 'text-sky-500'}`}
              title={`Data Quality Insights: ${dataQualityInsightCount}`}
            />
          )}
          {dataQualityInsightCount}
        </td>

        <td className={`whitespace-nowrap px-3 py-2 text-center text-sm font-medium ${hasErrors ? 'text-red-600' : 'text-green-600'}`}>
          {hasErrors && <FaTimesCircle className='mb-0.5 mr-1 inline text-red-500' title={`Errors: ${errorCount}`} />}
          {errorCount}
        </td>
        <td className='whitespace-nowrap pl-3 pr-3 py-2 text-center text-lg'>
          {/* Ưu tiên hiển thị trạng thái của hành động save hiện tại */}
          {saveStatus === 'success' && <FaCheckCircle className='text-green-500' title='Saved in this session' />}
          {saveStatus === 'error' && <FaTimesCircle className='text-red-500' title={`Save failed: ${saveError || 'Unknown'}`} />}


          {/* Nếu không có hành động save hiện tại, và đã được lưu từ trước */}
          {saveStatus === 'idle' && persistedSaveStatus === 'SAVED_TO_DATABASE' && (
            <FaCheckCircle className='text-gray-400' title={`Persistently saved on ${confData.persistedSaveTimestamp ? new Date(confData.persistedSaveTimestamp).toLocaleString() : 'N/A'}`} />
          )}
          {/* Có thể thêm logic để hiển thị nút save (FaSave) nếu saveStatus === 'idle' và !persistedSaveStatus */}
        </td>
      </tr>



      {/* PHẦN MỞ RỘNG (EXPANDED VIEW) */}
      {isExpanded && (
        <tr className='bg-slate-50 hover:bg-slate-100'>
          <td colSpan={colSpan} className='px-4 py-3 text-sm text-gray-700 md:px-6 md:py-4'>
            <div className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3'>

              {/* CỘT 1: Extracted Data Preview VÀ LINKS (NẾU UPDATE) */}
              <div>
                {crawlType === 'update' && (link || cfpLink || impLink) && (
                  <div className="mb-4">
                    <h4 className='mb-2 font-semibold text-sky-700'>Update Links:</h4>
                    <ul className="list-none space-y-1 text-xs bg-sky-50 p-2.5 rounded border border-sky-200 shadow-inner">
                      {link && (
                        <li className="break-all">
                          <strong className="text-sky-600">Main Link:</strong> <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link}</a>
                        </li>
                      )}
                      {cfpLink && (
                        <li className="break-all">
                          <strong className="text-sky-600">CFP Link:</strong> <a href={cfpLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{cfpLink}</a>
                        </li>
                      )}
                      {impLink && (
                        <li className="break-all">
                          <strong className="text-sky-600">Imp. Link:</strong> <a href={impLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{impLink}</a>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                <h4 className='mb-2 font-semibold text-gray-800'>Extracted Data Preview:</h4>
                <pre className='custom-scrollbar max-h-[500px] overflow-auto rounded border border-gray-200 bg-gray-100 p-2.5 text-xs shadow-inner'>
                  {finalResult ? JSON.stringify(finalResult, null, 2) : 'No preview available.'}
                </pre>
              </div>

              {/* CỘT 2: Errors và Link Access Failures */}
              <div className="space-y-4">
                {hasErrors && errors && errors.length > 0 && (
                  <div>
                    <h4 className='mb-2 font-semibold text-red-700'>Errors ({errorCount}):</h4>
                    {/* Thêm overflow-x-hidden để chỉ cuộn dọc */}
                    <ul className='custom-scrollbar max-h-[550px] overflow-y-auto overflow-x-hidden rounded border border-red-200 bg-red-50 p-2 text-xs text-red-600 shadow-inner'>
                      {errors.map((err, index) => (
                        <li key={`err-${index}`} className='break-words'> {/* break-words quan trọng */}
                          {err.sourceService && <span className="font-semibold text-red-800">[{err.sourceService}]</span>} {err.message}
                          {err.errorCode && <span className="text-xs text-red-500 ml-1">({err.errorCode})</span>}
                          {err.details && <pre className="mt-1 text-xs bg-red-100 p-1 rounded overflow-auto">{JSON.stringify(err.details, null, 2)}</pre>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {steps.link_processing_failed_details && steps.link_processing_failed_details.length > 0 && (
                  <div>
                    <h4 className='mb-2 font-semibold text-yellow-700'>
                      Link Access Failures ({steps.link_processing_failed_details.length}):
                    </h4>
                    {/* Thêm overflow-x-hidden để chỉ cuộn dọc */}
                    <ul className='custom-scrollbar max-h-[250px] overflow-y-auto overflow-x-hidden rounded border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-600'>
                      {steps.link_processing_failed_details.map(
                        (failDetail, index: number) => (
                          <li key={index} className='break-words'> {/* break-words quan trọng */}
                            {failDetail.url && <span className='font-medium'>URL:</span>} {failDetail.url || ''}
                            {failDetail.url && failDetail.error && ' - '}
                            {failDetail.error && <span className='font-medium'>Error:</span>} {failDetail.error || ''}
                            {!failDetail.url && !failDetail.error && (typeof failDetail === 'object' ? JSON.stringify(failDetail) : String(failDetail))}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* CỘT 3: Data Quality Insights và Step Details */}
              <div className="space-y-4">
                {dataQualityInsights && dataQualityInsights.length > 0 && (
                  <div>
                    <h4 className='mb-2 font-semibold text-slate-700'>
                      Data Quality Insights ({dataQualityInsightCount}):
                    </h4>
                    {/* Thêm overflow-x-hidden để chỉ cuộn dọc */}
                    <ul className='custom-scrollbar max-h-[300px] list-none space-y-2 overflow-y-auto overflow-x-hidden rounded border border-slate-200 bg-white p-2.5 text-xs shadow-inner'>
                      {dataQualityInsights.map((insight, index) => (
                        <li key={`insight-${index}`} className={`p-2 border rounded-md ${getSeverityClass(insight.severity)}`}>
                          {/* break-words có thể không cần thiết ở đây nếu nội dung được cấu trúc tốt, nhưng không gây hại */}
                          <div className="font-semibold mb-0.5 flex items-center break-words">
                            {getInsightIcon(insight.insightType)}
                            Field: <span className="font-bold ml-1">{insight.field}</span> - <span className="italic ml-1">{insight.insightType.replace(/([A-Z])/g, ' $1').trim()}</span>
                            {insight.severity && ` (Severity: ${insight.severity})`}
                          </div>
                          <div className="ml-5 text-slate-800 break-words">{insight.message}</div>
                          {insight.originalValue !== undefined && (
                            <div className="ml-5 text-xs mt-0.5 break-words">
                              <span className="text-gray-500">Original:</span> <code className="bg-gray-200 px-1 rounded">{String(insight.originalValue) || '""'}</code>
                            </div>
                          )}
                          {(insight.insightType !== 'ValidationWarning' || insight.details?.normalizedTo !== undefined || insight.details?.actionTaken === 'NormalizedToDefault') && insight.currentValue !== undefined ? (
                            <div className="ml-5 text-xs mt-0.5 break-words">
                              <span className="text-gray-500">Current:</span> <code className="bg-gray-200 px-1 rounded">{String(insight.currentValue)}</code>
                            </div>
                          ) : null}
                          {insight.details?.actionTaken && <div className="ml-5 text-xs mt-0.5 break-words"><span className="text-gray-500">Action:</span> {insight.details.actionTaken}</div>}
                          {insight.details?.ruleViolated && <div className="ml-5 text-xs mt-0.5 break-words"><span className="text-gray-500">Rule:</span> {insight.details.ruleViolated}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className='mb-2 font-semibold text-gray-800'>Step Details:</h4>
                  {/* Step details không cần cuộn nên giữ nguyên */}
                  <ul className='list-none space-y-1 text-xs'>
                    <li className='flex justify-between border-b border-gray-200 py-0.5'><span className="text-gray-600">Search:</span> <span><strong>{steps?.search_attempts_count ?? 0}</strong> att / <strong>{steps?.search_results_count ?? 0}</strong> res / <strong>{steps?.search_filtered_count ?? 0}</strong> filt</span></li>
                    <li className='flex justify-between border-b border-gray-200 py-0.5'><span className="text-gray-600">HTML Save:</span> <span>{steps?.html_save_attempted ? `Attempted (${steps?.html_save_success ? 'OK' : 'Fail'})` : 'Skipped'}</span></li>
                    <li className='flex justify-between border-b border-gray-200 py-0.5'><span className="text-gray-600">Links Processed:</span> <span><strong>{steps?.link_processing_success_count ?? 0}</strong> / {steps?.link_processing_attempted_count ?? 0}</span></li>
                    <li className='flex justify-between border-b border-gray-200 py-0.5'><span className="text-gray-600">Gemini Determine:</span> <span>{steps?.gemini_determine_attempted ? `Attempted (${steps?.gemini_determine_success ? 'OK' : 'Fail'})` : 'Skipped'} {steps?.gemini_determine_cache_used ? '(Cache)' : ''}</span></li>
                    <li className='flex justify-between border-b border-gray-200 py-0.5'><span className="text-gray-600">Gemini CFP:</span> <span>{steps.gemini_cfp_attempted ? `Attempted (${steps.gemini_cfp_success ? 'OK' : 'Fail'})` : 'Skipped'} {steps.gemini_cfp_cache_used ? '(Cache)' : ''}</span></li>
                    <li className='flex justify-between pt-0.5'><span className="text-gray-600">Gemini Extract:</span> <span>{steps?.gemini_extract_attempted ? `Attempted (${steps?.gemini_extract_success ? 'OK' : 'Fail'})` : 'Skipped'} {steps?.gemini_extract_cache_used ? '(Cache)' : ''}</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};