'use client'

import { useEffect, useState } from 'react'

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // --- Configuration for the progress circle ---
  const svgSize = 48 // Size of the SVG container (adjust as needed)
  const strokeWidth = 4 // Thickness of the border
  const center = svgSize / 2
  const radius = center - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  // -------------------------------------------

  useEffect(() => {
    const handleScroll = () => {
      // --- Visibility Logic ---
      const showThreshold = 300 // Pixel threshold to show the button
      if (window.scrollY > showThreshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }

      // --- Progress Calculation ---
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const maxScrollTop = docHeight - clientHeight

      const progress = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0
      const clampedProgress = Math.max(0, Math.min(1, progress))

      setScrollProgress(clampedProgress)
    }

    // Initial call
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup listener
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, []) // Empty dependency array ensures this runs only on mount and unmount

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Calculate the dash offset based on progress
  const dashOffset = circumference * (1 - scrollProgress)

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ width: `${svgSize}px`, height: `${svgSize}px` }}
      // Hide button completely using conditional rendering (optional, but cleaner for DOM)
      // style={{
      //   width: `${svgSize}px`,
      //   height: `${svgSize}px`,
      //   visibility: isVisible ? 'visible' : 'hidden', // Alternative to opacity + pointer-events
      //   opacity: isVisible ? 1 : 0
      // }}
    >
      <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className='h-full w-full'>
        {/* Background Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill='rgba(40, 40, 40, 0.7)' // Adjust background color and opacity
          stroke='rgba(100, 100, 100, 0.5)' // Adjust track color and opacity
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill='transparent'
          stroke='#1d4ed8 ' // Adjust progress color (e.g., Tailwind green-400)
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap='round'
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          data-testid='progress-circle'
        />
        {/* Arrow Icon */}
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='white' // Adjust arrow color
          width={svgSize * 0.5}
          height={svgSize * 0.5}
          x={svgSize * 0.25}
          y={svgSize * 0.25}
        >
          <path
            fillRule='evenodd'
            d='M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z'
            clipRule='evenodd'
          />
        </svg>
      </svg>
    </button>
  )
}
