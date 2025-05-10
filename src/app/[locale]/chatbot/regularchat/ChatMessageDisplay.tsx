// src/app/[locale]/chatbot/chat/ChatMessageDisplay.tsx
import React, { useState } from 'react'
import type { ReactHTML, PropsWithChildren } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import remarkBreaks from 'remark-breaks'
import {
  MessageType,
  ThoughtStep
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'
import { TriangleAlert, Copy, Pencil, Check } from 'lucide-react'
import { toast } from 'react-toastify'
import Map from '../../conferences/detail/Map'
import ThoughtProcess from './ThoughtProcess'
// Helper type (optional, makes it cleaner)
type MarkdownComponentProps<T extends keyof ReactHTML> = PropsWithChildren<
  JSX.IntrinsicElements[T] & {
    node?: unknown
  }
>

// --- Props Interface ---
interface ChatMessageDisplayProps {
  id: string
  message: string
  isUser: boolean
  type: MessageType
  thoughts?: ThoughtStep[]
  location?: string
}

const ChatMessageDisplay: React.FC<ChatMessageDisplayProps> = ({
  id,
  message,
  isUser,
  type = 'text',
  thoughts,
  location
}) => {
  const [isCopied, setIsCopied] = useState(false)

  // --- Event Handlers ---
  const handleCopyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (isCopied) return
    navigator.clipboard
      .writeText(message)
      .then(() => {
        toast.success('Copied to clipboard!')
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => {
        console.error('Failed to copy message: ', err)
        toast.error('Copy failed. Please try again.')
      })
  }

  const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    console.log('Edit button clicked for message:', message)
    // TODO: Implement actual edit functionality
  }

  // --- Dynamic Styling ---
  const bubbleClasses = `
        group relative
        max-w-[85%] md:max-w-[80%] p-3 rounded-lg shadow-sm flex flex-col text-sm
        ${isUser
      ? 'bg-blue-500 text-white rounded-br-none'
      : type === 'error'
        ? 'bg-red-100 text-red-700 border border-red-200 rounded-bl-none dark:bg-red-900/20 dark:text-red-200 dark:border-red-500/30' // Added dark error
        : type === 'warning'
          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-bl-none dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-500/30' // Added dark warning
          : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600' // Added dark default
    }
        ${type === 'map' ? 'w-full md:w-[80%] lg:w-[70%]' : ''}
    `

  return (
    <div className={bubbleClasses}>
      {/* Optional: Icon for Error/Warning */}
      {type === 'error' && (
        <TriangleAlert className='absolute -left-1.5 -top-1.5 mr-1.5 inline-block h-4 w-4 rounded-full bg-white p-0.5 text-red-600 shadow dark:bg-gray-800 dark:text-red-400' />
      )}
      {type === 'warning' && (
        <TriangleAlert className='absolute -left-1.5 -top-1.5 mr-1.5 inline-block h-4 w-4 rounded-full bg-white p-0.5 text-yellow-600 shadow dark:bg-gray-800 dark:text-yellow-400' />
      )}

      {/* === CONDITIONAL CONTENT RENDERING === */}
      {type === 'map' && location ? (
        <div className='map-content-wrapper py-1'>
          {message && message !== `Showing map for: ${location}` && (
            <p className='mb-2 text-sm font-medium '>{message}</p>
          )}
          <Map location={location} />
        </div>
      ) : (
        <div className={`message-content whitespace-pre-wrap break-words`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
            components={{
              p: ({ node: _, ...props }: MarkdownComponentProps<'p'>) => (
                <p {...props} />
              ),
              a: ({ node: _, ...props }: MarkdownComponentProps<'a'>) => (
                <a
                  {...props}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500 hover:underline dark:text-blue-400'
                />
              ),
              pre: ({ node: _, ...props }: MarkdownComponentProps<'pre'>) => (
                <pre
                  className='my-2 overflow-x-auto rounded-md bg-gray-100 p-2 text-gray-800 dark:bg-gray-800 dark:text-gray-200' // Adjusted pre style
                  {...props}
                />
              ),
              code: ({ node: _, ...props }: MarkdownComponentProps<'code'>) => (
                <code
                  className='rounded bg-gray-200 px-1 py-0.5 font-mono text-xs text-red-600 dark:bg-gray-600 dark:text-red-400'
                  {...props}
                /> // Adjusted code style
              ),
              h1: ({ node: _, ...props }: MarkdownComponentProps<'h1'>) => (
                <h1 className='my-4 text-2xl font-bold' {...props} />
              ),
              h2: ({ node: _, ...props }: MarkdownComponentProps<'h2'>) => (
                <h2 className='my-3 text-xl font-semibold' {...props} />
              ),
              h3: ({ node: _, ...props }: MarkdownComponentProps<'h3'>) => (
                <h3 className='my-2 text-lg font-medium' {...props} />
              ),
              ul: ({ node: _, ...props }: MarkdownComponentProps<'ul'>) => (
                <ul className='my-2 list-inside list-disc pl-2' {...props} />
              ),
              ol: ({ node: _, ...props }: MarkdownComponentProps<'ol'>) => (
                <ol className='my-2 list-inside list-decimal pl-2' {...props} />
              ),
              li: ({ node: _, ...props }: MarkdownComponentProps<'li'>) => (
                <li className='my-1' {...props} />
              )
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
      )}

      {/* --- Action Buttons --- */}
      {(isUser || (type !== 'map' && !isUser)) && (
        <div
          className={`absolute -bottom-1.5 flex space-x-1 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100
                          ${isUser ? '-right-1.5' : '-left-1.5'}`}
        >
          {type !== 'map' && (
            <button
              onClick={handleCopyClick}
              className={`rounded-full border border-gray-200 bg-white p-1 text-gray-500 shadow-sm transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200 ${isCopied ? 'text-green-500 dark:text-green-400' : ''}`}
              aria-label={isCopied ? 'Copied' : 'Copy message'}
              title={isCopied ? 'Copied!' : 'Copy message'}
              disabled={isCopied}
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
          {isUser && (
            <button
              onClick={handleEditClick}
              className={`rounded-full border border-gray-200 bg-white p-1 text-gray-500 shadow-sm hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200`}
              aria-label='Edit message'
              title='Edit message'
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
      )}

      {/* --- Thoughts Section (Using ThoughtProcess Component) --- */}
      {/* <<<--- 2 & 3. REPLACE <details> with <ThoughtProcess> and PASS props --->>> */}
      {!isUser && thoughts && thoughts.length > 0 && (
        // Add margin-top to separate from the main bubble content
        <div className='mt-3 border-t border-black/10 pt-2 dark:border-white/20'>
          <ThoughtProcess thoughts={thoughts} />
        </div>
      )}
    </div>
  )
}

export default ChatMessageDisplay

// Phiên bản xử lý nếu có error:

// // src/app/[locale]/chatbot/chat/ChatMessageDisplay.tsx
// import React, { useState } from 'react';
// import type { ReactHTML, PropsWithChildren } from 'react';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import rehypeRaw from 'rehype-raw';
// import remarkBreaks from 'remark-breaks';
// import { MessageType, ThoughtStep } from '@/src/models/chatbot/chatbot';
// import { TriangleAlert, Copy, Pencil, Check } from 'lucide-react';
// import { toast } from 'react-toastify';
// import Map from '../../conferences/detail/Map';
// import ThoughtProcess from './ThoughtProcess'; // Đã import

// // Helper type
// type MarkdownComponentProps<T extends keyof ReactHTML> = PropsWithChildren<
//     JSX.IntrinsicElements[T] & {
//         node?: unknown;
//     }
// >;

// // Props Interface
// interface ChatMessageDisplayProps {
//     id: string;
//     message: string; // <<< Vẫn nhận message gốc từ props
//     isUser: boolean;
//     type: MessageType;
//     thoughts?: ThoughtStep[];
//     location?: string;
// }

// // --- Thông báo lỗi thân thiện với người dùng ---
// // Có thể đặt ở file constants hoặc sử dụng i18n để đa ngôn ngữ
// const USER_FRIENDLY_ERROR_MESSAGE = "Sorry, something went wrong while processing your request. Please try again or rephrase your question.";

// const ChatMessageDisplay: React.FC<ChatMessageDisplayProps> = ({
//     id,
//     message, // <<< message gốc
//     isUser,
//     type = 'text',
//     thoughts,
//     location
// }) => {
//     const [isCopied, setIsCopied] = useState(false);

//     // --- Event Handlers ---
//     const handleCopyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//         event.stopPropagation();
//         if (isCopied) return;
//         // Quyết định xem nên copy message gốc hay message hiển thị?
//         // Thường thì người dùng muốn copy cái họ thấy. Nhưng nếu là lỗi, message gốc có thể hữu ích hơn cho debug.
//         // -> Tạm thời vẫn copy message GỐC (props.message) khi type là error.
//         const textToCopy = message; // Luôn copy message gốc
//         navigator.clipboard.writeText(textToCopy)
//             .then(() => {
//                 toast.success("Copied to clipboard!");
//                 setIsCopied(true);
//                 setTimeout(() => setIsCopied(false), 2000);
//             })
//             .catch(err => {
//                 console.error("Failed to copy message: ", err);
//                 toast.error("Copy failed. Please try again.");
//             });
//     };

//     const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//         event.stopPropagation();
//         console.log("Edit button clicked for message:", message);
//         // TODO: Implement actual edit functionality
//     };

//     // --- Dynamic Styling ---
//     const bubbleClasses = `
//         group relative
//         max-w-[85%] md:max-w-[80%] p-3 rounded-lg shadow-sm flex flex-col text-sm
//         ${isUser
//             ? 'bg-blue-500 text-white rounded-br-none'
//             : type === 'error'
//                 ? 'bg-red-100 text-red-700 border border-red-200 rounded-bl-none dark:bg-red-900/20 dark:text-red-200 dark:border-red-500/30'
//                 : type === 'warning'
//                     ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-bl-none dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-500/30'
//                     : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
//         }
//         ${type === 'map' ? 'w-full md:w-[80%] lg:w-[70%]' : ''}
//     `;

//     // --- Xác định nội dung sẽ hiển thị ---
//     // Nếu là lỗi, hiển thị thông báo thân thiện. Ngược lại, hiển thị message gốc.
//     const displayContent = type === 'error' ? USER_FRIENDLY_ERROR_MESSAGE : message;

//     return (
//         <div className={bubbleClasses}>
//             {/* Icon cho Error/Warning */}
//             {type === 'error' && <TriangleAlert className="w-4 h-4 mr-1.5 inline-block text-red-600 dark:text-red-400 absolute -top-1.5 -left-1.5 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow" />}
//             {type === 'warning' && <TriangleAlert className="w-4 h-4 mr-1.5 inline-block text-yellow-600 dark:text-yellow-400 absolute -top-1.5 -left-1.5 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow" />}

//             {/* === CONDITIONAL CONTENT RENDERING === */}
//             {type === 'map' && location ? (
//                 <div className="map-content-wrapper py-1">
//                     {message && message !== `Showing map for: ${location}` && (
//                         <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{message}</p>
//                     )}
//                     <Map location={location} />
//                 </div>
//             ) : (
//                 // --- Render Text/Markdown Content ---
//                 // <<< Sử dụng displayContent thay vì message trực tiếp >>>
//                 <div className={`message-content whitespace-pre-wrap break-words`}>
//                     <ReactMarkdown
//                         remarkPlugins={[remarkGfm, remarkBreaks]}
//                         rehypePlugins={[rehypeRaw]}
//                         components={{
//                             // ... (giữ nguyên các components markdown)
//                              p: ({ node: _, ...props }: MarkdownComponentProps<'p'>) => <p {...props} />,
//                             a: ({ node: _, ...props }: MarkdownComponentProps<'a'>) => (
//                                 <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline dark:text-blue-400" />
//                             ),
//                             pre: ({ node: _, ...props }: MarkdownComponentProps<'pre'>) => (
//                                 <pre
//                                     className='overflow-x-auto rounded-md bg-gray-100 dark:bg-gray-800 p-2 my-2 text-gray-800 dark:text-gray-200'
//                                     {...props}
//                                 />
//                             ),
//                             code: ({ node: _, ...props }: MarkdownComponentProps<'code'>) => (
//                                 <code className='rounded bg-gray-200 dark:bg-gray-600 px-1 py-0.5 text-red-600 dark:text-red-400 font-mono text-xs' {...props} />
//                             ),
//                             h1: ({ node: _, ...props }: MarkdownComponentProps<'h1'>) => (
//                                 <h1 className='my-4 text-2xl font-bold' {...props} />
//                             ),
//                             h2: ({ node: _, ...props }: MarkdownComponentProps<'h2'>) => (
//                                 <h2 className='my-3 text-xl font-semibold' {...props} />
//                             ),
//                             h3: ({ node: _, ...props }: MarkdownComponentProps<'h3'>) => (
//                                 <h3 className='my-2 text-lg font-medium' {...props} />
//                             ),
//                             ul: ({ node: _, ...props }: MarkdownComponentProps<'ul'>) => (
//                                 <ul className='my-2 list-inside list-disc pl-2' {...props} />
//                             ),
//                             ol: ({ node: _, ...props }: MarkdownComponentProps<'ol'>) => (
//                                 <ol className='my-2 list-inside list-decimal pl-2' {...props} />
//                             ),
//                             li: ({ node: _, ...props }: MarkdownComponentProps<'li'>) => <li className='my-1' {...props} />,
//                         }}
//                     >
//                         {displayContent}
//                     </ReactMarkdown>
//                 </div>
//             )}

//             {/* --- Action Buttons --- */}
//             {/* Nút Copy vẫn có thể hoạt động và copy message gốc (props.message) */}
//             {(isUser || (type !== 'map' && !isUser)) && (
//                  <div className={`absolute -bottom-1.5 flex space-x-1 transition-opacity duration-150 opacity-0 group-hover:opacity-100 focus-within:opacity-100
//                           ${isUser ? '-right-1.5' : '-left-1.5'}`}>
//                     {/* Copy Button: Hiện cho message bot (text, error, warning) và user */}
//                     {/* Cân nhắc: Có nên cho copy message lỗi thân thiện không? Hay ẩn nút copy khi lỗi? */}
//                     {/* -> Tạm thời giữ lại nút copy, nó sẽ copy message GỐC */}
//                     {type !== 'map' && (
//                          <button
//                             onClick={handleCopyClick}
//                             className={`p-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors duration-150 ${isCopied ? 'text-green-500 dark:text-green-400' : ''}`}
//                             aria-label={isCopied ? "Copied" : "Copy original message"} // Cập nhật label/title
//                             title={isCopied ? "Copied!" : "Copy original message"}
//                             disabled={isCopied}
//                         >
//                             {isCopied ? <Check size={14} /> : <Copy size={14} />}
//                         </button>
//                     )}
//                     {isUser && (
//                         <button
//                             onClick={handleEditClick}
//                             className={`p-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500`}
//                             aria-label="Edit message"
//                             title="Edit message"
//                         >
//                             <Pencil size={14} />
//                         </button>
//                     )}
//                 </div>
//             )}

//             {/* --- Thoughts Section --- */}
//             {/* Component ThoughtProcess sẽ hiển thị thoughts (nếu có) */}
//             {/* Backend nên đưa lỗi gốc vào thoughts nếu muốn developer thấy được */}
//             {
//                 !isUser && thoughts && thoughts.length > 0 && (
//                     <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/20">
//                          <ThoughtProcess thoughts={thoughts} />
//                     </div>
//                 )
//             }
//         </div >
//     );
// };

// export default ChatMessageDisplay;
