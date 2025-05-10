// src/app/[locale]/visualization/DataFieldPanel.tsx
import React from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { DataField } from '../../../models/visualization/visualization'
import FieldItem from './FieldItem'
import { ChevronDoubleLeftIcon } from '@heroicons/react/20/solid'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'

interface DataFieldPanelProps {
  fields: DataField[]
  droppableId: string
  isCollapsed: boolean
  onToggle: () => void
}
const DataFieldPanel: React.FC<DataFieldPanelProps> = React.memo(
  ({ fields, droppableId, isCollapsed, onToggle }) => {
    const t = useTranslations()

    const dimensions = fields.filter(f => f.type === 'dimension')
    const measures = fields.filter(f => f.type === 'measure')

    return (
      // Always render the div, control visibility purely with CSS
      <div
        className={`
                duration-400 relative flex-shrink-0 border-r border-gray-20
                bg-gray-5 transition-all
                duration-300 ease-in-out ease-out
                ${
                  isCollapsed
                    ? 'pointer-events-none w-0 overflow-hidden border-none p-0 opacity-0'
                    : 'w-64 overflow-y-auto p-4 opacity-100'
                }
            `}
        aria-hidden={isCollapsed}
      >
        {/* --- Content is ALWAYS rendered, but hidden by parent CSS when collapsed --- */}
        {/* Panel Title and Collapse Button */}
        <div className='mb-4 flex items-center justify-between'>
          <Link href='/' className=''>
            <h3 className='whitespace-nowrap text-sm font-semibold uppercase tracking-wide '>
              {' '}
              {t('Home')}
            </h3>
          </Link>
          <button
            onClick={onToggle}
            className='rounded p-1  hover:bg-gray-20 hover:text-gray-60 focus:outline-none focus:ring-1 focus:ring-gray-40'
            title='Collapse Fields Panel'
            aria-label='Collapse Fields Panel'
          >
            <ChevronDoubleLeftIcon className='h-5 w-5' />
          </button>
        </div>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='whitespace-nowrap text-sm font-semibold uppercase tracking-wide '>
            {' '}
            {/* Added whitespace-nowrap */}
            Fields
          </h3>
        </div>

        {/* Droppable area */}
        <Droppable droppableId={droppableId} isDropDisabled={true}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className='space-y-4'
            >
              {/* Dimensions Section */}
              <section>
                <h4 className='mb-2 whitespace-nowrap text-xs font-medium text-blue-700'>
                  {' '}
                  {/* Added whitespace-nowrap */}
                  {t('Dimensions')} ({dimensions.length})
                </h4>
                {dimensions.length > 0 ? (
                  dimensions.map((field, index) => (
                    <Draggable
                      key={field.id}
                      draggableId={field.id}
                      index={index}
                    >
                      {(providedDraggable, snapshotDraggable) => (
                        <FieldItem
                          field={field}
                          provided={providedDraggable}
                          isDragging={snapshotDraggable.isDragging}
                        />
                      )}
                    </Draggable>
                  ))
                ) : (
                  <p className='px-1 text-xs italic '>
                    {t('No_dimensions_available')}
                  </p>
                )}
              </section>

              {/* Measures Section */}
              <section>
                <h4 className='mb-2 whitespace-nowrap text-xs font-medium text-green-700'>
                  {' '}
                  {/* Added whitespace-nowrap */}
                  {t('Measures')} ({measures.length})
                </h4>
                {measures.length > 0 ? (
                  measures.map((field, index) => {
                    const draggableIndex = index + dimensions.length
                    return (
                      <Draggable
                        key={field.id}
                        draggableId={field.id}
                        index={draggableIndex}
                      >
                        {(providedDraggable, snapshotDraggable) => (
                          <FieldItem
                            field={field}
                            provided={providedDraggable}
                            isDragging={snapshotDraggable.isDragging}
                          />
                        )}
                      </Draggable>
                    )
                  })
                ) : (
                  <p className='px-1 text-xs italic '>
                    {t('No_measures_available')}
                  </p>
                )}
              </section>

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    )
  }
)

DataFieldPanel.displayName = 'DataFieldPanel'
export default DataFieldPanel
