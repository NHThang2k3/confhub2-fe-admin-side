// src/components/LandingVisualizationPage.tsx

// --- Add 'use client' at the very top ---
// This ensures the component runs client-side, which is necessary
// for accessing browser APIs used by ECharts (like document, window).
'use client'

import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { TreemapChart, SunburstChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  DatasetComponent,
  TransformComponent
  // BreadcrumbComponent // Breadcrumb needed for Treemap structure/navigation
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  DatasetComponent,
  TransformComponent,
  TreemapChart,
  SunburstChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
  // BreadcrumbComponent // Ensure Breadcrumb is registered
])

// Define the type for your chart instance
type EChartsType = echarts.ECharts
type EChartsOption = echarts.EChartsCoreOption // Type alias for options

const LandingVisualizationPage: React.FC = () => {
  // Ref for the chart container div
  const chartRef = useRef<HTMLDivElement | null>(null)
  // Ref to hold the chart instance across renders
  const chartInstance = useRef<EChartsType | null>(null)
  // Ref to hold the interval ID for cleanup
  const intervalRef = useRef<number | null>(null)

  // --- CORRECTED DATA PATH ---
  // Place 'echarts-package-size.json' in your project's 'public/data' directory
  // and fetch it from the root path '/data/echarts-package-size.json'.
  const DATA_PATH = '/data/echarts-package-size.json'
  // If you are certain it's at the root of the public folder, use '/echarts-package-size.json'

  useEffect(() => {
    // Function to initialize and set up the chart
    const setupChart = async () => {
      // Ensure the DOM element is available via ref
      if (!chartRef.current) {
        console.warn('Chart container ref not available.')
        return // Exit if ref is not ready
      }

      // Initialize ECharts instance if it doesn't exist
      if (!chartInstance.current) {
        const myChart = echarts.init(chartRef.current)
        chartInstance.current = myChart // Store the instance
        console.log('ECharts instance initialized.')
      } else {
        // If instance exists (e.g., component re-rendered but not unmounted), just resize
        // This case is less likely with [] dependency, but good practice.
        chartInstance.current.resize()
        console.log('ECharts instance already exists, resizing.')
      }

      try {
        // Fetch the data using the correct public path
        console.log(`Attempting to fetch data from: ${DATA_PATH}`)
        const response = await fetch(DATA_PATH)

        if (!response.ok) {
          // Log the response status and text for better debugging
          const errorText = await response.text()
          console.error(
            `HTTP error! status: ${response.status}, response: ${errorText}`
          )
          throw new Error(`Failed to fetch data: ${response.status}`)
        }

        const data = await response.json()
        console.log('Data fetched successfully:', data)

        if (!chartInstance.current) {
          console.error('ECharts instance not found after data fetch.')
          return // Should not happen if init was successful
        }

        // Define chart options using the fetched data structure
        // The provided JSON structure has 'children', which is correct for Treemap/Sunburst series data.
        const treemapOption: EChartsOption = {
          title: {
            text: 'ECharts Package Size (Treemap)',
            left: 'center'
          },
          tooltip: {
            // Added tooltip based on common practice and your original code implies it
            formatter: '{b}: {c} bytes' // Display name ({b}) and value ({c})
          },
          series: [
            {
              type: 'treemap',
              id: 'echarts-package-size', // Same ID for universal transition
              animationDurationUpdate: 1000,
              roam: false,
              nodeClick: undefined, // Keep default Treemap click behavior (drill-down)
              data: data.children, // Use data.children as per your JSON structure
              universalTransition: true,
              label: {
                show: true,
                formatter: '{b}' // Display name
              },
              breadcrumb: {
                show: false // Hide breadcrumb as per your original snippet
              }
            }
          ]
        }

        const sunburstOption: EChartsOption = {
          title: {
            text: 'ECharts Package Size (Sunburst)',
            left: 'center'
          },
          tooltip: {
            // Added tooltip
            formatter: '{b}: {c} bytes'
          },
          series: [
            {
              type: 'sunburst',
              id: 'echarts-package-size', // Same ID
              radius: ['20%', '90%'],
              animationDurationUpdate: 1000,
              nodeClick: undefined, // Keep default Sunburst click behavior (drill-down)
              data: data.children, // Use data.children
              universalTransition: true,
              itemStyle: {
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,.5)'
              },
              label: {
                show: false // Hide labels by default
              },
              emphasis: {
                // Add emphasis to show label on hover
                focus: 'descendant',
                label: {
                  show: true,
                  formatter: '{b}'
                }
              }
            }
          ]
        }

        let currentOption = treemapOption

        // Set the initial option
        chartInstance.current.setOption(currentOption)
        console.log('Initial chart option set (Treemap).')

        // Set interval to switch charts
        intervalRef.current = window.setInterval(() => {
          if (!chartInstance.current) return // Ensure chart instance still exists

          currentOption =
            currentOption === treemapOption ? sunburstOption : treemapOption

          // Use notMerge: false for the transition to work correctly
          chartInstance.current.setOption(currentOption, { notMerge: false })
          console.log(
            `Switched to ${currentOption === treemapOption ? 'Treemap' : 'Sunburst'}`
          )
        }, 3000) // Switch every 3 seconds
      } catch (error) {
        console.error('Error setting up chart:', error)
        // You might want to display an error message in the UI,
        // e.g., by setting a state variable like `setError(true)`.
        if (chartRef.current) {
          chartRef.current.innerHTML = `<p class="text-red-600 text-center">Error loading chart data.</p>`
        }
      }
    }

    // Call the async setup function
    setupChart()

    // Return cleanup function for useEffect
    return () => {
      console.log('Running ECharts cleanup...')
      // Clear the interval first
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
        console.log('Interval cleared.')
      }
      // Dispose the chart instance
      if (chartInstance.current) {
        chartInstance.current.dispose()
        chartInstance.current = null // Clear the ref
        console.log('ECharts instance disposed.')
      }
    }
  }, []) // Empty dependency array: effect runs only once on mount and cleans up on unmount

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        console.log('Resizing chart...')
        chartInstance.current.resize()
      }
    }
    // Add event listener
    window.addEventListener('resize', handleResize)
    console.log('Resize listener added.')

    // Cleanup: remove event listener
    return () => {
      window.removeEventListener('resize', handleResize)
      console.log('Resize listener removed.')
    }
  }, []) // Empty dependency array: adds listener on mount, removes on unmount

  return (
    <div className='min-h-screen bg-gray-50 font-sans text-gray-800'>
      {/* Header */}
      <header className='bg-white py-4 shadow-sm'>
        <div className='container mx-auto px-6 text-center'>
          <div className='text-3xl font-bold text-blue-600'>
            Interactive Visualization
          </div>
        </div>
      </header>

      {/* Hero Section (Simplified) */}
      <section className='bg-gradient-to-r from-blue-500 to-purple-600 py-16 text-center text-white'>
        <div className='container mx-auto px-6'>
          <h1 className='mb-4 text-4xl font-bold md:text-5xl'>
            See Data Morph Between Views
          </h1>
          <p className='mx-auto mb-8 max-w-3xl text-lg md:text-xl'>
            An example showcasing ECharts universal transition between Treemap
            and Sunburst charts.
          </p>
        </div>
      </section>

      {/* Visualization Section */}
      <section className='bg-white py-16'>
        <div className='container mx-auto px-6'>
          <h2 className='mb-12 text-center text-3xl font-bold text-gray-900'>
            ECharts Treemap vs Sunburst
          </h2>
          {/* Chart Container */}
          {/* THIS DIV MUST HAVE DIMENSIONS */}
          <div
            ref={chartRef}
            className='flex h-96 w-full items-center justify-center rounded-lg bg-gray-100 text-gray-500 shadow-md md:h-[500px] lg:h-[600px]'
            // Add a minimum height or explicit height using Tailwind classes or style prop
            // style={{ height: '500px' }} // Alternative way to set height
          >
            {/* Chart will render here. Add a loading indicator if needed */}
            Loading chart...{' '}
            {/* This text will be replaced by the chart once loaded */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-800 py-8 text-white'>
        <div className='container mx-auto px-6 text-center'>
          <p>© 2025 Visualization Showcase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingVisualizationPage
