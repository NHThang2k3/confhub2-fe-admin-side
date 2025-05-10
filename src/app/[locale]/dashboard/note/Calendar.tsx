import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import MonthView from './MonthView'
import WeekView from './WeekView'
import DayView from './DayView'
import useDateNavigation from '../../../../hooks/dashboard/note/useDateNavigation'
import useEventFiltering from '../../../../hooks/dashboard/note/useEventFiltering'
import useDatePickerControl from '../../../../hooks/dashboard/note/useDatePickerControl'
import useViewSwitching from '../../../../hooks/dashboard/note/useViewSwitching'
import AddNoteDialog from './AddNoteDialog'
import { ConferenceResponse } from '../../../../models/response/conference.response'
import useDialogPosition from '../../../../hooks/dashboard/note/useDialogPosition'
import { useTranslations } from 'next-intl'
import { getConferenceFromDB } from '@/src/app/api/conference/getConferenceDetails'

const DEFAULT_DOM_RECT: DOMRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  toJSON: () => {}
}

export interface CalendarEvent {
  day: number
  month: number
  year: number
  startHour?: number
  startMinute?: number
  type: string
  conference: string
  conferenceId: string
  title?: string
  name?: string
}

interface CalendarProps {
  calendarEvents: CalendarEvent[]
}

const Calendar: React.FC<CalendarProps> = ({ calendarEvents }) => {
  const t = useTranslations('')

  const dateNavigation = useDateNavigation()
  const {
    currentDate,
    setCurrentDate,
    goToPreviousMonth,
    goToNextMonth,
    goToPreviousDay,
    goToNextDay,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    getWeek,
    getDaysInMonth,
    getFirstDayOfMonth
  } = dateNavigation

  const datePickerControl = useDatePickerControl()
  const { showDatePicker, toggleDatePicker, datePickerRef, setShowDatePicker } =
    datePickerControl

  const viewSwitching = useViewSwitching()
  const {
    view,
    setView,
    showViewOptions,
    toggleViewOptions,
    viewOptionsRef,
    scrollToDate
  } = viewSwitching

  const calendarRef = useRef<HTMLDivElement>(null)

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const [highlightedDate, setHighlightedDate] = useState<Date | null>(null)
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>(calendarEvents)

  const { searchText, setSearchText } = useEventFiltering(currentDate)

  const filteredEvents = useMemo(() => {
    const lowerCaseSearchText = searchText.toLowerCase()
    return allEvents.filter(
      event =>
        (event.conference &&
          event.conference.toLowerCase().includes(lowerCaseSearchText)) ||
        (event.type &&
          event.type.toLowerCase().includes(lowerCaseSearchText)) ||
        (event.title && event.title.toLowerCase().includes(lowerCaseSearchText))
    )
  }, [searchText, allEvents])

  const getDayEvents = useCallback(
    (
      day: number,
      month: number = currentDate.getMonth() + 1,
      year: number = currentDate.getFullYear()
    ): CalendarEvent[] => {
      return filteredEvents.filter(
        event =>
          event.day === day && event.month === month && event.year === year
      )
    },
    [filteredEvents, currentDate]
  ) // Correct dependencies

  const typeColors = useMemo(
    () => ({
      conferenceDates: 'bg-teal-500',
      submissionDate: 'bg-red-500',
      notificationDate: 'bg-blue-500',
      cameraReadyDate: 'bg-orange-500',
      registrationDate: 'bg-cyan-500'
    }),
    []
  )

  const getEventTypeColor = useCallback(
    (type: string) => {
      return typeColors[type as keyof typeof typeColors] || 'bg-gray-400'
    },
    [typeColors]
  )

  const handleDateSelect = useCallback(
    (date: Date) => {
      setCurrentDate(date)
      setView('day')
      setShowDatePicker(false)
    },
    [setCurrentDate, setView, setShowDatePicker]
  )

  useEffect(() => {
    scrollToDate(currentDate, view, calendarRef)
  }, [currentDate, view, scrollToDate])

  const monthNames = [
    t('January'),
    t('February'),
    t('March'),
    t('April'),
    t('May'),
    t('June'),
    t('July'),
    t('August'),
    t('September'),
    t('October'),
    t('November'),
    t('December')
  ]
  const shortMonthNames = [
    t('January_acronym'),
    t('February_acronym'),
    t('March_acronym'),
    t('April_acronym'),
    t('May_acronym'),
    t('June_acronym'),
    t('July_acronym'),
    t('August_acronym'),
    t('September_acronym'),
    t('October_acronym'),
    t('November_acronym'),
    t('December_acronym')
  ]
  const pickerDate = new Date(currentDate)

  // --- DIALOG STATE AND HANDLERS ---
  const [showDialog, setShowDialog] = useState(false)
  const [dialogDate, setDialogDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedEventDetail, setSelectedEventDetail] =
    useState<ConferenceResponse | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Use the new hook
  const { dialogPosition, calculateDialogPosition } = useDialogPosition(
    calendarRef,
    dialogRef,
    DEFAULT_DOM_RECT,
    view
  )

  const openAddNoteDialog = useCallback(
    (date: Date, event: React.MouseEvent) => {
      const target = event.currentTarget as HTMLElement
      const targetRect = target.getBoundingClientRect()

      setDialogDate(date)
      setSelectedEvent(null)
      setSelectedEventDetail(null)
      setShowDialog(true)
      setHighlightedDate(date)
      calculateDialogPosition(targetRect) // Call the hook's function
    },
    [calculateDialogPosition, setHighlightedDate]
  ) // Include calculateDialogPosition

  const openEventDetailsDialog = useCallback(
    async (event: CalendarEvent, clickEvent: React.MouseEvent) => {
      const target = clickEvent.currentTarget as HTMLElement
      const targetRect = target.getBoundingClientRect()

      setDialogDate(new Date(event.year, event.month - 1, event.day))
      setSelectedEvent(event)
      setShowDialog(true)
      setHighlightedDate(new Date(event.year, event.month - 1, event.day))

      if (event.conferenceId) {
        try {
          setLoadingDetails(true)
          const conferenceDetails = await getConferenceFromDB(
            event.conferenceId
          )
          setSelectedEventDetail(conferenceDetails)
        } catch (error) {
          console.error('Failed to fetch conference details:', error)
          setSelectedEventDetail(null)
        } finally {
          setLoadingDetails(false)
        }
      } else {
        setSelectedEventDetail(null)
      }
      calculateDialogPosition(targetRect) // Call the hook's function
    },
    [calculateDialogPosition, setHighlightedDate]
  ) // Include calculateDialogPosition

  const closeDialog = useCallback(() => {
    setShowDialog(false)
    setSelectedEvent(null)
    setSelectedEventDetail(null)
    setHighlightedDate(null)
  }, [setHighlightedDate])

  const handleAddEvent = useCallback(
    (title: string, eventType: 'Event' | 'Task' | 'Appointment') => {
      if (!dialogDate) return
      const newEvent: CalendarEvent = {
        day: dialogDate.getDate(),
        month: dialogDate.getMonth() + 1,
        year: dialogDate.getFullYear(),
        type: eventType,
        conference: '',
        conferenceId: '',
        title: title
      }
      setAllEvents(prevEvents => [...prevEvents, newEvent])
      closeDialog() // Uses useCallback version
    },
    [dialogDate, closeDialog]
  ) //  closeDialog

  useEffect(() => {
    const handleOpenAddNote = (e: any) => {
      openAddNoteDialog(e.detail.date, e.detail.event)
    }
    const handleOpenEventDetails = (e: any) => {
      openEventDetailsDialog(e.detail.event, e.detail.clickEvent)
    }
    const calendarElement = calendarRef.current

    calendarElement?.addEventListener('open-add-note', handleOpenAddNote)
    calendarElement?.addEventListener(
      'open-event-details',
      handleOpenEventDetails
    )

    return () => {
      calendarElement?.removeEventListener('open-add-note', handleOpenAddNote)
      calendarElement?.removeEventListener(
        'open-event-details',
        handleOpenEventDetails
      )
    }
  }, [calendarRef, openAddNoteDialog, openEventDetailsDialog]) // Correct dependencies

  return (
    <section
      className='relative rounded-md bg-background px-2 pt-2 shadow'
      ref={calendarRef}
    >
      <div className='mb-2 flex items-center justify-between'>
        <div className='flex items-center gap-2 px-2'>
          <div
            className='relative z-10 inline-block text-left'
            ref={viewOptionsRef}
          >
            <button
              type='button'
              className='inline-flex items-center justify-center rounded-md border border-background-secondary bg-background px-4 py-2 text-sm font-medium  shadow-sm hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              onClick={toggleViewOptions}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
              <svg
                className='-mr-1 ml-2 h-5 w-5'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path
                  fillRule='evenodd'
                  d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>

            <div
              className={`absolute left-0 mt-2 w-24 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-text-secondary ring-opacity-5 ${showViewOptions ? '' : 'hidden'}`}
            >
              <div
                className='py-1'
                role='menu'
                aria-orientation='vertical'
                aria-labelledby='options-menu'
              >
                <button
                  onClick={() => {
                    setView('day')
                    toggleViewOptions()
                  }}
                  className='block w-full px-4 py-2 text-left text-sm  hover:bg-background-secondary '
                  role='menuitem'
                >
                  {t('Day')}
                </button>
                <button
                  onClick={() => {
                    setView('week')
                    toggleViewOptions()
                  }}
                  className='block w-full px-4 py-2 text-left text-sm  hover:bg-background-secondary '
                  role='menuitem'
                >
                  {t('Week')}
                </button>
                <button
                  onClick={() => {
                    setView('month')
                    toggleViewOptions()
                  }}
                  className='block w-full px-4 py-2 text-left text-sm  hover:bg-background-secondary '
                  role='menuitem'
                >
                  {t('Month')}
                </button>
              </div>
            </div>
          </div>

          {view === 'month' && (
            <>
              <button onClick={goToPreviousMonth} className='rounded-full p-1 '>
                <svg
                  className='svg-inline--fa fa-arrow-left fa-w-14'
                  aria-hidden='true'
                  focusable='false'
                  data-prefix='fas'
                  data-icon='arrow-left'
                  role='img'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 448 512'
                  data-fa-i2svg=''
                  style={{
                    width: '14px',
                    height: '14px',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <path
                    fill='currentColor'
                    d='M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z'
                  ></path>
                </svg>
              </button>
              <div
                className='relative w-36 cursor-pointer text-center text-lg font-semibold'
                onClick={toggleDatePicker}
              >
                {monthNames[currentMonth]} {currentYear}
              </div>
              <button onClick={goToNextMonth} className='rounded-full p-1 '>
                <svg
                  className='svg-inline--fa fa-arrow-right fa-w-14'
                  aria-hidden='true'
                  focusable='false'
                  data-prefix='fas'
                  data-icon='arrow-right'
                  role='img'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 448 512'
                  data-fa-i2svg=''
                  style={{
                    width: '14px',
                    height: '14px',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <path
                    fill='currentColor'
                    d='M190.5 66.9l22.2-22.2c9.4 9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0-33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z'
                  ></path>
                </svg>
              </button>
            </>
          )}

          {view === 'day' && (
            <>
              <button onClick={goToPreviousDay} className='rounded-full p-1 '>
                <svg
                  className='svg-inline--fa fa-arrow-left fa-w-14'
                  aria-hidden='true'
                  focusable='false'
                  data-prefix='fas'
                  data-icon='arrow-left'
                  role='img'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 448 512'
                  data-fa-i2svg=''
                  style={{
                    width: '14px',
                    height: '14px',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <path
                    fill='currentColor'
                    d='M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z'
                  ></path>
                </svg>
              </button>
              <div
                className='w-36 cursor-pointer text-center text-lg font-semibold'
                onClick={toggleDatePicker}
              >
                {monthNames[currentMonth]} {currentDate.getDate()},{' '}
                {currentYear}
              </div>
              <button onClick={goToNextDay} className='rounded-full p-1 '>
                <svg
                  className='svg-inline--fa fa-arrow-right fa-w-14'
                  aria-hidden='true'
                  focusable='false'
                  data-prefix='fas'
                  data-icon='arrow-right'
                  role='img'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 448 512'
                  data-fa-i2svg=''
                  style={{
                    width: '14px',
                    height: '14px',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <path
                    fill='currentColor'
                    d='M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0-33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z'
                  ></path>
                </svg>
              </button>
            </>
          )}

          {view === 'week' && (
            <>
              <button onClick={goToPreviousWeek} className='rounded-full p-1 '>
                <svg
                  className='svg-inline--fa fa-arrow-left fa-w-14'
                  aria-hidden='true'
                  focusable='false'
                  data-prefix='fas'
                  data-icon='arrow-left'
                  role='img'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 448 512'
                  data-fa-i2svg=''
                  style={{
                    width: '14px',
                    height: '14px',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <path
                    fill='currentColor'
                    d='M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z'
                  ></path>
                </svg>
              </button>
              <div className='w-36 text-center text-lg font-semibold'>
                {t('Week')} {getWeek(currentDate)}, {currentYear}
              </div>
              <button onClick={goToNextWeek} className='rounded-full p-1 '>
                <svg
                  className='svg-inline--fa fa-arrow-right fa-w-14'
                  aria-hidden='true'
                  focusable='false'
                  data-prefix='fas'
                  data-icon='arrow-right'
                  role='img'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 448 512'
                  data-fa-i2svg=''
                  style={{
                    width: '14px',
                    height: '14px',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <path
                    fill='currentColor'
                    d='M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0-33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z'
                  ></path>
                </svg>
              </button>
            </>
          )}
        </div>

        <div className='mx-auto flex items-center'>
          <input
            type='text'
            placeholder={t('Search_events')}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className='rounded border bg-background p-2'
          />
        </div>

        <button
          onClick={goToToday}
          className='hover:bg-bakcground-secondary mx-2 rounded-md bg-background px-3 py-1 text-sm hover:bg-background-secondary'
        >
          {t('Today')}
        </button>
      </div>

      {showDatePicker && (
        <div
          ref={datePickerRef}
          className='absolute z-10 mt-2 rounded-md bg-background p-4 shadow-lg hover:bg-background-secondary'
          style={{ top: '50px', left: '50px' }}
        >
          <div className='mb-2 flex items-center justify-between'>
            <div className='flex-1 text-center font-bold'>
              {monthNames[pickerDate.getMonth()]} {pickerDate.getFullYear()}
            </div>
            <button
              onClick={() =>
                setCurrentDate(
                  prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                )
              }
              className='rounded-full p-1 '
            >
              <svg
                className='h-4 w-4 '
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M15 19l-7-7 7-7'
                ></path>
              </svg>
            </button>
            <button
              onClick={() =>
                setCurrentDate(
                  prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                )
              }
              className='rounded-full p-1 '
            >
              <svg
                className='0 h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 5l7 7-7 7'
                ></path>
              </svg>
            </button>
          </div>

          <div className='grid grid-cols-7 gap-1 text-center'>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className='0 text-xs font-medium'>
                {day}
              </div>
            ))}
          </div>
          <div className='grid grid-cols-7 gap-1 text-center'>
            {Array.from({ length: getFirstDayOfMonth(pickerDate) }).map(
              (_, index) => (
                <div key={`empty-${index}`} className='p-2'></div>
              )
            )}
            {Array.from({ length: getDaysInMonth(pickerDate) }).map(
              (_, dayIndex) => {
                const dayNumber = dayIndex + 1
                const date = new Date(
                  pickerDate.getFullYear(),
                  pickerDate.getMonth(),
                  dayNumber
                )
                const isCurrentDay =
                  date.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={dayNumber}
                    className={`cursor-pointer rounded-full p-2 hover:bg-blue-200 ${isCurrentDay ? 'bg-button ' : ''}`}
                    onClick={() => handleDateSelect(date)}
                  >
                    {dayNumber}
                  </div>
                )
              }
            )}
          </div>
        </div>
      )}

      {view === 'month' && (
        <MonthView
          currentMonth={currentMonth}
          currentYear={currentYear}
          daysInMonth={getDaysInMonth(currentDate)}
          firstDayOfMonth={getFirstDayOfMonth(currentDate)}
          getDayEvents={getDayEvents}
          getEventTypeColor={getEventTypeColor}
          highlightedDate={highlightedDate}
          calendarRef={calendarRef}
        />
      )}
      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          shortMonthNames={shortMonthNames}
          getDayEvents={getDayEvents}
          getEventTypeColor={getEventTypeColor}
          highlightedDate={highlightedDate}
          calendarRef={calendarRef}
        />
      )}
      {view === 'day' && (
        <DayView
          currentDate={currentDate}
          getDayEvents={getDayEvents}
          getEventTypeColor={getEventTypeColor}
          highlightedDate={highlightedDate}
          calendarRef={calendarRef}
        />
      )}

      {showDialog && dialogDate && (
        <div
          ref={dialogRef}
          style={{
            position: 'absolute',
            left: dialogPosition.x,
            top: dialogPosition.y,
            zIndex: 10
          }}
        >
          <AddNoteDialog
            date={dialogDate}
            onClose={closeDialog}
            onSave={handleAddEvent}
            event={selectedEvent}
            eventDetails={selectedEventDetail}
            loadingDetails={loadingDetails}
          />
        </div>
      )}
    </section>
  )
}

export default Calendar
