// src/app/[locale]/dashboard/logAnalysis/MainRowCells.tsx

import React from 'react';
import { FaChevronDown, FaChevronUp, FaLink, FaCogs, FaInfoCircle, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { ConferenceTableData, RowSaveStatus } from '@/src/hooks/crawl/conference/useConferenceTableManager';
import { StatusIcon } from '../StatusIcon';
import { formatDuration } from '../utils/commonUtils';
interface MainRowCellsProps {
  confData: ConferenceTableData;
  isSelected: boolean;
  isExpanded: boolean;
  onSelectToggle: (uniqueRowId: string) => void;
  onToggleExpand: (uniqueRowId: string) => void;
  saveStatus: RowSaveStatus;
  saveError?: string;
  unrecoveredErrorCount: number;
  hasSignificantDataQualityIssues: boolean;
  hasUnrecoveredErrors: boolean;
  statusPulseClass: string;
}

export const MainRowCells: React.FC<MainRowCellsProps> = ({
  confData, isSelected, isExpanded, onSelectToggle, onToggleExpand, saveStatus, saveError,
  unrecoveredErrorCount, hasSignificantDataQualityIssues, hasUnrecoveredErrors, statusPulseClass
}) => {
  const {
    uniqueRowId, title, acronym, status, durationSeconds, steps,
    dataQualityInsightCount, crawlType, persistedSaveStatus, persistedSaveTimestamp
  } = confData;

    // <<<< LOGIC ĐÃ SỬA LẠI THEO YÊU CẦU >>>>

  const linkAttemptedCount = steps?.link_processing_attempted_count ?? 0;
  const linkSuccessCount = steps?.link_processing_success_count ?? 0;
  
  // Lấy số link thực sự được đưa vào xử lý sau khi áp dụng giới hạn.
  // Đây là con số quyết định thành công/thất bại của bước này.
  const linksToProcessCount = steps?.search_limited_count ?? 0;

  let linkIconSuccess: boolean | null = null;
  let linkIconAttempted: boolean = false;
  let linkIconHasAttempts: boolean = false;

  // Chỉ đánh giá trạng thái khi có link được giao để xử lý.
  if (linksToProcessCount > 0) {
    // Bước này được coi là "đã thử" ngay khi có ít nhất 1 link được thử.
    if (linkAttemptedCount > 0) {
      linkIconAttempted = true;
    }

    // 1. THÀNH CÔNG (XANH): Đã xử lý thành công TẤT CẢ các link được giao.
    if (linkSuccessCount === linksToProcessCount) {
      linkIconSuccess = true;
    }
    // 2. THẤT BẠI (ĐỎ): Không có thành công nào VÀ đã thử hết số link được giao VÀ tác vụ đã kết thúc.
    else if (linkSuccessCount === 0 && linkAttemptedCount >= linksToProcessCount && status !== 'processing') {
      linkIconSuccess = false;
    }
    // 3. TRUNG GIAN (VÀNG): Tất cả các trường hợp còn lại.
    //    - Có thành công nhưng chưa đủ.
    //    - Chưa có thành công nào nhưng vẫn đang xử lý.
    else {
      linkIconSuccess = null; // Vàng
      // Đặt cờ này để đảm bảo icon hiển thị màu vàng thay vì xám nếu đã có attempt.
      if (linkAttemptedCount > 0) {
        linkIconHasAttempts = true;
      }
    }
  }
  // Nếu linksToProcessCount === 0, tất cả các biến cờ sẽ giữ giá trị mặc định (false/null),
  // dẫn đến icon Xám (chưa thử), đây là hành vi đúng.


  const crawlTypeDisplay = crawlType && typeof crawlType === 'string' && crawlType.length > 0
    ? crawlType.charAt(0).toUpperCase() + crawlType.slice(1)
    : 'N/A';

  const crawlTypeColor = crawlType === 'update' ? 'text-sky-700 bg-sky-100' : 'text-teal-700 bg-teal-100';

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

  return (
    <>
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

      <td className='whitespace-nowrap px-3 py-2 text-sm'>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${crawlTypeColor}`}>
          {crawlType === 'update' ? <FaLink className="mr-1.5" /> : <FaCogs className="mr-1.5" />}
          {crawlTypeDisplay}
        </span>
      </td>

      <td className='whitespace-nowrap px-3 py-2 text-sm'>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${statusBadgeClass}`}>
          {status || 'N/A'}
        </span>
      </td>
      <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-500 text-center'>{formatDuration(durationSeconds)}</td>
      <td className='whitespace-nowrap px-2 py-2 text-right text-lg'><StatusIcon success={steps?.search_success} attempted={steps?.search_attempted} /></td>
      <td className='whitespace-nowrap px-2 py-2 text-right text-lg'><StatusIcon success={steps?.html_save_success} attempted={steps?.html_save_attempted} /></td>

      <td className='whitespace-nowrap px-2 py-2 text-right text-lg'>
        <StatusIcon
          success={linkIconSuccess}
          attempted={linkIconAttempted}
          hasAttempts={linkIconHasAttempts}
        />
      </td>
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

      <td className={`whitespace-nowrap px-3 py-2 text-center text-sm font-medium ${hasUnrecoveredErrors ? 'text-red-600' : 'text-green-600'}`}>
        {hasUnrecoveredErrors && <FaTimesCircle className='mb-0.5 mr-1 inline text-red-500' title={`Unrecovered Errors: ${unrecoveredErrorCount}`} />}
        {unrecoveredErrorCount}
      </td>
      <td className='whitespace-nowrap pl-3 pr-3 py-2 text-center text-lg'>
        {saveStatus === 'success' && <FaCheckCircle className='text-green-500' title='Saved in this session' />}
        {saveStatus === 'error' && <FaTimesCircle className='text-red-500' title={`Save failed: ${saveError || 'Unknown'}`} />}

        {saveStatus === 'idle' && persistedSaveStatus === 'SAVED_TO_DATABASE' && (
          <FaCheckCircle className='text-gray-400' title={`Persistently saved on ${persistedSaveTimestamp ? new Date(persistedSaveTimestamp).toLocaleString() : 'N/A'}`} />
        )}
      </td>
    </>
  );
};