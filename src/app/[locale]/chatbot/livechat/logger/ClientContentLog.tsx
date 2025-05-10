// ClientContentLog.tsx
import React from 'react'
import { ClientContentMessage } from '../multimodal-live-types'
import RenderPart from './RenderPart'

// FIX: Use the correct type for the message prop
type ClientContentLogProps = {
  message: ClientContentMessage['clientContent'] // Corrected type
}

const ClientContentLog: React.FC<ClientContentLogProps> = ({ message }) => {
  const { turns, turnComplete } = message // Destructure directly

  return (
    <div className='m-4 rounded-lg bg-blue-100 p-4 shadow-md dark:bg-gray-900'>
      {/* <h4 className="text-lg font-semibold text-blue-600 mb-2">User</h4> */}
      {turns.map((turn, i) => (
        <div key={`message-turn-${i}`} className='mb-4 last:mb-0'>
          {turn.parts
            .filter(part => !(part.text && part.text === '\n'))
            .map((part, j) =>
              // Apply ModelTurnLog's styling for text parts here
              part.text ? (
                <p
                  key={`message-turn-${i}-part-${j}`}
                  className='part part-text' // Keep existing classes
                  style={{ whiteSpace: 'pre-wrap' }} // Add pre-wrap for proper line breaks
                >
                  {part.text}
                </p>
              ) : (
                <RenderPart part={part} key={`message-turn-${i}-part-${j}`} />
              )
            )}
        </div>
      ))}
      {!turnComplete && (
        <span className='text-sm font-medium text-red-500'>
          turnComplete: false
        </span>
      )}
    </div>
  )
}

export default ClientContentLog
