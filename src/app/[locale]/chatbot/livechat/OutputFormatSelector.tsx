// src/components/layout/sidepanel/OutputFormatSelector.tsx
import React from 'react'
import { OutputModality } from '@/src/app/[locale]/chatbot/lib/live-chat.types'
import { Volume2, Text } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface OutputFormatSelectorProps {
  currentModality: OutputModality
  onModalityChange: (modality: OutputModality) => void
  disabled: boolean // Controlled by the parent fieldset
}

const OutputFormatSelector: React.FC<OutputFormatSelectorProps> = ({
  currentModality,
  onModalityChange,
  disabled // No need to recalculate here, parent passes it
}) => {
  const t = useTranslations()

  const isAudioSelected = currentModality === 'audio'
  const isTextSelected = currentModality === 'text'

  return (
    <div>
      <label className='mb-3 block text-sm font-medium '>
        {t('Output_Format')}
      </label>
      <div className='grid grid-cols-2 gap-3'>
        <button
          type='button'
          onClick={() => onModalityChange('audio')}
          disabled={disabled} // Apply disabled prop
          className={`group flex flex-col items-center justify-center rounded-lg border p-3 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${isAudioSelected ? 'bg-gray-10 border-blue-500 ring-1 ring-blue-500 ' : 'bg-white-pure hover:bg-gray-5 border-gray-300 hover:border-gray-400 '}`}
          aria-pressed={isAudioSelected}
        >
          <Volume2
            stroke='currentColor'
            className={`mb-1 h-6 w-6 ${isAudioSelected ? 'text-blue-600' : '0 group-hover:text-gray-500'}`}
            aria-hidden='true'
            size={24}
          />
          <span
            className={`text-sm font-medium ${isAudioSelected ? 'text-blue-700' : ' group-hover:text-gray-500'}`}
          >
            {' '}
            {t('Audio')}{' '}
          </span>
        </button>
        <button
          type='button'
          onClick={() => onModalityChange('text')}
          disabled={disabled} // Apply disabled prop
          className={`group flex flex-col items-center justify-center rounded-lg border p-3 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${isTextSelected ? 'bg-gray-10 border-blue-500 ring-1 ring-blue-500 ' : 'bg-white-pure hover:bg-gray-5 border-gray-300 hover:border-gray-400 '}`}
          aria-pressed={isTextSelected}
        >
          <Text
            stroke='currentColor'
            className={`mb-1 h-6 w-6 ${isTextSelected ? 'text-blue-600' : ' group-hover:text-gray-500'}`}
            aria-hidden='true'
            size={24}
          />
          <span
            className={`text-sm font-medium ${isTextSelected ? 'text-blue-700' : ' group-hover:text-gray-500'}`}
          >
            {' '}
            {t('Text')}{' '}
          </span>
        </button>
      </div>
    </div>
  )
}

export default OutputFormatSelector
