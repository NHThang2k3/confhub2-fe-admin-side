// src/app/visualization/DropZone.tsx
import React from 'react'
import { DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd'
import { DataField } from '../../../models/visualization/visualization' // Adjust path as needed
import { XMarkIcon } from '@heroicons/react/24/solid' // Using solid variant

interface DropZoneProps {
  /** Unique identifier for the droppable zone (e.g., 'xAxis', 'yAxis'). */
  id: string
  /** Text label displayed above the drop zone. */
  label: string
  /** Specifies the type of DataField accepted ('dimension', 'measure', or 'any'). */
  acceptedType: 'dimension' | 'measure' | 'any'
  /** The DataField currently placed in this zone, or null if empty. */
  field: DataField | null
  /** Callback function triggered when the remove button is clicked. Passes the zone's id. */
  onRemoveField: (zoneId: string) => void
  /** Props provided by @hello-pangea/dnd for the droppable element. */
  provided: DroppableProvided
  /** Snapshot object provided by @hello-pangea/dnd containing state information (e.g., isDraggingOver). */
  snapshot: DroppableStateSnapshot
  /** Optional flag to indicate if this zone is considered required for the current chart type. Defaults to false. */
  required?: boolean
}

/**
 * A component representing a droppable area for DataFields in the chart configuration panel.
 * It visually indicates its state (empty, filled, being dragged over) and allows field removal.
 */
const DropZone: React.FC<DropZoneProps> = ({
  id,
  label,
  acceptedType,
  field,
  onRemoveField,
  provided,
  snapshot,
  required = false // Default required to false
}) => {
  const isDraggingOver = snapshot.isDraggingOver

  // Determine background and border colors based on drag state
  const bgColor = isDraggingOver ? 'bg-blue-50' : 'bg-gray-5' // Lighter shades
  const borderColor = isDraggingOver ? 'border-blue-400' : 'border-gray-30'

  // Determine the placeholder text based on accepted type
  const placeholderText = `Drop ${acceptedType === 'any' ? 'a field' : `a ${acceptedType}`} here`

  return (
    <div className='mb-3'>
      {' '}
      {/* Consistent margin */}
      <label className='mb-1 flex items-center text-sm font-medium '>
        {' '}
        {/* Darker label text, flex for alignment */}
        {label}
        {required && (
          <span className='ml-1 font-semibold text-red-500'>*</span>
        )}{' '}
        {/* Display asterisk if required */}
      </label>
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={`
          flex min-h-[52px] items-center justify-center rounded-md border-2 border-dashed
          ${borderColor} ${bgColor} p-2 transition-all duration-150 ease-in-out
        `} // Use min-h-[52px] for consistency, adjusted padding/rounding/transition
      >
        {field ? (
          // Display the dropped field "pill"
          <div className='flex w-full items-center justify-between rounded border border-gray-30 bg-white-pure p-1.5 px-2 shadow-sm'>
            {/* Field Name and Type */}
            <span
              className={`mr-2 truncate text-sm font-medium ${field.type === 'dimension' ? 'text-blue-700' : 'text-green-700'}`}
            >
              {' '}
              {/* Slightly darker text */}
              {field.name}
              <span className='ml-1 text-xs font-normal '>
                ({field.type === 'dimension' ? 'Dim' : 'Measure'})
              </span>
            </span>
            {/* Remove Button */}
            <button
              onClick={e => {
                e.stopPropagation() // Prevent potential parent clicks if wrapped
                onRemoveField(id)
              }}
              className='0 ml-1 flex-shrink-0 rounded p-0.5 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:ring-offset-1' // Added focus styles and padding
              aria-label={`Remove ${field.name} from ${label}`}
              title={`Remove ${field.name}`} // Tooltip for clarity
            >
              <XMarkIcon className='h-4 w-4' />
            </button>
          </div>
        ) : (
          // Display placeholder text when empty
          <span className='text-center text-xs '>
            {' '}
            {/* Slightly darker placeholder */}
            {placeholderText}
          </span>
        )}
        {/* IMPORTANT: @hello-pangea/dnd placeholder for spacing during drag */}
        {provided.placeholder}
      </div>
    </div>
  )
}

export default DropZone
