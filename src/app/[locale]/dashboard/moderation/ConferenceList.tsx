// src/components/Moderation/ConferenceList.tsx

import React from 'react';
// Import types - Make sure these are updated in src/types.ts
import { Conference, ConferenceStatus, ConferenceDate, Location, Organization } from '@/src/types';
// Import helpers - assume these handle colors based on status string (e.g., 'PENDING')
import { getStatusColorClass, getStatusBgClass } from '../../utils/moderationHelpers';

// Helper to format Date objects
const formatDateTimeDisplay = (date: Date | undefined) => {
    if (!date || isNaN(date.getTime())) return 'N/A';
     return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        // second: '2-digit' // Optional
    });
}

// Helper to format a date range (using Date objects)
const formatDateRangeDisplay = (fromDate: Date | undefined, toDate: Date | undefined) => {
     const formattedFrom = fromDate && !isNaN(fromDate.getTime()) ? formatDateTimeDisplay(fromDate).split(', ')[0] : 'N/A'; // Get date part
     const formattedTo = toDate && !isNaN(toDate.getTime()) ? formatDateTimeDisplay(toDate).split(', ')[0] : 'N/A'; // Get date part

     if (formattedFrom === 'N/A' && formattedTo === 'N/A') return 'N/A';
     if (formattedFrom === formattedTo && formattedFrom !== 'N/A') return formattedFrom; // Same valid day
     if (formattedFrom !== 'N/A' && formattedTo === 'N/A') return `${formattedFrom} onwards`;
     if (formattedFrom === 'N/A' && formattedTo !== 'N/A') return `until ${formattedTo}`;

     return `${formattedFrom} - ${formattedTo}`;
};

// Helper to display a single location
const formatLocationDisplay = (location: Location | undefined | null) => {
     if (!location) return 'N/A';
     const parts = [];
     if (location.address) parts.push(location.address);
     if (location.cityStateProvince) parts.push(location.cityStateProvince);
     if (location.country) parts.push(location.country);
     if (location.continent && parts.length === 0 && !location.country && !location.cityStateProvince && !location.address) parts.push(location.continent); // Only add continent if no other parts
     return parts.length > 0 ? parts.filter(p => p != null).join(', ') : 'N/A'; // Filter out null/undefined parts
};


interface ConferenceListProps {
    conferences: Conference[]; // The combined and filtered/sorted list
    onModerateClick: (conferenceId: string, status: ConferenceStatus) => void; // conferenceId is the request ID
    showCommentModal: boolean; // Pass modal state to disable buttons
}

const ConferenceList: React.FC<ConferenceListProps> = ({
    conferences,
    onModerateClick,
    showCommentModal,
}) => {
    // Note: Empty list message is handled in the parent Moderation.tsx
    // This component just renders the list it receives.

    if (!conferences || conferences.length === 0) {
        return null; // Parent handles empty state messages
    }

    return (
        <ul>
            {conferences.map(conference => {
                 // Access details from the first organization, assuming it holds the main info
                 // Handle potential null/undefined organizations array and its first item
                 const mainOrganization = conference.organizations?.[0];
                 const mainLocation = mainOrganization?.locations?.[0]; // Assuming one main location
                 const mainConferenceDates = mainOrganization?.conferenceDates; // Array of date ranges


                return (
                    // Use conference.id (request ID) as key
                    <li
                        key={conference.id}
                        className={`border-b border-gray-200 py-0 px-0 last:border-b-0 ${getStatusBgClass(conference.status)}`}
                    >
                        <div className="p-4">
                             {/* Display details fetch error if it occurred for this item */}
                             {conference.detailsFetchError && (
                                 <div className="mb-3 text-sm text-red-600 italic">
                                     Error loading full details: {conference.detailsFetchError}
                                 </div>
                             )}

                            <div className='mb-3 flex items-start justify-between'>
                                <div>
                                    {/* Display Conference Title and Acronym (from combined data) */}
                                    <h3 className='text-xl font-semibold text-gray-900'>
                                        {conference.title || 'Untitled Conference'}
                                        {conference.acronym && conference.acronym.trim() !== '' && (
                                             <span className="font-normal text-gray-600"> ({conference.acronym})</span>
                                        )}
                                    </h3>

                                    {/* Display main conference link from organizations */}
                                     {mainOrganization?.link && mainOrganization.link.trim() !== '' && (
                                         <p className='text-sm text-blue-600 hover:underline'>
                                             <a href={mainOrganization.link} target="_blank" rel="noopener noreferrer">{mainOrganization.link}</a>
                                         </p>
                                     )}

                                    {/* Display access type from organizations */}
                                     {mainOrganization?.accessType && (
                                          <p className='text-sm italic text-gray-600'>
                                            {mainOrganization.accessType}
                                          </p>
                                     )}

                                    {/* Display request creation and update dates */}
                                    <p className='text-xs text-gray-500 mt-1'>
                                        Requested: {formatDateTimeDisplay(conference.createdAt)}
                                    </p>
                                     <p className='text-xs text-gray-500'>
                                        Last Updated: {formatDateTimeDisplay(conference.updatedAt)}
                                    </p>
                                    {/* Optionally display user info */}
                                    {/* <p className='text-xs text-gray-500'>By User ID: {conference.userId}</p> */}
                                </div>
                                <span
                                    className={`ml-4 inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColorClass(conference.status)}`}
                                >
                                    {conference.status} {/* Display status directly (e.g., PENDING) */}
                                </span>
                            </div>

                            {/* Display Conference Dates from organizations */}
                             {/* Check if mainConferenceDates is not null/undefined and has items */}
                             {mainConferenceDates && mainConferenceDates.length > 0 && (
                                 <div className="mb-3 text-sm text-gray-700">
                                    <p><strong>Important Dates:</strong></p>
                                     <ul className="list-disc list-inside ml-4">
                                         {mainConferenceDates.map((dateItem, index) => (
                                             // Assuming name and type can be used as labels
                                             // Check if dateItem is valid
                                             dateItem && (
                                                <li key={index}>
                                                    {dateItem.name || dateItem.type || 'Date Range'}: {formatDateRangeDisplay(dateItem.fromDate, dateItem.toDate)}
                                                </li>
                                             )
                                         ))}
                                     </ul>
                                 </div>
                             )}


                            {/* Display Location Details from organizations */}
                             {/* Check if mainLocation is valid and has displayable content */}
                            {mainLocation && formatLocationDisplay(mainLocation) !== 'N/A' && (
                                <div className="mb-3 text-sm text-gray-700">
                                    <p><strong>Location:</strong> {formatLocationDisplay(mainLocation)}</p>
                                </div>
                             )}
                             {/* Optionally display multiple locations if organizations.locations is an array */}


                             {/* Display Topics from organizations */}
                              {/* Check if mainOrganization exists and topics array is not null/undefined and has items */}
                             {mainOrganization?.topics && mainOrganization.topics.length > 0 && (
                                 <div className="mb-3 text-sm text-gray-700">
                                     <p><strong>Topics:</strong> {mainOrganization.topics.join(', ')}</p>
                                 </div>
                             )}

                            {/* Display Description (Summary/CallForPaper/Summerize?) from organizations */}
                             {/* Check if mainOrganization exists and summary is not null/undefined/empty */}
                            {(mainOrganization?.summary && mainOrganization.summary.trim() !== "") && (
                                <div className="mb-3 text-sm text-gray-700">
                                    <p><strong>Summary:</strong> {mainOrganization.summary}</p>
                                </div>
                            )}
                             {/* You might want to display callForPaper or other fields too */}


                            {/* Display User's Original Message from the request */}
                            {conference.message && conference.message.trim() !== '' && (
                                 <div className="mb-3 text-sm text-gray-700 italic">
                                     <p><strong>User Message:</strong> {conference.message}</p>
                                 </div>
                            )}


                            {/* Display comment if it exists (client-side managed) */}
                            {conference.comment && conference.comment.trim() !== '' && (
                                <div className="mb-4 text-sm text-gray-600 italic">
                                    <strong>Moderation Comment:</strong> {conference.comment}
                                </div>
                            )}

                            {/* Moderation Action Buttons */}
                            <div className='flex flex-wrap gap-3'>
                                {/* Pass conference.id (request ID) to handler */}
                                {/* Use uppercase status values for comparison */}
                                {conference.status !== 'APPROVED' && (
                                    <button
                                        onClick={() => onModerateClick(conference.id, 'APPROVED')}
                                        className='rounded bg-green-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                        disabled={showCommentModal}
                                    >
                                        Approve
                                    </button>
                                )}

                                {/* Pass conference.id (request ID) to handler */}
                                 {/* Use uppercase status values for comparison */}
                                {conference.status !== 'REJECTED' && (
                                    <button
                                        onClick={() => onModerateClick(conference.id, 'REJECTED')}
                                        className='rounded bg-red-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                        disabled={showCommentModal}
                                    >
                                        Reject
                                    </button>
                                )}

                                {/* Pass conference.id (request ID) to handler */}
                                 {/* Use uppercase status values for comparison */}
                                {conference.status !== 'PENDING' && (
                                    <button
                                        onClick={() => onModerateClick(conference.id, 'PENDING')}
                                        className='rounded bg-gray-300 px-4 py-2 text-sm text-gray-800 transition duration-150 ease-in-out hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
                                        disabled={showCommentModal}
                                    >
                                        Set to Pending
                                    </button>
                                )}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default ConferenceList;