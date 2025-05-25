// src/app/[locale]/dashboard/logAnalysis/ExpandedRowContent.tsx

import React from 'react';
import { ConferenceTableData } from '@/src/hooks/crawl/useConferenceTableManager';
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
  const hasErrorsOrLinkFailures = unrecoveredErrorCount > 0 || (steps.link_processing_failed_details && steps.link_processing_failed_details.length > 0);
  const hasDataQualityOrStepDetails = (dataQualityInsights && dataQualityInsights.length > 0) || (steps && Object.keys(steps).length > 0);

  const customGridTemplateColumns = getExpandedGridColumnsClass({
    hasPreviewData,
    hasErrorsOrLinkFailures,
    hasDataQualityOrStepDetails,
  });

  return (
    <td colSpan={15} className='px-4 py-3 text-sm text-gray-700 md:px-6 md:py-4'>
      <div className={`grid grid-cols-1 gap-x-6 gap-y-4 ${customGridTemplateColumns}`}>
        {hasPreviewData && <ExtractedDataPreviewSection confData={confData} />}
        {(errors && errors.length > 0) || (steps.link_processing_failed_details && steps.link_processing_failed_details.length > 0) ? (
          <ErrorAndLinkFailuresSection confData={confData} unrecoveredErrorCount={unrecoveredErrorCount} />
        ) : null}
        {hasDataQualityOrStepDetails && (
          <div className="space-y-4 min-w-0">
            <DataQualityInsightsSection confData={confData} />
            <StepDetailsSection confData={confData} />
          </div>
        )}
      </div>
    </td>
  );
};