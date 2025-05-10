// src/components/Feedback/FeedbackItem.tsx
import React from 'react'
import Image from 'next/image'
import { Feedback } from '@/src/models/response/conference.response'
import { safeGetDate, formatFeedbackDate } from './utils/dateUtils' // Adjust path
import { getStarsArray } from './utils/uiUtils' // Adjust path

interface FeedbackItemProps {
  feedback: Feedback
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({ feedback }) => {
  const stars = getStarsArray(feedback.star ?? 0)
  const feedbackDate = safeGetDate(feedback.createdAt)
  const formattedDate = formatFeedbackDate(feedbackDate)

  return (
    <div
      key={feedback.id}
      className='bg-white-pure rounded-md border border-gray-200 p-4 '
    >
      <div className='mb-2 flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0'>
        <div className='flex items-center'>
          <img
            src={feedback.avatar || '/avatar1.jpg'} // Use default
            alt={`${feedback.firstName || 'User'}'s Avatar`}
            width={30}
            height={30}
            className='bg-gray-20 mr-2 h-8 w-8 rounded-full object-cover'
            onError={e => {
              // Optional: More robust error handling if needed
              const target = e.target as HTMLImageElement
              if (target.src !== '/default-avatar.png') {
                target.src = '/default-avatar.png'
              }
            }}
          />
          <div className='font-medium '>
            {`${feedback.firstName} ${feedback.lastName}`.trim() || 'Anonymous'}
          </div>
        </div>
        <div className='flex text-yellow-500'>
          {stars.map((star, index) => (
            <span key={index}>{star}</span>
          ))}
        </div>
      </div>
      <div className='mb-2 text-xs '>{formattedDate}</div>
      <div className=''>{feedback.description}</div>
      {/* Optional: Reply/Report buttons */}
    </div>
  )
}

export default FeedbackItem
