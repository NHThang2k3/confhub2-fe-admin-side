import React from 'react'
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'
import { DataField } from '../../../models/visualization/visualization' // Adjust path as needed
import { TagIcon, VariableIcon } from '@heroicons/react/24/solid'

interface FieldItemProps {
  /** The data field object containing name, type, etc. */
  field: DataField
  /** Props provided by @hello-pangea/dnd for the draggable element. */
  provided: DraggableProvided
  /** Indicates whether the item is currently being dragged. Passed from the Draggable render prop. */
  isDragging: boolean
  // snapshot?: DraggableStateSnapshot; // Keep commented or remove if not needed for logging/logic
}

const logPrefixFI = '[FieldItem]'

/**
 * Represents a single draggable data field item in the DataFieldPanel.
 * Displays the field's name and an icon corresponding to its type (dimension/measure).
 * Changes appearance when being dragged.
 * Uses React.memo for performance optimization.
 */
const FieldItem: React.FC<FieldItemProps> = React.memo(
  ({
    field,
    provided,
    isDragging
    // snapshot // Destructure if using snapshot
  }) => {
    // Choose the appropriate icon based on field type
    const Icon = field.type === 'dimension' ? TagIcon : VariableIcon

    // Determine dynamic classes based on dragging state
    const draggingClasses = isDragging
      ? 'bg-blue-100 shadow-lg border-blue-300 ring-2 ring-blue-300' // Styles when dragging
      : 'bg-white-pure hover:shadow-md hover:bg-gray-5' // Styles when static or hovered

    return (
      // Main container div: Apply dnd refs and props
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps} // Drag handle props applied to the whole item for easy grabbing
        className={`
        mb-1.5 flex cursor-grab items-center rounded border p-2
        shadow-sm transition-all duration-150 ease-in-out
        ${draggingClasses}
        ${field.type === 'dimension' ? 'border-gray-30' : 'border-gray-30'}
      `} // Combine base, dynamic, and conditional type-based styles (though border is same here)
        // Apply the style transformation from dnd (important for movement)
        style={provided.draggableProps.style}
        title={`${field.name} (${field.type})`} // Add a tooltip
      >
        {/* Icon */}
        <Icon
          className={`
          mr-2 h-4 w-4 flex-shrink-0
          ${field.type === 'dimension' ? 'text-blue-600' : 'text-green-600'}
        `} // Adjusted colors slightly
        />
        {/* Field Name */}
        <span className='flex-grow truncate text-sm '>
          {' '}
          {/* Allow truncation */}
          {field.name}
        </span>
      </div>
    )
  }
)

FieldItem.displayName = 'FieldItem'
export default FieldItem
