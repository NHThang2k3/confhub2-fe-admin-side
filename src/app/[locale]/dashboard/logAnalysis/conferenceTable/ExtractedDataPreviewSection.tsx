// src/app/[locale]/dashboard/logAnalysis/ExtractedDataPreviewSection.tsx

import React from 'react';
import { FaLink, FaExternalLinkAlt } from 'react-icons/fa';
import { ConferenceTableData } from '@/src/hooks/crawl/conference/useConferenceTableManager';

interface ExtractedDataPreviewSectionProps {
  confData: ConferenceTableData;
}

export const ExtractedDataPreviewSection: React.FC<ExtractedDataPreviewSectionProps> = ({ confData }) => {
  const { crawlType, link, cfpLink, impLink, finalResult } = confData;
  const hasLinks = link || cfpLink || impLink;

  if (!finalResult || Object.keys(finalResult).length === 0) {
    return null;
  }

  return (
    <div className="min-w-0">
      {crawlType === 'update' && hasLinks && (
        <div className="mb-4">
          <h4 className='mb-2 font-semibold text-sky-700'>Update Links:</h4>
          <ul className="list-none space-y-1 text-xs bg-sky-50 p-2.5 rounded border border-sky-200 shadow-inner">
            {link && (
              <li className="break-all">
                <strong className="text-sky-600">Main Link:</strong> <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link}</a>
              </li>
            )}
            {cfpLink && (
              <li className="break-all">
                <strong className="text-sky-600">CFP Link:</strong> <a href={cfpLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{cfpLink}</a>
              </li>
            )}
            {impLink && (
              <li className="break-all">
                <strong className="text-sky-600">Imp. Link:</strong> <a href={impLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{impLink}</a>
              </li>
            )}
          </ul>
        </div>
      )}
      <h4 className='mb-2 font-semibold text-gray-800'>Extracted Data Preview:</h4>
      <pre className='custom-scrollbar max-h-[500px] overflow-auto rounded border border-gray-200 bg-gray-100 p-2.5 text-xs shadow-inner'>
        {JSON.stringify(finalResult, null, 2)}
      </pre>
    </div>
  );
};