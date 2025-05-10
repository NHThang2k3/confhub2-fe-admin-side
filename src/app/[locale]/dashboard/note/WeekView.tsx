// WeekView.tsx
import React from 'react'
import { CalendarEvent } from './Calendar'

interface WeekViewProps {
  currentDate: Date
  shortMonthNames: string[]
  getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[]
  getEventTypeColor: (type: string) => string
  highlightedDate: Date | null
  calendarRef: React.RefObject<HTMLElement> // Add calendarRef prop
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  shortMonthNames,
  getDayEvents,
  getEventTypeColor,
  highlightedDate,
  calendarRef // Receive calendarRef
}) => {
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()) // Go to the beginning of the week (Sunday)

  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    days.push(day)
  }

  return (
    <div className='grid grid-cols-7 text-center'>
      {days.map(day => {
        const dayNumber = day.getDate()
        const dayEvents = getDayEvents(
          dayNumber,
          day.getMonth() + 1,
          day.getFullYear()
        )
        const isHighlighted =
          highlightedDate?.toDateString() === day.toDateString()

        return (
          <div
            key={day.toISOString()}
            className={`cursor-pointer border border-primary py-4 hover:bg-secondary ${
              isHighlighted ? 'bg-secondary' : ''
            }`}
            onClick={e => {
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
                      detail: { date: day, event: e }
                    })
                  )
                }
              }
            }} // Pass the full date and click event
            data-day={dayNumber}
          >
            <div className='pb-8 text-sm '>
              {shortMonthNames[day.getMonth()]} {dayNumber}
            </div>
            <div className='mt-0.5 flex flex-col gap-0.5'>
              {dayEvents.map((event, index) => (
                <div
                  key={`${event.conferenceId}-${index}`}
                  className={`px-1 py-0.5 text-xs ${getEventTypeColor(
                    event.type
                  )} cursor-pointer truncate text-white`}
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
                  }} // Pass event and click event
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

export default WeekView
