// src/app/[locale]/dashboard/logAnalysis/overallSummary/NoDataMessage.tsx
import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { useTranslations } from 'next-intl'; // Import useTranslations

interface NoDataMessageProps {
  filterRequestId?: string | null;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({ filterRequestId }) => {
  // Khởi tạo t với namespace 'NoDataMessage'
  const t = useTranslations('NoDataMessage');

  return (
    <div className="p-4 text-center text-gray-500 flex flex-col items-center">
      <FaInfoCircle size={24} className="mb-2 text-blue-500" />
      {/* Sử dụng t() và truyền placeholder nếu có filterRequestId */}
      {filterRequestId ?
        t('messageWithRequestId', { requestId: filterRequestId }) :
        t('messageWithoutRequestId')
      }
    </div>
  );
};

export default NoDataMessage;