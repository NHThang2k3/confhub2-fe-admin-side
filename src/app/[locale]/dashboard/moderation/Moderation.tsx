// src/components/Moderation.tsx

import React, { useState } from 'react'
// import { ConferenceSubmission, SubmissionStatus } from '../types'; // Import type

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface ConferenceSubmission {
  id: string
  title: string
  presenterName: string
  abstract: string // Tóm tắt đề xuất
  status: SubmissionStatus
  submittedAt: string // Thời gian nộp (có thể thêm)
}
// Dữ liệu mẫu cho các đề xuất
const initialSubmissions: ConferenceSubmission[] = [
  {
    id: 'sub1',
    title: 'Introduction to React Hooks',
    presenterName: 'Alice Wonderland',
    abstract:
      'A beginner-friendly talk covering useState, useEffect, and other essential hooks.',
    status: 'pending',
    submittedAt: '2023-10-26T10:00:00Z'
  },
  {
    id: 'sub2',
    title: 'Advanced Tailwind CSS Techniques',
    presenterName: 'Bob The Builder',
    abstract:
      'Deep dive into custom configurations, plugins, and performance optimization with Tailwind.',
    status: 'approved',
    submittedAt: '2023-10-25T14:30:00Z'
  },
  {
    id: 'sub3',
    title: 'State Management with Zustand',
    presenterName: 'Charlie Chaplin',
    abstract:
      'Exploring Zustand as a simple and powerful alternative for state management in React.',
    status: 'pending',
    submittedAt: '2023-10-26T11:15:00Z'
  },
  {
    id: 'sub4',
    title: 'Testing React Components with React Testing Library',
    presenterName: 'Diana Prince',
    abstract:
      'Learn how to write effective and maintainable tests for your React applications.',
    status: 'rejected',
    submittedAt: '2023-10-24T09:00:00Z'
  }
]

const Moderation: React.FC = () => {
  const [submissions, setSubmissions] =
    useState<ConferenceSubmission[]>(initialSubmissions)

  // Handler để thay đổi trạng thái đề xuất
  const handleStatusChange = (
    submissionId: string,
    newStatus: SubmissionStatus
  ) => {
    setSubmissions(
      submissions.map(sub =>
        sub.id === submissionId ? { ...sub, status: newStatus } : sub
      )
    )
  }

  // Helper để lấy màu sắc dựa trên trạng thái
  const getStatusColorClass = (status: SubmissionStatus): string => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-100'
      case 'rejected':
        return 'text-red-700 bg-red-100'
      case 'pending':
        return 'text-yellow-700 bg-yellow-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  // Helper để định dạng ngày/giờ (tùy chọn)
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className='min-h-screen w-full bg-gray-100 p-6 font-sans'>
      <h1 className='mb-8 text-center text-3xl font-bold text-gray-800'>
        Conference Submission Moderation
      </h1>

      <div className='mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md'>
        <h2 className='mb-4 text-2xl font-semibold text-gray-700'>
          Submission List ({submissions.length})
        </h2>

        {submissions.length === 0 ? (
          <p className='py-8 text-center text-gray-500'>
            No submissions received yet.
          </p>
        ) : (
          <ul>
            {submissions.map(submission => (
              <li
                key={submission.id}
                className='border-b border-gray-200 py-4 last:border-b-0'
              >
                <div className='mb-2 flex items-start justify-between'>
                  <div>
                    <h3 className='text-xl font-semibold text-gray-900'>
                      {submission.title}
                    </h3>
                    <p className='italic text-gray-600'>
                      {submission.presenterName}
                    </p>
                  </div>
                  <span
                    className={`ml-4 rounded-full px-3 py-1 text-sm font-medium ${getStatusColorClass(submission.status)}`}
                  >
                    {submission.status.charAt(0).toUpperCase() +
                      submission.status.slice(1)}
                  </span>
                </div>

                <p className='mb-3 text-sm text-gray-700'>
                  {submission.abstract}
                </p>

                <div className='mb-3 text-sm text-gray-500'>
                  Submitted: {formatDate(submission.submittedAt)}
                </div>

                <div className='flex flex-wrap gap-3'>
                  {/* Nút Approve */}
                  {submission.status !== 'approved' && (
                    <button
                      onClick={() =>
                        handleStatusChange(submission.id, 'approved')
                      }
                      className='rounded bg-green-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-green-600'
                    >
                      Approve
                    </button>
                  )}

                  {/* Nút Reject */}
                  {submission.status !== 'rejected' && (
                    <button
                      onClick={() =>
                        handleStatusChange(submission.id, 'rejected')
                      }
                      className='rounded bg-red-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-red-600'
                    >
                      Reject
                    </button>
                  )}

                  {/* Nút Set to Pending (Nếu không ở trạng thái pending) */}
                  {submission.status !== 'pending' && (
                    <button
                      onClick={() =>
                        handleStatusChange(submission.id, 'pending')
                      }
                      className='rounded bg-gray-300 px-4 py-2 text-sm text-gray-800 transition duration-150 ease-in-out hover:bg-gray-400'
                    >
                      Set to Pending
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

export default Moderation
