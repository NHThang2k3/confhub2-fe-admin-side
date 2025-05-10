'use client'

import React, { useMemo, useRef } from 'react' // Added useMemo
import { ConferenceResponse } from '../../../../models/response/conference.response'
import MapDisplay from './Map' // Renamed from Map to MapDisplay
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import useSectionNavigation from '../../../../hooks/conferenceDetails/useSectionNavigation'
import useActiveSection from '../../../../hooks/conferenceDetails/useActiveSection'
import { useTranslations } from 'next-intl'
import rehypeRaw from 'rehype-raw'

interface ConferenceTabsProps {
  conference: ConferenceResponse | null
}

type OrgType = ConferenceResponse['organizations'][number]
type RankType = NonNullable<ConferenceResponse['ranks']>[number] // Define RankType

type GroupedDateInfo = {
  name: string
  isNew: boolean // Added field to track new date names
  current: {
    fromDate: string | null | undefined
    toDate: string | null | undefined
  }
  differentOldDates: {
    fromDate: string | null | undefined
    toDate: string | null | undefined
  }[]
}

// Define a type for the grouped rank data
type GroupedRankInfo = {
  source: string
  rank: string
  fieldsOfResearch: string[]
}

export const ConferenceTabs: React.FC<ConferenceTabsProps> = ({
  conference
}) => {
  const navRef = useRef<HTMLElement>(null)
  const t = useTranslations('')
  const language = t('language')

  // --- Helper Functions ---
  const formatDate = (date: string | null | undefined): string => {
    // ... (formatDate function remains the same)
    if (!date) return t('TBD')
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        return t('Invalid_Date')
      }
      return dateObj.toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return t('Invalid_Date')
    }
  }

  // --- Find the LATEST organization based on createdAt ---
  const findLatestOrganization = (): OrgType | null => {
    // ... (findLatestOrganization function remains the same)
    if (!conference?.organizations || conference.organizations.length === 0)
      return null
    const latestOrg = conference.organizations.reduce(
      (latest: OrgType, current: OrgType): OrgType => {
        let currentCreatedAt: Date | null = null
        try {
          const date = new Date(current.createdAt)
          if (!isNaN(date.getTime())) currentCreatedAt = date
        } catch {}
        let latestCreatedAt: Date | null = null
        try {
          const date = new Date(latest.createdAt)
          if (!isNaN(date.getTime())) latestCreatedAt = date
        } catch {}
        if (
          currentCreatedAt &&
          (!latestCreatedAt || currentCreatedAt > latestCreatedAt)
        )
          return current
        return latest
      },
      conference.organizations[0]
    )
    return latestOrg
  }

  const latestOrganization = findLatestOrganization()

  // --- Prepare Grouped Dates for the "Important Dates" Section ---
  const getGroupedDates = (): GroupedDateInfo[] => {
    if (!conference?.organizations || !latestOrganization?.conferenceDates) {
      return []
    }

    const groupedDatesMap = new Map<string, GroupedDateInfo>()
    const latestOrgId = latestOrganization.id
    const olderDateNames = new Set<string>() // Set to store names from older orgs

    // --- First Pass: Collect all date names from older organizations ---
    conference.organizations.forEach(org => {
      if (org.id === latestOrgId) return // Skip the latest organization

      if (org.conferenceDates) {
        org.conferenceDates.forEach(oldDateItem => {
          if (oldDateItem?.name) {
            olderDateNames.add(oldDateItem.name) // Add name to the set
          }
        })
      }
    })

    // --- Second Pass: Process the latest organization's dates ---
    latestOrganization.conferenceDates.forEach(dateItem => {
      if (dateItem?.name) {
        const isNewName = !olderDateNames.has(dateItem.name) // Check if name exists in older orgs
        groupedDatesMap.set(dateItem.name, {
          name: dateItem.name,
          isNew: isNewName, // Set the isNew flag
          current: { fromDate: dateItem.fromDate, toDate: dateItem.toDate },
          differentOldDates: [] // Initialize empty, will be populated next
        })
      }
    })

    // --- Third Pass: Populate differentOldDates (as before) ---
    const addedOldDates = new Map<string, Set<string>>()
    conference.organizations.forEach(org => {
      if (org.id === latestOrgId) return // Skip latest again

      if (org.conferenceDates) {
        org.conferenceDates.forEach(oldDateItem => {
          const groupInfo = oldDateItem?.name
            ? groupedDatesMap.get(oldDateItem.name)
            : undefined

          // Only add different dates if the date NAME itself existed in the latest org
          if (groupInfo) {
            const current = groupInfo.current
            const oldFrom = oldDateItem.fromDate
            const oldTo = oldDateItem.toDate
            const isDifferent =
              current.fromDate !== oldFrom || current.toDate !== oldTo

            if (isDifferent) {
              const oldDateKey = `${oldFrom || 'null'}|${oldTo || 'null'}`
              if (!addedOldDates.has(groupInfo.name)) {
                addedOldDates.set(groupInfo.name, new Set<string>())
              }
              const nameSet = addedOldDates.get(groupInfo.name)!
              if (!nameSet.has(oldDateKey)) {
                groupInfo.differentOldDates.push({
                  fromDate: oldFrom,
                  toDate: oldTo
                })
                nameSet.add(oldDateKey)
              }
            }
          }
          // Note: We don't need to add dates here if the *name* itself didn't exist in the latest org
        })
      }
    })

    const result = Array.from(groupedDatesMap.values())
    result.sort((a, b) => a.name.localeCompare(b.name))
    return result
  }

  const groupedDates = getGroupedDates() // Call the updated function

  // --- Process and Group Ranks ---
  // Use useMemo to avoid recalculating on every render unless conference.ranks changes
  const processedRanks = useMemo(() => {
    if (!conference?.ranks || conference.ranks.length === 0) {
      return []
    }

    // Use a Map for efficient grouping. Key: "source-rank", Value: GroupedRankInfo
    const rankGroups = new Map<string, GroupedRankInfo>()

    conference.ranks.forEach(rank => {
      const source = rank.source || t('Not_Available') // Handle missing source
      const rankValue = rank.rank || t('Not_Available') // Handle missing rank
      const field = rank.fieldOfResearch

      const groupKey = `${source}-${rankValue}`

      if (rankGroups.has(groupKey)) {
        // Group exists, add field if it's valid and not already present (optional uniqueness check)
        const existingGroup = rankGroups.get(groupKey)!
        if (field && !existingGroup.fieldsOfResearch.includes(field)) {
          // Add only if field exists and is unique within the group
          existingGroup.fieldsOfResearch.push(field)
        }
      } else {
        // New group, create it
        rankGroups.set(groupKey, {
          source: source,
          rank: rankValue,
          fieldsOfResearch: field ? [field] : [] // Initialize with the first field if it exists
        })
      }
    })

    // Convert Map values to an array for rendering
    return Array.from(rankGroups.values())
  }, [conference?.ranks, t]) // Dependency array includes conference.ranks and t (for translations)

  // --- Other Data Extraction ---
  // Removed 'ranks' variable here as we use processedRanks now
  const topics = latestOrganization?.topics
  const primaryLocation = latestOrganization?.locations?.[0]
  const summary = latestOrganization?.summary || latestOrganization?.summerize
  const callForPaper = latestOrganization?.callForPaper
  const accessType = latestOrganization?.accessType // Not used currently, but kept if needed later

  // --- Extract Unique Fields of Research (for the combined section) ---
  const uniqueFieldsOfResearch = useMemo(() => {
    // This calculation remains useful for the dedicated "Field of Research" section
    return conference?.ranks
      ? [
          ...new Set(
            conference.ranks
              .map(rank => rank.fieldOfResearch)
              .filter((field): field is string => !!field) // Type guard for filtering
          )
        ]
      : []
  }, [conference?.ranks])

  // --- Hooks ---
  const sectionKeys = conference
    ? [
        'overview',
        'important-dates',
        'call-for-papers',
        'fieldOfResearch-topics', // Combined section
        ...(processedRanks.length > 0 ? ['source-rank'] : []), // Use processedRanks check
        'map'
      ]
    : []
  const sectionTranslationMap: { [key: string]: string } = {
    overview: 'Overview',
    'important-dates': 'Important_Dates',
    'call-for-papers': 'Call_for_papers',
    'fieldOfResearch-topics': 'FieldOfResearch_and_Topics', // Combined label
    'source-rank': 'Source_Rank',
    map: 'Map'
  }
  const { activeSection, setActiveSection } = useActiveSection({
    navRef,
    updatedSections: sectionKeys
  })
  useSectionNavigation({ navRef, setActiveSection })

  if (!conference) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <p className='text-lg '>{t('Loading_conference_details')}</p>
      </div>
    )
  }

  // --- JSX Rendering ---
  return (
    <div className='container mx-auto px-0 md:px-4'>
      {/* Navigation */}
      <nav
        ref={navRef}
        className='bg-white-pure sticky top-14 z-30 flex overflow-x-auto whitespace-nowrap border-b border-gray-200 bg-opacity-95 py-2 '
      >
        {/* ... (Navigation mapping remains the same) ... */}
        {sectionKeys.map(sectionKey => {
          const hrefId = sectionKey
          const href = `#${hrefId}`
          const translationKey = sectionTranslationMap[sectionKey] || sectionKey
          return (
            <a
              key={sectionKey}
              href={href}
              className={`rounded-lg px-2 py-2 font-medium transition-colors duration-200 md:px-4 ${activeSection === sectionKey ? 'bg-gray-10 text-blue-600 ' : ' hover:bg-gray-10 hover:text-blue-600 '}`}
            >
              {t(translationKey)}
            </a>
          )
        })}
      </nav>

      {/* Overview Section */}
      <section
        id='overview'
        className='bg-white-pure mt-4 rounded-lg px-2 py-4 shadow-md  md:px-4'
      >
        {/* ... (Overview section remains the same) ... */}
        <h2 className='mb-4 text-xl font-semibold md:text-2xl '>
          {t('Overview')}
        </h2>
        <p className='leading-relaxed '>
          {summary || t('No_summary_available')}
        </p>
      </section>

      {/* Important Dates Section */}
      <section
        id='important-dates'
        className='bg-white-pure mt-6 rounded-lg px-2 py-4 shadow-md  md:px-4'
      >
        <h2 className='mb-6 text-xl font-semibold md:text-2xl '>
          {t('Important_Dates')}
        </h2>
        {!groupedDates || groupedDates.length === 0 ? (
          <p className=''>{t('No_Important_Dates_Available')}</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='bg-white-pure min-w-full border border-gray-300 text-sm '>
              <thead className='bg-gray-10 '>
                <tr>
                  <th className='border-b border-gray-300 px-2 py-3 text-left md:px-4'>
                    {t('Name')}
                  </th>
                  <th className='border-b border-gray-300 px-2 py-3 text-left md:px-4'>
                    {t('From_Date')}
                  </th>
                  <th className='border-b border-gray-300 px-2 py-3 text-left md:px-4'>
                    {t('To_Date')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupedDates.map(groupInfo => (
                  <tr key={groupInfo.name} className='hover:bg-gray-5'>
                    {/* --- MODIFIED TD --- */}
                    <td className='border-b border-gray-300 px-2 py-4 font-medium md:px-4'>
                      {groupInfo.name}
                      {groupInfo.isNew && ( // Check the isNew flag
                        <span className='ml-2 inline-block rounded bg-green-100 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-green-700'>
                          {/* Added badge styling */}
                          NEW
                        </span>
                      )}
                    </td>
                    {/* --- END MODIFIED TD --- */}
                    <td className='border-b border-gray-300 px-2 py-4 md:px-4'>
                      {formatDate(groupInfo.current.fromDate)}
                      {groupInfo.differentOldDates.length > 0 && (
                        <span className='ml-2 text-xs text-gray-500'>
                          (
                          {groupInfo.differentOldDates.map((old, i) => (
                            <React.Fragment key={i}>
                              <span className='line-through'>
                                {formatDate(old.fromDate)}
                              </span>
                              {i < groupInfo.differentOldDates.length - 1 &&
                                ', '}
                            </React.Fragment>
                          ))}
                          )
                        </span>
                      )}
                    </td>
                    <td className='border-b border-gray-300 px-2 py-4 md:px-4'>
                      {formatDate(groupInfo.current.toDate)}
                      {groupInfo.differentOldDates.length > 0 && (
                        <span className='ml-2 text-xs '>
                          (
                          {groupInfo.differentOldDates.map((old, i) => (
                            <React.Fragment key={i}>
                              <span className='line-through'>
                                {formatDate(old.toDate)}
                              </span>
                              {i < groupInfo.differentOldDates.length - 1 &&
                                ', '}
                            </React.Fragment>
                          ))}
                          )
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {groupedDates.some(g => g.differentOldDates.length > 0) && (
              <p className='mt-2 text-xs italic '>
                {t(
                  'Strikethrough_values_indicate_different_dates_from_older_records'
                )}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Call for Papers Section */}
      <section
        id='call-for-papers'
        className='bg-white-pure mt-6 rounded-lg px-2 py-4 shadow-md  md:px-4'
      >
        {/* ... (Call for Papers section remains the same) ... */}
        <h2 className='mb-4 text-xl font-semibold md:text-2xl '>
          {t('Call_for_papers')}
        </h2>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ node, ...props }) => <p className='mb-2' {...props} />,
            a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
              <a
                {...props}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-500 hover:underline'
              />
            ),
            pre: ({ node, ...props }) => (
              <pre
                className='bg-gray-10 overflow-x-auto rounded-md p-2 '
                {...props}
              />
            ),
            code: ({ node, ...props }) => (
              <code className='bg-gray-10 rounded px-1 ' {...props} />
            ),
            h1: ({ node, ...props }) => (
              <h1 className='my-4 text-2xl font-bold' {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className='my-3 text-xl font-semibold' {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className='my-2 text-lg font-medium' {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className='my-2 list-inside list-disc' {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className='my-2 list-inside list-decimal' {...props} />
            ),
            li: ({ node, ...props }) => <li className='my-1' {...props} />
          }}
        >
          {callForPaper || t('No_call_for_papers_available')}
        </ReactMarkdown>
      </section>

      {/* Field of Research and Topics Section */}
      <section
        id='fieldOfResearch-topics'
        className='bg-white-pure mt-6 rounded-lg px-2 py-4 shadow-md  md:px-4'
      >
        {/* ... (Field of Research and Topics section remains the same) ... */}
        <h2 className='mb-6 text-xl font-semibold md:text-2xl '>
          {t('FieldOfResearch_and_Topics')}
        </h2>

        {/* Field of Research Subsection */}
        <div className='mb-6'>
          {' '}
          {/* Add margin-bottom to separate subsections */}
          <h3 className='mb-2 text-lg font-medium '>
            {' '}
            {/* Slightly smaller heading */}
            {t('Field_Of_Research')}
          </h3>
          {uniqueFieldsOfResearch.length > 0 ? (
            <ul className='list-disc pl-5'>
              {' '}
              {/* Use a list for multiple fields */}
              {uniqueFieldsOfResearch.map((field, index) => (
                <li key={index} className='mb-1'>
                  {field}
                </li>
              ))}
            </ul>
          ) : (
            <p className=''>{t('fieldOfResearch_not_available')}</p>
          )}
        </div>

        {/* Topics Subsection */}
        <div>
          <h3 className='mb-2 text-lg font-medium '>{t('Topics')}</h3>{' '}
          {/* Slightly smaller heading */}
          {topics && topics.length > 0 ? (
            <ul className='grid list-disc grid-cols-1 gap-x-12 gap-y-2 pl-5 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2'>
              {' '}
              {/* Adjusted padding */}
              {topics.map((topic, index) => (
                <li key={index} className='mb-1'>
                  {' '}
                  {/* Added margin-bottom */}
                  {typeof topic === 'string' ? topic : t('Invalid_Topic')}
                </li>
              ))}
            </ul>
          ) : (
            <p className=''>{t('No_topics_available')}</p>
          )}
        </div>
      </section>

      {/* --- REFACTORED Source Rank Section --- */}
      {processedRanks.length > 0 && (
        <section
          id='source-rank'
          className='bg-white-pure mt-6 rounded-lg px-2 py-4 shadow-md  md:px-4'
        >
          <h2 className='mb-6 text-xl font-semibold md:text-2xl '>
            {t('Source_Rank')}
          </h2>
          {/* Iterate over the processed (grouped) ranks */}
          {processedRanks.map((group, index) => (
            <div
              // Use a combination of source, rank, and index for a stable key
              key={`${group.source}-${group.rank}-${index}`}
              className='mb-4 border-b border-gray-200 pb-4 last:mb-0 last:border-b-0 last:pb-0'
            >
              <p className=''>
                <strong>{t('Source')}:</strong> {group.source}{' '}
                {/* Already handled potential null in grouping */}
              </p>
              <p className=''>
                <strong>{t('Rank')}:</strong> {group.rank}{' '}
                {/* Already handled potential null in grouping */}
              </p>
              <p className=''>
                <strong>{t('Field_of_Research')}:</strong>{' '}
                {/* Join the collected fields with a comma and space */}
                {group.fieldsOfResearch.length > 0
                  ? group.fieldsOfResearch.join(', ')
                  : t('Not_Available')}
              </p>
            </div>
          ))}
        </section>
      )}
      {/* --- END REFACTORED Section --- */}

      {/* Map Section */}
      <section
        id='map'
        className='bg-white-pure mt-6 rounded-lg px-2 py-4 shadow-md  md:px-4'
      >
        {/* ... (Map section remains the same) ... */}
        <h2 className='mb-4 text-xl font-semibold md:text-2xl '>{t('Map')}</h2>
        {primaryLocation?.address ? (
          <MapDisplay location={primaryLocation.address} />
        ) : (
          <p className=''>{t('Location_information_is_not_available')}</p>
        )}
      </section>
    </div>
  )
}
