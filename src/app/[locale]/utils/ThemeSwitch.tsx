'use client';

import { capitalize } from '@/lib/utils'; // Assuming this utility is locale-aware or generic
import { useTranslations } from 'next-intl'; // Keep this import
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts'; // Keep this hook import

export default function ThemeSwitch() {
  // Call the useTranslations hook (already present)
  const t = useTranslations(''); // Using the default namespace

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // Note: 'theme' is the preferred theme, 'resolvedTheme' is the actual current theme
  const { setTheme, resolvedTheme, themes, theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  // useOnClickOutside hook is fine as is, doesn't need translation logic
  useOnClickOutside(ref, () => setIsOpen(false));

  // Render a disabled button while not mounted (SSR/initial render)
  if (!mounted)
    return (
      <div className='flex items-center justify-center'>
        <button
          className='text-destructive inline-flex items-center  justify-between gap-3 text-sm text-black'
          onClick={() => {}}
          aria-expanded='false'
          disabled // Disable the button when not mounted
          // Add aria-label for accessibility
          aria-label={t('Theme_Switch_AriaLabel_Loading')} // <-- Translate aria-label
        >
           {/* Translate the loading state text */}
          <span className='ml-2'>{t('Theme')}</span> {/* <-- Already uses t() */}
        </button>
      </div>
    );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Function to get the translated theme name
  const getTranslatedThemeName = (themeKey: string) => {
     // Use a specific key pattern like 'ThemeName_system', 'ThemeName_dark', etc.
     // Fallback to capitalizing the raw key if translation is missing
     return t(`ThemeName_${themeKey}`, {
        // Provide default value and try to capitalize if key is not found
        defaultMessage: capitalize(themeKey),
     });
  };


  return (
    <div ref={ref} className='w-full'>
      <div className='relative'>
        <button
          className='text-destructive inline-flex w-full items-center justify-between gap-1 rounded px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 md:px-4'
          onClick={toggleDropdown}
          aria-expanded={isOpen}
           // Add aria-label for accessibility
          aria-label={t('Theme_Switch_AriaLabel_ToggleDropdown')} // <-- Translate aria-label
        >
          {/* Translate the button label */}
          <span>{t('Theme')}</span> {/* <-- Already uses t() */}
          {/* SVG Chevron Down icon - does not need translation */}
          <svg
            className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </button>

        {isOpen && (
          <div className='absolute right-0 z-50 mt-2 w-full origin-top-right rounded-md bg-dropdown shadow-lg'>
            <div
              className=''
              role='menu'
              aria-orientation='vertical'
              aria-labelledby='options-menu' // Consider translating this label ID's target if it's a visible element
            >
              {themes.map(themeItem => (
                <button
                  key={themeItem}
                  onClick={() => {
                    setTheme(themeItem)
                    setIsOpen(false)
                  }}
                  className={`block w-full whitespace-nowrap px-2 py-2 text-left text-sm hover:bg-dropdownHover md:px-4 ${
                    themeItem === resolvedTheme
                      ? 'bg-selected text-primary hover:bg-selected'
                      : 'text-secondary'
                  }`}
                   // Add aria-label for each theme option
                   aria-label={t('Theme_Switch_AriaLabel_SelectTheme', { themeName: getTranslatedThemeName(themeItem) })} // <-- Translate aria-label with translated theme name
                >
                  {/* Translate the theme name */}
                  {getTranslatedThemeName(themeItem)} {/* <-- Use translated name */}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}