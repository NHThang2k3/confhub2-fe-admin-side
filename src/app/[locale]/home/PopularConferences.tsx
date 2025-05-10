// PopularConferences.tsx
'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import usePopularConferences from '../../../hooks/home/usePopularConferences'
import EventCard from '../conferences/EventCard'

const cardWidthDesktop = 320
const gap = 16
const desktopContainerWidth = cardWidthDesktop * 3 + gap * 2

const PopularConferences: React.FC = () => {
  const t = useTranslations('')
  const {
    listConferences,
    loading,
    error,
    scrollerRef,
    scroll,
    isAtStart, // Lấy state từ hook
    isAtEnd, // Lấy state từ hook
    setIsHovering // Lấy hàm set state từ hook
  } = usePopularConferences()

  // Không hiển thị nếu không có hoặc chỉ có 1 conference (vì không cuộn được)
  if (!listConferences || listConferences.length < 1 || error) return null
  // Xác định xem có cần căn giữa trên desktop không
  const shouldCenterDesktop = listConferences && listConferences.length < 3

  return (
    <section id='popular-conferences' className='m-4 px-4 pt-10 sm:m-6 sm:px-0'>
      <h1 className='mb-6 text-center text-2xl font-bold'>
        {t('Popular_Conferences')}
      </h1>
      <div className='relative'>
        {/* Nút Trái - Thêm disabled và styling */}
        <button
          onClick={() => scroll('left')}
          aria-label='Scroll Left'
          disabled={isAtStart || listConferences.length === 1} // Vô hiệu hóa nút
          className={`absolute -left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/60 p-2 shadow-md hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:-left-7 sm:p-3 md:-left-0 ${
            isAtStart || listConferences.length === 1
              ? 'cursor-not-allowed opacity-30'
              : '' // Style khi bị vô hiệu hóa
          }`}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-4 w-4 sm:h-5 sm:w-5'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M15.75 19.5 8.25 12l7.5-7.5'
            />
          </svg>
        </button>
        {/* Nút Phải - Thêm disabled và styling */}
        <button
          onClick={() => scroll('right')}
          aria-label='Scroll Right'
          disabled={isAtEnd || listConferences.length === 1} // Vô hiệu hóa nút
          className={`absolute -right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/60 p-2 shadow-md hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:-right-7 sm:p-3 md:-right-0 ${
            isAtEnd || listConferences.length === 1
              ? 'cursor-not-allowed opacity-30'
              : '' // Style khi bị vô hiệu hóa
          }`}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-4 w-4 sm:h-5 sm:w-5'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='m8.25 4.5 7.5 7.5-7.5 7.5'
            />
          </svg>
        </button>

        {/* Container cuộn - Thêm sự kiện hover */}
        <div
          id='conference-scroller'
          ref={scrollerRef}
          onMouseEnter={() => setIsHovering(true)} // Set hover khi chuột vào
          onMouseLeave={() => setIsHovering(false)} // Bỏ hover khi chuột ra
          className={
            `flex snap-x snap-mandatory space-x-4 overflow-x-scroll scroll-smooth scrollbar-hide ` +
            `px-[calc((100%-theme(width.72))/2)] py-4 ` + // Mobile padding
            // Desktop: Chiều rộng cố định, căn giữa container, và căn giữa nội dung nếu ít hơn 3 card
            `sm:mx-auto sm:w-[${desktopContainerWidth}px] sm:px-0 ${shouldCenterDesktop ? 'sm:justify-center' : ''}` // <-- THÊM sm:justify-center có điều kiện
            // Sử dụng giá trị pixel nếu cần:
            // `px-[calc((100%-288px)/2)] py-4 ` +
            // `sm:mx-auto sm:w-[992px] sm:px-0`
          }
        >
          {listConferences.map(conference => (
            <div key={conference.id} className='flex-shrink-0 snap-center'>
              <EventCard event={conference} className='h-full w-80 md:w-80' />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularConferences
