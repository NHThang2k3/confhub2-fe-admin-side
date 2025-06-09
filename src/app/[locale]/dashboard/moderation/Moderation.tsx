// src/components/Moderation/Moderation.tsx
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Conference, ConferenceStatus, SortKey, SortDirection,
    ApiConferenceRequest, FullConferenceDetailsResponse, OrganizationStrings
} from '@/src/types';
import ModerationControls from './ModerationControls';
import ConferenceList from './ConferenceList';
import CommentModal from './CommentModal';
import { useTranslations } from 'next-intl';

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
    const t = useTranslations('Moderation');

    // Store all conferences fetched based on date/sort criteria (not filtered by status at API level)
    const [allFetchedConferences, setAllFetchedConferences] = useState<Conference[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // filterStatus is now for client-side filtering of allFetchedConferences
    const [filterStatus, setFilterStatus] = useState<ConferenceStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

    // Sorting States
    const [sortKey, setSortKey] = useState<SortKey>('createdAt'); // 'createdAt', 'updatedAt' for API sort; 'title' for client sort
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Modal States
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [conferenceToModerateId, setConferenceToModerateId] = useState<string | null>(null);
    const [targetStatus, setTargetStatus] = useState<ConferenceStatus | null>(null);
    const [comment, setComment] = useState('');
    const [commentError, setCommentError] = useState('');


    // --- Fetch Data from API ---
    // This function now fetches conferences based on date range and sorting,
    // but NOT by status from the API. Status filtering will happen client-side.
    const fetchConferences = useCallback(async () => {
        if (!API_BASE_URL) {
             setError(t('Error_BackendUrlNotConfigured'));
             setLoading(false);
             return;
        }

        setLoading(true);
        setError(null);

        try {
            const requestsUrl = new URL(`${API_BASE_URL}/api/v1/admin/conferences/requests`);

            // Add query parameters for filtering/sorting requests
            // DO NOT filter by status here; we fetch all statuses matching other criteria.
            // The 'status' parameter is removed from the API call.

            const formattedStartDate = formatDateToYYYYMMDD(filterStartDate);
            if (formattedStartDate) {
                requestsUrl.searchParams.append('startDate', formattedStartDate);
            }
            const formattedEndDate = formatDateToYYYYMMDD(filterEndDate);
            if (formattedEndDate) {
                 requestsUrl.searchParams.append('endDate', formattedEndDate);
            }
            // API handles sorting by 'createdAt' or 'updatedAt'
            if (sortKey === 'createdAt' || sortKey === 'updatedAt') {
                 requestsUrl.searchParams.append('sortBy', sortKey);
                 requestsUrl.searchParams.append('sortOrder', sortDirection);
            }

            console.log("Fetching all conferences (matching date/sort criteria) from:", requestsUrl.toString());

            const requestsResponse = await fetch(requestsUrl.toString());

            if (!requestsResponse.ok) {
                const errorDetail = await requestsResponse.text();
                 throw new Error(t('Error_FailedToFetchRequests', {
                     status: requestsResponse.status,
                     body: errorDetail.substring(0, 100) + (errorDetail.length > 100 ? '...' : '')
                 }));
            }

            const requestsData: ApiConferenceRequest[] = await requestsResponse.json();

            if (!requestsData || requestsData.length === 0) {
                 setAllFetchedConferences([]); // Update state for all fetched conferences
                 setLoading(false);
                 return;
            }

            const conferenceDetailsPromises = requestsData.map(async (request) => {
                 const conferenceId = request.conferenceId;
                if (!conferenceId) {
                     console.warn(`Request ${request.id} is missing conferenceId. Skipping details fetch.`);
                     return { request, details: null, error: t('Error_MissingConferenceId') };
                }
                const detailsUrl = `${API_BASE_URL}/api/v1/conference/${conferenceId}`;

                try {
                    const detailsResponse = await fetch(detailsUrl);
                    if (!detailsResponse.ok) {
                        const errorDetail = await detailsResponse.text();
                         console.error(`Failed to fetch details for conference ${conferenceId}: status ${detailsResponse.status}, body: ${errorDetail}`);
                        return { request, details: null, error: t('Error_FailedToLoadDetailsStatus', { status: detailsResponse.status }) };
                    }
                    const detailsData: FullConferenceDetailsResponse = await detailsResponse.json();
                    return { request, details: detailsData, error: null };
                } catch (err: any) {
                    console.error(`Error fetching details for conference ${conferenceId}:`, err);
                    return { request, details: null, error: t('Error_LoadingDetailsNetwork', { message: err.message }) };
                }
            });

            const results = await Promise.all(conferenceDetailsPromises);

            const combinedConferences: Conference[] = results
                .map(item => {
                if (!item) return null; // Should not happen if all promises resolve
                const request = item.request;
                const details = item.details;

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
                    message: request.message, // This is likely the user's original message or admin's last message
                    createdAt: new Date(request.createdAt),
                    updatedAt: new Date(request.updatedAt),

                    title: details?.title || request.conference?.title || t('Moderation_DefaultTitle'),
                    acronym: details?.acronym || request.conference?.acronym || null,
                    creatorId: details?.creatorId || t('Moderation_DefaultCreatorId'),
                    organizations: mappedOrganizations,
                    ranks: details?.ranks || null,
                    feedbacks: details?.feedbacks || null,
                    followBy: details?.followBy || null,
                    detailsFetchError: item.error,
                    comment: '', // This field on Conference type might be for UI-only temporary storage if needed
                } as Conference;
            }).filter(Boolean) as Conference[]; // Filter out any nulls

            setAllFetchedConferences(combinedConferences); // Update state for all fetched conferences

        } catch (err: any) {
            console.error("Failed during data fetching:", err);
            setError(t('Error_FailedToLoadDataGeneric', { message: err.message }));
            setAllFetchedConferences([]); // Update state for all fetched conferences
        } finally {
            setLoading(false);
        }
      // Dependencies: only those that should trigger a full API re-fetch of allFetchedConferences
    }, [filterStartDate, filterEndDate, sortKey, sortDirection, t]);


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


    const handleModalSubmit = useCallback(async () => {
         if (!comment.trim() && targetStatus === 'REJECTED') {
              setCommentError(t('Error_CommentRequiredForStatus', { status: targetStatus }));
              return;
         }

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
             setError(t('Error_BackendUrlNotConfigured'));
             handleModalCancel();
             return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/conferences/requests/${conferenceToModerateId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin-token')}`,
                },
                body: JSON.stringify(updateBody),
            });

            if (!response.ok) {
                let errorMsg = `${t('Error_FailedToUpdateStatus')}: ${response.status}`;
                try {
                    const errorJson = await response.json();
                    errorMsg += ` - ${errorJson.message || JSON.stringify(errorJson)}`;
                } catch (e) { /* ignore json parse error */ }
                 console.error("API update failed:", errorMsg);
                 setError(t('Error_UpdateFailedDetails', { details: errorMsg }));
                 // Do not close modal on API error, let user see the issue or retry.
                 // Or, if you want to close, call handleModalCancel();
                 return;
            }

            console.log(`Successfully updated request ${conferenceToModerateId} to ${targetStatus}`);
            // After successful update, re-fetch all conferences.
            // This will update allFetchedConferences, which in turn updates counts and processedConferences.
            fetchConferences();

            // Close modal and reset modal state
            setShowCommentModal(false);
            setConferenceToModerateId(null);
            setTargetStatus(null);
            setComment('');
            setCommentError('');

        } catch (err: any) {
            console.error("Network error during API update:", err);
            setError(t('Error_NetworkErrorUpdatingStatus', { message: err.message }));
            handleModalCancel(); // Close modal on network error
        }
    }, [comment, conferenceToModerateId, targetStatus, fetchConferences, handleModalCancel, t]);

    // Handler for sorting by title (Client-side sort on processedConferences)
    const handleSortByTitle = useCallback(() => {
        if (sortKey === 'title') {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey('title');
            setSortDirection('asc');
        }
    }, [sortKey]); // sortDirection removed as it's set directly


    // Handler for sorting by creation/update date (Server-side sort via fetchConferences)
    const handleSortByDate = useCallback((key: 'createdAt' | 'updatedAt') => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
        // Changing sortKey to 'createdAt' or 'updatedAt' (or sortDirection if key is already date)
        // will trigger fetchConferences via its useEffect dependency because
        // fetchConferences depends on sortKey and sortDirection.
    }, [sortKey]); // sortDirection removed


    const handleClearDateFilter = useCallback(() => {
        setFilterStartDate(null);
        setFilterEndDate(null);
        // This will trigger fetchConferences due to filterStartDate/filterEndDate changing.
    }, []);


    // --- Client-side Filtering and Sorting for Display ---
    const processedConferences = useMemo(() => {
        let result = [...allFetchedConferences];

        // 1. Filter by status (selected tab) - client-side
        if (filterStatus !== 'all') {
            result = result.filter(conf => conf.status === filterStatus);
        }

        // 2. Filter by search term (case-insensitive title search) - client-side
        if (searchTerm) {
            result = result.filter(conf =>
                conf.title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 3. Sort by title if sortKey is 'title' (client-side)
        //    Date sorting ('createdAt', 'updatedAt') is handled by the API when fetching allFetchedConferences.
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
        // If allFetchedConferences is already sorted by date from API, no further date sort needed here.

        return result;
    }, [allFetchedConferences, filterStatus, searchTerm, sortKey, sortDirection]);


    // Calculate counts for filter options (based on *all* fetched data matching date/API-sort criteria)
     const allConferencesCount = allFetchedConferences.length;
     const pendingCount = allFetchedConferences.filter(c => c.status === 'PENDING').length;
     const approvedCount = allFetchedConferences.filter(c => c.status === 'APPROVED').length;
     const rejectedCount = allFetchedConferences.filter(c => c.status === 'REJECTED').length;


    return (
        <div className='min-h-screen w-full px-4 bg-gray-10 font-sans'>
            <h1 className='mb-8 text-center text-3xl font-bold p-4 '>
                {t('ModerationPage_Title')}
            </h1>

            <div className='mx-auto w-full rounded-lg bg-white-pure p-4 shadow-md'>
                <h2 className='mb-4 text-2xl font-semibold '>
                    {t('ModerationPage_ListSectionTitle')}
                </h2>

                <ModerationControls
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus} // This now only triggers client-side re-filter via processedConferences
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm} // This also only triggers client-side re-filter
                    filterStartDate={filterStartDate}
                    setFilterStartDate={setFilterStartDate} // Triggers API fetch via fetchConferences
                    filterEndDate={filterEndDate}
                    setFilterEndDate={setFilterEndDate} // Triggers API fetch
                    handleClearDateFilter={handleClearDateFilter} // Triggers API fetch
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    handleSortByName={handleSortByTitle} // Client-side sort, updates sortKey/Direction for processedConferences
                    handleSortByCreationDate={() => handleSortByDate('createdAt')} // Triggers API fetch
                    handleSortByUpdateDate={() => handleSortByDate('updatedAt')} // Triggers API fetch
                    allConferencesCount={allConferencesCount} // Now correctly reflects all (matching date/API-sort)
                    pendingCount={pendingCount} // Correct
                    approvedCount={approvedCount} // Correct
                    rejectedCount={rejectedCount} // Correct
                    isLoading={loading}
                />

                 {loading && (
                    <div className="text-center text-blue-600 py-4">
                        {allFetchedConferences.length === 0 ? t('ModerationPage_LoadingInitial') : t('ModerationPage_UpdatingList')}
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-600 py-4">
                        {t('Error_Generic')}: {error}
                    </div>
                )}

                {/* Display list if not loading OR if there's already data (even while updating) AND no error */}
                {(!loading || allFetchedConferences.length > 0) && !error && (
                    <ConferenceList
                        conferences={processedConferences} // Display the client-side filtered/sorted list
                        onModerateClick={handleActionClick}
                        showCommentModal={showCommentModal}
                    />
                )}

                {/* Message if data exists from API, but current client-side filters (status or search) yield no results */}
                {!loading && !error && allFetchedConferences.length > 0 && processedConferences.length === 0 && (
                     <p className='py-8 text-center '>
                        {t('ModerationPage_NoResultsSearch')}
                     </p>
                 )}
                 {/* Message if no data was fetched from API at all (matching current date/sort criteria) */}
                 {!loading && !error && allFetchedConferences.length === 0 && (
                     <p className='py-8 text-center '>
                        {t('ModerationPage_NoRequestsFound')}
                     </p>
                 )}
            </div>

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