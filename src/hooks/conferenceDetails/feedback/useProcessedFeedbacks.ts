// src/hooks/useProcessedFeedbacks.ts
import { useMemo } from 'react';
import { Feedback, SortOption } from '../../../models/send/feedback.send';
import { filterFeedbacks, sortFeedbacks } from '../../../app/[locale]/conferences/detail/feedback/utils/feedbackUtils';

/**
 * Hook to filter and sort feedbacks efficiently using useMemo.
 * @param allFeedbacks The complete array of feedback objects.
 * @param filterStar The star rating to filter by (null for all).
 * @param sortOption The sorting criteria ('time' or 'star').
 * @returns Memoized array of processed (filtered and sorted) feedbacks.
 */
export const useProcessedFeedbacks = (
    allFeedbacks: Feedback[],
    filterStar: number | null,
    sortOption: SortOption
): Feedback[] => {
    return useMemo(() => {
        // 1. Apply Star Filter
        const filtered = filterFeedbacks(allFeedbacks, filterStar);
        // 2. Apply Sorting
        const sorted = sortFeedbacks(filtered, sortOption);
        return sorted;
    }, [allFeedbacks, filterStar, sortOption]);
};