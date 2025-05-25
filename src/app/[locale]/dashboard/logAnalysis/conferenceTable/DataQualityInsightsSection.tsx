// src/app/[locale]/dashboard/logAnalysis/DataQualityInsightsSection.tsx
import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { ConferenceTableData } from '@/src/hooks/crawl/useConferenceTableManager';
import { getInsightIcon, getSeverityClass } from './conferenceTableRowUtils';

interface DataQualityInsightsSectionProps {
  confData: ConferenceTableData;
}

export const DataQualityInsightsSection: React.FC<DataQualityInsightsSectionProps> = ({ confData }) => {
  const { dataQualityInsights, dataQualityInsightCount } = confData;

  if (!dataQualityInsights || dataQualityInsights.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className='mb-2 font-semibold text-slate-700'>
        Data Quality Insights ({dataQualityInsightCount}):
      </h4>
      <ul className='custom-scrollbar max-h-[300px] list-none space-y-2 overflow-y-auto overflow-x-hidden rounded border border-slate-200 bg-white p-2.5 text-xs shadow-inner'>
        {dataQualityInsights.map((insight, index) => (
          <li key={`insight-${index}`} className={`p-2 border rounded-md ${getSeverityClass(insight.severity)}`}>
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
  );
};