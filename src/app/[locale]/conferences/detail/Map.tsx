// Map.tsx
'use client'

import { appConfig } from '@/src/middleware'
import React, { useEffect, useRef } from 'react'


interface MapProps {
  location: string
}

const Map: React.FC<MapProps> = ({ location }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const API_KEY = appConfig.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
  useEffect(() => {
    if (!location || !mapRef.current) return

    const encodedLocation = encodeURIComponent(location)
    const iframe = document.createElement('iframe')
    iframe.width = '100%' // Use 100% width to fit container
    iframe.height = '300' // Adjust height to be reasonable for chat history
    iframe.style.border = '0'
    iframe.loading = 'lazy'
    iframe.allowFullscreen = true // Keep allowFullscreen
    iframe.referrerPolicy = 'no-referrer-when-downgrade'
    iframe.src = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodedLocation}`

    // Ensure mapRef.current is cleared before appending
    const currentMapRef = mapRef.current;
    currentMapRef.innerHTML = '' // Clear previous map if location changes
    currentMapRef.appendChild(iframe)

    // Cleanup function to remove iframe if component unmounts or location changes
    // This might prevent issues if the component re-renders frequently
    return () => {
        if (currentMapRef && currentMapRef.contains(iframe)) {
            currentMapRef.removeChild(iframe);
        }
    };


  }, [location]) // Dependency array is correct

  return (
    // Add a wrapper class for easier styling from ChatHistory.css if needed
    <div className='chat-map-wrapper my-2'> {/* Added margin top/bottom */}
      <div ref={mapRef} className='map-container' /> {/* Inner container for the iframe */}
      {/* Add a loading indicator or placeholder if needed */}
       {!location && <p>Loading map...</p>}
    </div>
  )
}

export default Map