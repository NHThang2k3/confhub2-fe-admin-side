// PlainTextMessage.tsx
// import React from "react";
import { StreamingLog } from '../multimodal-live-types'

type PlainTextMessageProps = {
  message: StreamingLog['message']
}

const PlainTextMessage: React.FC<PlainTextMessageProps> = ({ message }) => {
  return (
    <div className='m-4 inline-block rounded-md bg-gray-300 p-2 dark:bg-gray-900'>
      <span className='text-xl '>{message as string}</span>
    </div>
  )
}

export default PlainTextMessage
