// components/conferences/ConferenceItem.tsx

import React from 'react'
import Image from 'next/image'
import Button from '../utils/Button'
import { Link } from '@/src/navigation'
import { useMediaQuery } from 'react-responsive'
import { useTranslations } from 'next-intl'

interface ConferenceItemProps {
  conference: {
    id: string
    title: string
    acronym: string
    location: string
    fromDate?: string
    toDate?: string
    followedAt?: string
    status?: string
  }
}

const ConferenceItem: React.FC<ConferenceItemProps> = ({ conference }) => {
  const t = useTranslations('')

  const isMobile = useMediaQuery({ maxWidth: 768 })
  const sizeButton = isMobile ? 'small' : 'medium'

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const showDetailButton = !(
    conference.status === 'Pending' || conference.status === 'Rejected'
  )
  const showEditButton =
    conference.status === 'Pending' || conference.status === 'Approved'

  // Helper function/component to render buttons to avoid repetition
  const renderButtons = () => (
    <>
      {showDetailButton && (
        <Link
          href={{
            pathname: '/conferences/detail',
            query: { id: conference.id }
          }}
        >
          <Button variant='primary' size={sizeButton} rounded>
            {t('Detail')}
          </Button>
        </Link>
      )}

      {showEditButton && (
        <Link
          href={{
            pathname: '/updateconference',
            query: { id: conference.id }
          }}
        >
          <Button variant='secondary' size={sizeButton} rounded>
            {t('Edit')}
          </Button>
        </Link>
      )}
    </>
  )

  return (
    <div className='mb-4 grid grid-cols-1 items-start gap-4 rounded-md bg-background p-2 shadow-md md:grid-cols-9 md:items-center md:p-4'>
      {/* Image Column (Hidden on Mobile) */}
      <div className='relative col-span-1 hidden items-center justify-center md:flex'>
        <Image
          src={'/bg-2.jpg'} // Consider using a dynamic or placeholder image if available
          alt={conference.title}
          width={500} // These might be too large for the container, consider smaller fixed size or aspect ratio
          height={300}
          className='h-auto w-full rounded-md object-cover' // Make image responsive within its container
        />
      </div>

      {/* Info Column (Spans full width on mobile, 6 cols on desktop) */}
      <div className='col-span-1 text-left text-sm md:col-span-6 md:text-base'>
        <h3 className='text-sm font-semibold text-button md:text-lg'>
          {conference.title} ({conference.acronym})
        </h3>
        <p>
          <strong>{t('Date')}:</strong>{' '}
          {conference.fromDate
            ? `${formatDate(conference.fromDate)} - ${formatDate(conference.toDate)}`
            : 'Dates not available'}
        </p>
        <p>
          <strong>{t('Location')}:</strong> {conference.location}
        </p>

        {/* Buttons Container (Only visible on Mobile, below Location) */}
        {isMobile && (
          <div className='mt-3 flex flex-wrap gap-2'>{renderButtons()}</div>
        )}
      </div>

      {/* Buttons Column (Only visible on Desktop) */}
      <div className='col-span-1 hidden items-center justify-center gap-2 md:col-span-2 md:flex md:flex-col lg:flex-row'>
        {!isMobile && renderButtons()}
      </div>
    </div>
  )
}

export default ConferenceItem
