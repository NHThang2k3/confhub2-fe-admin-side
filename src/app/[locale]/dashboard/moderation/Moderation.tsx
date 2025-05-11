// src/components/Moderation.tsx

import React, { useState } from 'react';

// Reusing the SubmissionStatus type, as it fits the concept of moderation status
export type ConferenceStatus = 'pending' | 'approved' | 'rejected';

// Define the interface for a Conference object
export interface Conference {
  id: string; // Unique ID for the conference
  name: string;
  acronym: string;
  link?: string; // Optional link
  type: string;
  address?: string; // Optional address
  continent?: string; // Optional continent
  country: string;
  stateProvince?: string; // Optional state/province
  importantDates: {
    conferenceDates: string; // e.g., "2025-05-21 - 2025-05-31"
    submissionDateRound1?: string; // Optional submission date
    // Add other date types if needed
  };
  topics: string[]; // Array of topics
  description?: string; // Optional description
  status: ConferenceStatus; // Status for moderation
  comment?: string; // Optional comment for moderation
}

// Sample Data for multiple Conferences
const initialConferences: Conference[] = [
  {
    id: 'conf1',
    name: "Hoi nghi thuong dinh",
    acronym: "HNTD",
    link: "https://www.facebook.com/",
    type: "Online",
    address: "12", // Keeping as provided, might need context in a real app
    continent: "Asia",
    country: "Vietnam",
    stateProvince: "Đà Nẵng",
    importantDates: {
      conferenceDates: "2025-05-21 - 2025-05-31",
      submissionDateRound1: "2025-05-12 - 2025-05-12",
    },
    topics: ["AI", "Math"],
    description: "No description provided",
    status: 'pending',
  },
  {
    id: 'conf2',
    name: "Global Tech Summit",
    acronym: "GTS2024",
    link: "https://example.com/gts",
    type: "Hybrid",
    address: "Silicon Valley, CA",
    continent: "North America",
    country: "USA",
    stateProvince: "California",
    importantDates: {
      conferenceDates: "2024-11-10 - 2024-11-15",
      submissionDateRound1: "2024-07-01",
    },
    topics: ["Software Engineering", "Cloud Computing", "Cybersecurity"],
    description: "A premier event for technology leaders and developers.",
    status: 'approved',
    comment: 'Approved for listing on platform.',
  },
   {
    id: 'conf3',
    name: "European AI Symposium",
    acronym: "EAIS2025",
    link: "https://example.com/gts",
    type: "In-person",
    address: "Berlin, Germany",
    continent: "Europe",
    country: "Germany",
    stateProvince: "California",
    importantDates: {
      conferenceDates: "2025-03-20 - 2025-03-22",
    },
    topics: ["Machine Learning", "Ethics in AI", "Natural Language Processing"],
    description: "Focusing on the latest advancements in AI research and application across Europe.",
    status: 'rejected',
    comment: 'Insufficient details provided in the application.',
  },
    {
    id: 'conf4',
    name: "Asia Pacific Data Science Conference",
    acronym: "APDSC2024",
    link: "https://example.com/apdsc",
    type: "Online",
    address: "Berlin, Germany",
    continent: "Asia",
    country: "Singapore",
    stateProvince: "California",
    importantDates: {
      conferenceDates: "2024-09-01 - 2024-09-03",
      submissionDateRound1: "2024-05-15",
    },
    topics: ["Data Science", "Big Data", "Analytics"],
    description: "Connecting data scientists and researchers across the Asia Pacific region.",
    status: 'pending',
  },
];

const Moderation: React.FC = () => {
  const [conferences, setConferences] =
    useState<Conference[]>(initialConferences);
  const [filterStatus, setFilterStatus] = useState<ConferenceStatus | 'all'>('all'); // State for filter
  const [showCommentModal, setShowCommentModal] = useState(false); // State to control modal visibility
  const [conferenceToModerateId, setConferenceToModerateId] = useState<string | null>(null); // Id of conference being moderated
  const [targetStatus, setTargetStatus] = useState<ConferenceStatus | null>(null); // Status (approved/rejected) to apply
  const [comment, setComment] = useState(''); // State for the comment input
  const [commentError, setCommentError] = useState(''); // State for comment validation error


  // Helper để lấy màu sắc dựa trên trạng thái (reusing the same logic)
  const getStatusColorClass = (status: ConferenceStatus): string => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-100';
      case 'rejected':
        return 'text-red-700 bg-red-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  // Handler to open the modal for approve/reject
  const handleActionClick = (conferenceId: string, status: 'approved' | 'rejected') => {
    setConferenceToModerateId(conferenceId);
    setTargetStatus(status);
    setComment(''); // Clear previous comment
    setCommentError(''); // Clear previous error
    setShowCommentModal(true);
  };

  // Handler for 'Set to Pending' (doesn't require comment)
  const handleSetPending = (conferenceId: string) => {
    setConferences(
      conferences.map(conf =>
        conf.id === conferenceId ? { ...conf, status: 'pending', comment: undefined } // Clear comment when setting to pending
        : conf
      )
    );
  };


  // Handler to submit the comment and change status
  const handleModalSubmit = () => {
    if (!comment.trim()) {
      setCommentError('Comment is required.');
      return;
    }

    if (conferenceToModerateId && targetStatus) {
      setConferences(
        conferences.map(conf =>
          conf.id === conferenceToModerateId
            ? { ...conf, status: targetStatus, comment: comment.trim() }
            : conf
        )
      );
    }

    // Reset and close modal
    setShowCommentModal(false);
    setConferenceToModerateId(null);
    setTargetStatus(null);
    setComment('');
    setCommentError('');
  };

  // Handler to cancel the modal
  const handleModalCancel = () => {
    setShowCommentModal(false);
    setConferenceToModerateId(null);
    setTargetStatus(null);
    setComment('');
    setCommentError('');
  };

  // Filter conferences based on filterStatus
  const filteredConferences = filterStatus === 'all'
    ? conferences
    : conferences.filter(conf => conf.status === filterStatus);


  return (
    <div className='min-h-screen w-full bg-gray-100 p-6 font-sans'>
      <h1 className='mb-8 text-center text-3xl font-bold text-gray-800'>
        Conference Listing Moderation
      </h1>

      {/* Conference List Moderation Section */}
      <div className='mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md'>
        <h2 className='mb-4 text-2xl font-semibold text-gray-700'>
          Conference List ({conferences.length})
        </h2>

        {/* Filter Control */}
        <div className="mb-6">
          <label htmlFor="statusFilter" className="mr-2 text-gray-700">Filter by Status:</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ConferenceStatus | 'all')}
            className="rounded border border-gray-300 px-3 py-1 text-gray-700"
          >
            <option value="all">All ({conferences.length})</option>
            <option value="pending">Pending ({conferences.filter(c => c.status === 'pending').length})</option>
            <option value="approved">Approved ({conferences.filter(c => c.status === 'approved').length})</option>
            <option value="rejected">Rejected ({conferences.filter(c => c.status === 'rejected').length})</option>
          </select>
        </div>

        {/* Conference List */}
        {filteredConferences.length === 0 ? (
          <p className='py-8 text-center text-gray-500'>
            {filterStatus === 'all' ? 'No conferences found.' : `No "${filterStatus}" conferences found.`}
          </p>
        ) : (
          <ul>
            {filteredConferences.map(conference => (
              <li
                key={conference.id}
                className='border-b border-gray-200 py-6 last:border-b-0'
              >
                <div className='mb-3 flex items-start justify-between'>
                  <div>
                    <h3 className='text-xl font-semibold text-gray-900'>
                      {conference.name} <span className="font-normal text-gray-600">({conference.acronym})</span>
                    </h3>
                    {conference.link && (
                      <p className='text-sm text-blue-600 hover:underline'>
                          <a href={conference.link} target="_blank" rel="noopener noreferrer">{conference.link}</a>
                      </p>
                    )}
                     <p className='text-sm italic text-gray-600'>
                      {conference.type}
                    </p>
                  </div>
                  <span
                    className={`ml-4 inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColorClass(conference.status)}`}
                  >
                    {conference.status.charAt(0).toUpperCase() +
                      conference.status.slice(1)}
                  </span>
                </div>

                 <div className="mb-3 text-sm text-gray-700">
                    {conference.address && <p><strong>Address:</strong> {conference.address}</p>}
                    {conference.continent && <p><strong>Continent:</strong> {conference.continent}</p>}
                    <p><strong>Country:</strong> {conference.country}</p>
                    {conference.stateProvince && <p><strong>State/Province:</strong> {conference.stateProvince}</p>}
                 </div>

                 <div className="mb-3 text-sm text-gray-700">
                    <p><strong>Important Dates:</strong></p>
                    <ul className="list-disc list-inside ml-4">
                        <li>Conference Dates: {conference.importantDates.conferenceDates}</li>
                        {conference.importantDates.submissionDateRound1 && (
                             <li>Submission Date (Round 1): {conference.importantDates.submissionDateRound1}</li>
                        )}
                        {/* Add other dates here if needed */}
                    </ul>
                 </div>

                <div className="mb-3 text-sm text-gray-700">
                  <p><strong>Topics:</strong> {conference.topics.join(', ')}</p>
                </div>

                 {conference.description && conference.description !== "No description provided" && (
                    <div className="mb-3 text-sm text-gray-700">
                       <p><strong>Description:</strong> {conference.description}</p>
                    </div>
                 )}


                {/* Display comment if it exists */}
                {conference.comment && (
                    <div className="mb-4 text-sm text-gray-600 italic">
                        <strong>Moderation Comment:</strong> {conference.comment}
                    </div>
                )}


                <div className='flex flex-wrap gap-3'>
                  {/* Nút Approve */}
                  {conference.status !== 'approved' && (
                    <button
                      onClick={() => handleActionClick(conference.id, 'approved')} // Use new handler
                      className='rounded bg-green-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed'
                      disabled={showCommentModal} // Disable buttons when modal is open
                    >
                      Approve
                    </button>
                  )}

                  {/* Nút Reject */}
                  {conference.status !== 'rejected' && (
                    <button
                      onClick={() => handleActionClick(conference.id, 'rejected')} // Use new handler
                      className='rounded bg-red-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                       disabled={showCommentModal} // Disable buttons when modal is open
                    >
                      Reject
                    </button>
                  )}

                  {/* Nút Set to Pending (Nếu không ở trạng thái pending) */}
                  {conference.status !== 'pending' && (
                    <button
                       onClick={() => handleSetPending(conference.id)} // Use dedicated pending handler
                      className='rounded bg-gray-300 px-4 py-2 text-sm text-gray-800 transition duration-150 ease-in-out hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
                       disabled={showCommentModal} // Disable buttons when modal is open
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

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              {targetStatus === 'approved' ? 'Approve' : 'Reject'} Conference
            </h3>
            <p className="mb-4 text-gray-700">Please provide a comment:</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={`w-full rounded border p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${commentError ? 'border-red-500' : 'border-gray-300'}`}
              rows={4}
              placeholder="Enter comment here..."
            ></textarea>
            {commentError && <p className="text-red-500 text-sm mt-1">{commentError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleModalCancel}
                className="rounded bg-gray-300 px-4 py-2 text-sm text-gray-800 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className={`rounded px-4 py-2 text-sm text-white ${targetStatus === 'approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
              >
                {targetStatus === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Moderation;