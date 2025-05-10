// src/app/[locale]/visualization/ChartConfigPanel.tsx
import React, { useState } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import {
  ChartConfig,
  ChartOptions,
  DataField,
  ChartType,
  AVAILABLE_CHART_TYPES
} from '../../../models/visualization/visualization'
import DropZone from './DropZone'
import { Listbox, Transition } from '@headlessui/react'
import {
  CheckIcon,
  ChevronUpDownIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/20/solid'
import { useTranslations } from 'next-intl'

interface ChartConfigPanelProps {
  availableFields: DataField[]
  config: ChartConfig
  options: ChartOptions
  onConfigChange: (newConfig: Partial<ChartConfig>) => void
  onOptionsChange: (newOptions: Partial<ChartOptions>) => void
  onRemoveField: (zoneId: string) => void
  isCollapsed: boolean
  onToggle: () => void
}

const ChartConfigPanel: React.FC<ChartConfigPanelProps> = ({
  availableFields,
  config,
  options,
  onConfigChange,
  onOptionsChange,
  onRemoveField,
  isCollapsed,
  onToggle
}) => {
  const t = useTranslations()

  const { chartType } = config
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)

  const getFieldById = (id: string | null | undefined): DataField | null => {
    if (!id) return null
    return availableFields.find(f => f.id === id) || null
  }

  const selectedChartType =
    AVAILABLE_CHART_TYPES.find(ct => ct.id === chartType) ||
    AVAILABLE_CHART_TYPES[0]

  const showXAxis = chartType !== 'pie'
  const showYAxis = true // Keep Y-axis dropzone for Pie (Value)
  const showColor = true
  const showSize = chartType === 'scatter'

  return (
    <div
      className={`
                - + relative flex-shrink-0 border-l border-gray-20
bg-white-pure                shadow-sm transition-all
duration-300               duration-500 ease-in-out ease-out
                ${
                  isCollapsed
                    ? 'pointer-events-none w-0 overflow-hidden border-none p-0 opacity-0'
                    : 'w-72 overflow-y-auto p-4 opacity-100'
                }
            `}
      aria-hidden={isCollapsed}
    >
      {/* --- Content is ALWAYS rendered, but hidden by parent CSS when collapsed --- */}
      {/* Panel Title and Collapse Button */}
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='whitespace-nowrap text-lg  font-semibold'>
          {t('Configuration')}
        </h3>{' '}
        {/* Added whitespace-nowrap */}
        <button
          onClick={onToggle}
          className='rounded p-1  hover:bg-gray-20 hover:text-gray-60 focus:outline-none focus:ring-1 focus:ring-gray-40'
          title={t('Collapse_Configuration_Panel')}
          aria-label={t('Collapse_Configuration_Panel')}
        >
          <ChevronDoubleRightIcon className='h-5 w-5' />
        </button>
      </div>

      {/* Chart Type Selector */}
      <div className='mb-6'>
        <Listbox
          value={chartType}
          onChange={(value: ChartType) => onConfigChange({ chartType: value })}
        >
          <Listbox.Label className='mb-1 block text-sm font-medium '>
            {t('Chart_Type')}
          </Listbox.Label>
          <div className='relative'>
            <Listbox.Button className='relative w-full cursor-default rounded-md border border-gray-30 bg-white-pure py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm'>
              <span className='block truncate'>{selectedChartType.name}</span>
              <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                <ChevronUpDownIcon className='h-5 w-5' aria-hidden='true' />
              </span>
            </Listbox.Button>
            <Transition
              as={React.Fragment}
              leave='transition ease-in duration-100'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <Listbox.Options className='absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white-pure py-1 text-base shadow-lg ring-1 ring-black-pure ring-opacity-5 focus:outline-none sm:text-sm'>
                {AVAILABLE_CHART_TYPES.map(type => (
                  <Listbox.Option
                    key={type.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : ''}`
                    }
                    value={type.id}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                        >
                          {type.name}
                        </span>
                        {selected && (
                          <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600'>
                            <CheckIcon className='h-5 w-5' aria-hidden='true' />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      {/* Drop Zones Section */}
      <div className='space-y-3'>
        {showXAxis && (
          <Droppable droppableId='xAxis'>
            {(provided, snapshot) => (
              <DropZone
                id='xAxis'
                label={
                  chartType === 'scatter'
                    ? t('XAxis_Measure_Dimension')
                    : t('XAxis_Category_Dimension')
                }
                acceptedType={chartType === 'scatter' ? 'any' : 'dimension'}
                field={getFieldById(config.xAxis?.fieldId)}
                onRemoveField={onRemoveField}
                provided={provided}
                snapshot={snapshot}
                required={true}
              />
            )}
          </Droppable>
        )}
        {showYAxis && ( // Always show Y-axis conceptually, label changes for Pie
          <Droppable droppableId='yAxis'>
            {(provided, snapshot) => (
              <DropZone
                id='yAxis'
                label={
                  chartType === 'pie'
                    ? t('Value_Slice_Size_Measure')
                    : t('YAxis_Value_Measure')
                }
                acceptedType='measure'
                field={getFieldById(config.yAxis?.fieldId)}
                onRemoveField={onRemoveField}
                provided={provided}
                snapshot={snapshot}
                required={true}
              />
            )}
          </Droppable>
        )}
        {showColor && ( // Always show Color conceptually, label changes for Pie
          <Droppable droppableId='color'>
            {(provided, snapshot) => (
              <DropZone
                id='color'
                label={
                  chartType === 'pie'
                    ? t('Slices_Color_Dimension')
                    : t('Color_Group_Dimension')
                }
                acceptedType='dimension'
                field={getFieldById(config.color?.fieldId)}
                onRemoveField={onRemoveField}
                provided={provided}
                snapshot={snapshot}
                required={chartType === 'pie'}
              />
            )}
          </Droppable>
        )}
        {showSize && (
          <Droppable droppableId='size'>
            {(provided, snapshot) => (
              <DropZone
                id='size'
                label='Size (Bubble/Measure)'
                acceptedType='measure'
                field={getFieldById(config.size?.fieldId)}
                onRemoveField={onRemoveField}
                provided={provided}
                snapshot={snapshot}
                required={false}
              />
            )}
          </Droppable>
        )}
      </div>

      {/* Chart Options Section */}
      <div className='mt-6 border-t border-gray-20 pt-4'>
        <button
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className='flex w-full items-center justify-between text-sm font-medium  hover:text-gray-80 focus:outline-none'
          aria-expanded={isOptionsOpen}
          aria-controls='chart-options-panel'
        >
          <span className='whitespace-nowrap'>{t('Chart_Options')}</span>{' '}
          {/* Added whitespace-nowrap */}
          <Cog6ToothIcon
            className={`h-5 w-5 transition-transform duration-200 ${isOptionsOpen ? 'rotate-90' : ''}`}
          />
        </button>
        {/* Headless UI Transition should work fine here as it handles display properties */}
        <Transition
          show={isOptionsOpen}
          enter='transition ease-out duration-100'
          enterFrom='transform opacity-0 scale-95'
          enterTo='transform opacity-100 scale-100'
          leave='transition ease-in duration-75'
          leaveFrom='transform opacity-100 scale-100'
          leaveTo='transform opacity-0 scale-95'
        >
          <div id='chart-options-panel' className='mt-3 space-y-4'>
            {/* Title Input */}
            <div>
              <label
                htmlFor='chartTitle'
                className='mb-1 block text-xs font-medium '
              >
                {t('Chart_Title')}
              </label>
              <input
                type='text'
                id='chartTitle'
                name='chartTitle'
                placeholder='Enter chart title'
                value={options.title}
                onChange={e => onOptionsChange({ title: e.target.value })}
                className='w-full rounded border border-gray-30 bg-white-pure px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500'
              />
            </div>
            {/* Legend Toggle */}
            <div className='flex items-center justify-between'>
              <span className='text-sm '>{t('Show_Legend')}</span>
              <button
                onClick={() =>
                  onOptionsChange({ showLegend: !options.showLegend })
                }
                title={options.showLegend ? 'Hide Legend' : 'Show Legend'}
                className='rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
              >
                {options.showLegend ? (
                  <EyeIcon className='h-5 w-5 text-blue-600 hover:text-blue-800' />
                ) : (
                  <EyeSlashIcon className='h-5 w-5  hover:text-gray-60' />
                )}
              </button>
            </div>
            {/* Toolbox Toggle */}
            <div className='flex items-center justify-between'>
              <span className='text-sm '>{t('Show_Toolbox')}</span>
              <button
                onClick={() =>
                  onOptionsChange({ showToolbox: !options.showToolbox })
                }
                title={options.showToolbox ? 'Hide Toolbox' : 'Show Toolbox'}
                className='rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
              >
                {options.showToolbox ? (
                  <EyeIcon className='h-5 w-5 text-blue-600 hover:text-blue-800' />
                ) : (
                  <EyeSlashIcon className='h-5 w-5  hover:text-gray-60' />
                )}
              </button>
            </div>
          </div>
        </Transition>
      </div>
      {/* --- REMOVED: Conditional rendering wrapper --- */}
    </div>
  )
}

export default ChartConfigPanel
