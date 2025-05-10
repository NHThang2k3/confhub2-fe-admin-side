'use client'

// src/app/[locale]/journal/JournalReport.tsx
import React, { useState } from 'react'
import Button from '../../utils/Button' // Import the Button component
import { JournalResponse } from '../../../../models/response/journal.response' // Import JournalResponse
import { useTranslations } from 'next-intl'

interface JournalReportProps {
  journal: JournalResponse | undefined // Make journal optional
}

const JournalReport: React.FC<JournalReportProps> = ({ journal }) => {
  const t = useTranslations()

  const [isFullDescriptionVisible, setIsFullDescriptionVisible] =
    useState(false)

  //Handle journal being undefined

  if (!journal) {
    return <div>{t('Journal_not_found')}</div>
  }

  const toggleDescription = () => {
    setIsFullDescriptionVisible(!isFullDescriptionVisible)
  }

  // Safely access bioxbio array and its elements
  const latestImpactFactor =
    journal.bioxbio && journal.bioxbio.length > 0
      ? journal.bioxbio[0].Impact_factor
      : 'N/A'
  const overalRanking = journal['Rank']
  const hIndex = journal['H index']
  const sjr = journal.SJR

  return (
    <div className='container mx-auto rounded-lg px-4  py-2'>
      <div className='flex flex-col gap-6 md:flex-row'>
        {/* Left section */}
        <div className='md:w-3/5'>
          <h2 className='mb-2 text-4xl font-bold'>{journal.title}</h2>
          <p className='mb-4'>
            Comprehensive information about the Journal, including Impact
            factor, H-index, subject Area, Category, Scope, ISSN.
          </p>
          <div className=' items-top relative mb-4 flex overflow-hidden rounded-lg bg-gradient-to-r from-background to-background-secondary p-4 shadow-sm'>
            {/* Thumbnail */}
            <div className='w-50 h-30 relative mt-4 overflow-hidden rounded-lg'>
              {/* Image */}
              <div className='relative h-56 w-40 overflow-hidden rounded-lg'>
                {' '}
                {/* Make sure the container has w-full and h-full */}
                <img
                  src={journal.Image || '/bg-2.jpg'}
                  alt={journal.Title}
                  className='h-full w-full object-cover'
                />
              </div>
            </div>
            {/* Details */}
            <div className='ml-8 flex flex-1 flex-col justify-center'>
              <div className='mt-3 grid grid-cols-2 gap-4'>
                <div className='flex flex-col items-center justify-center rounded-lg bg-blue-100 p-5 text-lg font-medium text-blue-700 shadow-md'>
                  <div className='flex items-center'>
                    <svg
                      className='mr-2 h-6 w-6'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path d='M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z'></path>
                    </svg>
                    Overall Rank
                  </div>
                  <div className='text-2xl font-bold'>{overalRanking}</div>
                </div>
                <div className='flex flex-col items-center justify-center rounded-lg bg-green-100 p-5 text-lg font-medium text-green-700 shadow-md'>
                  <div className='flex items-center'>
                    <svg
                      className='mr-2 h-6 w-6'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path d='M6 2a1 1 0 011 1v14a1 1 0 01-2 0V3a1 1 0 011-1zm8 0a1 1 0 011 1v14a1 1 0 01-2 0V3a1 1 0 011-1zm-4 4a1 1 0 011 1v10a1 1 0 01-2 0V7a1 1 0 011-1z'></path>
                    </svg>
                    Impact Factor
                  </div>
                  <div className='text-2xl font-bold'>{latestImpactFactor}</div>
                </div>
                <div className='flex flex-col items-center justify-center rounded-lg bg-yellow-100 p-5 text-lg font-medium text-yellow-700 shadow-md'>
                  <div className='flex items-center'>
                    <svg
                      className='mr-2 h-6 w-6'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path d='M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8-6a6 6 0 100 12A6 6 0 0010 4zm1 5a1 1 0 00-2 0v2a1 1 0 102 0V9z'></path>
                    </svg>
                    H-index
                  </div>
                  <div className='text-2xl font-bold'>{hIndex || 'N/A'}</div>
                </div>
                <div className='flex flex-col items-center justify-center rounded-lg bg-red-100 p-5 text-lg font-medium text-red-700 shadow-md'>
                  <div className='flex items-center'>
                    <svg
                      className='mr-2 h-6 w-6'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path d='M5 2a1 1 0 011 1v2h8V3a1 1 0 112 0v2h1a1 1 0 011 1v4a1 1 0 01-1 1h-1v4a1 1 0 01-2 0v-4H6v4a1 1 0 01-2 0v-4H3a1 1 0 01-1-1V6a1 1 0 011-1h1V3a1 1 0 011-1zm2 6h6V7H7v1z'></path>
                    </svg>
                    SJR
                  </div>
                  <div className='text-2xl font-bold'>{sjr || 'N/A'}</div>
                </div>
              </div>

              <div className='mt-8 flex justify-center'>
                <Button variant='primary' rounded>
                  <a href={journal.Information?.Homepage || '#'}>
                    Journal Website
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        {/* CHANGE: Reduced padding from p-6 to p-4 */}
        <div className='rounded-lg bg-gradient-to-r from-background to-background-secondary px-6 pt-6 shadow-md md:w-2/5'>
          <div className='relative overflow-x-auto'>
            <table className='text-md w-full border-collapse text-left'>
              <tbody>
                {/* CHANGE: Reduced py-2 to py-2 in all td elements */}
                <tr className='border-b  '>
                  <td className='px-3 py-2 font-semibold'>Title</td>
                  <td className='px-3 py-2'>{journal.Title}</td>
                </tr>
                <tr className='border-b  '>
                  <td className='px-3 py-2 font-semibold'>Areas</td>
                  <td className='px-3 py-2'>
                    {journal['Subject Area and Category'] ? (
                      <>
                        {
                          journal['Subject Area and Category'][
                            'Field of Research'
                          ]
                        }
                        {/* {journal["Subject Area and Category"].Topics.map((topic, index) => (
                          <span key={index}>
                            {index === 0 ? '; Categories: ' : ', '} {topic}
                          </span>
                        ))} */}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
                <tr className='border-b  '>
                  <td className='px-3 py-2 font-semibold'>Publisher</td>
                  <td className='px-3 py-2'>{journal.Publisher}</td>{' '}
                  {/* Use journal.Publisher */}
                </tr>
                <tr className='border-b  '>
                  <td className='px-3 py-2 font-semibold'>Country</td>
                  <td className='px-3 py-2'>{journal.Country}</td>{' '}
                  {/* Use journal.Country */}
                </tr>
                <tr className='border-b  '>
                  <td className='px-3 py-2 font-semibold'>ISSN</td>
                  <td className='px-3 py-2'>{journal.ISSN}</td>{' '}
                  {/* Use journal.ISSN */}
                </tr>
                <tr className='border-b  '>
                  <td className='px-3 py-2 font-semibold'>Best Quartile</td>
                  <td className='px-3 py-2'>Q1</td>{' '}
                  {/* Best Quartile is always Q1 according to SupplementaryTable, hardcoded for now, improve logic if needed */}
                </tr>
                <tr className='border-b  '>
                  <td className='px-3 py-2 font-semibold'>Coverage History</td>
                  <td className='px-3 py-2'>1999 - 2023</td>{' '}
                  {/* Coverage history based on SupplementaryTable years, hardcoded for now, improve logic if needed */}
                </tr>
              </tbody>
            </table>
            <Button
              className='mt-2 w-full py-2 text-center font-semibold'
              variant='primary'
            >
              Follow
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JournalReport

const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong className='font-semibold'>{children}</strong>
)
