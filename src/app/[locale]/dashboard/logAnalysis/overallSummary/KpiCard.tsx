// src/app/[locale]/dashboard/logAnalysis/overallSummary/KpiCard.tsx

import React from 'react';

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  valueDenominator?: string | number; // For cases like X / Y
  subText?: string;
  subTextColor?: string; // e.g., 'text-red-500'
  valueColor?: string; // e.g., 'text-amber-600'
}

const KpiCard: React.FC<KpiCardProps> = ({
  icon,
  label,
  value,
  valueDenominator,
  subText,
  subTextColor = 'text-xs text-gray-500 mt-0.5',
  valueColor = 'text-gray-800'
}) => {
  return (
    <div className='flex items-center space-x-3 rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow'>
      {icon}
      <div>
        <p className='mb-1 text-sm text-gray-500'>{label}</p>
        <p className={`text-xl font-semibold ${valueColor}`}>
          {value}
          {valueDenominator !== undefined && ` / ${valueDenominator}`}
        </p>
        {subText && <p className={subTextColor}>{subText}</p>}
      </div>
    </div>
  );
};

export default KpiCard;