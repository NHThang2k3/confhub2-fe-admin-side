// src/app/[locale]/dashboard/logAnalysis/overallSummary/SummaryHeader.tsx
import React from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useTranslations } from 'next-intl'; // Import useTranslations

interface SummaryHeaderProps {
  title: string; // Title prop itself could be localized by parent or is a dynamic value
  isExpanded: boolean;
  onToggle: () => void;
}

const SummaryHeader: React.FC<SummaryHeaderProps> = ({ title, isExpanded, onToggle }) => {
  // Khởi tạo t với namespace 'SummaryHeader'
  const t = useTranslations('SummaryHeader');

  return (
    <div
      className='flex items-center justify-between border-b border-gray-300 p-4 cursor-pointer hover:bg-gray-5'
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
      aria-expanded={isExpanded}
      aria-controls='overall-summary-content-area' // Link to the content area
    >
      <h2 className='text-xl font-semibold text-gray-700'>{title}</h2> {/* `title` được truyền từ component cha, giả định đã được quốc tế hóa */}
      <button
        className='rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300'
        title={isExpanded ? t('collapseSummaryTitle') : t('expandSummaryTitle')} 
        aria-label={isExpanded ? t('collapseSummaryAriaLabel') : t('expandSummaryAriaLabel')} 
        onClick={(e) => { e.stopPropagation(); onToggle(); }} // Prevent div click from also firing
      >
        {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
        <span className='sr-only'>{isExpanded ? t('srOnly.collapse') : t('srOnly.expand')}</span> 
      </button>
    </div>
  );
};

export default SummaryHeader;