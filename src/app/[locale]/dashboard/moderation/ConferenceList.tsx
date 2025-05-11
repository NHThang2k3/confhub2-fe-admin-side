// src/components/Moderation/ConferenceList.tsx

import React from 'react';
import { Conference, ConferenceStatus } from '@/src/types'; // Import types
import { getStatusColorClass, getStatusBgClass } from '../../utils/moderationHelpers'; // Import helpers

interface ConferenceListProps {
    conferences: Conference[]; // This should be the already filtered/sorted list
    onModerateClick: (conferenceId: string, status: ConferenceStatus) => void;
    showCommentModal: boolean; // Pass modal state to disable buttons
}

const ConferenceList: React.FC<ConferenceListProps> = ({
    conferences,
    onModerateClick,
    showCommentModal,
}) => {
    if (conferences.length === 0) {
        return (
            <p className='py-8 text-center text-gray-500'>
                No conferences match the current criteria.
            </p>
        );
    }

    return (
        <ul>
            {conferences.map(conference => (
                <li
                    key={conference.id}
                    className={`border-b border-gray-200 py-0 px-0 last:border-b-0 ${getStatusBgClass(conference.status)}`}
                >
                    {/* Wrap content in a div for consistent padding inside the coloured area */}
                    <div className="p-4">
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
                                    Added: {conference.createdAt.toLocaleString()}
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
                                    onClick={() => onModerateClick(conference.id, 'approved')}
                                    className='rounded bg-green-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                    disabled={showCommentModal}
                                >
                                    Approve
                                </button>
                            )}

                            {/* Nút Reject */}
                            {conference.status !== 'rejected' && (
                                <button
                                    onClick={() => onModerateClick(conference.id, 'rejected')}
                                    className='rounded bg-red-500 px-4 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                    disabled={showCommentModal}
                                >
                                    Reject
                                </button>
                            )}

                            {/* Nút Set to Pending */}
                            {conference.status !== 'pending' && (
                                <button
                                    onClick={() => onModerateClick(conference.id, 'pending')}
                                    className='rounded bg-gray-300 px-4 py-2 text-sm text-gray-800 transition duration-150 ease-in-out hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
                                    disabled={showCommentModal}
                                >
                                    Set to Pending
                                </button>
                            )}
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default ConferenceList;