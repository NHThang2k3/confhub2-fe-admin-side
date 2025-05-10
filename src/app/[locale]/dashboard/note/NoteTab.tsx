// NoteTab.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react'
import Calendar from './Calendar'
import { CalendarEvent } from './Calendar'
import {
  ConferenceResponse,
  ImportantDate
} from '../../../../models/response/conference.response'
import { Link } from '@/src/navigation'
import Button from '../../utils/Button'
import { useTranslations } from 'next-intl'
import { getConferenceFromDB } from '@/src/app/api/conference/getConferenceDetails'
import { appConfig } from '@/src/middleware'

interface NoteTabProps {}

const API_GET_USER_CALENDAR_ENDPOINT = `${process.env.NEXT_PUBLIC_DATABASE_URL}`

const NoteTab: React.FC<NoteTabProps> = () => {
  const t = useTranslations('')

  const [upcomingNotes, setUpcomingNotes] = useState<any[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leftWidth, setLeftWidth] = useState(50) // Initial width: 50%
  const [isResizing, setIsResizing] = useState(false)
  const leftSectionRef = useRef<HTMLDivElement>(null)
  const rightSectionRef = useRef<HTMLDivElement>(null)
  const notesContainerRef = useRef<HTMLDivElement>(null) // Ref for notes container
  // Helper function for calculating note width with gap
  let notesPerRow = 3
  type NoteType =
    | 'conferenceDates'
    | 'submissionDate'
    | 'notificationDate'
    | 'cameraReadyDate'
    | 'registrationDate'
    | 'yourNote'

  const typeColors = useMemo(
    () => ({
      conferenceDates: 'bg-teal-200',
      submissionDate: 'bg-red-200',
      notificationDate: 'bg-blue-200',
      cameraReadyDate: 'bg-orange-200',
      registrationDate: 'bg-cyan-200',
      yourNote: 'bg-yellow-200',
      other: 'bg-gray-200'
    }),
    []
  )

  const getEventTypeColor = (type: NoteType) => {
    return typeColors[type] || typeColors['other']
  }

  const getTypeText = (type: NoteType) => {
    switch (type) {
      case 'conferenceDates':
        return 'Conference Date'
      case 'submissionDate':
        return 'Submission Date'
      case 'notificationDate':
        return 'Notification Date'
      case 'cameraReadyDate':
        return 'Camera Ready Date'
      case 'registrationDate':
        return 'Registration Date'
      case 'yourNote':
        return 'Your Note'
      default:
        return 'Other Date'
    }
  }

  const areDatesContiguous = (date1: Date, date2: Date): boolean => {
    const diffInTime = Math.abs(date2.getTime() - date1.getTime())
    const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24))
    return diffInDays === 1
  }

  const startResizing = () => {
    setIsResizing(true)
  }

  const resize = (e: MouseEvent) => {
    if (!isResizing || !leftSectionRef.current || !rightSectionRef.current)
      return

    const container = leftSectionRef.current.parentElement
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const newLeftWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100

    const minWidth = 10
    const maxWidth = 90

    if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
      setLeftWidth(newLeftWidth)
    }
    updateNotesPerRow() // Update notes during resize
  }

  const stopResizing = () => {
    setIsResizing(false)
  }

  const updateNotesPerRow = () => {
    if (notesContainerRef.current) {
      const width = notesContainerRef.current.offsetWidth
      if (width < 640) {
        // sm breakpoint
        notesPerRow = 1
      } else if (width < 1024) {
        // Between sm and lg
        notesPerRow = 2
      } else {
        notesPerRow = 3
      }
    }
  }
  useEffect(() => {
    updateNotesPerRow()
  }, [leftWidth])
  useEffect(() => {
    window.addEventListener('resize', updateNotesPerRow)
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResizing)

    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
      window.removeEventListener('resize', updateNotesPerRow)
    }
  }, [isResizing]) // Dependency on isResizing

  useEffect(() => {
    const fetchData = async () => {
      // ... (rest of your fetchData logic, no changes needed here) ...
      try {
        const userData = localStorage.getItem('user')
        if (!userData) {
          setLoggedIn(false)
          setLoading(false)
          return
        }

        const user = JSON.parse(userData)
        setLoggedIn(true)

        const calendarResponse = await fetch(
          `${API_GET_USER_CALENDAR_ENDPOINT}/api/v1/calendar/events`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (!calendarResponse.ok) {
          const errorMessage =
            calendarResponse.status === 404
              ? 'Calendar not found for this user.'
              : `HTTP error! status: ${calendarResponse.status}`
          setError(errorMessage)
          throw new Error(errorMessage)
        }

        const calendarData: CalendarEvent[] = await calendarResponse.json()
        setCalendarEvents(calendarData)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcoming = calendarData
          .filter(event => {
            const eventDate = new Date(event.year, event.month - 1, event.day)
            return eventDate >= today
          })
          .sort((a, b) => {
            const dateA = new Date(a.year, a.month - 1, a.day)
            const dateB = new Date(b.year, b.month - 1, b.day)
            return dateA.getTime() - dateB.getTime()
          })

        const notesWithLocation = await Promise.all(
          upcoming.map(async event => {
            const eventDate = new Date(event.year, event.month - 1, event.day)
            const formattedDate = eventDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
            const timeDiff = eventDate.getTime() - new Date().getTime()
            const daysLeft = Math.max(
              0,
              Math.floor(timeDiff / (1000 * 60 * 60 * 24))
            )
            const hoursLeft = Math.max(
              0,
              Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            )
            const countdownString = `${daysLeft}d ${hoursLeft}h `

            try {
              const conferenceDetails: ConferenceResponse =
                await getConferenceFromDB(event.conferenceId)

              let eventName = ''
              if (conferenceDetails.organizations[0].conferenceDates) {
                const matchingDate =
                  conferenceDetails.organizations[0].conferenceDates.find(
                    (d: ImportantDate) => {
                      if (!d) return false
                      const fromDate = d.fromDate ? new Date(d.fromDate) : null
                      const toDate = d.toDate ? new Date(d.toDate) : null
                      const checkDate = new Date(
                        event.year,
                        event.month - 1,
                        event.day
                      )

                      return (
                        (fromDate &&
                          checkDate.getFullYear() === fromDate.getFullYear() &&
                          checkDate.getMonth() === fromDate.getMonth() &&
                          checkDate.getDate() === fromDate.getDate()) ||
                        (fromDate &&
                          toDate &&
                          checkDate >= fromDate &&
                          checkDate <= toDate)
                      )
                    }
                  )

                if (matchingDate && matchingDate.name) {
                  eventName = matchingDate.name
                }
              }

              return {
                type: event.type,
                conference: event.conference,
                id: event.conferenceId,
                location: `${conferenceDetails.organizations[0].locations[0].cityStateProvince}, ${conferenceDetails.organizations[0].locations[0].country}`,
                date: formattedDate,
                countdown: countdownString,
                year: event.year,
                month: event.month,
                day: event.day,
                name: eventName
              }
            } catch (locationError) {
              console.error(
                `Error fetching location for conference ${event.conferenceId}:`,
                locationError
              )
              return {
                type: event.type,
                conference: event.conference,
                id: event.conferenceId,
                location: 'Location unavailable',
                date: formattedDate,
                countdown: countdownString,
                year: event.year,
                month: event.month,
                day: event.day,
                name: ''
              }
            }
          })
        )

        const groupedNotes: { [key: string]: any } = {}
        notesWithLocation.forEach(note => {
          const key = `${note.id}-${note.type}`
          let addedToGroup = false

          for (const existingKey in groupedNotes) {
            if (existingKey.startsWith(key)) {
              const existingGroup = groupedNotes[existingKey]
              const lastDateInGroup = new Date(
                existingGroup.dates[existingGroup.dates.length - 1].year,
                existingGroup.dates[existingGroup.dates.length - 1].month - 1,
                existingGroup.dates[existingGroup.dates.length - 1].day
              )
              const currentDate = new Date(note.year, note.month - 1, note.day)

              if (areDatesContiguous(lastDateInGroup, currentDate)) {
                existingGroup.dates.push({
                  year: note.year,
                  month: note.month,
                  day: note.day
                })
                addedToGroup = true
                break
              }
            }
          }

          if (!addedToGroup) {
            const newKey = `${key}-${note.year}-${note.month}-${note.day}`
            groupedNotes[newKey] = {
              ...note,
              dates: [{ year: note.year, month: note.month, day: note.day }]
            }
          }
        })

        const finalUpcomingNotes = Object.values(groupedNotes)
          .map((note: any) => {
            const typeText = getTypeText(note.type as NoteType)

            if (note.dates.length > 1) {
              note.dates.sort((a: any, b: any) => {
                const dateA = new Date(a.year, a.month - 1, a.day)
                const dateB = new Date(b.year, b.month - 1, b.day)
                return dateA.getTime() - dateB.getTime()
              })
              const startDate = note.dates[0]
              const endDate = note.dates[note.dates.length - 1]
              const startDateObj = new Date(
                startDate.year,
                startDate.month - 1,
                startDate.day
              )
              const endDateObj = new Date(
                endDate.year,
                endDate.month - 1,
                endDate.day
              )

              const options: Intl.DateTimeFormatOptions = {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }

              let formattedDateRange = ''
              if (
                startDate.year === endDate.year &&
                startDate.month === endDate.month
              ) {
                const startDay = startDateObj.toLocaleDateString('en-US', {
                  day: 'numeric'
                })
                const endDay = endDateObj.toLocaleDateString('en-US', {
                  day: 'numeric'
                })
                const monthYear = startDateObj.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })
                formattedDateRange = `${startDay} - ${endDay} ${monthYear}`
              } else if (startDate.year === endDate.year) {
                formattedDateRange = `${startDateObj.toLocaleDateString(
                  'en-US',
                  {
                    month: 'long',
                    day: 'numeric'
                  }
                )} - ${endDateObj.toLocaleDateString('en-US', options)}`
              } else {
                formattedDateRange = `${startDateObj.toLocaleDateString('en-US', options)} - ${endDateObj.toLocaleDateString(
                  'en-US',
                  options
                )}`
              }

              return { ...note, date: formattedDateRange, typeText }
            } else {
              const date = note.dates[0]
              const dateObj = new Date(date.year, date.month - 1, date.day)
              const options: Intl.DateTimeFormatOptions = {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }
              const formattedDate = dateObj.toLocaleDateString('en-US', options)
              return { ...note, date: formattedDate, typeText }
            }
          })
          .slice(0, 6)

        setUpcomingNotes(finalUpcomingNotes)
        updateNotesPerRow() // Update after data fetch
      } catch (error: any) {
        console.error('Failed to fetch calendar data:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (!loggedIn) {
    return (
      <div className='container mx-auto p-4'>
        {t('Please_log_in_to_view_your_calendar')}
      </div>
    )
  }

  if (loading) {
    return <div className='container mx-auto p-4'>{t('Loading')}</div>
  }

  if (error) {
    return <div className='container mx-auto p-4 text-red-500'>{error}</div>
  }

  const getNoteWidth = () => {
    return `calc((100% / ${notesPerRow}) - 1rem)` // 1rem gap, adjust as needed
  }

  return (
    <div className='flex h-full flex-col bg-background p-2 md:p-4'>
      {/* Dates Details Section */}
      <section className='mb-4 rounded-md bg-background px-4 pb-6 pt-4 shadow'>
        <h2 className='mb-4 text-lg font-semibold'>{t('Dates_details')}</h2>
        <ul className='flex flex-row gap-4'>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-teal-400'></div>
            <span className='text-sm '>{t('Conference')}</span>
          </li>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-red-400'></div>
            <span className='text-sm '>{t('Submission')}</span>
          </li>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-blue-400'></div>
            <span className='text-sm '>{t('Notification')}</span>
          </li>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-orange-400'></div>
            <span className='text-sm '>{t('Camera_Ready')}</span>
          </li>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-cyan-400'></div>
            <span className='text-sm '>{t('Registration')}</span>
          </li>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-gray-400'></div>
            <span className='text-sm '>{t('Other')}</span>
          </li>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-yellow-400'></div>
            <span className='text-sm '>{t('Your_notes')}</span>
          </li>
        </ul>
      </section>
      <div className='flex flex-grow'>
        <div
          ref={leftSectionRef}
          style={{ width: `${leftWidth}%` }}
          className='overflow-auto p-2 md:p-4'
        >
          {/* Upcoming Notes Section */}
          <section className='mb-4 rounded-md bg-background p-2 shadow md:p-4'>
            <h2 className='mb-2 text-lg font-semibold'>
              {t('Upcoming_Notes')}
            </h2>
            {upcomingNotes.length === 0 ? (
              <p>{t('Nothing_important_dates_coming_up')}</p>
            ) : (
              <div
                ref={notesContainerRef}
                className='flex flex-row flex-wrap gap-4'
              >
                {upcomingNotes.map((note, index) => (
                  <div
                    key={index}
                    className={`
                      w-full rounded-md border p-4 shadow-md
                      ${notesPerRow === 2 ? `sm:w-[${getNoteWidth()}]` : ''}
                      ${notesPerRow === 3 ? `md:w-[${getNoteWidth()}]` : ''}
                      ${getEventTypeColor(note.type as NoteType)}
                    `}
                  >
                    <div className='flex h-full flex-col'>
                      <div className='h-3/4'>
                        <h3 className='text-lg font-semibold'>
                          {note.conference}
                        </h3>
                        <div className='mt-1 flex items-center'>
                          <span className='text-sm'>{note.location}</span>
                        </div>
                        <p className='mt-1 text-sm font-semibold'>
                          {note.name ? `${note.name}: ` : ''} {note.date}
                        </p>
                        <p className='mt-1 text-xs'>({note.typeText})</p>
                      </div>
                      <div className='flex h-1/4 items-end'>
                        <div className='mt-2 flex w-full items-center justify-between'>
                          <div className='rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700'>
                            {note.countdown}
                          </div>
                          <Link
                            href={{
                              pathname: '/conferences/detail',
                              query: { id: note.id }
                            }}
                          >
                            <Button className='hover: text-xs text-button'>
                              {t('More_details')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Resizer */}
        <div
          className={`cursor-col-resize  ${isResizing ? 'bg-blue-500' : 'bg-gray-300'}`} // Change color on mousedown
          onMouseDown={startResizing}
          style={{ width: '5px' }} // Smaller width
        ></div>

        {/* Calendar Section */}
        <div
          ref={rightSectionRef}
          style={{ width: `calc(${100 - leftWidth}% - 3px)` }}
          className='overflow-auto p-4'
        >
          <Calendar calendarEvents={calendarEvents} />
        </div>
      </div>
    </div>
  )
}

export default NoteTab
