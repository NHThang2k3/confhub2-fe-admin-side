// src/app/[locale]/dashboard/logAnalysis/overallSummary/LogProcessingErrorsDisplay.tsx

import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useTranslations } from 'next-intl'; // Import useTranslations

interface LogProcessingErrorsDisplayProps {
  logProcessingErrors?: string[];
  parseErrors?: number;
  totalLogEntries?: number;
}

const LogProcessingErrorsDisplay: React.FC<LogProcessingErrorsDisplayProps> = ({
  logProcessingErrors,
  parseErrors,
  totalLogEntries,
}) => {
  // Khởi tạo t với namespace 'LogProcessingErrorsDisplay'
  const t = useTranslations('LogProcessingErrorsDisplay');

  if (!logProcessingErrors || logProcessingErrors.length === 0) {
    return null;
  }

  const displayedErrorsCount = logProcessingErrors.length;
  const remainingErrors = displayedErrorsCount > 20 ? displayedErrorsCount - 20 : 0;

  return (
    <div className='mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 shadow-sm'>
      <h3 className='text-md mb-2 flex items-center font-semibold text-yellow-800'>
        <FaExclamationTriangle className='mr-2' />
        {t('title', {
            parseErrors: parseErrors || 0,
            totalLogEntries: totalLogEntries || 0
        })} {/* Sử dụng t() với placeholders */}
      </h3>
      <ul className='max-h-40 list-inside list-disc space-y-1 overflow-y-auto pl-4 text-sm text-yellow-700'>
        {logProcessingErrors.slice(0, 20).map((err, index) => (
          <li key={index} className='break-words'>{err}</li>
        ))}
        {remainingErrors > 0 && (
          <li>{t('moreErrorsMessage', { count: remainingErrors })}</li> 
        )}
      </ul>
    </div>
  );
};

export default LogProcessingErrorsDisplay;