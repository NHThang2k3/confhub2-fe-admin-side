// src/components/Moderation/Moderation.tsx
'use client'; // <-- Already marked as client component

import React, { useState, useMemo, useCallback, useEffect } from 'react';

// Import types
import {
    Conference, ConferenceStatus, SortKey, SortDirection,
    ApiConferenceRequest, FullConferenceDetailsResponse, OrganizationStrings
} from '@/src/types';

// Import child components
import ModerationControls from './ModerationControls';
import ConferenceList from './ConferenceList';
import CommentModal from './CommentModal';
// Import useTranslations
import { useTranslations } from 'next-intl'; // <-- Added import

// Helper function to format Date to YYYY-MM-DD
const formatDateToYYYYMMDD = (date: Date | null): string | undefined => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Base API URL - Using environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_DATABASE_URL;


const Moderation: React.FC = () => {
    // Call useTranslations hook
    const t = useTranslations('Moderation'); // <-- Added hook call (using a namespace example)

    const [conferences, setConferences] = useState<Conference[]>([]);
    const [loading, setLoading] = useState(true);
    // Initialize error with potential translation
    const [error, setError] = useState<string | null>(null);

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


    // --- Fetch Data from API ---
    const fetchConferences = useCallback(async () => {
        if (!API_BASE_URL) {
             // Translate backend URL error
             setError(t('Error_BackendUrlNotConfigured')); // <-- Translated
             setLoading(false);
             return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Fetch the list of moderation requests
            const requestsUrl = new URL(`${API_BASE_URL}/api/v1/admin/conferences/requests`);

            // Add query parameters for filtering/sorting requests
            if (filterStatus !== 'all') {
                requestsUrl.searchParams.append('status', filterStatus.toLowerCase());
            }
            const formattedStartDate = formatDateToYYYYMMDD(filterStartDate);
            if (formattedStartDate) {
                requestsUrl.searchParams.append('startDate', formattedStartDate);
            }
            const formattedEndDate = formatDateToYYYYMMDD(filterEndDate);
            if (formattedEndDate) {
                 requestsUrl.searchParams.append('endDate', formattedEndDate);
            }
            if (sortKey === 'createdAt' || sortKey === 'updatedAt') {
                 requestsUrl.searchParams.append('sortBy', sortKey);
                 requestsUrl.searchParams.append('sortOrder', sortDirection);
            }

            console.log("Fetching requests from:", requestsUrl.toString());

            const requestsResponse = await fetch(requestsUrl.toString());

            if (!requestsResponse.ok) {
                const errorDetail = await requestsResponse.text();
                 // Translate fetch error
                 throw new Error(t('Error_FailedToFetchRequests', {
                     status: requestsResponse.status,
                     body: errorDetail.substring(0, 100) + (errorDetail.length > 100 ? '...' : '') // Prevent excessively long error messages
                 })); // <-- Translated
            }

            const requestsData: ApiConferenceRequest[] = await requestsResponse.json();

            if (!requestsData || requestsData.length === 0) {
                 setConferences([]);
                 setLoading(false);
                 return;
            }

            // 2. Fetch full conference details for each request
            const conferenceDetailsPromises = requestsData.map(async (request) => {
                 const conferenceId = request.conferenceId;
                if (!conferenceId) {
                     console.warn(`Request ${request.id} is missing conferenceId. Skipping details fetch.`);
                     // Translate missing ID error
                     return { request, details: null, error: t('Error_MissingConferenceId') }; // <-- Translated
                }
                const detailsUrl = `${API_BASE_URL}/api/v1/conference/${conferenceId}`;

                try {
                    const detailsResponse = await fetch(detailsUrl);
                    if (!detailsResponse.ok) {
                        const errorDetail = await detailsResponse.text();
                         console.error(`Failed to fetch details for conference ${conferenceId}: status ${detailsResponse.status}, body: ${errorDetail}`);
                         // Translate failed details error
                        return { request, details: null, error: t('Error_FailedToLoadDetailsStatus', { status: detailsResponse.status }) }; // <-- Translated
                    }
                    const detailsData: FullConferenceDetailsResponse = await detailsResponse.json();
                    return { request, details: detailsData, error: null };
                } catch (err: any) {
                    console.error(`Error fetching details for conference ${conferenceId}:`, err);
                     // Translate network/other details error
                    return { request, details: null, error: t('Error_LoadingDetailsNetwork', { message: err.message }) }; // <-- Translated
                }
            });

            const results = await Promise.all(conferenceDetailsPromises);

            // 3. Combine data and map to our Conference type
            const combinedConferences: Conference[] = results
                .map(item => {
                const request = item!.request;
                const details = item!.details;

                const mappedOrganizations = details?.organizations?.map((org: OrganizationStrings) => ({
                    ...org,
                    conferenceDates: org.conferenceDates?.map(dateRange => ({
                         ...dateRange,
                         fromDate: dateRange.fromDate ? new Date(dateRange.fromDate) : undefined,
                         toDate: dateRange.toDate ? new Date(dateRange.toDate) : undefined,
                     })).filter(dateRange => dateRange.fromDate || dateRange.toDate) || null,
                    locations: org.locations || null,
                    topics: org.topics || null
                })) || null;

                return {
                    id: request.id,
                    conferenceId: request.conferenceId,
                    userId: request.userId,
                    adminId: request.adminId,
                    status: request.status,
                    message: request.message,
                    createdAt: new Date(request.createdAt),
                    updatedAt: new Date(request.updatedAt),

                    title: details?.title || request.conference?.title || t('Moderation_DefaultTitle'), // <-- Translate Default Title
                    acronym: details?.acronym || request.conference?.acronym || null,
                    creatorId: details?.creatorId || t('Moderation_DefaultCreatorId'), // <-- Translate Default CreatorId
                    organizations: mappedOrganizations,
                    ranks: details?.ranks || null,
                    feedbacks: details?.feedbacks || null,
                    followBy: details?.followBy || null,

                    detailsFetchError: item!.error, // Store error if details fetch failed

                    comment: '',
                } as Conference;
            });

            setConferences(combinedConferences);

        } catch (err: any) {
            console.error("Failed during data fetching:", err);
             // Translate generic fetch error
            setError(t('Error_FailedToLoadDataGeneric', { message: err.message })); // <-- Translated
             setConferences([]);
        } finally {
            setLoading(false);
        }
        // Added t as a dependency as it's used inside useCallback
    }, [filterStatus, filterStartDate, filterEndDate, sortKey, sortDirection, t]); // <-- Added t


    useEffect(() => {
        fetchConferences();
    }, [fetchConferences]);


     const handleModalCancel = useCallback(() => {
         setShowCommentModal(false);
         setConferenceToModerateId(null);
         setTargetStatus(null);
         setComment('');
         setCommentError('');
     }, []);


    const handleActionClick = useCallback((conferenceId: string, status: ConferenceStatus) => {
        setConferenceToModerateId(conferenceId);
        setTargetStatus(status);
        setComment('');
        setCommentError('');
        setShowCommentModal(true);
    }, []);


    // Handler to submit the comment and change status
    const handleModalSubmit = useCallback(async () => {
         // Translate comment requirement error based on status
         if (!comment.trim() && targetStatus === 'REJECTED') {
              setCommentError(t('Error_CommentRequiredForStatus', { status: targetStatus })); // <-- Translated
              return;
         }
         // If comment is required for ALL statuses
         // if (!comment.trim()) {
         //      setCommentError(t('Error_CommentRequired')); // <-- Translated
         //      return;
         // }


        if (!conferenceToModerateId || !targetStatus) {
             console.warn("Moderation submit called without valid ID or target status.");
             handleModalCancel();
             return;
        }

        const updateBody = {
            status: targetStatus,
            message: comment.trim(),
        };

        if (!API_BASE_URL) {
             // Translate backend URL error
             setError(t('Error_BackendUrlNotConfigured')); // <-- Translated
             handleModalCancel();
             return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/conferences/requests/${conferenceToModerateId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(updateBody),
            });

            if (!response.ok) {
                let errorMsg = `${t('Error_FailedToUpdateStatus')}: ${response.status}`; // <-- Translate base error message
                try {
                    const errorJson = await response.json();
                    errorMsg += ` - ${errorJson.message || JSON.stringify(errorJson)}`;
                } catch (e) { /* ignore json parse error */ }
                 console.error("API update failed:", errorMsg);
                 // Translate specific update error message
                 setError(t('Error_UpdateFailedDetails', { details: errorMsg })); // <-- Translated
                 handleModalCancel();
                 return;
            }

            console.log(`Successfully updated request ${conferenceToModerateId} to ${targetStatus}`);
            fetchConferences();

            setShowCommentModal(false);
            setConferenceToModerateId(null);
            setTargetStatus(null);
            setComment('');
            setCommentError('');

        } catch (err: any) {
            console.error("Network error during API update:", err);
            // Translate network error during update
            setError(t('Error_NetworkErrorUpdatingStatus', { message: err.message })); // <-- Translated
            handleModalCancel();
        } finally {
             // setIsSubmitting(false);
        }
        // Added t as a dependency as it's used inside useCallback
    }, [comment, conferenceToModerateId, targetStatus, fetchConferences, handleModalCancel, t]); // <-- Added t


    // Handler for sorting by title (Client-side sort)
    const handleSortByTitle = useCallback(() => {
        if (sortKey === 'title') {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey('title');
            setSortDirection('asc');
        }
    }, [sortKey, sortDirection]);


    // Handler for sorting by creation/update date (Primarily server-side sort)
    const handleSortByDate = useCallback((key: 'createdAt' | 'updatedAt') => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    }, [sortKey, sortDirection]);


    // Handler to clear date filters
    const handleClearDateFilter = useCallback(() => {
        setFilterStartDate(null);
        setFilterEndDate(null);
    }, []);


    // --- Client-side Filtering and Sorting ---
    const processedConferences = useMemo(() => {
        let result = [...conferences];

        // 1. Filter by search term (case-insensitive title search)
        if (searchTerm) {
            result = result.filter(conf =>
                conf.title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Sort by title if sortKey is 'title'
        if (sortKey === 'title') {
             result.sort((a, b) => {
                 const titleA = a.title?.toLowerCase() || '';
                 const titleB = b.title?.toLowerCase() || '';
                 if (titleA < titleB) {
                     return sortDirection === 'asc' ? -1 : 1;
                 }
                 if (titleA > titleB) {
                     return sortDirection === 'asc' ? 1 : -1;
                 }
                 return 0;
             });
        }

        return result;
    }, [conferences, searchTerm, sortKey, sortDirection]);


    // Calculate counts for filter options (based on total fetched data)
     const allConferencesCount = conferences.length;
     const pendingCount = conferences.filter(c => c.status === 'PENDING').length;
     const approvedCount = conferences.filter(c => c.status === 'APPROVED').length;
     const rejectedCount = conferences.filter(c => c.status === 'REJECTED').length;


    return (
        <div className='min-h-screen w-full px-4 bg-gray-100 font-sans'>
            <h1 className='mb-8 text-center text-3xl font-bold p-4 text-gray-800'>
                {/* Translate page title */}
                {t('ModerationPage_Title')} {/* <-- Translated */}
            </h1>

            <div className='mx-auto w-full rounded-lg bg-white p-4 shadow-md'>
                <h2 className='mb-4 text-2xl font-semibold text-gray-700'>
                     {/* Translate section title */}
                    {t('ModerationPage_ListSectionTitle')} {/* <-- Translated */}
                </h2>

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
                    handleSortByName={handleSortByTitle}
                    handleSortByCreationDate={() => handleSortByDate('createdAt')}
                    handleSortByUpdateDate={() => handleSortByDate('updatedAt')}
                    allConferencesCount={allConferencesCount}
                    pendingCount={pendingCount}
                    approvedCount={approvedCount}
                    rejectedCount={rejectedCount}
                    isLoading={loading}
                    // Pass t down to ModerationControls
                    // Alternative: Make ModerationControls a client component and call useTranslations there (Recommended)
                />

                 {/* Loading and Error Indicators */}
                 {loading && (
                    <div className="text-center text-blue-600 py-4">
                        {/* Translate loading messages */}
                        {conferences.length === 0 ? t('ModerationPage_LoadingInitial') : t('ModerationPage_UpdatingList')} {/* <-- Translated */}
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-600 py-4">
                        {/* Translate generic error label */}
                        {t('Error_Generic')}: {error} {/* <-- Translated */}
                    </div>
                )}


                {/* Conference List */}
                {(!loading || conferences.length > 0) && !error && (
                    <ConferenceList
                        conferences={processedConferences}
                        onModerateClick={handleActionClick}
                        showCommentModal={showCommentModal}
                        // Pass t down to ConferenceList if needed there (e.g., for buttons or status labels)
                        // t={t} // <-- Example
                    />
                )}
                {/* Message for no results after loading and filtering/searching */}
                 {!loading && !error && processedConferences.length === 0 && conferences.length > 0 && searchTerm && (
                     <p className='py-8 text-center text-gray-500'>
                        {/* Translate no results message */}
                        {t('ModerationPage_NoResultsSearch')} {/* <-- Translated */}
                     </p>
                 )}
                 {/* Message if no data was fetched at all */}
                 {!loading && !error && processedConferences.length === 0 && conferences.length === 0 && !searchTerm && (
                     <p className='py-8 text-center text-gray-500'>
                        {/* Translate no requests message */}
                        {t('ModerationPage_NoRequestsFound')} {/* <-- Translated */}
                     </p>
                 )}
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
                // Pass t down to CommentModal
             />
        </div>
    );
};

export default Moderation;