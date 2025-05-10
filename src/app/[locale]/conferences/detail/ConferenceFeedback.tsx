// src/app/[locale]/conferences/detail/ConferenceFeedback.tsx

import React, { useState, useMemo, useEffect } from 'react' // Thêm useEffect
import { ConferenceResponse } from '../../../../models/response/conference.response' // Adjust path
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import useAddFeedback from '../../../../hooks/conferenceDetails/useAddFeedBack' // Adjust path
import useAuthApi from '@/src/hooks/auth/useAuthApi' // Adjust path
import { Feedback, SortOption } from '../../../../models/send/feedback.send'
import GeneralPagination from '../../utils/GeneralPagination'
// Import Hooks
import { useProcessedFeedbacks } from '@/src/hooks/conferenceDetails/feedback/useProcessedFeedbacks' // Adjust path

// Import Utils
import {
  calculateOverallRating,
  calculateRatingDistribution
} from './feedback/utils/feedbackUtils' // Adjust path

// Import Components
import FeedbackControls from './feedback/FeedbackControls' // Adjust path
import FeedbackSummary from './feedback/FeedbackSummary' // Adjust path
import FeedbackItem from './feedback/FeedbackItem' // Adjust path
import FeedbackForm from './feedback/FeedbackForm' // Adjust path
import SignInPrompt from './feedback/SignInPrompt' // Adjust path
import { useTranslations } from 'next-intl'

interface ConferenceFeedbackProps {
  conferenceData: ConferenceResponse | null
}

const ITEMS_PER_PAGE = 5 // Define how many feedbacks per page

const ConferenceFeedback: React.FC<ConferenceFeedbackProps> = ({
  conferenceData
}) => {
  const t = useTranslations('feedback')

  // --- State ---
  const [filterStar, setFilterStar] = useState<number | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('time')
  const [description, setDescription] = useState('')
  const [star, setStar] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1) // State for pagination
  const [isClient, setIsClient] = useState(false) // <-- Thêm state để theo dõi client mount

  // --- Hooks ---
  const { submitFeedback, loading, error, newFeedback } = useAddFeedback()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isLoggedIn } = useAuthApi() // Hook này vẫn được gọi

  // --- Effects ---
  useEffect(() => {
    // Effect này chỉ chạy sau khi component mount ở phía client
    setIsClient(true)
  }, []) // Mảng dependency rỗng đảm bảo nó chỉ chạy một lần sau khi mount

  // --- Data Preparation ---
  const conferenceId = conferenceData?.id
  const baseFeedbacks = conferenceData?.feedbacks ?? []

  // Combine base feedbacks and new feedback (if any)
  const allFeedbacks = useMemo(() => {
    const combined: Feedback[] = [...baseFeedbacks] // Ensure type
    if (newFeedback && !combined.some(f => f.id === newFeedback.id)) {
      combined.unshift(newFeedback) // Add to beginning
    }
    return combined
  }, [baseFeedbacks, newFeedback])

  // Filter and Sort Feedbacks using custom hook
  const displayedFeedbacks = useProcessedFeedbacks(
    allFeedbacks,
    filterStar,
    sortOption
  )

  // --- Pagination Logic ---
  const totalPages = Math.ceil(displayedFeedbacks.length / ITEMS_PER_PAGE)

  // Get the feedbacks for the *current* page using slice
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return displayedFeedbacks.slice(startIndex, endIndex)
  }, [displayedFeedbacks, currentPage])

  // Handler for the Pagination component
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Reset page to 1 when filters/sort change
  useEffect(() => {
    // Đổi tên React.useEffect thành useEffect cho nhất quán
    setCurrentPage(1)
  }, [filterStar, sortOption])

  const totalReviews = displayedFeedbacks.length // Total *filtered/sorted* reviews

  // --- Calculations (Based on *all* feedbacks) ---
  const { overallRating, ratingDistribution } = useMemo(() => {
    const reviews = allFeedbacks
    return {
      overallRating: calculateOverallRating(reviews),
      ratingDistribution: calculateRatingDistribution(reviews)
    }
  }, [allFeedbacks])

  // --- Event Handlers ---
  const handleStarClick = (selectedStar: number) => {
    setStar(selectedStar)
  }

  const handleSubmit = async () => {
    if (!conferenceId || star === null || description.trim() === '') {
      // Nên sử dụng một thông báo tinh tế hơn alert
      console.error('Missing conferenceId, star, or description', {
        conferenceId,
        star,
        description
      })
      return
    }

    const addedFeedback = await submitFeedback(conferenceId, description, star)
    if (addedFeedback) {
      setDescription('')
      setStar(null)
    }
  }

  const handleSignInClick = () => {
    const localePrefix = pathname.split('/')[1] || 'en'
    const fullUrl = `${pathname}?${searchParams.toString()}`
    try {
      localStorage.setItem('returnUrl', fullUrl)
    } catch (e) {
      console.error('Failed to set returnUrl in localStorage', e)
    }
    const pathWithLocale = `/${localePrefix}/auth/login`
    router.push(pathWithLocale)
  }

  // Xác định thông báo khi không có feedback
  let message
  if (paginatedFeedbacks.length > 0) {
    // Kiểm tra paginatedFeedbacks thay vì displayedFeedbacks
    message = t('no_feedback_on_page') // Thông báo này có thể không cần thiết nếu danh sách không rỗng
  } else if (displayedFeedbacks.length === 0) {
    // Nếu không có feedback nào sau khi lọc
    if (filterStar !== null) {
      message = t('no_feedback_matching_filter', { starCount: filterStar })
    } else {
      message = t('no_feedback_yet')
    }
  } else {
    // Nếu có feedback sau khi lọc nhưng trang hiện tại rỗng (trường hợp hiếm)
    message = t('no_feedback_on_page')
  }

  // --- Render ---
  return (
    <div className='container mx-auto rounded-lg px-2 py-2 sm:px-4 lg:px-6'>
      <FeedbackControls
        filterStar={filterStar}
        sortOption={sortOption}
        totalReviews={allFeedbacks.length} // Tổng số feedback chưa lọc
        displayedCount={displayedFeedbacks.length} // Tổng số feedback đã lọc/sắp xếp
        onFilterChange={setFilterStar}
        onSortChange={setSortOption}
      />

      {/* Main Content Area */}
      <div className='mt-6 flex flex-col gap-8 md:flex-row md:gap-8'>
        {' '}
        {/* Thêm khoảng cách mt-6 và gap */}
        {/* === Left Column (Summary & Form/Prompt) === */}
        <div className='w-full md:w-1/2'>
          {' '}
          {/* Điều chỉnh độ rộng cột */}
          <FeedbackSummary
            overallRating={overallRating}
            ratingDistribution={ratingDistribution}
            totalReviews={allFeedbacks.length} // Sử dụng allFeedbacks.length cho tổng số thực
          />
          {/* === Post Feedback Section or Sign In Prompt === */}
          <div className='mt-6'>
            {' '}
            {/* Thêm khoảng cách */}
            {/*
               Render SignInPrompt ban đầu (để khớp với server nếu server render nó).
               Sau khi client mount (isClient = true), render dựa trên isLoggedIn thực tế.
            */}
            {isClient ? ( // Chỉ render phần động sau khi client mount
              isLoggedIn ? (
                <FeedbackForm
                  star={star}
                  description={description}
                  loading={loading}
                  error={error}
                  onStarClick={handleStarClick}
                  onDescriptionChange={setDescription}
                  onSubmit={handleSubmit}
                />
              ) : (
                <SignInPrompt onSignInClick={handleSignInClick} />
              )
            ) : (
              // Render SignInPrompt để khớp với server render (giả định server render cái này)
              // Hoặc bạn có thể render `null` nếu muốn
              <SignInPrompt onSignInClick={handleSignInClick} />
            )}
          </div>
        </div>
        {/* === Right Column (Comments List & Pagination) === */}
        <div className='w-full md:w-1/2 '>
          {' '}
          {/* Điều chỉnh độ rộng cột */}
          {/* Feedback Comments List - Use *paginated* feedbacks */}
          <div className='space-y-4'>
            {' '}
            {/* Bỏ mb-8 ở đây vì đã có gap ở flex container */}
            {paginatedFeedbacks.length === 0 &&
            displayedFeedbacks.length === 0 ? ( // Chỉ hiển thị thông báo khi không có feedback nào cả (sau khi lọc)
              <div className='pt-4 text-center '>{message}</div>
            ) : paginatedFeedbacks.length === 0 &&
              displayedFeedbacks.length > 0 ? ( // Hiển thị nếu trang hiện tại rỗng nhưng có feedback ở trang khác
              <div className='pt-4 text-center '>
                {t('no_feedback_on_page')}
              </div>
            ) : (
              // Render danh sách feedback đã phân trang
              paginatedFeedbacks.map(feedback => (
                <FeedbackItem key={feedback.id} feedback={feedback} />
              ))
            )}
          </div>
          {/* Render Pagination Component chỉ khi có nhiều hơn 1 trang */}
          {totalPages > 1 && (
            <div className='mt-6 flex justify-center'>
              {' '}
              {/* Căn giữa và thêm khoảng cách */}
              <GeneralPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConferenceFeedback
