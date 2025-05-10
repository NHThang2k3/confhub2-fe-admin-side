// ChatInput.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Button from '../../../utils/Button' // Assuming Button component path
import { GrSend } from 'react-icons/gr'
// Optional: Import a spinner component from a library
// import { ClipLoader } from 'react-spinners'; // Example using react-spinners
import { useTranslations } from 'next-intl'

// --- Refined Tailwind Spinner SVG Component ---
const SpinnerIcon = () => (
  <svg
    // animate-spin: Tailwind animation
    // h-5 w-5: Kích thước spinner (có thể điều chỉnh)
    // text-blue-600: Màu sắc spinner (có thể dùng màu thương hiệu của bạn)
    className='h-5 w-5 animate-spin text-blue-600'
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
  >
    <circle
      // Phần "track" mờ hơn của spinner
      className='opacity-25' // Giữ nguyên hoặc giảm nhẹ nếu muốn (vd: opacity-20)
      cx='12'
      cy='12'
      r='10'
      stroke='currentColor'
      strokeWidth='4' // Có thể giảm strokeWidth nếu muốn spinner mảnh hơn
    ></circle>
    <path
      // Phần quay chính của spinner, rõ ràng hơn
      className='opacity-100' // Tăng opacity để nổi bật hơn (trước là 75)
      fill='currentColor'
      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    ></path>
  </svg>
)

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onFillInput?: (fillInputCallback: (text: string) => void) => void
  disabled?: boolean
  isLoading?: boolean // Prop để kiểm soát trạng thái loading
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFillInput,
  disabled = false,
  isLoading = false
}) => {
  const t = useTranslations()

  const [message, setMessage] = useState<string>('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  // Không cần state isFocused nếu không sử dụng để thay đổi style phức tạp
  // const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    const handleFill = (text: string) => {
      setMessage(text)
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
    if (onFillInput) {
      onFillInput(handleFill)
    }
  }, [onFillInput])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value)
    },
    []
  )

  // Kết hợp trạng thái disabled và isLoading
  const isEffectivelyDisabled = disabled || isLoading

  const handleSendMessage = useCallback(() => {
    if (message.trim() && !isEffectivelyDisabled) {
      onSendMessage(message)
      setMessage('')
    }
  }, [message, onSendMessage, isEffectivelyDisabled])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (isEffectivelyDisabled) {
        // Ngăn chặn nhập thêm khi đang tải hoặc bị vô hiệu hóa
        e.preventDefault()
        return
      }

      // Ctrl+Enter để gửi, Enter để xuống dòng
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault() // Ngăn xuống dòng khi Ctrl+Enter
        handleSendMessage()
      }
      // Nếu muốn Enter để gửi và Shift+Enter để xuống dòng thì bỏ comment phần dưới
      /*
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
    */
    },
    [handleSendMessage, isEffectivelyDisabled]
  )

  // Không cần useCallback cho handleFocus/Blur nếu chỉ set state đơn giản
  // const handleFocus = () => setIsFocused(true);
  // const handleBlur = () => setIsFocused(false);

  return (
    // ${isEffectivelyDisabled ? 'opacity-60 bg-gray-50' : 'bg-white'}
    // --- Improved Styling ---
    <div
      className={`
      flex w-full items-center rounded-full                   
      p-1 transition-all duration-200 
      ease-in-out focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500  

    `}
    >
      <TextareaAutosize
        className='flex-grow resize-none bg-transparent px-4 py-2 text-sm  outline-none disabled:cursor-not-allowed' // Bỏ disabled:bg-gray-100 vì đã xử lý ở div cha
        placeholder={t('Enter_message_Ctrl_Enter_to_send')}
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        rows={1}
        maxRows={5} // Giới hạn chiều cao tối đa
        // onFocus={handleFocus} // Không cần thiết nếu không dùng isFocused
        // onBlur={handleBlur}
        disabled={isEffectivelyDisabled}
        aria-label='Nội dung tin nhắn'
      />

      <Button
        variant='secondary' // Sử dụng ghost hoặc một variant không có background mặc định để dễ tùy chỉnh hover
        size='medium' // Sử dụng size 'icon' nếu Button component hỗ trợ để tối ưu padding/margin cho icon
        rounded={true} // Giữ bo tròn
        onClick={handleSendMessage}
        disabled={isEffectivelyDisabled}
        aria-label={isLoading ? t('Sending') : t('Send_message')}
        className={`
         h-12                                
        `}
        // style={{ minWidth: '32px', minHeight: '32px' }}
      >
        {/* --- Conditional Rendering: Spinner or Send Icon --- */}
        {isLoading ? (
          <SpinnerIcon />
        ) : (
          // --- Hoặc dùng thư viện react-spinners ---
          // <ClipLoader size={18} color={"#2563EB"} loading={true} /> // Điều chỉnh size/color phù hợp
          <GrSend className='h-4 w-4 text-button' size={18} /> // Điều chỉnh kích thước icon nếu cần
        )}
      </Button>
    </div>
  )
}

export default ChatInput
