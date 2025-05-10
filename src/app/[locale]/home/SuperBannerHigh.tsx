// src/components/SuperBannerHigh.tsx

import React, { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/src/navigation'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GraphicComponent } from 'echarts/components'
import type { EChartsCoreOption, EChartsType } from 'echarts/core'
import WorldMap from './world'

// Register necessary ECharts components and renderers
echarts.use([GraphicComponent, CanvasRenderer])

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
}
// --- End Variants ---

const SuperBannerHigh: React.FC = () => {
  const t = useTranslations('') // Initialize translations
  const chartRef = useRef<HTMLDivElement>(null) // Ref for ECharts container
  const chartInstanceRef = useRef<EChartsType | null>(null) // Ref for ECharts instance
  const sloganText = t('Slogan_Website') // Get slogan text

  // --- Define Colors for WorldMap ---
  // This object maps country IDs (strings) to Tailwind fill classes (strings)
  // Example: Color specific countries with some transparency
  const countryColors: { [key: string]: string } = {
    AD: 'fill-blue-500',
    AE: 'fill-green-500',
    US: 'fill-red-400',
    CA: 'fill-red-400'
  }

  // Example: Semi-transparent gray
  const defaultMapColor = 'fill-gray-500'

  // --- ECharts Initialization Effect ---
  useEffect(() => {
    let chart: EChartsType | null = null // Local chart instance

    // Initialize ECharts only if the ref is attached to the DOM
    if (chartRef.current) {
      chart = echarts.init(chartRef.current)
      chartInstanceRef.current = chart // Store instance in ref

      // ECharts configuration with dynamic text
      const option: EChartsCoreOption = {
        graphic: {
          elements: [
            {
              type: 'text',
              left: 'center',
              top: 'center',
              style: {
                text: sloganText, // Use text from translation
                fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', // Responsive font size
                fontWeight: 'bold',
                lineDash: [0, 200],
                lineDashOffset: 0,
                fill: 'transparent', // Initial fill color
                stroke: '#FFFFFF', // Initial stroke color (e.g., button text color)
                lineWidth: 1,
                textShadowBlur: 4, // Optional text shadow
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffsetX: 0,
                textShadowOffsetY: 2
              },
              // Text animation keyframes
              keyframeAnimation: {
                duration: 3000,
                loop: true, // Loop the animation
                keyframes: [
                  {
                    percent: 0.7, // Point where drawing finishes
                    style: {
                      fill: 'transparent',
                      lineDashOffset: 200,
                      lineDash: [200, 0]
                    }
                  },
                  {
                    percent: 0.8, // Pause slightly
                    style: { fill: 'transparent' }
                  },
                  {
                    percent: 1, // Final state: filled text
                    style: { fill: '#FFFFFF' } // Final fill color
                  }
                ]
              }
            }
          ]
        }
      }

      chart.setOption(option)

      // Handle window resize to adjust ECharts layout
      const handleResize = () => {
        chart?.resize()
      }
      window.addEventListener('resize', handleResize)

      // Cleanup function on component unmount
      return () => {
        window.removeEventListener('resize', handleResize)
        chartInstanceRef.current?.dispose() // Dispose ECharts instance
        chartInstanceRef.current = null // Reset ref
      }
    }
    // Dependency array: Re-run effect if sloganText changes
  }, [sloganText])

  return (
    <motion.section
      // Main section styling: background gradient, layout, text color
      className='bg-span-gradient relative flex h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-button-text sm:px-2 lg:px-4'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      {/* --- WorldMap Background --- */}
      <div // Changed from motion.div as animation is removed, but motion.div is fine too
        className='absolute inset-0 z-0 overflow-hidden ' // <- STATIC OPACITY SET HERE
        aria-hidden='true' // Hide from screen readers
      >
        {/* Render the WorldMap component */}
        <WorldMap
          // Styling to make the SVG fill the container and cover it
          className='h-full w-full object-cover'
          // Pass the color configuration props
          coloredCountries={countryColors}
          defaultColor={defaultMapColor}
        />
      </div>

      {/* --- Decorative Blobs --- */}
      <motion.div
        // Top-left blob styling and position (higher z-index)
        className='absolute left-0 top-0 z-[5] h-32 w-32 -translate-x-1/4 -translate-y-1/4 rounded-full bg-white/10 opacity-30 blur-xl filter'
        // Optional: Add subtle animation if desired
      />
      <motion.div
        // Bottom-right blob styling, position, and animation (higher z-index)
        className='absolute bottom-0 right-0 z-[5] h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-white/10 opacity-30 blur-xl filter'
        animate={{ scale: [1, 1.15, 1], rotate: [0, -180, -360] }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
          delay: 2
        }}
      />

      {/* --- Main Content Area --- */}
      <div className='relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 text-center'>
        {/* ECharts Animated Slogan */}
        <motion.div
          ref={chartRef}
          // Ensure sufficient height for the large text
          className='mb-6 h-24 w-full max-w-full cursor-default sm:h-28 md:h-32 lg:h-40'
          variants={itemVariants}
          aria-label={sloganText} // Accessible label for the animation
        >
          {/* ECharts renders here */}
        </motion.div>

        {/* Slogan Description */}
        <motion.p
          // Styling for the descriptive text
          className='mb-10 max-w-7xl text-lg font-medium text-button opacity-90 sm:text-xl md:text-2xl'
          variants={itemVariants}
        >
          {t('Slogan_Website_describe')}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          // Layout for buttons
          className='flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6'
          variants={itemVariants}
        >
          {/* Link to Conferences Page */}
          <Link href='/conferences' passHref legacyBehavior={false}>
            <motion.button
              // Primary button styling
              className='w-full transform rounded-lg bg-button px-8 py-3 font-semibold text-button-text shadow-md transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 focus:ring-offset-background active:scale-95 sm:w-auto'
              whileTap={{ scale: 0.97 }}
            >
              {t('Search_Conferences')}
            </motion.button>
          </Link>

          {/* Link to Journals Page */}
          <Link href='/journals' passHref legacyBehavior={false}>
            <motion.button
              // Secondary/outline button styling
              className='w-full transform rounded-lg border-2 border-button-text bg-transparent px-8 py-3 font-semibold text-button-text shadow-sm transition-all duration-200 ease-in-out hover:scale-105 hover:bg-button-text hover:text-button focus:outline-none focus:ring-2 focus:ring-button-text focus:ring-offset-2 focus:ring-offset-background active:scale-95 sm:w-auto'
              whileTap={{ scale: 0.97 }}
            >
              {t('Search_Journals')}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default SuperBannerHigh
