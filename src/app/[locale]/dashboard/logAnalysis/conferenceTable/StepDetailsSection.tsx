import React from 'react';
import { ConferenceTableData } from '@/src/hooks/crawl/conference/useConferenceTableManager';

interface StepDetailsSectionProps {
  confData: ConferenceTableData;
}

// --- HELPER COMPONENT MỚI ---
// Component nhỏ để hiển thị thời gian, giúp code gọn gàng hơn
const TimeDisplay: React.FC<{ durationMs?: number }> = ({ durationMs }) => {
  if (typeof durationMs !== 'number' || durationMs <= 0) {
    return null;
  }
  // Chuyển ms sang giây và làm tròn đến 1 chữ số thập phân
  const seconds = (durationMs / 1000).toFixed(1);
  return (
    <span className="ml-2 text-blue-600 font-mono text-[11px]">
      ({seconds}s)
    </span>
  );
};
// -----------------------------

export const StepDetailsSection: React.FC<StepDetailsSectionProps> = ({ confData }) => {
  // Lấy cả steps và timings từ confData
  const { steps, timings } = confData;

  if (!steps || Object.keys(steps).length === 0) {
    return null;
  }

  // --- ĐIỀU CHỈNH CÁC DÒNG LI ĐỂ HIỂN THỊ THỜI GIAN ---
  return (
    <div>
      <h4 className='mb-2 font-semibold text-gray-800'>Step Details:</h4>
      <ul className='list-none space-y-1 text-xs'>
        {/* Search: Hiển thị thời gian của Google Search */}
        <li className='flex justify-between border-b border-gray-200 py-0.5'>
          <span className="text-gray-600">Search:</span>
          <span className="flex items-center">
            <strong>{steps?.search_attempts_count ?? 0}</strong> att / <strong>{steps?.search_results_count ?? 0}</strong> res / <strong>{steps?.search_filtered_count ?? 0}</strong> filt
            <TimeDisplay durationMs={timings?.googleSearchDurationMs} />
          </span>
        </li>
        
        {/* Crawl & Save: Hiển thị thời gian crawl ban đầu (save) hoặc crawl update */}
        <li className='flex justify-between border-b border-gray-200 py-0.5'>
          <span className="text-gray-600">Crawl & Save:</span>
          <span className="flex items-center">
            {steps?.html_save_attempted ? `Attempted (${steps?.html_save_success ? 'OK' : 'Fail'})` : 'Skipped'}
            <TimeDisplay durationMs={timings?.crawlInitialLinksDurationMs || timings?.crawlUpdateLinksDurationMs} />
          </span>
        </li>

        {/* Links Processed: Đây là một phần của Crawl & Save, không có thời gian riêng */}
        <li className='flex justify-between border-b border-gray-200 py-0.5'>
          <span className="text-gray-600">Links Processed:</span>
          <span><strong>{steps?.link_processing_success_count ?? 0}</strong> / {steps?.link_processing_attempted_count ?? 0}</span>
        </li>

        {/* Gemini Determine: Hiển thị thời gian API determine và crawl trang chính thức */}
        <li className='flex justify-between border-b border-gray-200 py-0.5'>
          <span className="text-gray-600">Gemini Determine:</span>
          <span className="flex items-center">
            {steps?.gemini_determine_attempted ? `Attempted (${steps?.gemini_determine_success ? 'OK' : 'Fail'})` : 'Skipped'} {steps?.gemini_determine_cache_used ? '(Cache)' : ''}
            <TimeDisplay durationMs={timings?.apiDetermineLinksDurationMs} />
            <TimeDisplay durationMs={timings?.crawlDeterminedLinksDurationMs} />
          </span>
        </li>

        {/* Gemini Final Extract: Hiển thị thời gian của API extract + cfp */}
        <li className='flex justify-between pt-0.5'>
          <span className="text-gray-600">Gemini Final Extract:</span>
          <span className="flex items-center">
            {steps?.gemini_extract_attempted ? `Attempted (${steps?.gemini_extract_success ? 'OK' : 'Fail'})` : 'Skipped'} {steps?.gemini_extract_cache_used ? '(Cache)' : ''}
            <TimeDisplay durationMs={timings?.apiFinalExtractionDurationMs} />
          </span>
        </li>

        {/* Bỏ đi dòng Gemini CFP riêng lẻ vì thời gian của nó đã được gộp vào Final Extract */}
      </ul>
    </div>
  );
};