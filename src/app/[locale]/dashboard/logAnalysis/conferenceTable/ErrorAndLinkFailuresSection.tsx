// src/app/[locale]/dashboard/logAnalysis/ErrorAndLinkFailuresSection.tsx
import React from 'react';
import { FaTimesCircle, FaLink, FaExclamationTriangle, FaExternalLinkAlt } from 'react-icons/fa';
import { ConferenceTableData } from '@/src/hooks/crawl/conference/useConferenceTableManager';
import { ErrorItem } from './ErrorItem';
import { parseLinkError } from './conferenceTableRowUtils';

interface ErrorAndLinkFailuresSectionProps {
  confData: ConferenceTableData;
  unrecoveredErrorCount: number;
}

export const ErrorAndLinkFailuresSection: React.FC<ErrorAndLinkFailuresSectionProps> = ({ confData, unrecoveredErrorCount }) => {
  const { errors, steps } = confData;
  const hasErrors = errors && errors.length > 0;
  const hasLinkFailures = steps.link_processing_failed_details && steps.link_processing_failed_details.length > 0;

  if (!hasErrors && !hasLinkFailures) {
    return null;
  }

  return (
    <div className="space-y-4 min-w-0">
      {hasErrors && (
        <div>
          <h4 className='mb-2 font-semibold text-red-700'>
            <FaTimesCircle className="mr-1.5 inline-block text-red-600" /> All Errors ({errors.length})
            {unrecoveredErrorCount > 0 && <span className="ml-1 text-red-500">({unrecoveredErrorCount} unrecovered)</span>}
          </h4>
          <ul className='custom-scrollbar max-h-[550px] overflow-y-auto overflow-x-hidden rounded border border-red-200 bg-red-50 p-2 text-xs text-red-600 shadow-inner'>
            {errors.map((err, index) => (
              <ErrorItem key={`err-${index}`} error={err} />
            ))}
          </ul>
        </div>
      )}

      {hasLinkFailures && (
        <div>
          <h4 className='mb-2 font-semibold text-red-700'>
            <FaTimesCircle className="mr-1.5 inline-block text-red-600" /> Link Access Failures ({steps.link_processing_failed_details.length}):
          </h4>
          <ul className='custom-scrollbar max-h-[250px] overflow-y-auto overflow-x-hidden rounded border border-red-200 bg-red-50 p-2 text-xs text-red-600'>
            {steps.link_processing_failed_details.map(
              (failDetail, index: number) => {
                const parsedError = parseLinkError(failDetail.error || '');
                const errorMessage = parsedError ? `Service: ${parsedError.service || 'N/A'}` : (failDetail.error || 'Unknown Error');

                return (
                  <li key={index} className='mb-2 p-2 border border-red-300 rounded bg-red-100'>
                    <div className="flex items-center mb-1">
                      <FaLink className="mr-1.5 text-red-700 flex-shrink-0" />
                      <span className='font-medium text-red-800'>URL:</span>
                      {failDetail.url ? (
                        <a
                          href={failDetail.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-700 hover:underline break-all flex-grow"
                          title="Click to open link"
                        >
                          {failDetail.url} <FaExternalLinkAlt className="inline-block ml-1 text-blue-500 text-[0.6em]" />
                        </a>
                      ) : (
                        <span className="ml-1 text-red-600 break-all flex-grow">N/A</span>
                      )}
                    </div>
                    <div className="flex items-start">
                      <FaExclamationTriangle className="mr-1.5 text-red-700 flex-shrink-0 mt-0.5" />
                      <span className='font-medium text-red-800'>Error:</span>
                      <span className="ml-1 text-red-600 break-words flex-grow">
                        {errorMessage}
                      </span>
                    </div>
                  </li>
                );
              }
            )}
          </ul>
        </div>
      )}
    </div>
  );
};