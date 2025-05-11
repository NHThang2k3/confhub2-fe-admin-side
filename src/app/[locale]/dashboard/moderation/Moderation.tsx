// src/components/Moderation/Moderation.tsx

import React, { useState, useMemo, useCallback } from 'react';

// Import types and data
import { Conference, ConferenceStatus, SortKey, SortDirection } from '@/src/types';
import { initialConferences } from '@/src/data/initialConferences';

// Import child components
import ModerationControls from './ModerationControls';
import ConferenceList from './ConferenceList';
import CommentModal from './CommentModal';

// Removed local getStatusColorClass and getStatusBgClass - now imported in ConferenceList


const Moderation: React.FC = () => {
    const [conferences, setConferences] =
        useState<Conference[]>(initialConferences); // Keep original data here

    // Filtering States
    const [filterStatus, setFilterStatus] = useState<ConferenceStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

    // Sorting States
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Modal States
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [conferenceToModerateId, setConferenceToModerateId] = useState<string | null>(null);
    const [targetStatus, setTargetStatus] = useState<ConferenceStatus | null>(null);
    const [comment, setComment] = useState('');
    const [commentError, setCommentError] = useState('');


    // Handler to open the modal for any status change requiring a comment
    const handleActionClick = useCallback((conferenceId: string, status: ConferenceStatus) => {
        setConferenceToModerateId(conferenceId);
        setTargetStatus(status);
        // Find the existing comment for this conference to pre-fill the modal
        const existingConference = conferences.find(conf => conf.id === conferenceId);
        setComment(existingConference?.comment || '');
        setCommentError('');
        setShowCommentModal(true);
    }, [conferences]); // Depends on conferences to find the existing comment


    // Handler to submit the comment and change status
    const handleModalSubmit = useCallback(() => {
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
    }, [comment, conferenceToModerateId, targetStatus, conferences]);


    // Handler to cancel the modal
    const handleModalCancel = useCallback(() => {
        setShowCommentModal(false);
        setConferenceToModerateId(null);
        setTargetStatus(null);
        setComment('');
        setCommentError('');
    }, []);


    // Handler for sorting by name
    const handleSortByName = useCallback(() => {
        if (sortKey === 'name') {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey('name');
            setSortDirection('asc');
        }
    }, [sortKey, sortDirection]);


    // Handler for sorting by creation date
    const handleSortByCreationDate = useCallback(() => {
        if (sortKey === 'createdAt') {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey('createdAt');
            setSortDirection('desc');
        }
    }, [sortKey, sortDirection]);

    // Handler to clear date filters
    const handleClearDateFilter = useCallback(() => {
        setFilterStartDate(null);
        setFilterEndDate(null);
    }, []);


    // --- Filtering, Searching, and Sorting Logic ---
    // This remains in the parent as it depends on multiple state variables
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

        // 3. Filter by Created Date Range
        if (filterStartDate || filterEndDate) {
            result = result.filter(conf => {
                const created = conf.createdAt;
                let isMatch = true;

                // Check against start date (inclusive)
                if (filterStartDate) {
                     const startOfFilterDay = new Date(filterStartDate);
                     startOfFilterDay.setHours(0, 0, 0, 0);
                     isMatch = isMatch && created >= startOfFilterDay;
                }

                // Check against end date (inclusive)
                if (filterEndDate) {
                    const endOfFilterDay = new Date(filterEndDate);
                    endOfFilterDay.setHours(23, 59, 59, 999);
                    isMatch = isMatch && created <= endOfFilterDay;
                }

                return isMatch;
            });
        }


        // 4. Sort
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
                    return 0;
                } else if (sortKey === 'createdAt') {
                     const dateA = a.createdAt;
                     const dateB = b.createdAt;

                     if (sortDirection === 'asc') {
                         return dateA.getTime() - dateB.getTime();
                     } else {
                         return dateB.getTime() - dateA.getTime();
                     }
                }
                return 0;
            });
        }

        return result;
    }, [conferences, filterStatus, searchTerm, filterStartDate, filterEndDate, sortKey, sortDirection]); // Dependencies


    // Calculate counts for filter options
     const pendingCount = conferences.filter(c => c.status === 'pending').length;
     const approvedCount = conferences.filter(c => c.status === 'approved').length;
     const rejectedCount = conferences.filter(c => c.status === 'rejected').length;


    return (
        <div className='min-h-screen w-full px-4 bg-gray-100 font-sans'>
            <h1 className='mb-8 text-center text-3xl font-bold p-4 text-gray-800'>
                Conference Listing Moderation
            </h1>

            {/* Conference List Moderation Section */}
            <div className='mx-auto w-full rounded-lg bg-white p-4 shadow-md'>
                <h2 className='mb-4 text-2xl font-semibold text-gray-700'>
                    Conference List
                </h2>

                {/* Controls: Filter, Search, Sort */}
                <ModerationControls
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterStartDate={filterStartDate}
                    setFilterStartDate={setFilterStartDate}
                    filterEndDate={filterEndDate}
                    setFilterEndDate={setFilterEndDate}
                    handleClearDateFilter={handleClearDateFilter}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    handleSortByName={handleSortByName}
                    handleSortByCreationDate={handleSortByCreationDate}
                    allConferencesCount={conferences.length} // Pass counts
                    pendingCount={pendingCount}
                    approvedCount={approvedCount}
                    rejectedCount={rejectedCount}
                />


                {/* Conference List */}
                <ConferenceList
                    conferences={processedConferences} // Pass the filtered/sorted list
                    onModerateClick={handleActionClick} // Pass the click handler
                    showCommentModal={showCommentModal} // Pass modal state to disable buttons
                />
            </div>

            {/* Comment Modal */}
             <CommentModal
                show={showCommentModal}
                targetStatus={targetStatus}
                comment={comment}
                commentError={commentError}
                setComment={setComment}
                onSubmit={handleModalSubmit}
                onCancel={handleModalCancel}
             />
        </div>
    );
};

export default Moderation;