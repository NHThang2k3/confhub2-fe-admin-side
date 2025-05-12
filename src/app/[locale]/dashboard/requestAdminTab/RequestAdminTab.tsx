// src/components/RequestAdminTab.tsx
'use client'; // <-- Add directive because of useState

import React, { useState } from 'react';
// Import useTranslations
import { useTranslations } from 'next-intl'; // <-- Add import

// Define types locally or import from a separate file
export type UserRequestType = 'report' | 'contact';
export type AdminRequestStatus = 'new' | 'in-progress' | 'closed';

export interface UserRequest {
  id: string;
  subject: string; // Subject (user-provided, not translated)
  type: UserRequestType; // Type
  message: string; // Message (user-provided, not translated)
  senderName: string; // Sender name (user-provided, not translated)
  sentAt: string; // Sent timestamp
  status: AdminRequestStatus; // Status
}

// Dữ liệu mẫu cho các Request (content itself is sample, not translated)
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
];

const RequestAdminTab: React.FC = () => {
  // Call the useTranslations hook
  const t = useTranslations('RequestAdminTab'); // <-- Added hook call (using a namespace example)

  const [requests, setRequests] = useState<UserRequest[]>(initialRequests);

  // Handler to change Request status
  const handleStatusChange = (
    requestId: string,
    newStatus: AdminRequestStatus
  ) => {
    setRequests(
      requests.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
  };

  // Helper to get color based on admin status (does not contain strings to translate)
  const getStatusColorClass = (status: AdminRequestStatus): string => {
    switch (status) {
      case 'new':
        return 'text-yellow-700 bg-yellow-100';
      case 'in-progress':
        return 'text-blue-700 bg-blue-100';
      case 'closed':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  // Helper to get color based on request type (does not contain strings to translate)
  const getTypeColorClass = (type: UserRequestType): string => {
    switch (type) {
      case 'report':
        return 'text-red-700 bg-red-100';
      case 'contact':
        return 'text-indigo-700 bg-indigo-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  // Helper to format date/time (needs access to t for error message)
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
         // Translate invalid date string
        return t('Invalid_Date'); // <-- Use t()
      }
      return date.toLocaleDateString(undefined, options);
    } catch (e) {
       // Translate error string
      return t('Invalid_Date'); // <-- Use t()
    }
  };

  return (
    <div className='min-h-screen w-full bg-gray-100 p-6 font-sans'>
      <h1 className='mb-8 text-center text-3xl font-bold text-gray-800'>
         {/* Translate main title */}
        {t('AdminRequestManagement_Title')} {/* <-- Translated */}
      </h1>

      <div className='mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md'>
        <h2 className='mb-4 text-2xl font-semibold text-gray-700'>
           {/* Translate section title with count */}
          {t('RequestList_SectionTitle', { count: requests.length })} {/* <-- Translated with interpolation */}
        </h2>

        {requests.length === 0 ? (
          <p className='py-8 text-center text-gray-500'>
             {/* Translate empty state message */}
            {t('EmptyState_NoRequests')} {/* <-- Translated */}
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
                      {request.subject} {/* User-provided subject */}
                    </h3>
                    <p className='text-sm italic text-gray-600'>
                       {/* Translate "from" label */}
                      {t('Label_From')} {request.senderName} {/* <-- Translated label */}
                    </p>
                  </div>
                  <div className='flex flex-shrink-0 flex-col items-end space-y-1'>
                    {/* Status Badge - Translate the status string */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColorClass(request.status)}`}
                    >
                       {/* Translate status string using t() */}
                       {/* Assume keys are lowercase like in the data: Status_new, Status_in-progress, Status_closed */}
                      {t(`Status_${request.status}`)} {/* <-- Translated status */}
                    </span>
                    {/* Type Badge (Optional) - Translate the type string */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getTypeColorClass(request.type)}`}
                    >
                        {/* Translate type string using t() */}
                        {/* Assume keys are lowercase like in the data: Type_report, Type_contact */}
                      {t(`Type_${request.type}`)} {/* <-- Translated type */}
                    </span>
                  </div>
                </div>

                <div className='mb-3 text-sm text-gray-500'>
                   {/* Translate "Sent" label */}
                  {t('Label_Sent')}: {formatDate(request.sentAt)} {/* <-- Translated label */}
                </div>

                <p className='mb-4 text-base text-gray-700'>
                  {request.message} {/* User-provided message */}
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
                       {/* Translate button text */}
                      {t('Button_MarkInProgress')} {/* <-- Translated */}
                    </button>
                  )}

                  {request.status !== 'closed' && (
                    <button
                      onClick={() => handleStatusChange(request.id, 'closed')}
                      className='rounded bg-green-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-green-600'
                    >
                       {/* Translate button text */}
                      {t('Button_MarkClosed')} {/* <-- Translated */}
                    </button>
                  )}

                  {request.status !== 'new' && (
                    <button
                      onClick={() => handleStatusChange(request.id, 'new')}
                      className='rounded bg-gray-300 px-4 py-2 text-sm text-gray-800 transition duration-150 ease-in-out hover:bg-gray-400'
                    >
                       {/* Translate button text */}
                      {t('Button_SetToNew')} {/* <-- Translated */}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RequestAdminTab;