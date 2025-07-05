// src/utils/arrayUtils.ts
export function chunkArray<T>(array: T[], size: number): T[][] {
    if (size <= 0) return [array];
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}



// src/utils/dateUtils.ts

/**
 * Formats a Date object or null into a YYYY-MM-DD string.
 * @param date The date to format.
 * @returns A string in YYYY-MM-DD format, or undefined if the input is null.
 */
export const formatDateToYYYYMMDD = (date: Date | null): string | undefined => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};





export const generateCronExpression = (
    cycleType: 'daily' | 'monthly',
    time: string,
    dayOfMonth: string
): string => {
    const [hours, minutes] = time.split(':');
    if (cycleType === 'daily') {
        return `${minutes} ${hours} * * *`;
    } else {
        // Đảm bảo dayOfMonth là một số hợp lệ từ 1-31
        const day = Math.max(1, Math.min(31, parseInt(dayOfMonth, 10) || 1));
        return `${minutes} ${hours} ${day} * *`;
    }
};






// Import types
import { Location } from '@/src/types';

// Helper to format Date objects for display (can remain here, doesn't have translatable strings)
export const formatDateTimeDisplay = (date: Date | undefined) => {
    if (!date || isNaN(date.getTime())) return 'N/A';
     return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}


// FIXED: Changed the type of the `t` parameter from `ReturnType<typeof useTranslations>`
// to `(key: string) => string` to resolve the 'never' type inference issue.
export const formatDateRangeDisplay = (fromDate: Date | undefined, toDate: Date | undefined, t: (key: string) => string) => {
     const formattedFrom = fromDate && !isNaN(fromDate.getTime()) ? formatDateTimeDisplay(fromDate).split(', ')[0] : t('Common_NA');
     const formattedTo = toDate && !isNaN(toDate.getTime()) ? formatDateTimeDisplay(toDate).split(', ')[0] : t('Common_NA');

     if (formattedFrom === t('Common_NA') && formattedTo === t('Common_NA')) return t('Common_NA');
     if (formattedFrom === formattedTo && formattedFrom !== t('Common_NA')) return formattedFrom;
     if (formattedFrom !== t('Common_NA') && formattedTo === t('Common_NA')) return `${formattedFrom} ${t('DateRange_Onwards')}`;
     if (formattedFrom === t('Common_NA') && formattedTo !== t('Common_NA')) return `${t('DateRange_Until')} ${formattedTo}`;

     return `${formattedFrom} - ${formattedTo}`;
};

// FIXED: Applied the same type fix to this helper for consistency.
export const formatLocationDisplay = (location: Location | undefined | null, t: (key: string) => string) => {
     if (!location) return t('Common_NA');
     const parts = [];
     if (location.address) parts.push(location.address);
     if (location.cityStateProvince) parts.push(location.cityStateProvince);
     if (location.country) parts.push(location.country);
     if (location.continent && parts.length === 0 && !location.country && !location.cityStateProvince && !location.address) parts.push(location.continent);
     return parts.length > 0 ? parts.filter(p => p != null).join(', ') : t('Common_NA');
};