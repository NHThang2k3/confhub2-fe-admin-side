// MonthView.tsx
import React from 'react'
import { CalendarEvent } from './Calendar'
import { useTranslations } from 'next-intl'

interface MonthViewProps {
  currentMonth: number
  currentYear: number
  daysInMonth: number
  firstDayOfMonth: number
  getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[]
  getEventTypeColor: (type: string) => string
  highlightedDate: Date | null
  calendarRef: React.RefObject<HTMLElement> // Add calendarRef prop
}

const MonthView: React.FC<MonthViewProps> = ({
  currentMonth,
  currentYear,
  daysInMonth,
  firstDayOfMonth,
  getDayEvents,
  getEventTypeColor,
  highlightedDate,
  calendarRef // Receive calendarRef
}) => {
  const t = useTranslations('')

  const daysInWeek = [
    t('Sun'),
    t('Mon'),
    t('Tue'),
    t('Wed'),
    t('Thu'),
    t('Fri'),
    t('Sat')
  ]

  return (
    <div className='grid grid-cols-7 text-center'>
      {daysInWeek.map(day => (
        <div key={day} className='font-medium '>
          {day}
        </div>
      ))}

      {Array.from({ length: firstDayOfMonth }).map((_, index) => (
        <div key={`empty-${index}`} className='p-1'></div>
      ))}

      {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
        const dayNumber = dayIndex + 1
        const dayEvents = getDayEvents(dayNumber, currentMonth + 1, currentYear)
        const isHighlighted =
          highlightedDate?.getDate() === dayNumber &&
          highlightedDate?.getMonth() === currentMonth &&
          highlightedDate?.getFullYear() === currentYear

        return (
          <div
            key={dayNumber}
            className={`cursor-pointer border border-primary py-4 hover:bg-secondary ${isHighlighted ? 'bg-secondary' : ''}`}
            onClick={e => {
              const date = new Date(currentYear, currentMonth, dayNumber)
              if (e.target instanceof HTMLElement) {
                const closestDiv = (e.target as HTMLElement).closest(
                  'div[data-day]'
                )
                if (closestDiv) {
                  // element is click in div has data-day attribute
                  // open add note dialog.
                  calendarRef.current?.dispatchEvent(
                    new CustomEvent('open-add-note', {
                      bubbles: true,
                      detail: { date: date, event: e }
                    })
                  )
                }
              }
            }} // Pass click event
            data-day={dayNumber}
          >
            <div className='pb-8 text-sm '>{dayNumber}</div>
            <div className='mt-0.5 flex flex-col gap-0.5'>
              {dayEvents.map((event, index) => (
                <div
                  key={`${event.conferenceId}-${index}`}
                  className={`px-1 py-0.5 text-xs ${getEventTypeColor(event.type)} cursor-pointer truncate text-white`}
                  title={event.conference}
                  onClick={e => {
                    e.stopPropagation()
                    if (e.target instanceof HTMLElement) {
                      calendarRef.current?.dispatchEvent(
                        new CustomEvent('open-event-details', {
                          bubbles: true,
                          detail: { event: event, clickEvent: e }
                        })
                      )
                    }
                  }} // Pass event data and click event
                >
                  {event.title || event.conference.split('-')[0].trim()}{' '}
                  {/* Display title or conference */}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MonthView
