// src/hooks/useModerationData.ts

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
    Conference, ConferenceStatus, SortKey, SortDirection,
    ApiConferenceRequest, FullConferenceDetailsResponse, OrganizationStrings
} from '@/src/types';
import { formatDateToYYYYMMDD } from '@/src/utils/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_DATABASE_URL;

interface UseModerationDataProps {
    filterStartDate: Date | null;
    filterEndDate: Date | null;
    sortKey: SortKey;
    sortDirection: SortDirection;
}

/**
 * Custom hook to fetch and manage conference data for moderation.
 * It handles API calls, loading states, errors, and data transformation.
 * @param props - The filter and sort parameters that trigger an API refetch.
 * @returns An object with the fetched conferences, loading state, error state, and a refetch function.
 */
export const useModerationData = ({ filterStartDate, filterEndDate, sortKey, sortDirection }: UseModerationDataProps) => {
    const t = useTranslations('Moderation');
    const [allFetchedConferences, setAllFetchedConferences] = useState<Conference[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            const formattedStartDate = formatDateToYYYYMMDD(filterStartDate);
            if (formattedStartDate) requestsUrl.searchParams.append('startDate', formattedStartDate);
            
            const formattedEndDate = formatDateToYYYYMMDD(filterEndDate);
            if (formattedEndDate) requestsUrl.searchParams.append('endDate', formattedEndDate);

            if (sortKey === 'createdAt' || sortKey === 'updatedAt') {
                requestsUrl.searchParams.append('sortBy', sortKey);
                requestsUrl.searchParams.append('sortOrder', sortDirection);
            }

            const requestsResponse = await fetch(requestsUrl.toString());
            if (!requestsResponse.ok) {
                const errorDetail = await requestsResponse.text();
                throw new Error(t('Error_FailedToFetchRequests', { status: requestsResponse.status, body: errorDetail.substring(0, 100) + (errorDetail.length > 100 ? '...' : '') }));
            }

            const requestsData: ApiConferenceRequest[] = await requestsResponse.json();
            if (!requestsData || requestsData.length === 0) {
                setAllFetchedConferences([]);
                setLoading(false);
                return;
            }

            const conferenceDetailsPromises = requestsData.map(async (request) => {
                const conferenceId = request.conferenceId;
                if (!conferenceId) {
                    console.warn(`Request ${request.id} is missing conferenceId. Skipping details fetch.`);
                    return { request, details: null, error: t('Error_MissingConferenceId') };
                }
                const detailsUrl = `${API_BASE_URL}/api/v1/conference/${conferenceId}?force=true`;
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
                    if (!item) return null;
                    const { request, details } = item;
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
                        title: details?.title || request.conference?.title || t('Moderation_DefaultTitle'),
                        acronym: details?.acronym || request.conference?.acronym || null,
                        creatorId: details?.creatorId || t('Moderation_DefaultCreatorId'),
                        organizations: mappedOrganizations,
                        ranks: details?.ranks || null,
                        feedbacks: details?.feedbacks || null,
                        followBy: details?.followBy || null,
                        detailsFetchError: item.error,
                        comment: '',
                    } as Conference;
                }).filter(Boolean) as Conference[];

            setAllFetchedConferences(combinedConferences);
        } catch (err: any) {
            console.error("Failed during data fetching:", err);
            setError(t('Error_FailedToLoadDataGeneric', { message: err.message }));
            setAllFetchedConferences([]);
        } finally {
            setLoading(false);
        }
    }, [filterStartDate, filterEndDate, sortKey, sortDirection, t]);

    useEffect(() => {
        fetchConferences();
    }, [fetchConferences]);

    return { conferences: allFetchedConferences, loading, error, refetch: fetchConferences };
};