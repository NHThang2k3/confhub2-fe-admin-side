// src/utils/dateUtils.ts
export const defaultDateForNull = new Date(0); // Unix epoch
/**
 * Safely parses a date string or Date object, returning a default date on failure or null/undefined input.
 * @param dateInput The date string, Date object, or potentially null/undefined.
 * @returns A valid Date object (defaults to epoch on error/invalid input).
 */
export const safeGetDate = (dateInput: string | Date | null | undefined): Date => {
  if (!dateInput) {
    return defaultDateForNull;
  }
  try {
    const date = new Date(dateInput);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date input:', dateInput);
      return defaultDateForNull;
    }
    return date;
  } catch (e) {
    console.error('Error parsing date:', dateInput, e);
    return defaultDateForNull; // Fallback to epoch on error
  }
};

/**
 * Formats a Date object into a locale-specific string (Date + Time).
 * @param date The Date object to format.
 * @returns Formatted date and time string, or 'Date Unavailable'.
 */
export const formatFeedbackDate = (date: Date): string => {
    if (date === defaultDateForNull || isNaN(date.getTime())) {
        return 'Date Unavailable';
    }
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}