// src/components/Moderation.tsx

import React, { useState, useMemo, useCallback } from 'react'; // Added useCallback

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
    submissionDateRound1?: string; // Optional submission date (YYYY-MM-DD format preferred)
    // Add other date types if needed
  };
  topics: string[]; // Array of topics
  description?: string; // Optional description
  status: ConferenceStatus; // Status for moderation
  comment?: string; // Optional comment for moderation
  createdAt: Date; // New: Timestamp when the conference was added
}

// Sample Data for multiple Conferences
// Using new Date('YYYY-MM-DD') for createdAt for simplicity in sample data
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
      submissionDateRound1: "2025-05-12",
    },
    topics: ["AI", "Math"],
    description: "No description provided",
    status: 'pending',
    createdAt: new Date('2023-10-26T10:00:00Z'), // Example creation date
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
    createdAt: new Date('2023-10-20T09:30:00Z'), // Example creation date (earlier)
  },
   {
    id: 'conf3',
    name: "European AI Symposium",
    acronym: "EAIS2025",
    link: "https://example.com/eais",
    type: "In-person",
    address: "Berlin, Germany",
    continent: "Europe",
    country: "Germany",
    stateProvince: "Berlin",
    importantDates: {
      conferenceDates: "2025-03-20 - 2025-03-22",
    },
    topics: ["Machine Learning", "Ethics in AI", "Natural Language Processing"],
    description: "Focusing on the latest advancements in AI research and application across Europe.",
    status: 'rejected',
    comment: 'Insufficient details provided in the application.',
    createdAt: new Date('2023-10-25T14:00:00Z'), // Example creation date
  },
    {
    id: 'conf4',
    name: "Asia Pacific Data Science Conference",
    acronym: "APDSC2024",
    link: "https://example.com/apdsc",
    type: "Online",
    address: "Virtual",
    continent: "Asia",
    country: "Singapore",
    stateProvince: "",
    importantDates: {
      conferenceDates: "2024-09-01 - 2024-09-03",
      submissionDateRound1: "2024-05-15",
    },
    topics: ["Data Science", "Big Data", "Analytics"],
    description: "Connecting data scientists and researchers across the Asia Pacific region.",
    status: 'pending',
    comment: 'Initial submission pending review.',
    createdAt: new Date('2023-10-24T11:45:00Z'), // Example creation date
  },
     {
    id: 'conf5',
    name: "North American Cybersecurity Workshop",
    acronym: "NACW2024",
    link: "https://example.com/nacw",
    type: "In-person",
    address: "Toronto, Canada",
    continent: "North America",
    country: "Canada",
    stateProvince: "Ontario",
    importantDates: {
      conferenceDates: "2024-10-25 - 2024-10-27",
      submissionDateRound1: "2024-08-20",
    },
    topics: ["Cybersecurity", "Network Security", "Cryptography"],
    description: "Annual workshop on cybersecurity threats and defenses.",
    status: 'approved',
    comment: 'Content verified, approved.',
    createdAt: new Date('2023-10-22T16:10:00Z'), // Example creation date
  },
     {
    id: 'conf6',
    name: "International Robotics Symposium",
    acronym: "IRS2025",
    link: "https://example.com/irs",
    type: "Hybrid",
    address: "Tokyo, Japan",
    continent: "Asia",
    country: "Japan",
    stateProvince: "Tokyo",
    importantDates: {
      conferenceDates: "2025-01-15 - 2025-01-18",
      submissionDateRound1: "2024-10-01",
    },
    topics: ["Robotics", "Automation", "AI"],
    description: "Leading research and development in robotics.",
    status: 'pending',
    createdAt: new Date('2023-10-28T08:00:00Z'), // Example creation date (latest)
  },
];

// Type for sort options
type SortKey = 'name' | 'submissionDate' | 'createdAt' | null; // Added 'createdAt'
type SortDirection = 'asc' | 'desc';

const Moderation: React.FC = () => {
  const [conferences, setConferences] =
    useState<Conference[]>(initialConferences);
  const [filterStatus, setFilterStatus] = useState<ConferenceStatus | 'all'>('all'); // State for filter
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const [sortKey, setSortKey] = useState<SortKey>('createdAt'); // Default sort by createdAt
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc'); // Default sort descending (newest first)


  const [showCommentModal, setShowCommentModal] = useState(false); // State to control modal visibility
  const [conferenceToModerateId, setConferenceToModerateId] = useState<string | null>(null); // Id of conference being moderated
  const [targetStatus, setTargetStatus] = useState<ConferenceStatus | null>(null); // Status (approved/rejected/pending) to apply
  const [comment, setComment] = useState(''); // State for the comment input
  const [commentError, setCommentError] = useState(''); // State for comment validation error


  // Helper để lấy màu sắc dựa trên trạng thái
  const getStatusColorClass = useCallback((status: ConferenceStatus): string => {
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
  }, []); // No dependencies, so memoize


  // Handler to open the modal for any status change requiring a comment
  const handleActionClick = useCallback((conferenceId: string, status: ConferenceStatus) => {
    setConferenceToModerateId(conferenceId);
    setTargetStatus(status);
    // Find the existing comment for this conference to pre-fill the modal
    const existingConference = conferences.find(conf => conf.id === conferenceId);
    setComment(existingConference?.comment || ''); // Use existing comment or empty string
    setCommentError(''); // Clear previous error
    setShowCommentModal(true);
  }, [conferences]); // Depends on conferences to find the existing comment


  // Handler to submit the comment and change status
  const handleModalSubmit = useCallback(() => {
    // Comment is now required for all actions handled by the modal
    if (!comment.trim()) {
      setCommentError(`Comment is required for ${targetStatus} status.`);
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
  }, [comment, conferenceToModerateId, targetStatus, conferences]); // Depends on these states/props


  // Handler to cancel the modal
  const handleModalCancel = useCallback(() => {
    setShowCommentModal(false);
    setConferenceToModerateId(null);
    setTargetStatus(null);
    setComment('');
    setCommentError('');
  }, []); // No dependencies


  // Handler for sorting by name
  const handleSortByName = useCallback(() => {
    if (sortKey === 'name') {
      // If already sorting by name, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Start sorting by name in ascending order
      setSortKey('name');
      setSortDirection('asc');
    }
  }, [sortKey, sortDirection]); // Depends on sortKey and sortDirection


    // Handler for sorting by submission date
    const handleSortBySubmissionDate = useCallback(() => {
        if (sortKey === 'submissionDate') {
            // If already sorting by submission date, toggle direction
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Start sorting by submission date in ascending order
            setSortKey('submissionDate');
            setSortDirection('asc'); // Often asc (earliest) makes sense for submission date
        }
    }, [sortKey, sortDirection]); // Depends on sortKey and sortDirection

     // Handler for sorting by creation date
    const handleSortByCreationDate = useCallback(() => {
        if (sortKey === 'createdAt') {
            // If already sorting by creation date, toggle direction
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Start sorting by creation date in descending order (newest first)
            setSortKey('createdAt');
            setSortDirection('desc'); // Often desc (newest) makes sense for creation date
        }
    }, [sortKey, sortDirection]); // Depends on sortKey and sortDirection


  // --- Filtering, Searching, and Sorting Logic ---
  const processedConferences = useMemo(() => {
    let result = [...conferences]; // Start with a copy of the original data

    // 1. Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(conf => conf.status === filterStatus);
    }

    // 2. Filter by search term (case-insensitive name search)
    if (searchTerm) {
      result = result.filter(conf =>
        conf.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 3. Sort
    if (sortKey) {
      result.sort((a, b) => {
        if (sortKey === 'name') {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          if (nameA < nameB) {
            return sortDirection === 'asc' ? -1 : 1;
          }
          if (nameA > nameB) {
            return sortDirection === 'asc' ? 1 : -1;
          }
          return 0; // names are equal
        } else if (sortKey === 'submissionDate') {
            const dateA = a.importantDates.submissionDateRound1;
            const dateB = b.importantDates.submissionDateRound1;

            // Handle cases where one or both dates are missing
            // Missing dates are usually sorted last regardless of direction
            if (!dateA && !dateB) return 0; // Both missing
            if (!dateA) return 1; // A is missing, sort A after B
            if (!dateB) return -1; // B is missing, sort B after A

            // Both dates exist, compare as strings (assumes YYYY-MM-DD format)
            // String comparison works for YYYY-MM-DD dates chronologically
            if (dateA < dateB) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (dateA > dateB) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0; // Dates are equal
        } else if (sortKey === 'createdAt') {
             // Date object comparison
             const dateA = a.createdAt;
             const dateB = b.createdAt;

             if (sortDirection === 'asc') {
                 return dateA.getTime() - dateB.getTime(); // Earlier dates first
             } else { // desc
                 return dateB.getTime() - dateA.getTime(); // Later dates first
             }
        }
        return 0; // Should not happen if sortKey is not null
      });
    }

    return result;
  }, [conferences, filterStatus, searchTerm, sortKey, sortDirection]); // Re-run only when these states change


  return (
    <div className='min-h-screen w-full bg-gray-100 p-6 font-sans'>
      <h1 className='mb-8 text-center text-3xl font-bold text-gray-800'>
        Conference Listing Moderation
      </h1>

      {/* Conference List Moderation Section */}
      <div className='mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md'>
        <h2 className='mb-4 text-2xl font-semibold text-gray-700'>
          Conference List
        </h2>

        {/* Controls: Filter, Search, Sort */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap"> {/* Added flex-wrap */}
          {/* Filter Control */}
          <div className="flex items-center shrink-0"> {/* Added shrink-0 */}
            <label htmlFor="statusFilter" className="mr-2 text-gray-700 text-sm">Filter by Status:</label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ConferenceStatus | 'all')}
              className="rounded border border-gray-300 px-3 py-1 text-gray-700 text-sm"
            >
              <option value="all">All ({conferences.length})</option>
              <option value="pending">Pending ({conferences.filter(c => c.status === 'pending').length})</option>
              <option value="approved">Approved ({conferences.filter(c => c.status === 'approved').length})</option>
              <option value="rejected">Rejected ({conferences.filter(c => c.status === 'rejected').length})</option>
            </select>
          </div>

          {/* Search Control */}
           <div className="flex items-center flex-grow">
            <label htmlFor="conferenceSearch" className="mr-2 text-gray-700 text-sm shrink-0">Search by Name:</label>
            <input
              id="conferenceSearch"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter conference name..."
              className="w-full rounded border border-gray-300 px-3 py-1 text-gray-700 text-sm"
            />
          </div>

           {/* Sort Controls */}
           <div className="flex items-center gap-2 shrink-0">
             <button
               onClick={handleSortByName}
               className={`rounded px-3 py-1 text-sm transition duration-150 ease-in-out
                  ${sortKey === 'name' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
               `}
             >
               Sort by Name{' '}
               {sortKey === 'name' && (
                 sortDirection === 'asc' ? ' (A-Z)' : ' (Z-A)'
               )}
               {sortKey !== 'name' && ' (A-Z)'}
             </button>

             <button
               onClick={handleSortBySubmissionDate}
                className={`rounded px-3 py-1 text-sm transition duration-150 ease-in-out
                  ${sortKey === 'submissionDate' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
               `}
             >
               Sort by Submission Date{' '}
                {sortKey === 'submissionDate' && (
                 sortDirection === 'asc' ? ' (Earliest First)' : ' (Latest First)'
               )}
                {sortKey !== 'submissionDate' && ' (Earliest First)'}
             </button>

              <button
               onClick={handleSortByCreationDate}
                className={`rounded px-3 py-1 text-sm transition duration-150 ease-in-out
                  ${sortKey === 'createdAt' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
               `}
             >
               Sort by Added Date{' '}
                {sortKey === 'createdAt' && (
                 sortDirection === 'asc' ? ' (Oldest First)' : ' (Newest First)'
               )}
                {sortKey !== 'createdAt' && ' (Newest First)'} {/* Default to Newest First */}
             </button>
           </div>

        </div>


        {/* Conference List */}
        {processedConferences.length === 0 ? (
          <p className='py-8 text-center text-gray-500'>
            No conferences match the current criteria.
          </p>
        ) : (
          <ul>
            {processedConferences.map(conference => (
              <li
                key={conference.id}
                className='border-b border-gray-200 py-6 last:border-b-0'
              >
                <div className='mb-3 flex items-start justify-between'>
                  <div>
                    <h3 className='text-xl font-semibold text-gray-900'>
                      {conference.name} <span className="font-normal text-gray-600">({conference.acronym})</span>
                    </h3>
                    {conference.link && conference.link.trim() !== '' && (
                      <p className='text-sm text-blue-600 hover:underline'>
                          <a href={conference.link} target="_blank" rel="noopener noreferrer">{conference.link}</a>
                      </p>
                    )}
                     <p className='text-sm italic text-gray-600'>
                      {conference.type}
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>
                       Added: {conference.createdAt.toLocaleString()} {/* Display creation date */}
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
                    {conference.address && conference.address.trim() !== '' && <p><strong>Address:</strong> {conference.address}</p>}
                    {conference.continent && conference.continent.trim() !== '' && <p><strong>Continent:</strong> {conference.continent}</p>}
                    <p><strong>Country:</strong> {conference.country}</p>
                    {conference.stateProvince && conference.stateProvince.trim() !== '' && <p><strong>State/Province:</strong> {conference.stateProvince}</p>}
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

                 {conference.description && conference.description.trim() !== "" && conference.description !== "No description provided" && (
                    <div className="mb-3 text-sm text-gray-700">
                       <p><strong>Description:</strong> {conference.description}</p>
                    </div>
                 )}


                {/* Display comment if it exists */}
                {conference.comment && conference.comment.trim() !== '' && (
                    <div className="mb-4 text-sm text-gray-600 italic">
                        <strong>Moderation Comment:</strong> {conference.comment}
                    </div>
                )}


                <div className='flex flex-wrap gap-3'>
                  {/* Nút Approve */}
                  {conference.status !== 'approved' && (
                    <button
                      onClick={() => handleActionClick(conference.id, 'approved')}
                      className='rounded bg-green-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed'
                      disabled={showCommentModal} // Disable buttons when modal is open
                    >
                      Approve
                    </button>
                  )}

                  {/* Nút Reject */}
                  {conference.status !== 'rejected' && (
                    <button
                      onClick={() => handleActionClick(conference.id, 'rejected')}
                      className='rounded bg-red-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                       disabled={showCommentModal} // Disable buttons when modal is open
                    >
                      Reject
                    </button>
                  )}

                  {/* Nút Set to Pending */}
                  {conference.status !== 'pending' && (
                    <button
                       onClick={() => handleActionClick(conference.id, 'pending')}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              {targetStatus === 'approved' && 'Approve'}
              {targetStatus === 'rejected' && 'Reject'}
              {targetStatus === 'pending' && 'Set to Pending'}
              {' '}Conference
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
                className={`rounded px-4 py-2 text-sm text-white
                  ${targetStatus === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                     targetStatus === 'rejected' ? 'bg-red-500 hover:bg-red-600' :
                     'bg-blue-500 hover:bg-blue-600' // Use blue for pending submit
                   }
                `}
              >
                 {targetStatus === 'approved' && 'Approve'}
                 {targetStatus === 'rejected' && 'Reject'}
                 {targetStatus === 'pending' && 'Set Pending'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Moderation;