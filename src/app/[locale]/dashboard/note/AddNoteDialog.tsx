// AddNoteDialog.tsx
import React, { useState, useEffect, useRef } from 'react'
import { CalendarEvent } from './Calendar' // Import
import Image from 'next/image'

interface AddNoteDialogProps {
  date: Date
  onClose: () => void
  onSave: (note: string, eventType: 'Event' | 'Task' | 'Appointment') => void
  event?: CalendarEvent | null // Optional event prop
  eventDetails?: any | null // Optional event details
  loadingDetails?: boolean
}

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  date,
  onClose,
  onSave,
  event,
  eventDetails,
  loadingDetails
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState<'Event' | 'Task' | 'Appointment'>(
    'Event'
  )

  const [showLocationInput, setShowLocationInput] = useState(false)
  const [location, setLocation] = useState('')
  const [showGuestsInput, setShowGuestsInput] = useState(false)
  const [guests, setGuests] = useState('')
  const [showMeetInput, setShowMeetInput] = useState(false)
  const [meetLink, setMeetLink] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState(false)
  const [showEndTimeDropdown, setShowEndTimeDropdown] = useState(false)
  const startTimeRef = useRef(null)
  const endTimeRef = useRef(null)
  const formattedDate = date.toISOString().split('T')[0]

  // Generate time options (e.g., every 15 minutes)
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hourStr = String(hour).padStart(2, '0')
        const minuteStr = String(minute).padStart(2, '0')
        options.push(`${hourStr}:${minuteStr}`)
      }
    }
    return options
  }
  const timeOptions = generateTimeOptions()

  const handleSaveWithTimes = () => {
    if (allDay) {
      // handleSave({ title, description, location, guests, meetLink, date: formattedDate, startTime: '00:00', endTime: '23:59' });
    } else {
      if (!startTime || !endTime) {
        alert('Please select both start and end times.')
        return
      }
      // handleSave({ title, description, location, guests, meetLink, date: formattedDate, startTime, endTime });
    }
  }

  // Update state when the event prop changes (for editing)
  useEffect(() => {
    if (event) {
      setTitle(event.title || '') // Use title if available
      setEventType(event.type as 'Event' | 'Task' | 'Appointment')
      // You might set other fields here, like description, based on your event data
    } else {
      // Reset to defaults when adding a new note
      setTitle('')
      setDescription('')
      setEventType('Event')
    }
  }, [event])

  const handleDelete = () => {
    // Implement your delete logic here.  You'll likely need a way
    // to identify the event to delete (e.g., using a unique ID).
    // You might need an `onDelete` prop similar to `onSave`.
    console.log('Delete event:', event)
    onClose()
  }

  const renderAddEditView = () => {
    return (
      <>
        <h2 className='mb-4 text-lg font-semibold'>
          {event ? 'Edit Event' : ''}
          {/* Added "Add Event" for clarity */}
        </h2>

        <div className='relative mb-4 font-bold'>
          <input
            type='text'
            placeholder='Add title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            className='w-full bg-background py-2 placeholder-secondary focus:border-b-2 focus:border-background-secondary focus:outline-none'
          />
        </div>

        <div className='mb-4 flex items-center text-sm'>
          <div className='mr-4 '>{formattedDate}</div>
          {/* <div className='flex items-center'> */}
          <div className='relative' ref={startTimeRef}>
            <input
              type='text'
              placeholder='Start Time'
              value={startTime}
              onClick={() => setShowStartTimeDropdown(!showStartTimeDropdown)}
              readOnly // Important: Prevent keyboard input
              className='mr-1 w-16 cursor-pointer bg-background py-2 text-center text-sm  placeholder-text-secondary focus:border-b focus:outline-none focus:ring-2 focus:ring-button'
              disabled={allDay}
            />

            {showStartTimeDropdown && (
              <div className='absolute z-10 max-h-40 w-20 overflow-y-auto rounded border bg-background text-sm shadow-md scrollbar-none'>
                {timeOptions.map(time => (
                  <div
                    key={time}
                    className='cursor-pointer px-3 py-1 hover:bg-gray-100'
                    onClick={() => {
                      setStartTime(time)
                      setShowStartTimeDropdown(false)
                    }}
                  >
                    {time}
                  </div>
                ))}
              </div>
            )}
          </div>
          <span>-</span>
          <div className='relative ml-2' ref={endTimeRef}>
            <input
              type='text'
              placeholder='End Time'
              value={endTime}
              onClick={() => setShowEndTimeDropdown(!showEndTimeDropdown)}
              readOnly // Prevent keyboard input
              className='ml-1 w-16 cursor-pointer bg-background py-2 text-center text-sm placeholder-text-secondary focus:border-b focus:outline-none focus:ring-2 focus:ring-button'
              disabled={allDay}
            />

            {showEndTimeDropdown && (
              <div className='absolute z-10 max-h-40 w-20 overflow-y-auto rounded border bg-background shadow-md scrollbar-none'>
                {timeOptions.map(time => (
                  <div
                    key={time}
                    className=' cursor-pointer px-3 py-1 '
                    onClick={() => {
                      setEndTime(time)
                      setShowEndTimeDropdown(false)
                    }}
                  >
                    {time}
                  </div>
                ))}
              </div>
            )}
          </div>
          <label className='ml-4 flex items-center'>
            <input
              type='checkbox'
              checked={allDay}
              onChange={e => setAllDay(e.target.checked)}
              className='mr-2 h-4 w-4  bg-background' // Added h-4 w-4 for better checkbox size
            />
            All Day
          </label>
        </div>
        {/* </div> */}

        {/* Guests */}
        <div className='relative mb-4 flex items-center text-sm'>
          {/* Guests Icon */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='mr-2 h-5 w-5 '
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z'
            />
          </svg>
          {showGuestsInput ? (
            <input
              type='text'
              placeholder='Add guests'
              value={guests}
              onChange={e => setGuests(e.target.value)}
              className='w-full bg-background py-2 placeholder-text-secondary focus:border-b-2 focus:border-background-secondary focus:outline-none'
              onBlur={() => setShowGuestsInput(false)}
              autoFocus
            />
          ) : (
            <div
              className='flex cursor-pointer items-center py-2'
              onClick={() => setShowGuestsInput(true)}
            >
              Add guests
            </div>
          )}
        </div>

        {/* Google Meet */}
        <div className='relative mb-4 flex items-center text-sm'>
          {/* Google Meet Icon */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='mr-2 h-5 w-5 '
          >
            <path
              fillRule='evenodd'
              d='M1.5 7.125c0-1.036.84-1.875 1.875-1.875h6c1.036 0 1.875.84 1.875 1.875V9h-9.75V7.125ZM4.125 11.25h17.25c1.035 0 1.875.84 1.875 1.875v6c0 1.036-.84 1.875-1.875 1.875h-17.25A1.875 1.875 0 0 1 2.25 19.125v-6c0-1.035.84-1.875 1.875-1.875Zm6 3.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm3-.75a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Zm4.5.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm-9-3a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Zm3-.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm4.5.75a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Z'
              clipRule='evenodd'
            />
          </svg>
          {showMeetInput ? (
            <input
              type='text'
              placeholder='Add Google Meet '
              value={meetLink}
              onChange={e => setMeetLink(e.target.value)}
              className='w-full bg-background py-2 placeholder-text-secondary focus:border-b-2 focus:border-background-secondary focus:outline-none'
              onBlur={() => setShowMeetInput(false)}
              autoFocus
            />
          ) : (
            <div
              className='flex cursor-pointer items-center py-2'
              onClick={() => setShowMeetInput(true)}
            >
              Add Google Meet
            </div>
          )}
        </div>

        {/* Location */}
        <div className='relative mb-4 flex items-center text-sm'>
          {/* Location Icon */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='mr-2 h-5 w-5 '
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z'
            />
          </svg>
          {showLocationInput ? (
            <input
              type='text'
              placeholder='Add location'
              value={location}
              onChange={e => setLocation(e.target.value)}
              className='w-full bg-background py-2 placeholder-text-secondary focus:border-b-2 focus:border-background-secondary focus:outline-none'
              onBlur={() => setShowLocationInput(false)}
              autoFocus
            />
          ) : (
            <div
              className='flex cursor-pointer items-center py-2'
              onClick={() => setShowLocationInput(true)}
            >
              Add location
            </div>
          )}
        </div>

        {/* Description */}
        <div className='relative mb-4 text-sm'>
          <textarea
            placeholder='Add description'
            value={description}
            onChange={e => setDescription(e.target.value)}
            className='w-full bg-background py-2  placeholder-text-secondary focus:border-b-2 focus:border-background-secondary focus:outline-none'
          />
        </div>

        <div className='flex justify-end'>
          {event && (
            <button
              className='mr-2 px-4 py-2  hover:underline'
              onClick={handleDelete}
            >
              Delete
            </button>
          )}

          <button
            className='ml-2 rounded-md bg-button px-4 py-2 text-button-text '
            onClick={handleSaveWithTimes} // Use the new save function
            disabled={!title}
          >
            Save
          </button>
        </div>
      </>
    )
  }

  const renderEventDetailView = () => {
    if (loadingDetails) {
      return <div>Loading conference details...</div>
    }
    if (!event || !eventDetails) return null

    return (
      <div>
        <h3 className='mb-2 text-lg font-semibold text-teal-700'>
          {eventDetails.conference.title}
        </h3>
        <p className='mb-2 text-gray-700'>
          Acronym: {eventDetails.conference.acronym}
        </p>
        <p className='mb-2 text-gray-700'>
          Location: {eventDetails.location.cityStateProvince},{' '}
          {eventDetails.location.country}
        </p>
        {/* Display important dates */}
        {eventDetails.dates && eventDetails.dates.length > 0 && (
          <div className='mb-2'>
            <h4 className='font-medium'>Important Dates:</h4>
            <ul>
              {eventDetails.dates.map((date: any, index: any) => (
                <li key={index} className='text-gray-700'>
                  {date.name}: {new Date(date.fromDate).toLocaleDateString()} -{' '}
                  {new Date(date.toDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className='mb-2'>
          <h4 className='font-medium'>Topics:</h4>
          <p className='mb-2 text-gray-700'>
            {eventDetails.organization.topics.join(', ')}
          </p>
        </div>

        <div className='mb-4'>
          <a
            href={eventDetails.organization.link}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center text-blue-500 hover:text-blue-700'
          >
            <Image
              src='/images/link-icon.svg'
              alt='More Details'
              width={14}
              height={14}
              className='mr-1'
            />
            More details
          </a>
        </div>
        <div className='flex justify-between'>
          <button
            onClick={handleDelete}
            className='focus:shadow-outline rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none'
          >
            Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='relative w-full max-w-md rounded-lg bg-background p-6 shadow-xl'>
      <button className='absolute right-2 top-2' onClick={onClose}>
        <svg
          className='h-6 w-6'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      </button>

      {event
        ? event.conferenceId
          ? renderEventDetailView()
          : renderAddEditView()
        : renderAddEditView()}
    </div>
  )
}

export default AddNoteDialog
