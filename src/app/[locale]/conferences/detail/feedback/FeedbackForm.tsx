// src/components/Feedback/FeedbackForm.tsx
import React from 'react'
import { useTranslations } from 'next-intl'

interface FeedbackFormProps {
  star: number | null
  description: string
  loading: boolean
  error: string | null
  onStarClick: (starValue: number) => void
  onDescriptionChange: (value: string) => void
  onSubmit: () => void
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  star,
  description,
  loading,
  error,
  onStarClick,
  onDescriptionChange,
  onSubmit
}) => {
  const t = useTranslations('')

  return (
    <div className='border-t border-gray-200 pt-6'>
      <div className='mb-3 font-medium '>{t('Rate_the_Conference')}:</div>
      <div className='mb-4 flex text-3xl'>
        {[1, 2, 3, 4, 5].map(starValue => (
          <span
            key={starValue}
            onClick={() => onStarClick(starValue)}
            className={`cursor-pointer transition-colors ${
              star !== null && starValue <= star
                ? 'text-yellow-500'
                : ' hover:text-yellow-400'
            }`}
            role='button'
            aria-label={`Rate ${starValue} stars`}
          >
            ★
          </span>
        ))}
      </div>
      <textarea
        placeholder={t('Write_your_feedback')}
        className='mb-4 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-blue-500'
        rows={3}
        value={description}
        onChange={e => onDescriptionChange(e.target.value)}
        aria-label={t('Feedback_description')}
      />
      <div className='flex items-center justify-end'>
        <button
          className='rounded-md bg-button px-4 py-2 font-semibold text-button-text hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50'
          onClick={onSubmit}
          disabled={loading || !star || !description.trim()}
        >
          {loading ? t('Posting') : t('Post_Feedback')}
        </button>
      </div>
      {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}
    </div>
  )
}

export default FeedbackForm
