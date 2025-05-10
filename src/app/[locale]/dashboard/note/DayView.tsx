// DayView.tsx
import React from 'react'
import { CalendarEvent } from './Calendar'

interface DayViewProps {
  currentDate: Date
  getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[]
  getEventTypeColor: (type: string) => string
  highlightedDate: Date | null
  calendarRef: React.RefObject<HTMLElement> // Add calendarRef prop
}

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  getDayEvents,
  getEventTypeColor,
  highlightedDate,
  calendarRef
}) => {
  const dayNumber = currentDate.getDate()
  const dayEvents = getDayEvents(
    dayNumber,
    currentDate.getMonth() + 1,
    currentDate.getFullYear()
  )
  const isHighlighted =
    highlightedDate?.toDateString() === currentDate.toDateString()

  return (
    <div
      className={`cursor-pointer border border-primary py-4 hover:bg-secondary ${isHighlighted ? 'bg-secondary' : ''}`}
      onClick={e => {
        if (e.target instanceof HTMLElement) {
          const closestDiv = (e.target as HTMLElement).closest('div[data-day]')
          if (closestDiv) {
            // element is click in div has data-day attribute
            // open add note dialog.
            calendarRef.current?.dispatchEvent(
              new CustomEvent('open-add-note', {
                bubbles: true,
                detail: { date: currentDate, event: e }
              })
            )
          }
        }
      }} // Pass the full date and click event
      data-day={dayNumber}
    >
      <div className='pb-8 text-center text-sm '>
        {currentDate.toLocaleDateString()}
      </div>
      <div className='mt-0.5 flex flex-col items-center gap-0.5'>
        {dayEvents.map((event, index) => (
          <div
            key={`${event.conferenceId}-${index}`}
            className={`px-1 py-0.5 text-xs ${getEventTypeColor(event.type)} w-full cursor-pointer truncate text-center text-white`} // Added cursor-pointer
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
            }} // Handle event click
          >
            {event.title || event.conference.split('-')[0].trim()}{' '}
            {/* Display title or conference */}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DayView
