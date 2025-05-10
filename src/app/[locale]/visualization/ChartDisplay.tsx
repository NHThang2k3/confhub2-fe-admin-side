// src/app/[locale]/visualization/ChartDisplay.tsx
import React, { useRef, useEffect, useCallback } from 'react'
import ReactECharts from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type {
  EChartsOption,
  EChartsType
} from '@/src/models/visualization/echarts'
import { ChartConfig } from '@/src/models/visualization/visualization'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import Loading from '../utils/Loading'
import { debounce } from 'lodash'
import { useTranslations } from 'next-intl'

// --- Register ECharts components (No changes) ---
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  CanvasRenderer
])

interface ChartDisplayProps {
  option: EChartsOption | null // Corrected type name
  isLoading: boolean
  isReady: boolean
  config: ChartConfig
  onDownloadSvg: () => void
  chartHeight?: string | number
  getChartInstance?: (instance: EChartsType | null | undefined) => void
}

const logPrefixCD = '[ChartDisplay]'

const ChartDisplay: React.FC<ChartDisplayProps> = ({
  option, // This prop now uses the EChartsCoreOption type
  isLoading,
  isReady,
  config,
  onDownloadSvg,
  chartHeight = '100%',
  getChartInstance
}) => {
  const t = useTranslations()

  const chartRef = useRef<ReactECharts | null>(null)
  const chartContainerRef = useRef<HTMLDivElement | null>(null)

  const debouncedChartResize = useCallback(
    debounce(() => {
      // --- Type Assertion (Still likely needed) ---
      const instance = chartRef.current?.getEchartsInstance() as
        | EChartsType
        | undefined
      if (instance) {
        instance.resize()
      }
    }, 150),
    []
  )

  useEffect(() => {
    const containerElement = chartContainerRef.current
    let observer: ResizeObserver | null = null

    if (containerElement) {
      observer = new ResizeObserver(() => {
        debouncedChartResize()
      })
      observer.observe(containerElement)
    }

    // --- Pass Instance Up ---
    // --- Type Assertion (Still likely needed) ---
    const instance = chartRef.current?.getEchartsInstance() as
      | EChartsType
      | undefined
    if (getChartInstance) {
      getChartInstance(instance)
    }
    // --- End Pass Instance ---

    return () => {
      if (observer) {
        observer.disconnect()
      }
      debouncedChartResize.cancel()
    }
  }, [debouncedChartResize, getChartInstance])

  const getPlaceholderMessage = useCallback((): string => {
    // ... (no changes needed in this function)
    const { chartType, xAxis, yAxis, color, size } = config
    switch (chartType) {
      case 'pie':
        if (!color?.fieldId)
          return t('Please_select_a_field_for_Slices_Color_Dimension')
        if (!yAxis?.fieldId)
          return t('Please_select_a_field_for_Value_Slice_Size_Measure')
        break
      case 'scatter':
        if (!xAxis?.fieldId) return t('Please_select_a_field_for_the_XAxis')
        if (!yAxis?.fieldId) return t('Please_select_a_field_for_the_YAxis')
        break
      case 'bar':
      case 'line':
      default:
        if (!xAxis?.fieldId)
          return t('Please_select_a_field_for_the_XAxis_Category_Dimension')
        if (!yAxis?.fieldId)
          return t('Please_select_a_field_for_the_YAxis_Value_Measure')
        break
    }
    return t('Configure_the_chart_using_the_panels_or_check_data_processing')
  }, [config])

  // --- Render Logic (No changes) ---
  return (
    <div
      ref={chartContainerRef}
      className='relative h-full flex-grow overflow-hidden rounded-lg bg-gray-5 p-4 pt-10 shadow-inner'
    >
      {/* Action Buttons */}
      <div className='absolute right-3 top-2.5 z-10 flex space-x-1.5'>
        <button
          onClick={onDownloadSvg}
          className='rounded p-1.5  transition-colors duration-150 hover:bg-gray-20 hover:text-gray-80 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
          title='Download as SVG'
          disabled={isLoading || !isReady || !option}
          aria-label='Download chart as SVG'
        >
          <ArrowDownTrayIcon className='h-5 w-5' />
        </button>
      </div>
      {/* Loading Overlay */}
      {isLoading && (
        <div className='absolute inset-0 z-20 flex items-center justify-center bg-white-pure backdrop-blur-sm'>
          <Loading />
        </div>
      )}
      {/* Placeholder/Instructions */}
      {!isLoading && !isReady && (
        <div className='flex h-full flex-col items-center justify-center text-center  '>
          <p className='mb-2'>{getPlaceholderMessage()}</p>
          <p className='text-sm '>
            {t(
              'Drag_fields_from_the_left_panel_to_the_configuration_zones_on_the_right'
            )}
          </p>
        </div>
      )}
      {/* ECharts Component */}
      {!isLoading && isReady && option && (
        <ReactECharts
          ref={chartRef}
          echarts={echarts}
          option={option}
          notMerge={true}
          lazyUpdate={true}
          style={{ height: chartHeight, width: '100%' }}
        />
      )}
    </div>
  )
}

export default ChartDisplay
