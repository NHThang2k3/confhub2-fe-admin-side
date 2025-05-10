// src/app/[locale]/chatbot/PanelToggleButton.tsx
import React from 'react';
import { X, AlignJustify } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PanelToggleButtonProps {
  isPanelOpen: boolean;
  onTogglePanel: () => void;
}

const PanelToggleButton: React.FC<PanelToggleButtonProps> = ({ isPanelOpen, onTogglePanel }) => {
  const t = useTranslations();
  const commonButtonInteractiveClasses =
    'rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const iconOnlyButtonBaseClasses = 'h-12 w-12 justify-center p-2';
  const expandedButtonBaseClasses = 'px-3 py-2.5 text-sm font-medium';

  return (
    <div
      className={`${isPanelOpen ? 'mb-3 flex items-center justify-between' : 'flex justify-center'}`}
    >
      <button
        onClick={onTogglePanel}
        className={`flex items-center
          ${isPanelOpen ? `${expandedButtonBaseClasses} ${commonButtonInteractiveClasses}` : `${iconOnlyButtonBaseClasses} ${commonButtonInteractiveClasses}`}
          ${isPanelOpen ? 'w-auto' : 'w-full'}
        `}
        title={isPanelOpen ? t('Close_panel') : t('Open_panel')}
        aria-label={isPanelOpen ? t('Close_panel') : t('Open_panel')}
        aria-expanded={isPanelOpen}
      >
        {isPanelOpen ? (
          <>
            <span className='flex-grow text-lg font-semibold'>
              {/* Optional: Menu Title if needed */}
            </span>
            <X size={20} className='ml-auto h-5 w-5' aria-hidden='true' />
          </>
        ) : (
          <AlignJustify size={24} className='h-6 w-6' aria-hidden='true' />
        )}
      </button>
    </div>
  );
};

export default PanelToggleButton;