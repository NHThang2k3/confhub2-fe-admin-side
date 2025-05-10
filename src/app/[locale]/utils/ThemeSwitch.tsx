'use client'
import { capitalize } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

export default function ThemeSwitch() {
  const t = useTranslations('')
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { setTheme, resolvedTheme, themes, theme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])
  useOnClickOutside(ref, () => setIsOpen(false))

  if (!mounted)
    return (
      <div className='flex items-center justify-center'>
        <button
          className='text-destructive inline-flex items-center  justify-between gap-3 text-sm text-black'
          onClick={() => {}}
          aria-expanded='false'
          disabled // Disable the button when not mounted
        >
          <span className='ml-2'>{t('Theme')}</span>
        </button>
      </div>
    )

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div ref={ref} className='w-full'>
      <div className='relative'>
        <button
          className='text-destructive inline-flex w-full items-center justify-between gap-1 rounded px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 md:px-4'
          onClick={toggleDropdown}
          aria-expanded={isOpen}
        >
          <span>{t('Theme')}</span>
          {/* SVG Chevron Down */}
          <svg
            className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} // Added h-5 w-5 for size control
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
              aria-labelledby='options-menu'
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
                >
                  {capitalize(themeItem)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
