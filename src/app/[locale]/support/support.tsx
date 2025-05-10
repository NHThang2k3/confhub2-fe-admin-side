'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

const Support = () => {
  const t = useTranslations('')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const faqCategories = [
    {
      name: t('AboutWebsite_name'),
      value: 'about_website'
    },
    {
      name: t('Account_name'),
      value: 'account'
    },
    {
      name: t('ConferenceJournal_name'),
      value: 'conference_journal'
    },
    {
      name: t('PostConference_name'),
      value: 'post_conference'
    },
    {
      name: t('FavoriteFeature_name'),
      value: 'favorite_feature'
    },
    {
      name: t('Chatbot_name'),
      value: 'chatbot'
    }
  ]

  const faqData = [
    // Về trang web
    {
      category: 'about_website',
      question: t('AboutWebsite_question1'),
      answer: t('AboutWebsite_answer1')
    },
    {
      category: 'about_website',
      question: t('AboutWebsite_question2'),
      answer: t('AboutWebsite_answer2')
    },
    {
      category: 'about_website',
      question: t('AboutWebsite_question3'),
      answer: t('AboutWebsite_answer3')
    },
    {
      category: 'about_website',
      question: t('AboutWebsite_question4'),
      answer: t('AboutWebsite_answer4')
    },
    {
      category: 'about_website',
      question: t('AboutWebsite_question5'),
      answer: t('AboutWebsite_answer5')
    },

    // Về tài khoản
    {
      category: 'account',
      question: t('Account_question1'),
      answer: t('Account_answer1')
    },
    {
      category: 'account',
      question: t('Account_question2'),
      answer: t('Account_answer2')
    },
    {
      category: 'account',
      question: t('Account_question3'),
      answer: t('Account_answer3')
    },
    {
      category: 'account',
      question: t('Account_question4'),
      answer: t('Account_answer4')
    },
    {
      category: 'account',
      question: t('Account_question5'),
      answer: t('Account_answer5')
    },
    {
      category: 'account',
      question: t('Account_question6'),
      answer: t('Account_answer6')
    },

    //Hội nghị và tạp chí
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question1'),
      answer: t('ConferenceJournal_answer1')
    },
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question2'),
      answer: t('ConferenceJournal_answer2')
    },
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question3'),
      answer: t('ConferenceJournal_answer3')
    },
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question4'),
      answer: t('ConferenceJournal_answer4')
    },
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question5'),
      answer: t('ConferenceJournal_answer5')
    },
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question6'),
      answer: t('ConferenceJournal_answer6')
    },
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question7'),
      answer: t('ConferenceJournal_answer7')
    },

    //Đăng bài
    {
      category: 'post_conference',
      question: t('PostConference_question1'),
      answer: t('PostConference_answer1')
    },
    {
      category: 'post_conference',
      question: t('PostConference_question2'),
      answer: t('PostConference_answer2')
    },
    {
      category: 'post_conference',
      question: t('PostConference_question3'),
      answer: t('PostConference_answer3')
    },
    {
      category: 'post_conference',
      question: t('PostConference_question4'),
      answer: t('PostConference_answer4')
    },
    {
      category: 'post_conference',
      question: t('PostConference_question5'),
      answer: t('PostConference_answer5')
    },
    {
      category: 'post_conference',
      question: t('PostConference_question6'),
      answer: t('PostConference_answer6')
    },
    {
      category: 'post_conference',
      question: t('PostConference_question7'),
      answer: t('PostConference_answer7')
    },

    //Favorite
    {
      category: 'favorite_feature',
      question: t('FavoriteFeature_question1'),
      answer: t('FavoriteFeature_answer1')
    },
    {
      category: 'favorite_feature',
      question: t('FavoriteFeature_question2'),
      answer: t('FavoriteFeature_answer2')
    },
    {
      category: 'favorite_feature',
      question: t('FavoriteFeature_question3'),
      answer: t('FavoriteFeature_answer3')
    },
    {
      category: 'favorite_feature',
      question: t('FavoriteFeature_question4'),
      answer: t('FavoriteFeature_answer4')
    },
    {
      category: 'favorite_feature',
      question: t('FavoriteFeature_question5'),
      answer: t('FavoriteFeature_answer5')
    },

    //Chatbot
    {
      category: 'chatbot',
      question: t('Chatbot_question1'),
      answer: t('Chatbot_answer1')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question2'),
      answer: t('Chatbot_answer2')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question3'),
      answer: t('Chatbot_answer3')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question4'),
      answer: t('Chatbot_answer4')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question5'),
      answer: t('Chatbot_answer5')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question6'),
      answer: t('Chatbot_answer6')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question7'),
      answer: t('Chatbot_answer7')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question8'),
      answer: t('Chatbot_answer8')
    }
  ]

  const filteredFaqData = faqData.filter(
    item =>
      (selectedCategory === null || item.category === selectedCategory) && // Filter by category
      (searchTerm === '' ||
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())) // Filter by search term
  )

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setExpandedIndex(null) // Collapse all accordions when searching
  }

  const handleCategoryClick = (categoryValue: string | null) => {
    setSelectedCategory(categoryValue)
    setExpandedIndex(null) // Collapse all accordions when category changes
    setSearchTerm('') // Clear search term when category changes
  }
  return (
    <>
      {/* Use mobile-first padding: p-4 default, md:p-8 for medium screens and up */}
      <div className='w-full bg-gradient-to-r from-background to-background-secondary p-4 md:p-8'>
        <div className='container mx-auto'>
          {' '}
          {/* Added mx-auto for centering container content */}
          <div className='flex flex-col items-center'>
            <h2 className='py-6 text-center text-2xl font-bold md:py-8 md:text-3xl'>
              {t('How_can_we_help_you')}
            </h2>
          </div>
          {/* Search Bar */}
          {/* Adjusted margins for better responsiveness */}
          <div className='relative mx-auto mb-8 max-w-2xl md:mb-12'>
            {' '}
            {/* Use max-width and mx-auto */}
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <svg
                className='h-5 w-5 ' // Added text color
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path
                  fillRule='evenodd'
                  d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <input
              type='text'
              // Consistent padding, maybe slightly less tall than py-6? py-3 or py-4 might be better
              className='block w-full rounded-full border border-gray-300  py-3 pl-10 pr-3  shadow-sm focus:border-button focus:outline-none focus:ring-1 focus:ring-button sm:text-sm'
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          {/* Layout: Stack vertically on mobile, horizontally on medium screens+ */}
          {/* Adjusted gap and margins */}
          <div className='flex flex-col gap-6 md:flex-row md:gap-8'>
            {/* Left Column - Categories */}
            {/* Takes full width on mobile, 1/3 on md+. Added bottom margin for mobile stacking */}
            <div className='w-full rounded-lg  p-4 shadow-lg  md:mb-0 md:w-1/4 lg:w-1/5'>
              {' '}
              {/* Adjusted desktop width */}
              <h3 className='mb-3 text-lg font-semibold  '>
                {t('Categories')}
              </h3>
              <ul className='space-y-1'>
                <li
                  key='all'
                  className={`cursor-pointer rounded px-2 py-1 font-bold transition-colors duration-150  ${
                    selectedCategory === null ? ' text-button ' : ' '
                  }`}
                  onClick={() => handleCategoryClick(null)}
                >
                  {t('All')}
                </li>
                {faqCategories.map(category => (
                  <li
                    key={category.value}
                    className={`cursor-pointer rounded px-2 py-1 font-bold transition-colors duration-150 ${
                      selectedCategory === category.value
                        ? ' text-button '
                        : ' '
                    }`}
                    onClick={() => handleCategoryClick(category.value)}
                  >
                    {category.name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column - Questions and Answers */}
            {/* Takes full width on mobile, remaining width on md+ */}
            <div className='w-full rounded-lg p-2 shadow-lg md:w-3/4 lg:w-4/5'>
              <div className='space-y-2 '>
                {filteredFaqData.length > 0 ? (
                  filteredFaqData.map((item, index) => (
                    <div
                      key={index}
                      className='overflow-hidden rounded-lg border border-gray-200  '
                    >
                      <div
                        className='flex cursor-pointer items-center justify-between px-4 py-1 transition-colors duration-150 '
                        onClick={() => toggleAccordion(index)}
                        aria-expanded={expandedIndex === index}
                        aria-controls={`faq-content-${index}`}
                        id={`faq-header-${index}`}
                      >
                        <h3 className='text-base font-semibold   md:text-lg'>
                          {item.question}
                        </h3>
                        <svg
                          className={`h-5 w-5 text-gray-500 transition-transform duration-200  ${
                            expandedIndex === index ? 'rotate-180' : ''
                          }`}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M19 9l-7 7-7-7'
                          ></path>
                        </svg>
                      </div>
                      {/* Smooth transition for accordion */}
                      <div
                        id={`faq-content-${index}`}
                        role='region'
                        aria-labelledby={`faq-header-${index}`}
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedIndex === index ? 'max-h-screen' : 'max-h-0'}`}
                      >
                        <div className='px-4 pb-2 pt-1  '>
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='rounded-lg border border-gray-200  p-4 text-center shadow-sm  '>
                    <p className=''>{t('noResultsFound')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Support
