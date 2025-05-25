// src/app/[locale]/dashboard/logAnalysis/ConferenceTableRow.tsx
import React from 'react';
import { ConferenceTableData, RowSaveStatus } from '@/src/hooks/crawl/useConferenceTableManager';
import { ExpandedRowContent } from './ExpandedRowContent';
import { MainRowCells } from './MainRowCells';

interface ConferenceTableRowProps {
  confData: ConferenceTableData;
  isSelected: boolean;
  isExpanded: boolean;
  onSelectToggle: (uniqueRowId: string) => void;
  onToggleExpand: (uniqueRowId: string) => void;
  saveStatus: RowSaveStatus;
  saveError?: string;
}

export const ConferenceTableRow: React.FC<ConferenceTableRowProps> = ({
  confData, isSelected, isExpanded, onSelectToggle, onToggleExpand, saveStatus, saveError
}) => {
  const {
    uniqueRowId, status, errors, dataQualityInsights, hasSignificantDataQualityIssues, finalResult, steps
  } = confData;

  // Tính toán unrecoveredErrorCount chỉ cho các lỗi CHƯA được phục hồi
  const unrecoveredErrorCount = errors?.filter(err => !err.isRecovered).length || 0;
  const hasUnrecoveredErrors = unrecoveredErrorCount > 0;

  let rowBgClass = 'hover:bg-gray-5';
  let statusPulseClass = '';

  // Điều chỉnh class nền của hàng dựa trên hasUnrecoveredErrors
  if (hasUnrecoveredErrors) {
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

  return (
    <React.Fragment>
      <tr className={`${rowBgClass} transition-colors duration-150`}>
        <MainRowCells
          confData={confData}
          isSelected={isSelected}
          isExpanded={isExpanded}
          onSelectToggle={onSelectToggle}
          onToggleExpand={onToggleExpand}
          saveStatus={saveStatus}
          saveError={saveError}
          unrecoveredErrorCount={unrecoveredErrorCount}
          hasSignificantDataQualityIssues={hasSignificantDataQualityIssues}
          hasUnrecoveredErrors={hasUnrecoveredErrors}
          statusPulseClass={statusPulseClass}
        />
      </tr>

      {isExpanded && (
        <tr className='bg-slate-50 hover:bg-slate-100'>
          <ExpandedRowContent
            confData={confData}
            unrecoveredErrorCount={unrecoveredErrorCount}
          />
        </tr>
      )}
    </React.Fragment>
  );
};