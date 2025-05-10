// src/components/journals/details/JournalDetails.tsx (Ví dụ đường dẫn mới)
'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { JournalResponse } from '../../../../models/response/journal.response'
import { Header } from '../../utils/Header'
import Footer from '../../utils/Footer'
import NotFoundPage from '../../utils/NotFoundPage'
import JournalReport from './JournalReport' // Giả sử các component con nằm cùng thư mục
import { JournalTabs } from './JournalTabs'
import { RecommendedJournals } from './RecommendedJournals'
import { RecentlyAddedJournals } from './RecentlyAddedJournals'
import SubjectAreasJournals from '../../home/SubjectAreasJournals'
import { useTranslations } from 'next-intl'

const JournalDetails = ({ locale }: { locale: string }) => {
  const t = useTranslations()

  const searchParams = useSearchParams()
  const idFromQuery = searchParams.get('id') // Lấy Sourceid từ query param 'id'

  // State để lưu trữ journal tìm thấy, trạng thái loading và lỗi
  const [journal, setJournal] = useState<JournalResponse | null | undefined>(
    undefined
  ) // undefined: chưa fetch, null: không tìm thấy, object: tìm thấy
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Hàm để fetch và tìm kiếm journal
    const fetchAndFindJournal = async () => {
      // Nếu không có id trong query param, không cần fetch
      if (!idFromQuery) {
        console.log("No 'id' (Sourceid) found in query parameters.")
        setJournal(null) // Đánh dấu là không tìm thấy
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      setJournal(undefined) // Reset journal state trong khi fetch

      try {
        console.log(`Fetching all journals to find Sourceid: ${idFromQuery}...`)
        const response = await fetch('/api/journal') // Gọi API endpoint

        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`)
        }

        const allJournals: JournalResponse[] = await response.json()
        console.log(
          `Received ${allJournals.length} journals from API. Searching for Sourceid: ${idFromQuery}`
        )

        // Tìm kiếm journal trong danh sách trả về từ API
        const foundJournal = allJournals.find(j => j.Sourceid === idFromQuery)

        if (foundJournal) {
          console.log(`Journal found:`, foundJournal.Title)
          setJournal(foundJournal)
        } else {
          console.log(
            `Journal with Sourceid ${idFromQuery} not found in the fetched data.`
          )
          setJournal(null) // Đánh dấu là không tìm thấy
        }
      } catch (err: any) {
        console.error('Failed to fetch or find journal:', err)
        setError(err.message || 'An unknown error occurred')
        setJournal(null) // Đặt là null khi có lỗi
      } finally {
        setLoading(false) // Kết thúc loading
      }
    }

    fetchAndFindJournal()

    // Chạy lại effect khi idFromQuery thay đổi
  }, [idFromQuery])

  // --- Render Logic ---

  // Trường hợp đang loading
  if (loading) {
    return (
      <>
        <Header locale={locale} />
        <div className='flex min-h-screen items-center justify-center'>
          <p>{t('Loading_journal_details')}</p> {/* Hoặc component spinner */}
        </div>
        <Footer />
      </>
    )
  }

  // Trường hợp có lỗi fetch hoặc không tìm thấy journal (bao gồm cả không có id)
  if (error || journal === null) {
    return (
      <>
        <Header locale={locale} />
        {error && (
          <div className='py-4 text-center text-red-500'>
            {t('Error')}: {error}
          </div>
        )}
        <NotFoundPage />
        <Footer />
      </>
    )
  }

  // Trường hợp đã load xong và tìm thấy journal (journal không phải null/undefined)
  if (journal) {
    return (
      <div className=''>
        <Header locale={locale} />
        <div className='w-full bg-background py-10'></div>
        <JournalReport journal={journal} />
        <JournalTabs journal={journal} />
        {/* <RecommendedJournals /> */}
        <RecentlyAddedJournals />
        <SubjectAreasJournals />
        <Footer />
      </div>
    )
  }

  // Trường hợp mặc định (không nên xảy ra nếu logic trên đúng)
  return (
    <>
      <Header locale={locale} />
      <div className='flex min-h-screen items-center justify-center'>
        <p>{t('Something_went_wrong')}</p>
      </div>
      <Footer />
    </>
  )
}

export default JournalDetails
