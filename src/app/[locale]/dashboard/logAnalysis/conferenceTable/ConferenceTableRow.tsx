// src/app/[locale]/dashboard/logAnalysis/ConferenceTableRow.tsx
import React from 'react';
import { FaChevronDown, FaChevronUp, FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaWrench } from 'react-icons/fa';
import { ConferenceTableData, RowSaveStatus } from '../../../../../hooks/crawl/useConferenceTableManager'; // Adjust path
import { StatusIcon } from '../StatusIcon'; // Adjust path. Assuming StatusIcon.tsx is in a parent 'common' directory.
                                            // If StatusIcon is in the same directory or a different relative path, adjust accordingly.
                                            // Example: import { StatusIcon } from './StatusIcon'; if in the same directory as ConferenceTableRow
                                            // Example: import { StatusIcon } from '../../common/StatusIcon'; if it's ../../common relative to current file
import { formatDuration } from '../utils/commonUtils'; // Adjust path
import { DataQualityInsight } from '@/src/models/logAnalysis/logAnalysis'; // << IMPORT


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
    case 'ValidationWarning': return <FaExclamationTriangle className="mr-1.5 inline-block" />;
    case 'NormalizationApplied': return <FaWrench className="mr-1.5 inline-block text-sky-600" />;
    case 'DataCorrection': return <FaInfoCircle className="mr-1.5 inline-block text-purple-600" />;
    default: return <FaInfoCircle className="mr-1.5 inline-block" />;
  }
};


export const ConferenceTableRow: React.FC<ConferenceTableRowProps> = ({
  confData, isSelected, isExpanded, onSelectToggle, onToggleExpand, saveStatus, saveError
}) => {
  const {
    uniqueRowId, title, acronym,
    status: originalStatus, // << Lấy status gốc
    durationSeconds, steps, errors, finalResult,
    errorCount,
    dataQualityInsights, dataQualityInsightCount, hasSignificantDataQualityIssues,
    requestId
  } = confData;

  const linkProcessingSuccessCount = steps?.link_processing_success_count ?? 0;
  // const linkProcessingAttemptedCount = steps?.link_processing_attempted_count ?? 0; // Có thể cần nếu logic phức tạp hơn

  // --- LOGIC MỚI ĐỂ XÁC ĐỊNH EFFECTIVE STATUS ---
  let effectiveStatus = originalStatus;
  // Nếu link_processing_success_count = 0 VÀ status gốc không phải là 'processing' (vì có thể đang xử lý và sẽ tăng lên)
  // thì coi như 'failed'.
  // Điều này sẽ ghi đè 'completed', 'unknown', etc. nếu link_processing_success_count là 0.
  // Nếu originalStatus đã là 'failed' thì nó vẫn là 'failed'.
  if (linkProcessingSuccessCount === 0 && originalStatus !== 'processing') {
    effectiveStatus = 'failed';
  }
  // --- KẾT THÚC LOGIC MỚI ---


  const hasErrors = errorCount > 0 || effectiveStatus === 'failed'; // Cập nhật hasErrors để bao gồm cả effectiveStatus 'failed'

  let rowBgClass = 'hover:bg-gray-50';
  let statusPulseClass = '';

  // Sử dụng effectiveStatus cho rowBgClass
  if (effectiveStatus === 'failed') { // Ưu tiên màu đỏ nếu là failed (do lỗi hoặc do link_processing_success_count = 0)
    rowBgClass = isSelected ? 'bg-red-100 hover:bg-red-200' : 'bg-red-50 hover:bg-red-100';
  } else if (hasErrors && originalStatus !== 'failed') { // Trường hợp có errorCount > 0 nhưng effectiveStatus không phải 'failed' (hiếm, nhưng để logic cũ)
     rowBgClass = isSelected ? 'bg-red-100 hover:bg-red-200' : 'bg-red-50 hover:bg-red-100';
  } else if (hasSignificantDataQualityIssues) {
    rowBgClass = isSelected ? 'bg-amber-100 hover:bg-amber-200' : 'bg-amber-50 hover:bg-amber-100';
  } else if (isSelected) {
    rowBgClass = 'bg-blue-50 hover:bg-blue-100';
  } else {
    // Các trường hợp còn lại dựa trên effectiveStatus
    if (effectiveStatus === 'processing') {
      rowBgClass = 'bg-blue-50 hover:bg-blue-100';
      statusPulseClass = 'animate-pulse';
    } else if (effectiveStatus === 'completed') {
      rowBgClass = 'bg-white hover:bg-green-50';
    }
    // Các trường hợp 'unknown' hoặc status khác không phải 'failed', 'processing', 'completed' sẽ dùng default hover:bg-gray-50
    else {
        rowBgClass = 'bg-white hover:bg-gray-50';
    }
  }


  let statusBadgeClass = 'bg-gray-100 text-gray-800'
  // Sử dụng effectiveStatus cho statusBadgeClass
  switch (effectiveStatus) {
    case 'completed':
      statusBadgeClass = 'bg-green-100 text-green-800'
      break
    case 'failed':
      statusBadgeClass = 'bg-red-100 text-red-800'
      break
    case 'processing':
      statusBadgeClass = `bg-blue-100 text-blue-800 ${statusPulseClass}` // statusPulseClass sẽ được đặt nếu effectiveStatus là 'processing'
      break
    case 'unknown': // Hoặc các status khác
      statusBadgeClass = 'bg-yellow-100 text-yellow-800'
      break
    // Mặc định đã được đặt ở trên
  }

  const linkAttemptedCount = steps?.link_processing_attempted_count ?? 0;
  // linkSuccessCount đã được định nghĩa ở trên là linkProcessingSuccessCount
  const linkAttempted = linkAttemptedCount > 0;
  const linkAllSuccess = linkAttempted && (linkProcessingSuccessCount === linkAttemptedCount);
  const linkHasAttemptsButNotAllSuccess = linkAttempted && !linkAllSuccess;
  const showRequestIdColumn = confData.requestId !== 'N/A';
  const colSpanBase = 13;
  const colSpan = showRequestIdColumn ? colSpanBase + 1 : colSpanBase;


  return (
    <React.Fragment>
      <tr className={`${rowBgClass} transition-colors duration-150`}>
        <td className='whitespace-nowrap px-3 py-2 text-center text-sm'>
          <input type='checkbox' className='h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
            checked={isSelected} onChange={() => onSelectToggle(uniqueRowId)} aria-label={`Select ${title}`} />
        </td>
        <td
          className='px-3 py-2 text-sm font-medium text-gray-900 max-w-[20px] cursor-pointer group' // Giảm max-w để tiêu đề không quá rộng
          title={`${title} (Click to ${isExpanded ? 'collapse' : 'expand'})`}
          onClick={() => onToggleExpand(uniqueRowId)}
        >
          <div className="flex items-center">
            {isExpanded
              ? <FaChevronUp className='mr-2 text-blue-600 group-hover:text-blue-800 flex-shrink-0' />
              : <FaChevronDown className='mr-2 text-blue-600 group-hover:text-blue-800 flex-shrink-0' />}
            <span className="truncate">
              {acronym}
            </span>
          </div>
        </td>

        {showRequestIdColumn && (
          <td className='px-3 py-2 text-sm text-gray-500 max-w-[150px] truncate' title={requestId}>
            {requestId}
          </td>
        )}

        <td className='whitespace-nowrap px-3 py-2 text-sm'>
          {/* Sử dụng effectiveStatus để hiển thị text trạng thái */}
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${statusBadgeClass}`}>
            {effectiveStatus || 'N/A'}
          </span>
        </td>
        <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-500 text-center'>{formatDuration(durationSeconds)}</td>
        {/* Các StatusIcon cho từng step không thay đổi, chúng phản ánh trạng thái của step đó */}
        <td className='whitespace-nowrap px-2 py-2 text-center text-lg'><StatusIcon success={steps?.search_success} attempted={steps?.search_attempted} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-center text-lg'><StatusIcon success={steps?.html_save_success} attempted={steps?.html_save_attempted} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-center text-lg'><StatusIcon success={linkAttempted ? linkAllSuccess : null} attempted={linkAttempted} hasAttempts={linkHasAttemptsButNotAllSuccess} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-center text-lg'><StatusIcon success={steps?.gemini_determine_success} attempted={steps?.gemini_determine_attempted} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-center text-lg'><StatusIcon success={steps?.gemini_cfp_success} attempted={steps?.gemini_cfp_attempted} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-center text-lg'><StatusIcon success={steps?.gemini_extract_success} attempted={steps?.gemini_extract_attempted} /></td>
        
        <td className={`whitespace-nowrap px-3 py-2 text-center text-sm font-medium ${hasSignificantDataQualityIssues ? 'text-amber-600' : 'text-gray-500'}`}>
          {dataQualityInsightCount > 0 && (
            <FaInfoCircle
              className={`mb-0.5 mr-1 inline ${hasSignificantDataQualityIssues ? 'text-amber-500' : 'text-sky-500'}`}
              title={`Data Quality Insights: ${dataQualityInsightCount}`}
            />
          )}
          {dataQualityInsightCount}
        </td>

        {/* Cột Errors giờ sẽ phản ánh cả trường hợp effectiveStatus là 'failed' */}
        <td className={`whitespace-nowrap px-3 py-2 text-center text-sm font-medium ${hasErrors ? 'text-red-600' : (errorCount > 0 ? 'text-red-600' : 'text-green-600')}`}>
          {(hasErrors || errorCount > 0) && <FaTimesCircle className='mb-0.5 mr-1 inline text-red-500' title={`Errors: ${errorCount}`} />}
          {errorCount}
        </td>
        <td className='whitespace-nowrap pl-3 pr-3 py-2 text-center text-lg'>
          {saveStatus === 'success' && <FaCheckCircle className='text-green-500' title='Saved' />}
          {saveStatus === 'error' && <FaTimesCircle className='text-red-500' title={`Save failed: ${saveError || 'Unknown'}`} />}
        </td>
      </tr>

      {isExpanded && (
        <tr className='bg-slate-50 hover:bg-slate-100'>
          <td colSpan={colSpan} className='px-4 py-3 text-sm text-gray-700 md:px-6 md:py-4'>
            <div className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
              <div>
                <h4 className='mb-1.5 font-semibold text-gray-800'>Extracted Data Preview:</h4>
                <pre className='custom-scrollbar max-h-60 overflow-auto rounded border border-gray-200 bg-gray-100 p-2.5 text-xs shadow-inner'>
                  {finalResult ? JSON.stringify(finalResult, null, 2) : 'No preview available.'}
                </pre>
              </div>
              <div className="space-y-4">
                {/* Errors section: hasErrors đã được cập nhật */}
                {(hasErrors || (errors && errors.length > 0)) && ( // Kiểm tra cả errors array
                  <div>
                    <h4 className='mb-1 font-semibold text-red-700'>Errors ({errorCount}):</h4>
                    {errors && errors.length > 0 ? (
                      <ul className='custom-scrollbar max-h-32 list-inside list-disc space-y-1 overflow-y-auto rounded border border-red-200 bg-red-50 p-2 text-xs text-red-600 shadow-inner'>
                        {errors.map((err, index) => (
                          <li key={`err-${index}`} className='break-words'>
                            {err.sourceService && <span className="font-semibold text-red-800">[{err.sourceService}]</span>} {err.message}
                            {err.errorCode && <span className="text-xs text-red-500 ml-1">({err.errorCode})</span>}
                            {err.details && <pre className="mt-1 text-xs bg-red-100 p-1 rounded overflow-auto">{JSON.stringify(err.details, null, 2)}</pre>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      effectiveStatus === 'failed' && linkProcessingSuccessCount === 0 && <p className="text-xs text-red-600">Marked as failed due to 0 successful link processings.</p>
                    )}
                  </div>
                )}

                {dataQualityInsights && dataQualityInsights.length > 0 && (
                  <div className='mb-4'>
                    <h4 className='mb-1.5 font-semibold text-slate-700'>
                      Data Quality Insights ({dataQualityInsightCount}):
                    </h4>
                    <ul className='custom-scrollbar max-h-60 list-none space-y-2 overflow-y-auto rounded border border-slate-200 bg-white p-2.5 text-xs shadow-inner'>
                      {dataQualityInsights.map((insight, index) => (
                        <li key={`insight-${index}`} className={`p-2 border rounded-md ${getSeverityClass(insight.severity)}`}>
                          <div className="font-semibold mb-0.5">
                            {getInsightIcon(insight.insightType)}
                            Field: <span className="font-bold">{insight.field}</span> - <span className="italic">{insight.insightType.replace(/([A-Z])/g, ' $1').trim()}</span>
                            {insight.severity && ` (Severity: ${insight.severity})`}
                          </div>
                          <div className="ml-5 text-slate-800">{insight.message}</div>
                          {insight.originalValue !== undefined && (
                            <div className="ml-5 text-xs mt-0.5">
                              <span className="text-gray-500">Original:</span> <code className="bg-gray-200 px-1 rounded">{String(insight.originalValue) || '""'}</code>
                            </div>
                          )}
                          {insight.insightType !== 'ValidationWarning' || insight.details?.normalizedTo !== undefined || insight.details?.actionTaken === 'NormalizedToDefault' ? (
                            <div className="ml-5 text-xs mt-0.5">
                              <span className="text-gray-500">Current:</span> <code className="bg-gray-200 px-1 rounded">{String(insight.currentValue)}</code>
                            </div>
                          ) : null}
                          {insight.details?.actionTaken && <div className="ml-5 text-xs mt-0.5"><span className="text-gray-500">Action:</span> {insight.details.actionTaken}</div>}
                          {insight.details?.ruleViolated && <div className="ml-5 text-xs mt-0.5"><span className="text-gray-500">Rule:</span> {insight.details.ruleViolated}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {steps.link_processing_failed_details &&
                  steps.link_processing_failed_details.length > 0 && (
                    <div className='mb-4'>
                      <h4 className='mb-1 font-semibold text-yellow-700'>
                        Link Access Failures ({steps.link_processing_failed_details.length}):
                      </h4>
                      <ul className='custom-scrollbar max-h-40 list-inside list-disc space-y-1 overflow-y-auto rounded border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-600'>
                        {steps.link_processing_failed_details.map(
                          (failDetail, index: number) => (
                            <li key={index} className='break-words'>
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

                <div>
                  <h4 className='mb-1.5 font-semibold text-gray-800'>Step Details:</h4>
                  <ul className='list-none space-y-1 text-xs'>
                    <li className='flex justify-between border-b border-gray-200 py-0.5'><span className="text-gray-600">Search:</span> <span><strong>{steps?.search_attempts_count ?? 0}</strong> att / <strong>{steps?.search_results_count ?? 0}</strong> res / <strong>{steps?.search_filtered_count ?? 0}</strong> filt</span></li>
                    <li className='flex justify-between border-b border-gray-200 py-0.5'><span className="text-gray-600">HTML Save:</span> <span>{steps?.html_save_attempted ? `Attempted (${steps?.html_save_success ? 'OK' : 'Fail'})` : 'Skipped'}</span></li>
                    <li className='flex justify-between border-b border-gray-200 py-0.5'><span className="text-gray-600">Links Processed:</span> <span><strong>{linkProcessingSuccessCount}</strong> / {linkAttemptedCount}</span></li>
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