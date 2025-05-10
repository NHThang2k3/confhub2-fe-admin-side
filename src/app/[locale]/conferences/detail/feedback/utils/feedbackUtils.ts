// src/utils/feedbackUtils.ts
import { Feedback, SortOption } from '../../../../../../models/send/feedback.send'
import { safeGetDate } from './dateUtils';

/**
 * Filters an array of feedbacks based on a star rating.
 * @param feedbacks Array of feedback objects.
 * @param filterStar The star rating to filter by (1-5), or null for no filter.
 * @returns Filtered array of feedbacks.
 */
export const filterFeedbacks = (feedbacks: Feedback[], filterStar: number | null): Feedback[] => {
  if (filterStar === null) {
    return feedbacks;
  }
  return feedbacks.filter(fb => (fb.star ?? 0) === filterStar);
};

/**
 * Sorts an array of feedbacks based on the specified option.
 * @param feedbacks Array of feedback objects.
 * @param sortOption 'time' (descending) or 'star' (descending, with time as secondary).
 * @returns A *new* sorted array of feedbacks.
 */
export const sortFeedbacks = (feedbacks: Feedback[], sortOption: SortOption): Feedback[] => {
  // Create a copy to avoid mutating the original array
  return [...feedbacks].sort((a, b) => {
    const starA = a.star ?? 0;
    const starB = b.star ?? 0;
    const dateA = safeGetDate(a.createdAt);
    const dateB = safeGetDate(b.createdAt);

    // Primary sort based on sortOption
    if (sortOption === 'star') {
      const starDifference = starB - starA;
      if (starDifference !== 0) {
        return starDifference; // Sort by star descending
      }
    }

    // Default/Secondary sort: time descending (newest first)
    return dateB.getTime() - dateA.getTime();
  });
};

/**
 * Calculates the overall average star rating from feedbacks.
 * @param feedbacks Array of feedback objects.
 * @returns Average rating (0 if no feedbacks).
 */
export const calculateOverallRating = (feedbacks: Feedback[]): number => {
  if (feedbacks.length === 0) return 0;
  const totalStars = feedbacks.reduce(
    (sum, feedback) => sum + (feedback.star ?? 0),
    0
  );
  return totalStars / feedbacks.length;
};

/**
 * Calculates the distribution of star ratings (count for each star 1-5).
 * @param feedbacks Array of feedback objects.
 * @returns An object mapping star number (1-5) to its count.
 */
export const calculateRatingDistribution = (feedbacks: Feedback[]): Record<number, number> => {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedbacks.forEach(feedback => {
    const star = feedback.star ?? 0;
    if (star >= 1 && star <= 5) {
      distribution[star]++;
    }
  });
  return distribution;
};