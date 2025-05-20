// src/components/ConferenceDetails.tsx
import React, { useState } from 'react'; // Import useState
import {
  FaChevronUp, // Import icons
  FaChevronDown
} from 'react-icons/fa';
// Import LogAnalysisResult để truyền vào hook
import {
  LogAnalysisResult,
  ConferenceAnalysisDetail
} from '@/src/models/logAnalysis/logAnalysis'; // Adjust path
import { useConferenceTableManager } from '@/src/hooks/crawl/useConferenceTableManager'; // Adjust path
import { ConferenceTableControls } from './conferenceTable/ConferenceTableControls'; // Adjust path
import { ConferenceTable } from './conferenceTable/ConferenceTable'; // Adjust path

interface ConferenceDetailsProps {
  // Nhận toàn bộ logAnalysisResult
  logAnalysisResult: LogAnalysisResult | null | undefined;
}

const ConferenceDetails: React.FC<ConferenceDetailsProps> = ({
  logAnalysisResult
}) => {
  // Thêm state để quản lý trạng thái mở rộng, mặc định là true (mở)
  const [isExpanded, setIsExpanded] = useState(true);

  // Toggle function
  const handleToggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  // Truyền logAnalysisResult vào hook
  const tableManager = useConferenceTableManager({ logAnalysisResult });

  // Kiểm tra dựa trên sortedData từ tableManager (đã được xử lý)
  // Vẫn hiển thị header ngay cả khi không có data, để nút toggle hoạt động
  const hasData =
    tableManager.sortedData && tableManager.sortedData.length > 0;

  const rowSaveErrorsCount = Object.keys(tableManager.rowSaveErrors).length;

  return (
    <section className='bg-white shadow-xl rounded-lg p-4 md:p-6 border border-gray-200 mt-6 hover:bg-gray-5'>
      {/* Header Section - Làm cho nó có thể click được */}
      <div
        className='flex flex-wrap items-center justify-between mb-4 pb-2 border-b border-gray-300 gap-4 cursor-pointer' // Thêm cursor-pointer và hover effect
        onClick={handleToggleExpand} // Thêm onClick handler
      >
        <h2 className='text-xl font-semibold text-gray-800 whitespace-nowrap'>
          Detailed Conference Analysis
          {/* {logAnalysisResult?.filterRequestId && (
            <span className='text-sm text-blue-600 ml-2'>
              (Request ID: {logAnalysisResult.filterRequestId})
            </span>
          )} */}
        </h2>
        {/* Nút Toggle */}
        <button
          className='rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none'
          aria-expanded={isExpanded}
          aria-controls='conference-details-content' // Thêm ID cho nội dung
          title={isExpanded ? 'Collapse Details' : 'Expand Details'}
          onClick={e => {
            e.stopPropagation(); // Ngăn chặn sự kiện lan truyền lên div cha
            handleToggleExpand();
          }}
        >
          {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
          <span className='sr-only'>{isExpanded ? 'Collapse' : 'Expand'}</span>
        </button>
      </div>

      {/* Conditional rendering based on isExpanded */}
      {isExpanded && (
        <div id='conference-details-content'>
          {/* Nội dung chính của phần details */}
          {!hasData ? (
            <p className='text-center text-gray-500 py-8'>
              No conference analysis data available for the current filter.
            </p>
          ) : (
            <>
              <ConferenceTableControls
                selectedCount={tableManager.selectedRowIds.length} // Sử dụng selectedRowIds
                isSaveEnabled={tableManager.isSaveEnabled}
                mainSaveStatus={tableManager.mainSaveStatus}
                rowSaveErrorsCount={rowSaveErrorsCount}
                onSave={tableManager.handleBulkSave}
                onCrawl={tableManager.handleCrawlAgain}
                onSelectAll={tableManager.handleSelectAll}
                onSelectNoError={tableManager.handleSelectNoError}
                onSelectError={tableManager.handleSelectError}
                onSelectNoWarning={tableManager.handleSelectNoWarning}
                onSelectWarning={tableManager.handleSelectWarning}
                onDeselectAll={tableManager.handleDeselectAll}
              />

              <ConferenceTable
                data={tableManager.sortedData}
                selectedRows={tableManager.selectedRows} // Sử dụng selectedRows
                expandedRowUniqueId={tableManager.expandedRow} // Sử dụng expandedRow
                sortColumn={tableManager.sortColumn}
                sortDirection={tableManager.sortDirection}
                rowSaveStatus={tableManager.rowSaveStatus}
                rowSaveErrors={tableManager.rowSaveErrors}
                onSort={tableManager.handleSort}
                onToggleExpand={tableManager.toggleExpand} // Hàm này giờ nhận uniqueRowId
                onSelectToggle={tableManager.handleRowSelectToggle} // Hàm này giờ nhận uniqueRowId
                // Truyền thông tin filterRequestId (không cần thiết ở đây nữa vì tableManager đã xử lý)
                // filterRequestId={logAnalysisResult?.filterRequestId} // Có thể bỏ dòng này
              />
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default ConferenceDetails;