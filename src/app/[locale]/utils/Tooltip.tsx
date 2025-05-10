// components/Tooltip.tsx

import React, { useState } from 'react'

interface TooltipProps {
  children: React.ReactNode
  text: string
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className='relative inline-block'
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className='absolute -left-2 -top-6 z-10 w-max whitespace-nowrap rounded bg-background-secondary px-2 py-1 text-xs shadow-md'>
          {text}
        </div>
      )}
    </div>
  )
}

export default Tooltip
