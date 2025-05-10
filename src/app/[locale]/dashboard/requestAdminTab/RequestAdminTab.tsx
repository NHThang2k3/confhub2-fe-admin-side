// src/components/RequestAdminTab.tsx

import React, { useState } from 'react'
// import { UserRequest, UserRequestType, AdminRequestStatus } from '../types'; // Import types
export type UserRequestType = 'report' | 'contact' // Loại request: Báo cáo hoặc Liên hệ

export type AdminRequestStatus = 'new' | 'in-progress' | 'closed' // Trạng thái xử lý của admin

export interface UserRequest {
  id: string
  subject: string // Chủ đề
  type: UserRequestType // Loại request
  message: string // Nội dung tin nhắn
  senderName: string // Tên người gửi (hoặc ID người dùng)
  sentAt: string // Thời gian gửi
  status: AdminRequestStatus // Trạng thái xử lý của admin
}
// Dữ liệu mẫu cho các Request
const initialRequests: UserRequest[] = [
  {
    id: 'req1',
    subject: 'Cannot access my account',
    type: 'contact',
    message: 'Hi team, I am unable to log in with my credentials. Please help!',
    senderName: 'User A',
    sentAt: '2023-10-27T09:00:00Z',
    status: 'new'
  },
  {
    id: 'req2',
    subject: 'Spam message in chat',
    type: 'report',
    message:
      'User "Spammer123" is sending promotional messages in the main chat.',
    senderName: 'User B',
    sentAt: '2023-10-27T10:15:00Z',
    status: 'new'
  },
  {
    id: 'req3',
    subject: 'Question about payment',
    type: 'contact',
    message:
      'My payment seems to be stuck in pending status. What should I do?',
    senderName: 'User C',
    sentAt: '2023-10-26T15:30:00Z',
    status: 'in-progress'
  },
  {
    id: 'req4',
    subject: 'Offensive language in session Q&A',
    type: 'report',
    message:
      'During session "Intro to AI", a user posted an offensive question.',
    senderName: 'User D',
    sentAt: '2023-10-26T11:00:00Z',
    status: 'closed'
  }
]

const RequestAdminTab: React.FC = () => {
  const [requests, setRequests] = useState<UserRequest[]>(initialRequests)

  // Handler để thay đổi trạng thái Request
  const handleStatusChange = (
    requestId: string,
    newStatus: AdminRequestStatus
  ) => {
    setRequests(
      requests.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    )
  }

  // Helper để lấy màu sắc dựa trên trạng thái admin
  const getStatusColorClass = (status: AdminRequestStatus): string => {
    switch (status) {
      case 'new':
        return 'text-yellow-700 bg-yellow-100'
      case 'in-progress':
        return 'text-blue-700 bg-blue-100'
      case 'closed':
        return 'text-green-700 bg-green-100' // hoặc text-gray-700 bg-gray-100 tùy ý
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  // Helper để lấy màu sắc dựa trên loại request (tùy chọn)
  const getTypeColorClass = (type: UserRequestType): string => {
    switch (type) {
      case 'report':
        return 'text-red-700 bg-red-100'
      case 'contact':
        return 'text-indigo-700 bg-indigo-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  // Helper để định dạng ngày/giờ
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    // Xử lý lỗi khi dateString không hợp lệ
    try {
      return new Date(dateString).toLocaleDateString(undefined, options)
    } catch (e) {
      return 'Invalid Date'
    }
  }

  return (
    <div className='min-h-screen w-full bg-gray-100 p-6 font-sans'>
      <h1 className='mb-8 text-center text-3xl font-bold text-gray-800'>
        Admin Request Management
      </h1>

      <div className='mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md'>
        <h2 className='mb-4 text-2xl font-semibold text-gray-700'>
          Request List ({requests.length})
        </h2>

        {requests.length === 0 ? (
          <p className='py-8 text-center text-gray-500'>
            No user requests received yet.
          </p>
        ) : (
          <ul>
            {requests.map(request => (
              <li
                key={request.id}
                className='border-b border-gray-200 py-4 last:border-b-0'
              >
                <div className='mb-2 flex items-start justify-between'>
                  <div>
                    <h3 className='text-xl font-semibold text-gray-900'>
                      {request.subject}
                    </h3>
                    <p className='text-sm italic text-gray-600'>
                      from {request.senderName}
                    </p>
                  </div>
                  <div className='flex flex-shrink-0 flex-col items-end space-y-1'>
                    {/* Status Badge */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColorClass(request.status)}`}
                    >
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </span>
                    {/* Type Badge (Optional) */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getTypeColorClass(request.type)}`}
                    >
                      {request.type.charAt(0).toUpperCase() +
                        request.type.slice(1)}
                    </span>
                  </div>
                </div>

                <div className='mb-3 text-sm text-gray-500'>
                  Sent: {formatDate(request.sentAt)}
                </div>

                <p className='mb-4 text-base text-gray-700'>
                  {request.message}
                </p>

                <div className='flex flex-wrap gap-3'>
                  {/* Nút chuyển trạng thái */}
                  {request.status !== 'in-progress' && (
                    <button
                      onClick={() =>
                        handleStatusChange(request.id, 'in-progress')
                      }
                      className='rounded bg-blue-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-blue-600'
                    >
                      Mark as In-Progress
                    </button>
                  )}

                  {request.status !== 'closed' && (
                    <button
                      onClick={() => handleStatusChange(request.id, 'closed')}
                      className='rounded bg-green-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-green-600'
                    >
                      Mark as Closed
                    </button>
                  )}

                  {request.status !== 'new' && (
                    <button
                      onClick={() => handleStatusChange(request.id, 'new')}
                      className='rounded bg-gray-300 px-4 py-2 text-sm text-gray-800 transition duration-150 ease-in-out hover:bg-gray-400'
                    >
                      Set to New
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default RequestAdminTab
