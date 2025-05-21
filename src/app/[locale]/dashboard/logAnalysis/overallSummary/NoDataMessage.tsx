// src/app/[locale]/dashboard/logAnalysis/overallSummary/NoDataMessage.tsx
import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

interface NoDataMessageProps {
  filterRequestId?: string | null;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({ filterRequestId }) => {
  return (
    <div className="p-4 text-center text-gray-500 flex flex-col items-center">
      <FaInfoCircle size={24} className="mb-2 text-blue-500" />
      No summary data available for the current filter.
      {filterRequestId && ` (Request ID: ${filterRequestId})`}
    </div>
  );
};

export default NoDataMessage;