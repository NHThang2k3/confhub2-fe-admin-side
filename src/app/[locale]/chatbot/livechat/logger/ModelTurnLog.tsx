// ModelTurnLog.tsx
import React, { memo } from 'react' // Import memo
import { ServerContentMessage, ModelTurn } from '../multimodal-live-types'
import RenderPart from './RenderPart'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
type ModelTurnLogProps = {
  message: ServerContentMessage
}

const ModelTurnLog: React.FC<ModelTurnLogProps> = ({
  message
}): JSX.Element => {
  const serverContent = message.serverContent
  const { modelTurn } = serverContent as ModelTurn
  const { parts } = modelTurn

  // Combine text parts into a single string, handling potential undefined values
  const combinedText = parts
    .filter(
      part =>
        part.text !== undefined && part.text !== null && part.text !== '\n'
    )
    .map(part => part.text)
    .join('')

  return (
    <div className='m-4 rounded-lg bg-green-100 p-4 shadow-md dark:bg-gray-900'>
      {/* <h4 className="text-lg font-semibold text-green-700 mb-2">Model</h4> */}
      {/* Render combined text using ReactMarkdown */}
      {combinedText && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]} // Added remarkBreaks
          rehypePlugins={[rehypeRaw]}
          components={{
            // Customize components (optional, for more control)
            p: ({ node, ...props }) => (
              <p className='part part-text' {...props} />
            ), // Add margin to paragraphs
            a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
              <a
                {...props}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-500 hover:underline'
              />
            ),
            // Add more component overrides as needed (ul, ol, li, code, etc.)
            pre: ({ node, ...props }) => (
              <pre
                className='overflow-x-auto rounded-md bg-gray-100 p-2 dark:bg-gray-900'
                {...props}
              />
            ),
            code: ({ node, ...props }) => (
              <code
                className='rounded bg-gray-100 px-1 dark:bg-gray-900'
                {...props}
              />
            ),
            h1: ({ node, ...props }) => (
              <h1 className='my-4 text-2xl font-bold' {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className='my-3 text-xl font-semibold' {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className='my-2 text-lg font-medium' {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className='my-2 list-inside list-disc' {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className='my-2 list-inside list-decimal' {...props} />
            ),
            li: ({ node, ...props }) => <li className='my-1' {...props} />
          }}
        >
          {combinedText}
        </ReactMarkdown>
      )}
      {/* Render other parts (code, etc.) */}
      {/* {parts
        .filter((part) => !part.text || part.text === "\n") // filter only part is not text
        .map((part, j) => (
          <RenderPart part={part} key={`model-turn-part-${j}`} />
        ))} */}
    </div>
  )
}

export default memo(ModelTurnLog)
