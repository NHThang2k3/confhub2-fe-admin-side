// src/components/FeatureComparisonTable.tsx

import React, { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl' // Import useTranslations

// --- Data Definitions (Interface) ---
// Interface defining the structure for a single feature, using keys for translatable content
interface Feature {
  id: string
  nameKey: string // Key for the feature name in the translation file
  descriptionKey: string | string[] // Key(s) for the feature description
  requiresLogin: boolean
  isNew?: boolean
}

// Interface defining the structure for a category of features
interface FeatureCategory {
  categoryNameKey: string // Key for the category name
  features: Feature[]
}

// --- Static Data Configuration (Using Keys) ---
// This data structure uses keys that correspond to the en.json file.
// It defines the features and their properties, linking them to translatable strings.
const featureDataConfig: FeatureCategory[] = [
  {
    categoryNameKey: 'FeatureComparisonTable.categories.general',
    features: [
      {
        id: 'auth',
        nameKey: 'FeatureComparisonTable.features.auth.name',
        descriptionKey: 'FeatureComparisonTable.features.auth.description',
        requiresLogin: false
      },
      {
        id: 'search',
        nameKey: 'FeatureComparisonTable.features.search.name',
        descriptionKey: [
          // Array of keys for multi-line descriptions
          'FeatureComparisonTable.features.search.description.0',
          'FeatureComparisonTable.features.search.description.1',
          'FeatureComparisonTable.features.search.description.2',
          'FeatureComparisonTable.features.search.description.3',
          'FeatureComparisonTable.features.search.description.4',
          'FeatureComparisonTable.features.search.description.5'
        ],
        requiresLogin: false
      },
      {
        id: 'location_map',
        nameKey: 'FeatureComparisonTable.features.location_map.name',
        descriptionKey:
          'FeatureComparisonTable.features.location_map.description',
        requiresLogin: false
      },
      {
        id: 'journal_search',
        nameKey: 'FeatureComparisonTable.features.journal_search.name',
        descriptionKey:
          'FeatureComparisonTable.features.journal_search.description',
        requiresLogin: false
      },
      {
        id: 'chatbot',
        nameKey: 'FeatureComparisonTable.features.chatbot.name',
        descriptionKey: [
          'FeatureComparisonTable.features.chatbot.description.0',
          'FeatureComparisonTable.features.chatbot.description.1',
          'FeatureComparisonTable.features.chatbot.description.2',
          'FeatureComparisonTable.features.chatbot.description.3'
        ],
        requiresLogin: false,
        isNew: true
      }
    ]
  },
  {
    categoryNameKey: 'FeatureComparisonTable.categories.loggedIn',
    features: [
      {
        id: 'follow',
        nameKey: 'FeatureComparisonTable.features.follow.name',
        descriptionKey: 'FeatureComparisonTable.features.follow.description',
        requiresLogin: true
      },
      {
        id: 'feedback',
        nameKey: 'FeatureComparisonTable.features.feedback.name',
        descriptionKey: 'FeatureComparisonTable.features.feedback.description',
        requiresLogin: true
      },
      {
        id: 'notes',
        nameKey: 'FeatureComparisonTable.features.notes.name',
        descriptionKey: [
          'FeatureComparisonTable.features.notes.description.0',
          'FeatureComparisonTable.features.notes.description.1'
        ],
        requiresLogin: true
      },
      {
        id: 'submit_conf',
        nameKey: 'FeatureComparisonTable.features.submit_conf.name',
        descriptionKey:
          'FeatureComparisonTable.features.submit_conf.description',
        requiresLogin: true
      },
      {
        id: 'notifications',
        nameKey: 'FeatureComparisonTable.features.notifications.name',
        descriptionKey: [
          'FeatureComparisonTable.features.notifications.description.0',
          'FeatureComparisonTable.features.notifications.description.1'
        ],
        requiresLogin: true
      },
      {
        id: 'settings',
        nameKey: 'FeatureComparisonTable.features.settings.name',
        descriptionKey: [
          'FeatureComparisonTable.features.settings.description.0',
          'FeatureComparisonTable.features.settings.description.1'
        ],
        requiresLogin: true
      },
      {
        id: 'profile_update',
        nameKey: 'FeatureComparisonTable.features.profile_update.name',
        descriptionKey: [
          'FeatureComparisonTable.features.profile_update.description.0',
          'FeatureComparisonTable.features.profile_update.description.1',
          'FeatureComparisonTable.features.profile_update.description.2'
        ],
        requiresLogin: true
      },
      {
        id: 'chart_visualization',
        nameKey: 'FeatureComparisonTable.features.chart_visualization.name',
        descriptionKey:
          'FeatureComparisonTable.features.chart_visualization.description',
        requiresLogin: true,
        isNew: true
      }
    ]
  }
]

// --- Helper Components (Icons and Badge) ---

// Check Icon Component
const CheckIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={2.5}
    stroke='currentColor'
    className={`h-6 w-6 text-green-600 ${className}`}
    aria-hidden='true'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M4.5 12.75l6 6 9-13.5'
    />
  </svg>
)

// Cross Icon Component
const CrossIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={2.5}
    stroke='currentColor'
    className={`h-6 w-6 text-red-600 ${className}`}
    aria-hidden='true'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M6 18L18 6M6 6l12 12'
    />
  </svg>
)

// "NEW" Badge Component - Uses translations
const NewBadge: React.FC = () => {
  const t = useTranslations('Common') // Access the 'Common' namespace for shared terms
  return (
    <span className='ml-2 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 align-middle text-xs font-semibold text-blue-800'>
      {t('new')} {/* Display the translated "NEW" text */}
    </span>
  )
}

// Information Icon Component
const InformationCircleIcon: React.FC<{ className?: string }> = ({
  className = ''
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={`h-5 w-5 ${className}`}
    aria-hidden='true'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
    />
  </svg>
)

// --- Tooltip Content Renderer ---
// Renders the description inside the tooltip, fetching translations based on keys.
interface TooltipContentProps {
  descriptionKey: string | string[] // Accepts a single key or an array of keys
}

const TooltipContent: React.FC<TooltipContentProps> = ({ descriptionKey }) => {
  const t = useTranslations('') // Use the global namespace to access feature description keys

  // If descriptionKey is an array, translate and render each key as a list item
  if (Array.isArray(descriptionKey)) {
    return (
      <ul className='list-inside list-disc space-y-1 text-left text-xs'>
        {descriptionKey.map((key, index) => (
          <li key={index}>{t(key)}</li> // Translate each key
        ))}
      </ul>
    )
  }
  // If descriptionKey is a single string, translate and render it as a paragraph
  return <p className='text-left text-xs'>{t(descriptionKey)}</p>
}

// --- Main Table Component ---
const FeatureComparisonTable: React.FC = () => {
  // Initialize translation hooks for different namespaces
  const t = useTranslations('FeatureComparisonTable') // For table-specific text (title, headers, etc.)
  const tg = useTranslations('') // Global namespace for feature names/descriptions accessed via keys

  // State to manage which tooltip is currently active
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null)

  // Memoize the flattened list of all features from the config data
  // This prevents recalculating on every render
  const allFeatures = useMemo(
    () =>
      featureDataConfig.reduce(
        (acc, category) => acc.concat(category.features),
        [] as Feature[] // Type assertion
      ),
    [] // Dependency array is empty as featureDataConfig is static
  )

  return (
    <div className='w-full px-0 py-12 md:px-12'>
      {/* Display the translated table title */}
      <h2 className='mb-4 text-center text-xl font-semibold '>{t('title')}</h2>
      <div className='overflow-x-auto border border-gray-20 shadow-md sm:rounded-lg'>
        <table className='w-full text-left text-sm '>
          {/* Table Head */}
          <thead className='bg-gray-10 text-xs uppercase  '>
            <tr>
              {/* Display translated headers */}
              <th
                scope='col'
                className='w-2/4 border-b border-gray-30 px-8 py-5 '
              >
                {t('headers.feature')}
              </th>
              <th
                scope='col'
                className='border-b border-gray-30 px-8 py-5 text-center'
              >
                {t('headers.guest')}
                {/* Screen reader text, also translated */}
                <span className='sr-only'> {t('availability.available')}</span>
              </th>
              <th
                scope='col'
                className='border-b border-gray-30 px-8 py-5 text-center'
              >
                {t('headers.loggedIn')}
                {/* Screen reader text, also translated */}
                <span className='sr-only'> {t('availability.available')}</span>
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {/* Map through each feature to create a table row */}
            {allFeatures.map((feature, featureIndex) => (
              <tr
                key={feature.id}
                className={`border-b border-gray-20 last:border-b-0 ${
                  featureIndex % 2 === 0 ? 'bg-white-pure ' : 'bg-gray-5 '
                } transition-colors duration-150 hover:bg-gray-10`}
              >
                {/* Feature Name Column */}
                <td className='px-8 py-5 align-top'>
                  <div className='flex items-center space-x-2'>
                    {/* Display the translated feature name */}
                    <span className='font-medium '>{tg(feature.nameKey)}</span>
                    {/* Conditionally render the "NEW" badge */}
                    {feature.isNew && <NewBadge />}
                    {/* Tooltip Trigger Area */}
                    <div
                      className='relative flex cursor-help items-center'
                      onMouseEnter={() => setActiveTooltipId(feature.id)}
                      onMouseLeave={() => setActiveTooltipId(null)}
                    >
                      <InformationCircleIcon className=' hover:text-blue-600' />
                      {/* Conditionally render the tooltip */}
                      {activeTooltipId === feature.id && (
                        <div
                          className='absolute left-full top-1/2 z-20 ml-2 w-64 max-w-xs -translate-y-1/2 rounded-md  bg-white-pure p-3 shadow-lg'
                          role='tooltip'
                        >
                          {/* Render tooltip content using the keys */}
                          <TooltipContent
                            descriptionKey={feature.descriptionKey}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Guest User Availability Column */}
                <td className='px-8 py-5 text-center align-middle'>
                  <div className='inline-flex h-full w-full items-center justify-center'>
                    {feature.requiresLogin ? (
                      <>
                        <CrossIcon />
                        {/* Translated screen reader text for accessibility */}
                        <span className='sr-only'>
                          {t('availability.notAvailable')}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckIcon />
                        {/* Translated screen reader text for accessibility */}
                        <span className='sr-only'>
                          {t('availability.available')}
                        </span>
                      </>
                    )}
                  </div>
                </td>

                {/* Logged-in User Availability Column */}
                <td className='px-8 py-5 text-center align-middle'>
                  <div className='inline-flex h-full w-full items-center justify-center'>
                    <CheckIcon />
                    {/* Translated screen reader text for accessibility */}
                    <span className='sr-only'>
                      {t('availability.available')}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- Default Export ---
export default FeatureComparisonTable
