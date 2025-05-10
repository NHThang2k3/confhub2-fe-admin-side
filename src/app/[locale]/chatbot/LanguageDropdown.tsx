// src/components/layout/sidepanel/LanguageDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  LanguageOption, //
} from '@/src/app/[locale]/chatbot/lib/live-chat.types'; 
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LanguageDropdownProps {
  currentLanguage: LanguageOption; // <--- THAY ĐỔI: Giờ là LanguageOption
  availableLanguages: LanguageOption[];
  onLanguageChange: (lang: LanguageOption) => void; // <--- THAY ĐỔI: Giờ nhận LanguageOption
  disabled: boolean;
}

const getFlagUrl = (flagCode: string) => `/country_flags/${flagCode}.svg`;

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  currentLanguage, // currentLanguage giờ là object LanguageOption
  availableLanguages,
  onLanguageChange,
  disabled
}) => {
  const t = useTranslations();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // selectedLanguage giờ chính là currentLanguage (vì nó đã là object)
  // const selectedLanguage = availableLanguages.find(
  //   lang => lang.code === currentLanguage.code // So sánh code nếu currentLanguage là object
  // );
  // Hoặc đơn giản là:
  const selectedLanguage = currentLanguage;


  const handleSelect = (langOption: LanguageOption) => { // <--- THAY ĐỔI: Nhận LanguageOption
    onLanguageChange(langOption); // <--- THAY ĐỔI: Truyền LanguageOption
    setIsOpen(false);
  };

  // Click outside handler (giữ nguyên)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className='mb-6'>
      <label
        id='language-select-label'
        className='mb-2 block text-sm font-medium '
      >
        {t('Language')}
      </label>
      <div ref={dropdownRef} className='relative'>
        <button
          type='button'
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className='bg-white-pure disabled:bg-gray-5 relative w-full cursor-default rounded-md border border-gray-300 py-2 pl-3 pr-10 text-left text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70 '
          aria-haspopup='listbox'
          aria-expanded={isOpen}
          aria-labelledby='language-select-label'
        >
          <span className='flex items-center'>
            {selectedLanguage ? ( // selectedLanguage giờ là currentLanguage
              <>
                <Image
                  src={getFlagUrl(selectedLanguage.flagCode)}
                  alt={`${selectedLanguage.name} flag`}
                  width={20}
                  height={15}
                  className='mr-2 h-auto w-[20px] flex-shrink-0 rounded-sm'
                  loading='lazy'
                />
                <span className='block truncate '>{selectedLanguage.name}</span>
              </>
            ) : (
              // Trường hợp này ít xảy ra nếu currentLanguage luôn có giá trị mặc định
              <span className='block truncate '>{t('Select_language')}</span>
            )}
          </span>
          <span className='pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2'>
            <ChevronDown
              className={`h-5 w-5  transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden='true'
            />
          </span>
        </button>

        {isOpen && (
          <div
            role='listbox'
            aria-labelledby='language-select-label'
            className='absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-900 sm:text-sm'
          >
            {availableLanguages.map(langOption => ( // Đổi tên biến thành langOption cho rõ
              <button
                key={langOption.code}
                type='button'
                role='option'
                aria-selected={currentLanguage.code === langOption.code} // So sánh code
                onClick={() => handleSelect(langOption)} // <--- THAY ĐỔI: Truyền cả object langOption
                disabled={disabled}
                className={`relative w-full cursor-default select-none py-2 pl-3 pr-9 text-left hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 ${
                  currentLanguage.code === langOption.code // So sánh code
                    ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-gray-800'
                    : ''
                }`}
              >
                <div className='flex items-center'>
                  <Image
                    src={getFlagUrl(langOption.flagCode)}
                    alt={`${langOption.name} flag`}
                    width={20}
                    height={15}
                    className='mr-2 h-auto w-[20px] flex-shrink-0 rounded-sm'
                    loading='lazy'
                  />
                  <span
                    className={`block truncate ${currentLanguage.code === langOption.code ? 'font-semibold' : 'font-normal'}`}
                  >
                    {langOption.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageDropdown;