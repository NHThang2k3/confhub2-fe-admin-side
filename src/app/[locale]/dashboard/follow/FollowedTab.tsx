// FollowedTab.tsx
import React, { useState, useEffect, useCallback } from 'react'
import ConferenceItem from '../../conferences/ConferenceItem'
import {
  getListConferenceFromDB,
  getListConferenceFromJSON
} from '../../../../app/api/conference/getListConferences'
import { ConferenceInfo } from '../../../../models/response/conference.list.response'
import { UserResponse, Follow } from '../../../../models/response/user.response'
import { timeAgo, formatDateFull } from '../timeFormat'
import Tooltip from '../../utils/Tooltip'
import { useTranslations } from 'next-intl'
import { appConfig } from '@/src/middleware'

interface FollowedTabProps {}

// Nên đặt type cho dữ liệu fetch về để dễ quản lý
interface FollowedConferenceResponse extends ConferenceInfo {
  followedAt: string // Thêm trường followedAt từ API response
  // Các trường khác nếu có từ API response
}

const API_GET_USER_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1`

const FollowedTab: React.FC<FollowedTabProps> = () => {
  const t = useTranslations('')
  const language = t('language')

  // Cập nhật kiểu dữ liệu cho state để bao gồm followedAt
  const [followedConferences, setFollowedConferences] = useState<
    FollowedConferenceResponse[] // Sử dụng kiểu dữ liệu đã định nghĩa
  >([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false) // Bạn có thể dùng trạng thái này nếu kiểm tra token ở đây
  const [initialLoad, setInitialLoad] = useState(true)

  const fetchData = useCallback(async () => {
    // Kiểm tra token trước khi fetch
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('No token found, cannot fetch followed conferences.')
      setLoggedIn(false)
      setLoading(false) // Đảm bảo loading tắt nếu không có token
      setFollowedConferences([]) // Xóa dữ liệu cũ nếu có
      return
    }
    setLoggedIn(true) // Đặt trạng thái loggedIn nếu có token
    setLoading(true) // Bắt đầu loading khi fetch

    try {
      const featchFollow = await fetch(
        `${API_GET_USER_ENDPOINT}/follow-conference/followed`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // Sử dụng biến token
          }
        }
      )

      if (!featchFollow.ok) {
        // Xử lý lỗi, ví dụ token hết hạn hoặc user không login (backend trả lỗi 401/403)
        if (featchFollow.status === 401 || featchFollow.status === 403) {
          console.error('Authentication error. Please log in.')
          // Optional: clear token and redirect to login
          localStorage.removeItem('token')
          setLoggedIn(false)
          setFollowedConferences([])
        } else {
          throw new Error(`HTTP error! status: ${featchFollow.status}`)
        }
        // Dừng xử lý nếu có lỗi HTTP
        setLoading(false)
        setInitialLoad(false)
        return // Kết thúc hàm fetchData
      }

      let followed: FollowedConferenceResponse[] = await featchFollow.json()

      // Sắp xếp danh sách theo followedAt giảm dần (mới nhất lên trên)
      followed.sort((a, b) => {
        // Chuyển đổi chuỗi ngày thành đối tượng Date hoặc timestamp để so sánh chính xác
        const dateA = new Date(a.followedAt).getTime()
        const dateB = new Date(b.followedAt).getTime()

        // So sánh b với a để có thứ tự giảm dần (mới nhất trước)
        // Nếu dateB > dateA, kết quả dương -> b đứng trước a
        return dateB - dateA
      })

      setFollowedConferences(followed) // Set mảng đã được sắp xếp
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setFollowedConferences([]) // Xóa dữ liệu nếu fetch thất bại
      setLoggedIn(false) // Giả định lỗi fetch có thể do auth
    } finally {
      // Dừng loading sau khi fetch xong hoặc gặp lỗi
      setLoading(false)
      setInitialLoad(false) // initialLoad chỉ set false sau lần fetch đầu tiên
    }
  }, []) // initialLoad không cần ở đây vì logic set nó đã trong finally

  useEffect(() => {
    fetchData() // Gọi fetchData khi component mount
  }, [fetchData]) // Dependency array chỉ cần fetchData

  // Không cần useEffect này nữa, logic loading đã được handle trong fetchData và finally
  // useEffect(() => {
  //   if (!initialLoad) {
  //     setLoading(false)
  //   }
  // }, [followedConferences, initialLoad])

  // Hiển thị UI dựa trên trạng thái loading và loggedIn
  if (loading) {
    return <div className='container mx-auto p-4'>{t('Loading')}</div>
  }

  // Hiển thị thông báo nếu không logged in hoặc token không hợp lệ
  if (!loggedIn) {
    return (
      <div className='container mx-auto p-4'>
        {t('Please_log_in_to_view_followed_conferences')}
      </div>
    )
  }

  // transformedConferences vẫn làm việc với dữ liệu đã được sắp xếp
  const transformedConferences = followedConferences.map(conf => {
    const conferenceDates = conf.dates

    return {
      id: conf.id!,
      title: conf.title,
      acronym: conf.acronym,
      location: conf.location
        ? `${conf.location.cityStateProvince || ''}, ${conf.location.country || ''}`
        : '',
      fromDate: conferenceDates?.fromDate || undefined,
      toDate: conferenceDates?.toDate || undefined,
      followedAt: conf.followedAt, // Giữ lại followedAt để hiển thị hoặc dùng ở đây nếu cần
      status: conf.status
    }
  })
  // console.log('transformedConferences:', transformedConferences) // Bỏ console.log không cần thiết

  return (
    <div className='container mx-auto p-2 md:p-4'>
      <div className='mb-2 flex items-center justify-between'>
        <h1 className='text-xl font-semibold md:text-2xl'>
          {t('Followed_Conferences')}
        </h1>
        <button
          onClick={fetchData} // Gọi lại fetchData để refresh
          className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
          aria-label='Refresh'
          disabled={loading} // Disable nút khi đang loading
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className={`lucide lucide-refresh-cw ${loading ? 'animate-spin' : ''}`} // Thêm hiệu ứng spin khi loading
          >
            <path d='M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.67 2.62' />
            <path d='M22 4v4h-4' />
          </svg>
        </button>
      </div>

      {/* Sử dụng followedConferences trực tiếp sau khi đã sắp xếp */}
      {followedConferences.length === 0 ? (
        // Hiển thị thông báo phù hợp nếu không có conference nào
        <p>
          {loggedIn
            ? t('You_are_not_following_any_conferences_yet')
            : t('Please_log_in_to_view_followed_conferences')}
        </p>
      ) : (
        followedConferences.map(conference => {
          // console.log('Rendering ConferenceItem with conference:', conference) // Bỏ console.log không cần thiết
          return (
            <div
              className='mb-4 rounded-xl md:border-2 md:px-4 md:py-2 md:shadow-xl'
              key={conference.id}
            >
              {/* Hiển thị thời gian follow */}
              {conference.followedAt && (
                <div className='flex text-xs md:text-base'>
                  <span className='mr-1 '>{t('Followed_Time')}: </span>
                  <Tooltip
                    text={formatDateFull(conference.followedAt, language)}
                  >
                    <span>{timeAgo(conference.followedAt, language)}</span>
                  </Tooltip>
                </div>
              )}

              {/* Truyền dữ liệu conference đến ConferenceItem */}
              <ConferenceItem
                key={conference.id} // Key nên ở div bọc ngoài hoặc ở đây
                conference={{
                  id: conference.id!,
                  title: conference.title,
                  acronym: conference.acronym,
                  location: conference.location
                    ? `${conference.location.cityStateProvince || ''}, ${conference.location.country || ''}`
                    : '',
                  fromDate: conference.dates?.fromDate, // Truy cập lại từ conference.dates
                  toDate: conference.dates?.toDate // Truy cập lại từ conference.dates
                  // Không cần truyền followedAt vào ConferenceItem nếu nó chỉ hiển thị trong div này
                }}
              />
            </div>
          )
        })
      )}
    </div>
  )
}

export default FollowedTab
