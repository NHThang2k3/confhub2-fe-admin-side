// src/components/Moderation/Moderation.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';

// Import types - Make sure this file is updated based on the new combined structure
import {
    Conference, ConferenceStatus, SortKey, SortDirection,
    ApiConferenceRequest, FullConferenceDetailsResponse, OrganizationStrings
} from '@/src/types';

// Import child components
import ModerationControls from './ModerationControls';
import ConferenceList from './ConferenceList';
import CommentModal from './CommentModal';

// Helper function to format Date to YYYY-MM-DD (still useful for API date filtering)
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
    const [conferences, setConferences] = useState<Conference[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtering States (match types.ts and API response uppercase)
    const [filterStatus, setFilterStatus] = useState<ConferenceStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState(''); // Search is client-side on 'title'
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null); // Filter on request createdAt
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null); // Filter on request createdAt

    // Sorting States
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Modal States
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [conferenceToModerateId, setConferenceToModerateId] = useState<string | null>(null); // This is the REQUEST ID
    const [targetStatus, setTargetStatus] = useState<ConferenceStatus | null>(null);
    const [comment, setComment] = useState('');
    const [commentError, setCommentError] = useState('');


    // --- Fetch Data from API ---
    const fetchConferences = useCallback(async () => {
        if (!API_BASE_URL) {
             setError("Backend URL is not configured (NEXT_PUBLIC_DATABASE_URL)");
             setLoading(false);
             return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Fetch the list of moderation requests
            const requestsUrl = new URL(`${API_BASE_URL}/api/v1/admin-conference/requests`);

            // Add query parameters for filtering/sorting requests (based on first API's capabilities)
            if (filterStatus !== 'all') {
                // API filter param might expect lowercase (as per Swagger)
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
            // Only send sortBy/sortOrder if the key is supported by the *first* API ('createdAt', 'updatedAt')
            if (sortKey === 'createdAt' || sortKey === 'updatedAt') {
                 requestsUrl.searchParams.append('sortBy', sortKey);
                 // API Swagger showed 'asc', 'desc'. Ensure case matches.
                 requestsUrl.searchParams.append('sortOrder', sortDirection);
            }
            // 'title' sort is handled client-side after fetching details


            console.log("Fetching requests from:", requestsUrl.toString());

            const requestsResponse = await fetch(requestsUrl.toString());

            if (!requestsResponse.ok) {
                const errorDetail = await requestsResponse.text();
                throw new Error(`Failed to fetch requests! status: ${requestsResponse.status}, body: ${errorDetail}`);
            }

            const requestsData: ApiConferenceRequest[] = await requestsResponse.json();

            if (!requestsData || requestsData.length === 0) {
                 setConferences([]); // No requests, so no conferences
                 setLoading(false);
                 return;
            }

            // 2. Fetch full conference details for each request
            const conferenceDetailsPromises = requestsData.map(async (request) => {
                 const conferenceId = request.conferenceId;
                if (!conferenceId) {
                     console.warn(`Request ${request.id} is missing conferenceId. Skipping details fetch.`);
                     return { request, details: null, error: "Missing conference ID" };
                }
                const detailsUrl = `${API_BASE_URL}/api/v1/conference/${conferenceId}`;

                try {
                    const detailsResponse = await fetch(detailsUrl);
                    if (!detailsResponse.ok) {
                        const errorDetail = await detailsResponse.text();
                         console.error(`Failed to fetch details for conference ${conferenceId}: status ${detailsResponse.status}, body: ${errorDetail}`);
                        return { request, details: null, error: `Failed to load details: ${detailsResponse.status}` };
                    }
                    const detailsData: FullConferenceDetailsResponse = await detailsResponse.json();
                    return { request, details: detailsData, error: null };
                } catch (err: any) {
                    console.error(`Error fetching details for conference ${conferenceId}:`, err);
                    return { request, details: null, error: `Error loading details: ${err.message}` };
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
                    id: request.id, // Request ID
                    conferenceId: request.conferenceId, // Actual Conference ID
                    userId: request.userId,
                    adminId: request.adminId,
                    status: request.status, // Request Status (Uppercase from API)
                    message: request.message, // User's original message
                    createdAt: new Date(request.createdAt),
                    updatedAt: new Date(request.updatedAt),

                    title: details?.title || request.conference?.title || 'N/A', // Prefer full details
                    acronym: details?.acronym || request.conference?.acronym || null,
                    creatorId: details?.creatorId || 'N/A',
                    organizations: mappedOrganizations,
                    ranks: details?.ranks || null,
                    feedbacks: details?.feedbacks || null,
                    followBy: details?.followBy || null,

                    detailsFetchError: item!.error, // Store error if details fetch failed

                    comment: '', // Client-side comment (not from API response, used for input)
                } as Conference;
            });

            setConferences(combinedConferences);

        } catch (err: any) {
            console.error("Failed during data fetching:", err);
            setError(`Failed to load data: ${err.message}`);
             setConferences([]); // Clear conferences on major fetch error
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus, filterStartDate, filterEndDate, sortKey, sortDirection]);


    useEffect(() => {
        fetchConferences();
    }, [fetchConferences]);


    // Handler to cancel the modal (DEFINED FIRST TO BE CALLED BY handleModalSubmit)
     const handleModalCancel = useCallback(() => {
         setShowCommentModal(false);
         setConferenceToModerateId(null);
         setTargetStatus(null);
         setComment('');
         setCommentError('');
     }, []);


    // Handler to open the modal (uses request ID)
    const handleActionClick = useCallback((conferenceId: string, status: ConferenceStatus) => {
        // conferenceId here is the *request* ID (conf.id)
        setConferenceToModerateId(conferenceId);
        setTargetStatus(status);
        // As per previous discussion, we are not pre-filling the comment from 'conferences' state
        // We clear the comment input for the admin's new message/reason
        setComment(''); // Clear comment input on opening modal
        setCommentError('');
        setShowCommentModal(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Removed 'conferences' dependency as it's no longer used inside this function


    // Handler to submit the comment and change status (Calls API to update Request)
    const handleModalSubmit = useCallback(async () => {
        // Validate comment if required (e.g., for REJECTED status)
        // Based on the PATCH swagger, 'message' is required.
        // If message is required by API for ALL status changes, uncomment this:
        // if (!comment.trim()) {
        //      setCommentError(`Comment is required.`);
        //      return;
        // }
        // If message is only required for REJECTED:
         if (!comment.trim() && targetStatus === 'REJECTED') {
              setCommentError(`Comment is required for ${targetStatus} status.`);
              return;
         }


        if (!conferenceToModerateId || !targetStatus) {
             console.warn("Moderation submit called without valid ID or target status.");
             handleModalCancel(); // Call the now-defined function
             return;
        }

        const updateBody = {
            status: targetStatus, // Send uppercase status
            // Send admin comment/reason in the 'message' field as per PATCH swagger
            // Send empty string if no comment is provided, UNLESS API REQUIRES IT
            message: comment.trim(),
        };

        if (!API_BASE_URL) {
             setError("Backend URL is not configured");
             handleModalCancel(); // Call the now-defined function
             return;
        }

        // Optionally add a specific loading state for the modal submit
        // e.g., const [isSubmitting, setIsSubmitting] = useState(false);
        // setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin-conference/requests/${conferenceToModerateId}/status`, {
                method: 'PATCH', // Use PATCH method
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header if needed (e.g., Bearer token for admin)
                    // 'Authorization': `Bearer ${yourAuthToken}`
                },
                body: JSON.stringify(updateBody),
            });

            if (!response.ok) {
                let errorMsg = `Failed to update status: ${response.status}`;
                try {
                    const errorJson = await response.json();
                    // Assuming backend returns a JSON error body with a 'message' or 'error' field
                    errorMsg += ` - ${errorJson.message || JSON.stringify(errorJson)}`;
                } catch (e) { /* ignore json parse error */ }
                 console.error("API update failed:", errorMsg);
                 setError(`Update failed: ${errorMsg}`); // Show error to the user
                 handleModalCancel(); // Call the now-defined function
                 return;
            }

            // Handle Success
            console.log(`Successfully updated request ${conferenceToModerateId} to ${targetStatus}`);
            // Refetch all data to ensure list is up-to-date, including new status and updatedAt
            fetchConferences();

            // Close Modal and Reset State (on successful API call)
            setShowCommentModal(false);
            setConferenceToModerateId(null);
            setTargetStatus(null);
            setComment('');
            setCommentError('');

        } catch (err: any) {
            // Handle network errors
            console.error("Network error during API update:", err);
            setError(`Network error updating status: ${err.message}`);
            handleModalCancel(); // Call the now-defined function
        } finally {
             // setIsSubmitting(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comment, conferenceToModerateId, targetStatus, fetchConferences, handleModalCancel]); // Dependencies updated


    // Handler for sorting by title (Client-side sort)
    const handleSortByTitle = useCallback(() => {
        if (sortKey === 'title') {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey('title');
            setSortDirection('asc'); // Default direction for title sort
        }
    }, [sortKey, sortDirection]);


    // Handler for sorting by creation/update date (Primarily server-side sort)
    const handleSortByDate = useCallback((key: 'createdAt' | 'updatedAt') => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc'); // Default direction for date sort (newest first)
        }
    }, [sortKey, sortDirection]);


    // Handler to clear date filters
    const handleClearDateFilter = useCallback(() => {
        setFilterStartDate(null);
        setFilterEndDate(null);
    }, []);


    // --- Client-side Filtering (Search Term) and Sorting (Title) ---
    const processedConferences = useMemo(() => {
        let result = [...conferences];

        // 1. Filter by search term (case-insensitive title search) - Client-side
        if (searchTerm) {
            result = result.filter(conf =>
                conf.title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Sort by title if sortKey is 'title' - Client-side
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
        // If sortKey is createdAt or updatedAt, the initial list fetch was sorted by the API.
        // Only client-side search filter is applied here.

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
                Conference Listing Moderation
            </h1>

            <div className='mx-auto w-full rounded-lg bg-white p-4 shadow-md'>
                <h2 className='mb-4 text-2xl font-semibold text-gray-700'>
                    Conference List
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
                />

                 {/* Loading and Error Indicators */}
                 {loading && (
                    <div className="text-center text-blue-600 py-4">
                        {conferences.length === 0 ? "Loading conferences..." : "Updating list..."}
                         {/* Add a spinner here if you have one */}
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-600 py-4">Error: {error}</div>
                )}


                {/* Conference List */}
                {/* Show list if not loading or if data is available */}
                {(!loading || conferences.length > 0) && !error && (
                    <ConferenceList
                        conferences={processedConferences} // Pass the filtered/sorted list
                        onModerateClick={handleActionClick} // Pass the click handler
                        showCommentModal={showCommentModal} // Pass modal state to disable buttons
                    />
                )}
                {/* Message for no results after loading and filtering/searching */}
                 {!loading && !error && processedConferences.length === 0 && conferences.length > 0 && searchTerm && (
                     <p className='py-8 text-center text-gray-500'>
                        No conferences found matching search term.
                     </p>
                 )}
                 {/* Message if no data was fetched at all */}
                 {!loading && !error && processedConferences.length === 0 && conferences.length === 0 && !searchTerm && (
                     <p className='py-8 text-center text-gray-500'>
                        No conference requests found.
                     </p>
                 )}
            </div>

            {/* Comment Modal */}
             <CommentModal
                show={showCommentModal}
                targetStatus={targetStatus} // This is the uppercase status
                comment={comment}
                commentError={commentError}
                setComment={setComment}
                onSubmit={handleModalSubmit} // This calls the API to update status
                onCancel={handleModalCancel}
             />
        </div>
    );
};

export default Moderation;