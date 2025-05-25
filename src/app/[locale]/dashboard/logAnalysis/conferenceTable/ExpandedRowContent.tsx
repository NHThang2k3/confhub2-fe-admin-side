// src/app/[locale]/dashboard/logAnalysis/ExpandedRowContent.tsx
import React from 'react';
import { ConferenceTableData } from '@/src/hooks/crawl/useConferenceTableManager';
import { ExtractedDataPreviewSection } from './ExtractedDataPreviewSection';
import { ErrorAndLinkFailuresSection } from './ErrorAndLinkFailuresSection';
import { DataQualityInsightsSection } from './DataQualityInsightsSection';
import { StepDetailsSection } from './StepDetailsSection';
import { getExpandedGridColumnsClass } from './conferenceTableRowUtils'; // Không thay đổi file này

interface ExpandedRowContentProps {
  confData: ConferenceTableData;
  unrecoveredErrorCount: number;
}

export const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({ confData, unrecoveredErrorCount }) => {
  const { finalResult, errors, steps, dataQualityInsights } = confData;

  const hasPreviewData = finalResult && Object.keys(finalResult).length > 0;
  const hasErrorsOrLinkFailures = unrecoveredErrorCount > 0 || (steps.link_processing_failed_details && steps.link_processing_failed_details.length > 0);
  const hasDataQuality = dataQualityInsights && dataQualityInsights.length > 0;
  const hasStepDetails = steps && Object.keys(steps).length > 0; // Kích hoạt nếu có bất kỳ chi tiết bước nào

  // hasDataQualityOrStepDetails bây giờ chỉ là một cờ tổng quát cho cột thứ 3
  // Nó sẽ là true nếu có Data Quality HOẶC Step Details
  const hasDataQualityOrStepDetailsColumn = hasDataQuality || hasStepDetails;


  const customGridTemplateColumns = getExpandedGridColumnsClass({
    hasPreviewData,
    hasErrorsOrLinkFailures,
    hasDataQualityOrStepDetails: hasDataQualityOrStepDetailsColumn, // Truyền cờ này vào
  });

  return (
    <td colSpan={15} className='px-4 py-3 text-sm text-gray-700 md:px-6 md:py-4'>
      <div className={`grid grid-cols-1 gap-x-6 gap-y-4 ${customGridTemplateColumns}`}>
        {/* Cột 1: Extracted Data Preview */}
        {hasPreviewData && <ExtractedDataPreviewSection confData={confData} />}

        {/* Cột 2: Errors and Link Failures */}
        {hasErrorsOrLinkFailures && (
          <ErrorAndLinkFailuresSection confData={confData} unrecoveredErrorCount={unrecoveredErrorCount} />
        )}

        {/* Cột 3: Data Quality Insights AND Step Details */}
        {/* Cột này sẽ hiển thị nếu ít nhất một trong hai phần có dữ liệu */}
        {hasDataQualityOrStepDetailsColumn && (
          <div className="space-y-4 min-w-0">
            {hasDataQuality && <DataQualityInsightsSection confData={confData} />}
            {hasStepDetails && <StepDetailsSection confData={confData} />}
          </div>
        )}
      </div>
    </td>
  );
};