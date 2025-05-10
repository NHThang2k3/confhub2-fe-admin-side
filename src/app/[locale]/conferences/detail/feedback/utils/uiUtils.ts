// src/utils/uiUtils.ts

/**
 * Generates an array of star characters (filled/empty) based on a rating.
 * @param starCount The rating number (will be rounded).
 * @param maxStars The total number of stars (default 5).
 * @returns Array of '★' and '☆' characters.
 */
export const getStarsArray = (starCount: number, maxStars: number = 5): string[] => {
    const stars: string[] = [];
    const roundedStars = Math.max(0, Math.min(maxStars, Math.round(starCount)));
    for (let i = 0; i < maxStars; i++) {
      stars.push(i < roundedStars ? '★' : '☆');
    }
    return stars;
  };