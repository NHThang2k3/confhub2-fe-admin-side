// src/app/[locale]/chatbot/regular/LoadingIndicator.tsx
import React from 'react'
import {
  FiDownloadCloud,
  FiCpu,
  FiSettings,
  FiSearch,
  FiDatabase,
  FiEdit,
  FiAlertTriangle,
  FiHelpCircle,
  FiLoader, // <<< Icon chung cho trạng thái loading/chờ
  FiCheckSquare, // <<< Icon cho trạng thái sẵn sàng/đã load xong (tùy chọn)
  FiFilePlus // <<< Icon cho việc bắt đầu chat mới
} from 'react-icons/fi' // Hoặc thư viện icon bạn đang dùng
import { MdOutlineAltRoute } from 'react-icons/md'
import { useTranslations } from 'next-intl'

/**
 * Ánh xạ các step chi tiết vào một IconComponent đại diện cho giai đoạn chính.
 */
const getLoadingPhaseIcon = (step: string): React.ElementType => {
  const normalizedStep = step.toLowerCase()

  // --- Giai đoạn Lỗi / Warning ---
  if (
    normalizedStep.includes('error') ||
    normalizedStep.includes('failed') ||
    normalizedStep.includes('not_found') ||
    normalizedStep.includes('unknown_function') ||
    normalizedStep.includes('max_turns') ||
    normalizedStep.includes('warn')
  ) {
    return FiAlertTriangle
  }

  // === CÁC STEP MỚI LIÊN QUAN ĐẾN HISTORY/CONVERSATION ===
  if (
    normalizedStep === 'loading_history' ||
    normalizedStep === 'fetching_list'
  ) {
    // Thêm fetching_list nếu có
    return FiLoader // Icon loading chung khi tải dữ liệu
  }
  if (normalizedStep === 'history_loaded') {
    // Thường không hiển thị loading nữa, nhưng có thể dùng icon check nếu muốn
    return FiCheckSquare // Hoặc trả về null/FiCpu nếu không muốn hiển thị gì đặc biệt
  }
  if (normalizedStep === 'starting_new_chat') {
    return FiFilePlus // Icon cho việc tạo mới
  }
  if (normalizedStep === 'new_chat_ready') {
    // Tương tự history_loaded, có thể không cần icon
    return FiCheckSquare // Hoặc null/FiCpu
  }
  // ======================================================

  // Routing Task
  if (normalizedStep === 'routing_task') {
    return MdOutlineAltRoute
  }
  // --- Giai đoạn Xử lý Input ---
  if (normalizedStep === 'processing_input' || normalizedStep === 'sending') {
    // Thêm 'sending'
    return FiDownloadCloud
  }

  // --- Giai đoạn Suy nghĩ / Lập kế hoạch ---
  if (normalizedStep === 'thinking') {
    return FiCpu
  }

  // --- Giai đoạn Gọi Function / Thực thi Hành động ---
  if (
    normalizedStep.startsWith('function_call') ||
    normalizedStep.startsWith('validating') ||
    normalizedStep.startsWith('preparing') ||
    normalizedStep.startsWith('executing') ||
    normalizedStep.endsWith('action_prepared') ||
    normalizedStep.startsWith('determining') ||
    normalizedStep === 'processing_request' ||
    normalizedStep === 'confirming_email'
  ) {
    // Thêm confirming_email
    return FiSettings
  }

  // --- Giai đoạn Truy xuất / Tìm kiếm Thông tin ---
  if (
    normalizedStep.startsWith('retrieving') ||
    normalizedStep.startsWith('finding') ||
    normalizedStep.startsWith('checking')
  ) {
    return FiSearch
  }

  // --- Giai đoạn Xử lý Kết quả / Dữ liệu ---
  if (
    normalizedStep.startsWith('processing_function_result') ||
    normalizedStep.startsWith('parsing') ||
    normalizedStep.endsWith('found') ||
    normalizedStep.endsWith('checked') ||
    normalizedStep.endsWith('determined') ||
    normalizedStep.endsWith('success') || // Có thể giữ lại hoặc chuyển về FiCpu
    normalizedStep.startsWith('email_')
  ) {
    // email_success, email_failed
    return FiDatabase
  }

  // --- Giai đoạn Tạo Phản hồi ---
  if (
    normalizedStep === 'generating_response' ||
    normalizedStep === 'streaming_response'
  ) {
    // Thêm streaming
    return FiEdit
  }

  // --- Mặc định / Fallback ---
  console.warn(`LoadingIndicator: Unknown step "${step}", using default icon.`)
  return FiCpu // Thinking làm mặc định
}

interface LoadingIndicatorProps {
  step: string
  message: string
  timeCounter: string | undefined
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  step,
  message,
  timeCounter
}) => {
  const PhaseIconComponent = getLoadingPhaseIcon(step)
  const t = useTranslations()

  // --- CẬP NHẬT LOGIC ẨN ---
  // Các step báo hiệu quá trình loading/chờ đã kết thúc và không cần hiển thị indicator nữa
  const completedSteps = [
    'history_loaded',
    'new_chat_ready',
    'result_received',
    'connected', // Thường không hiển thị loading khi chỉ connected
    'disconnected', // Không hiển thị loading khi disconnected
    'email_success', // Có thể ẩn sau một thời gian ngắn hoặc nếu không có message
    'email_failed', // Tương tự email_success
    'email_cancelled' // Tương tự
    // Thêm các step khác nếu cần
  ]

  // Ẩn indicator nếu step nằm trong danh sách hoàn thành
  if (completedSteps.includes(step)) {
    // Có thể thêm điều kiện chỉ ẩn nếu !message nếu bạn *muốn* giữ lại indicator
    // khi có thông báo kết quả (ví dụ: email_success với message "Email sent!")
    // if (!message) {
    return null // Ẩn hoàn toàn
    // }
  }
  // --------------------------

  return (
    <div
      id='loading-container'
      className='mb-2 flex animate-pulse items-center space-x-2 text-gray-600 dark:text-gray-400'
    >
      <button
        disabled
        type='button'
        className='inline-flex items-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-medium dark:border-gray-600 dark:bg-gray-700'
        title={`Current step: ${step.replace(/_/g, ' ')}`}
      >
        {/* Spinner vẫn giữ */}
        <svg
          aria-hidden='true'
          role='status'
          className='me-2 inline h-3.5 w-3.5 animate-spin text-gray-200 dark:text-gray-500'
          viewBox='0 0 100 101'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
            fill='currentColor'
          />
          <path
            d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
            fill='#1C64F2'
          />
        </svg>

        {/* Icon Giai đoạn */}
        {PhaseIconComponent && (
          <PhaseIconComponent
            className='me-2 h-4 w-4 flex-shrink-0'
            aria-hidden='true'
          />
        )}

        {/* Thông điệp Step */}
        {/* Chỉ hiển thị message nếu nó khác với các thông báo mặc định hoặc loading */}
        {message &&
          !['Loading history...', 'Starting new chat...', ''].includes(
            message
          ) && <span className='truncate'>{message}</span>}
        {/* Hiển thị thông báo mặc định nếu không có message cụ thể cho các step loading */}
        {step === 'loading_history' && !message && (
          <span className='truncate'>{t('Loading_history')}</span>
        )}
        {step === 'starting_new_chat' && !message && (
          <span className='truncate'>{t('Starting_new_chat')}</span>
        )}
        {step === 'sending' && !message && (
          <span className='truncate'>{t('Sending')}</span>
        )}
        {/* Có thể thêm các step khác nếu cần thông báo mặc định */}
      </button>
      {/* Bộ đếm thời gian */}
      {timeCounter && (
        <span
          id='time-counter'
          className='flex-shrink-0 font-mono text-sm text-gray-500'
        >
          {timeCounter}
        </span>
      )}
    </div>
  )
}

export default LoadingIndicator
