// src/app/[locale]/dashboard/logAnalysis/ConferenceTableRow.tsx
import React from 'react';
import { FaChevronDown, FaChevronUp, FaTimesCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { ConferenceTableData, RowSaveStatus } from '../../../../../hooks/crawl/useConferenceTableManager'; // Adjust path
import { StatusIcon } from '../StatusIcon'; // Adjust path
import { formatDuration } from '../utils/commonUtils'; // Adjust path
import { Rocket } from 'lucide-react';

interface ConferenceTableRowProps {
  confData: ConferenceTableData;
  isSelected: boolean;
  isExpanded: boolean;
  onSelectToggle: (uniqueRowId: string) => void; // Sử dụng uniqueRowId
  onToggleExpand: (uniqueRowId: string) => void; // Sử dụng uniqueRowId
  saveStatus: RowSaveStatus;
  saveError?: string;
}

export const ConferenceTableRow: React.FC<ConferenceTableRowProps> = ({
  confData, isSelected, isExpanded, onSelectToggle, onToggleExpand, saveStatus, saveError
}) => {
  const {
    uniqueRowId, title, acronym, status, durationSeconds, steps, errors, finalResult,
    errorCount, validationWarningCount, hasValidationWarnings, validationWarnings, requestId // Lấy requestId
  } = confData;
  const hasErrors = errorCount > 0
  // Row Background Logic (Cập nhật để ưu tiên Error > Warning > Selected > Status)
  let rowBgClass = 'hover:bg-gray-5' // Default hover // Changed from hover:bg-gray-5 to hover:bg-gray-5
  let statusPulseClass = ''

  if (hasErrors) {
    rowBgClass = isSelected
      ? 'bg-red-100 hover:bg-red-200'
      : 'bg-red-50 hover:bg-red-100' // Ưu tiên màu đỏ cho lỗi
  } else if (hasValidationWarnings) {
    rowBgClass = isSelected
      ? 'bg-amber-100 hover:bg-amber-200'
      : 'bg-amber-50 hover:bg-amber-100' // Màu vàng/cam cho warning
  } else if (isSelected) {
    rowBgClass = 'bg-blue-50 hover:bg-blue-100';
  } else { // Not selected, no errors, no warnings
    if (status === 'failed') {
      rowBgClass = 'bg-red-50 hover:bg-red-100';
    } else if (status === 'processing') {
      rowBgClass = 'bg-blue-50 hover:bg-blue-100'; // Hoặc một màu processing khác nếu không selected
      statusPulseClass = 'animate-pulse';
    } else if (status === 'completed') {
      rowBgClass = 'bg-white hover:bg-green-50'; // Ví dụ: Nền trắng, hover xanh lá nhạt
    } else {
      // Mặc định cho unknown, skipped khi không selected, không lỗi/warning
      rowBgClass = 'bg-white hover:bg-gray-5'; // Changed from hover:bg-gray-5 to hover:bg-gray-5
    }
  }

  // Status Badge Logic
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

  // Link Icon Logic
  const linkAttemptedCount = steps?.link_processing_attempted_count ?? 0;
  const linkSuccessCount = steps?.link_processing_success_count ?? 0;

  const linkAttempted = linkAttemptedCount > 0;
  const linkAllSuccess = linkAttempted && (linkSuccessCount === linkAttemptedCount);
  const linkHasAttemptsButNotAllSuccess = linkAttempted && !linkAllSuccess;

  const showRequestIdColumn = confData.requestId !== 'N/A';

  // UPDATED colSpanBase: Select + Title + Status + Duration + 6 Steps Icons + Warns + Errors + Saved = 12
  const colSpanBase = 13; 
  const colSpan = showRequestIdColumn ? colSpanBase + 1 : colSpanBase;


  return (
    <React.Fragment>
      <tr className={`${rowBgClass} transition-colors duration-150`}>
        <td className='whitespace-nowrap px-3 py-2 text-center text-sm'>
          <input type='checkbox' className='h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
            checked={isSelected} onChange={() => onSelectToggle(uniqueRowId)} aria-label={`Select ${title}`} />
        </td>
        {/* REMOVED Expand TD HERE */}
        
        {/* MODIFIED Title TD to include expand functionality */}
        <td 
          className='px-3 py-2 text-sm font-medium text-gray-900 max-w-[20px] cursor-pointer group' 
          title={`${title} (Click to ${isExpanded ? 'collapse' : 'expand'})`}
          onClick={() => onToggleExpand(uniqueRowId)}
        >
          <div className="flex items-center">
            {isExpanded 
              ? <FaChevronUp className='mr-2 text-blue-600 group-hover:text-blue-800 flex-shrink-0' /> 
              : <FaChevronDown className='mr-2 text-blue-600 group-hover:text-blue-800 flex-shrink-0' />}
            <span className="truncate">
              {acronym}
               {/* <span className="text-gray-500">({title.length > 30 ? title.slice(0,30) + '...' : title})</span> */}
            </span>
          </div>
        </td>

        {/* CỘT REQUEST ID - Hiển thị có điều kiện */}
        {showRequestIdColumn && (
          <td className='px-3 py-2 text-sm text-gray-500 max-w-[150px] truncate' title={requestId}>
            {/* <Rocket size={16} className='mr-1.5 inline text-purple-400' /> */}
            {requestId}
          </td>
        )}

        <td className='whitespace-nowrap px-3 py-2 text-sm'>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${statusBadgeClass}`}>
            {status || 'N/A'}
          </span>
        </td>
        <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-500 text-center'>{formatDuration(durationSeconds)}</td>
        <td className='whitespace-nowrap px-2 py-2 text-center text-lg'><StatusIcon success={steps?.search_success} attempted={steps?.search_attempted} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-center text-lg'><StatusIcon success={steps?.html_save_success} attempted={steps?.html_save_attempted} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-center text-lg'><StatusIcon success={linkAttempted ? linkAllSuccess : null} attempted={linkAttempted} hasAttempts={linkHasAttemptsButNotAllSuccess} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-center text-lg'><StatusIcon success={steps?.gemini_determine_success} attempted={steps?.gemini_determine_attempted} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-center text-lg'><StatusIcon success={steps?.gemini_cfp_success} attempted={steps?.gemini_cfp_attempted} /></td>
        <td className='whitespace-nowrap px-2 py-2 text-center text-lg'><StatusIcon success={steps?.gemini_extract_success} attempted={steps?.gemini_extract_attempted} /></td>
        <td className={`whitespace-nowrap px-3 py-2 text-center text-sm font-medium ${hasValidationWarnings ? 'text-amber-600' : 'text-gray-500'}`}>
          {hasValidationWarnings && <FaExclamationCircle className='mb-0.5 mr-1 inline text-amber-500' title={`Warnings: ${validationWarningCount}`} />}
          {validationWarningCount}
        </td>
        <td className={`whitespace-nowrap px-3 py-2 text-center text-sm font-medium ${hasErrors ? 'text-red-600' : 'text-green-600'}`}>
          {hasErrors && <FaTimesCircle className='mb-0.5 mr-1 inline text-red-500' title={`Errors: ${errorCount}`} />}
          {errorCount}
        </td>
        <td className='whitespace-nowrap pl-8 py-2 text-center text-lg'>
          {saveStatus === 'success' && <FaCheckCircle className='text-green-500' title='Saved' />}
          {saveStatus === 'error' && <FaTimesCircle className='text-red-500' title={`Save failed: ${saveError || 'Unknown'}`} />}
        </td>
      </tr>
      {isExpanded && (
        <tr className='bg-slate-50 hover:bg-slate-100'>
          <td colSpan={colSpan} className='px-4 py-3 text-sm text-gray-700 md:px-6 md:py-4'> {/* Use calculated colSpan */}
            <div className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
              <div>
                <h4 className='mb-1.5 font-semibold text-gray-800'>Extracted Data Preview:</h4>
                <pre className='custom-scrollbar max-h-60 overflow-auto rounded border border-gray-200 bg-gray-100 p-2.5 text-xs shadow-inner'>
                  {finalResult ? JSON.stringify(finalResult, null, 2) : 'No preview available.'}
                </pre>
              </div>
              <div className="space-y-3">
                {hasErrors && errors && errors.length > 0 && (
                  <div>
                    <h4 className='mb-1 font-semibold text-red-700'>Errors ({errorCount}):</h4>
                    <ul className='custom-scrollbar max-h-32 list-inside list-disc space-y-1 overflow-y-auto rounded border border-red-200 bg-red-50 p-2 text-xs text-red-600 shadow-inner'>
                      {errors.map((err, index) => (<li key={index} className='break-words'>{typeof err === 'object' ? JSON.stringify(err) : String(err)}</li>))}
                    </ul>
                  </div>
                )}
                {/* --- HIỂN THỊ VALIDATION WARNINGS (Nếu có) --- */}
                {hasValidationWarnings &&
                  validationWarnings &&
                  validationWarnings.length > 0 && (
                    <div className='mb-4'>
                      <h4 className='mb-1 font-semibold text-amber-700'>
                        Validation Warnings ({validationWarningCount}):
                      </h4>
                      <ul className='custom-scrollbar max-h-40 list-inside list-disc space-y-1 overflow-y-auto rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700'>
                        {validationWarnings.map((warn, index) => (
                          <li key={index} className='break-words'>
                            <span className='font-medium'>{warn.field}:</span>{' '}
                            {String(warn.value)}{' '}
                            <span className='text-gray-500'>
                              ({warn.action})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                {/* Link Access Failures */}

                {steps.link_processing_failed_details && // Kiểm tra sự tồn tại của mảng
                  steps.link_processing_failed_details.length > 0 && (
                    <div className='mb-4'>
                      <h4 className='mb-1 font-semibold text-yellow-700'>
                        Link Access Failures ({steps.link_processing_failed_details.length}):
                      </h4>
                      <ul className='custom-scrollbar max-h-40 list-inside list-disc space-y-1 overflow-y-auto rounded border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-600'>
                        {steps.link_processing_failed_details.map( // Đổi tên biến
                          (failDetail, index: number) => ( // Đổi tên biến
                            <li key={index} className='break-words'>
                              {/* Render failDetail.url, failDetail.error, failDetail.timestamp */}
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
                    {/* Step details list with improved formatting */}
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