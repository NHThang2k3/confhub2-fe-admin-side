// src/app/[locale]/dashboard/logAnalysis/ExpandedRowContent.tsx

import React from 'react';
import { ConferenceTableData } from '@/src/hooks/crawl/conference/useConferenceTableManager';
import { ExtractedDataPreviewSection } from './ExtractedDataPreviewSection';
import { ErrorAndLinkFailuresSection } from './ErrorAndLinkFailuresSection';
import { DataQualityInsightsSection } from './DataQualityInsightsSection';
import { StepDetailsSection } from './StepDetailsSection';
import { getExpandedGridColumnsClass } from './conferenceTableRowUtils';

interface ExpandedRowContentProps {
  confData: ConferenceTableData;
  unrecoveredErrorCount: number;
}

export const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({ confData, unrecoveredErrorCount }) => {
  const { finalResult, errors, steps, dataQualityInsights } = confData;

  const hasPreviewData = finalResult && Object.keys(finalResult).length > 0;
  
  const hasErrorContent = (errors && errors.length > 0) || 
                          (steps.link_processing_failed_details && steps.link_processing_failed_details.length > 0);
  
  const hasDataQualityInsights = dataQualityInsights && dataQualityInsights.length > 0;

  // Kiểm tra xem có step details nào "có ý nghĩa" để hiển thị không,
  // ngoài link_processing_failed_details.
  const hasActualSteps = (() => {
    if (!steps) return false;

    // Ép kiểu Object.keys(steps) để TypeScript hiểu key là một key hợp lệ của steps
    const stepKeys = Object.keys(steps) as Array<keyof typeof steps>;

    for (const key of stepKeys) {
      // Bỏ qua link_processing_failed_details vì nó được xử lý bởi ErrorAndLinkFailuresSection
      if (key === 'link_processing_failed_details') {
        continue;
      }

      const stepValue = steps[key]; // Truy cập an toàn nhờ ép kiểu ở trên

      // Xác định xem stepValue có "nội dung" không
      if (stepValue !== null && stepValue !== undefined) {
        if (typeof stepValue === 'boolean') {
          // Chỉ coi 'true' là có nội dung cho step dạng boolean,
          // hoặc nếu StepDetailsSection của bạn hiển thị cả 'false'.
          // Giả sử 'true' là có nội dung.
          if (stepValue === true) return true;
        } else if (Array.isArray(stepValue)) {
          if (stepValue.length > 0) return true; // Mảng không rỗng
        } else if (typeof stepValue === 'object') {
          // Đảm bảo nó không phải là null (đã kiểm tra) và là một object thực sự
          if (Object.keys(stepValue).length > 0) return true; // Object không rỗng
        } else {
          // Cho các kiểu nguyên thủy khác (string, number)
          // Nếu stepValue có giá trị (ví dụ: chuỗi không rỗng, số khác 0 tùy theo logic)
          // Hiện tại, chỉ cần nó tồn tại và không phải là các trường hợp trên đã bị continue/return false
          return true; 
        }
      }
    }
    return false; // Không tìm thấy step nào có nội dung (ngoài link_processing_failed_details)
  })();

  const showPreviewSection = hasPreviewData;
  const showErrorSection = hasErrorContent;

  // Trường hợp đặc biệt: Preview, Errors, Steps đều có, NHƯNG Data Quality KHÔNG có.
  // Steps sẽ là một cột riêng.
  const showStepsAsSeparateColumn = 
    showPreviewSection && 
    showErrorSection && 
    hasActualSteps && // Quan trọng: phải có actual steps để hiển thị
    !hasDataQualityInsights;

  // Trường hợp thông thường: Data Quality và/hoặc Steps được nhóm chung.
  const showDataQualityAndOrStepsCombined = 
    !showStepsAsSeparateColumn && 
    (hasDataQualityInsights || hasActualSteps);

  const customGridTemplateColumns = getExpandedGridColumnsClass({
    showPreview: showPreviewSection,
    showErrors: showErrorSection,
    showDataQualityAndOrStepsCombined,
    showStepsAsSeparateColumn,
  });

  // Không hiển thị gì nếu không có section nào active
  if (!showPreviewSection && !showErrorSection && !showDataQualityAndOrStepsCombined && !showStepsAsSeparateColumn) {
    return (
        <td colSpan={15} className='px-4 py-3 text-sm text-gray-700 md:px-6 md:py-4'>
            <div className="italic text-gray-500">No details to display.</div>
        </td>
    );
  }

  return (
    <td colSpan={15} className='px-4 py-3 text-sm text-gray-700 md:px-6 md:py-4'>
      <div className={`grid grid-cols-1 gap-x-6 gap-y-4 ${customGridTemplateColumns}`}>
        {showPreviewSection && <ExtractedDataPreviewSection confData={confData} />}
        
        {showErrorSection && (
          <ErrorAndLinkFailuresSection confData={confData} unrecoveredErrorCount={unrecoveredErrorCount} />
        )}

        {/* Render Data Quality và/hoặc Steps (kết hợp) */}
        {showDataQualityAndOrStepsCombined && (
          <div className="space-y-4 min-w-0">
            {hasDataQualityInsights && <DataQualityInsightsSection confData={confData} />}
            {hasActualSteps && <StepDetailsSection confData={confData} />}
          </div>
        )}

        {/* Render Steps như một cột riêng (trường hợp đặc biệt) */}
        {/* hasActualSteps đã được bao gồm trong điều kiện của showStepsAsSeparateColumn */}
        {showStepsAsSeparateColumn && (
          <div className="space-y-4 min-w-0">
            <StepDetailsSection confData={confData} />
          </div>
        )}
      </div>
    </td>
  );
};