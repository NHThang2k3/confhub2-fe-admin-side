'use client' // Ensure this is a Client Component

import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

// Define CategoryKey type (optional but good practice)
type CategoryKey = 'getting-started' | 'functionality-features' | 'general'

const AIFAQ: React.FC = () => {
  // Use the 'FAQ' namespace defined in the JSON
  const t = useTranslations('AIFAQ')

  const [activeCategory, setActiveCategory] =
    useState<CategoryKey>('getting-started')
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  const [titleVisible, setTitleVisible] = useState(false)
  const faqRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false) // For hover effect

  // --- Icons (No change needed) ---
  const categoryIcons = {
    'getting-started': (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='lucide lucide-sparkles-icon lucide-sparkles mr-3'
      >
        <path d='M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z' />
        <path d='M20 3v4' />
        <path d='M22 5h-4' />
        <path d='M4 17v2' />
        <path d='M5 18H3' />
      </svg>
    ),
    'functionality-features': (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='lucide lucide-circle-icon lucide-circle mr-3'
      >
        <circle cx='12' cy='12' r='10' />
      </svg>
    ),
    general: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='lucide lucide-server-icon lucide-server mr-3'
      >
        <rect width='20' height='8' x='2' y='2' rx='2' ry='2' />
        <rect width='20' height='8' x='2' y='14' rx='2' ry='2' />
        <line x1='6' x2='6.01' y1='6' y2='6' />
        <line x1='6' x2='6.01' y1='18' y2='18' />
      </svg>
    )
  }

  // --- Animation Effect (No change needed) ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTitleVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { root: null, threshold: 0.2 }
    )
    if (faqRef.current) observer.observe(faqRef.current)
    return () => {
      if (faqRef.current) observer.unobserve(faqRef.current)
    }
  }, [])

  const titleClasses = `text-4xl font-semibold text-gray-100 mt-2 transition-opacity duration-1000 transition-transform duration-1000 ${titleVisible || isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-20px]'}`

  // --- Helper function to render a single question block ---
  const renderQuestion = (index: number, category: CategoryKey) => {
    const questionKey = `categories.${category}.questions.${index}.q`
    const answerKey = `categories.${category}.questions.${index}.a`

    // Get question text - t() returns the key if not found
    const questionText = t(questionKey)

    // Optional: Don't render if the question key doesn't exist in JSON
    if (questionText === questionKey) {
      // console.warn(`Missing translation for key: ${questionKey}`); // Optional warning
      return null
    }

    return (
      <div key={`${category}-${index}`} className='mb-2'>
        <div
          className='flex cursor-pointer items-center justify-between rounded-md px-4 py-3 hover:bg-gray-700'
          onClick={() =>
            setExpandedQuestion(expandedQuestion === index ? null : index)
          }
        >
          <span className='text-gray-300'>{questionText}</span>
          {/* Arrow Icon */}
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${expandedQuestion === index ? 'rotate-90' : ''}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M9 5l7 7-7 7'
            />
          </svg>
        </div>
        {/* Answer Panel */}
        {expandedQuestion === index && (
          <div className='mt-1 rounded-md bg-gray-800 p-4 text-sm text-gray-400'>
            {' '}
            {/* Added mt-1 and text-sm */}
            {t(answerKey)}
          </div>
        )}
      </div>
    )
  }

  // --- Main Render ---
  return (
    <div
      className='min-h-screen bg-gray-900 px-4 py-12 text-white sm:px-6' // Adjusted padding
      ref={faqRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='container mx-auto max-w-5xl'>
        {' '}
        {/* Added max-width */}
        {/* Title */}
        <div className='mb-12 text-center md:text-left'>
          {' '}
          {/* Centered on mobile */}
          <h2 className='text-xl font-bold text-blue-400'>{t('title')}</h2>
          <h1 className={titleClasses}>
            {/* Using t() for the headline */}
            {t('headline')
              .split('\n')
              .map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
          </h1>
        </div>
        {/* Main Content Area */}
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {' '}
          {/* Changed to 3 columns */}
          {/* Left Side - Category List (Now takes 1 column) */}
          <div className='flex flex-col space-y-4 md:col-span-1'>
            {/* Getting Started Category */}
            <div
              className={`cursor-pointer rounded-md bg-gray-800 p-4 shadow-sm transition duration-200 hover:bg-gray-700 hover:shadow-md ${activeCategory === 'getting-started' ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''}`} // Using ring for active state
              onClick={() => {
                setActiveCategory('getting-started')
                setExpandedQuestion(null)
              }} // Reset expanded on category change
            >
              <div className='flex items-center'>
                {categoryIcons['getting-started']}
                <span className='font-medium text-gray-200'>
                  {t('categories.getting-started.title')}
                </span>
              </div>
            </div>
            {/* Functionality Category */}
            <div
              className={`cursor-pointer rounded-md bg-gray-800 p-4 shadow-sm transition duration-200 hover:bg-gray-700 hover:shadow-md ${activeCategory === 'functionality-features' ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''}`}
              onClick={() => {
                setActiveCategory('functionality-features')
                setExpandedQuestion(null)
              }}
            >
              <div className='flex items-center'>
                {categoryIcons['functionality-features']}
                <span className='font-medium text-gray-200'>
                  {t('categories.functionality-features.title')}
                </span>
              </div>
            </div>
            {/* General Category */}
            <div
              className={`cursor-pointer rounded-md bg-gray-800 p-4 shadow-sm transition duration-200 hover:bg-gray-700 hover:shadow-md ${activeCategory === 'general' ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''}`}
              onClick={() => {
                setActiveCategory('general')
                setExpandedQuestion(null)
              }}
            >
              <div className='flex items-center'>
                {categoryIcons['general']}
                <span className='font-medium text-gray-200'>
                  {t('categories.general.title')}
                </span>
              </div>
            </div>
          </div>
          {/* Right Side - Questions (Now takes 2 columns) */}
          <div className='flex flex-col md:col-span-2'>
            {/* Render questions based on activeCategory */}
            {activeCategory === 'getting-started' && (
              <>
                {renderQuestion(0, 'getting-started')}
                {renderQuestion(1, 'getting-started')}
                {renderQuestion(2, 'getting-started')}
                {/* Add more renderQuestion calls if you add more Qs to JSON */}
              </>
            )}
            {activeCategory === 'functionality-features' && (
              <>
                {renderQuestion(0, 'functionality-features')}
                {renderQuestion(1, 'functionality-features')}
                {renderQuestion(2, 'functionality-features')}
                {renderQuestion(3, 'functionality-features')}
                {/* Add more renderQuestion calls if you add more Qs to JSON */}
              </>
            )}
            {activeCategory === 'general' && (
              <>
                {renderQuestion(0, 'general')}
                {renderQuestion(1, 'general')}
                {renderQuestion(2, 'general')}
                {/* Add more renderQuestion calls if you add more Qs to JSON */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIFAQ
