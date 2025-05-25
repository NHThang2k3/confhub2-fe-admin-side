// src/app/[locale]/dashboard/logAnalysis/StepDetailsSection.tsx

import React from 'react';
import { ConferenceTableData } from '@/src/hooks/crawl/useConferenceTableManager';

interface StepDetailsSectionProps {
  confData: ConferenceTableData;
}

export const StepDetailsSection: React.FC<StepDetailsSectionProps> = ({ confData }) => {
  const { steps } = confData;

  if (!steps || Object.keys(steps).length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className='mb-2 font-semibold text-gray-800'>Step Details:</h4>
      <ul className='list-none space-y-1 text-xs'>
        <li className='flex justify-between border-b border-gray-200 py-0.5'>
          <span className="text-gray-600">Search:</span>
          <span><strong>{steps?.search_attempts_count ?? 0}</strong> att / <strong>{steps?.search_results_count ?? 0}</strong> res / <strong>{steps?.search_filtered_count ?? 0}</strong> filt</span>
        </li>
        <li className='flex justify-between border-b border-gray-200 py-0.5'>
          <span className="text-gray-600">HTML Save:</span>
          <span>{steps?.html_save_attempted ? `Attempted (${steps?.html_save_success ? 'OK' : 'Fail'})` : 'Skipped'}</span>
        </li>
        <li className='flex justify-between border-b border-gray-200 py-0.5'>
          <span className="text-gray-600">Links Processed:</span>
          <span><strong>{steps?.link_processing_success_count ?? 0}</strong> / {steps?.link_processing_attempted_count ?? 0}</span>
        </li>
        <li className='flex justify-between border-b border-gray-200 py-0.5'>
          <span className="text-gray-600">Gemini Determine:</span>
          <span>{steps?.gemini_determine_attempted ? `Attempted (${steps?.gemini_determine_success ? 'OK' : 'Fail'})` : 'Skipped'} {steps?.gemini_determine_cache_used ? '(Cache)' : ''}</span>
        </li>
        <li className='flex justify-between border-b border-gray-200 py-0.5'>
          <span className="text-gray-600">Gemini CFP:</span>
          <span>{steps.gemini_cfp_attempted ? `Attempted (${steps.gemini_cfp_success ? 'OK' : 'Fail'})` : 'Skipped'} {steps.gemini_cfp_cache_used ? '(Cache)' : ''}</span>
        </li>
        <li className='flex justify-between pt-0.5'>
          <span className="text-gray-600">Gemini Extract:</span>
          <span>{steps?.gemini_extract_attempted ? `Attempted (${steps?.gemini_extract_success ? 'OK' : 'Fail'})` : 'Skipped'} {steps?.gemini_extract_cache_used ? '(Cache)' : ''}</span>
        </li>
      </ul>
    </div>
  );
};