// src/app/[locale]/visualization/utils/helpers.ts

/**
 * Log prefix for utility functions.
 */
const logPrefixHelper = 'HELPER:';

/**
 * Safely retrieves a nested value from an object using a dot-separated path.
 * Handles array indices within the path.
 * @param obj The object to traverse.
 * @param path The dot-separated path string (e.g., 'organizations[0].locations[0].country').
 * @returns The value found at the path, or undefined if the path is invalid or any part is null/undefined.
 */
export const getNestedValue = (obj: any, path: string): any => {
    if (typeof obj !== 'object' || obj === null) {
        // console.log(`${logPrefixHelper} getNestedValue: Input obj is not an object or is null.`);
        return undefined;
    }
    // console.log(`${logPrefixHelper} getNestedValue: Accessing path "${path}"`);
    try {
        const parts = path.split('.');
        let current: any = obj;

        for (const part of parts) {
            if (current === null || current === undefined) {
                // console.log(`${logPrefixHelper} getNestedValue: Path traversal stopped at "${part}" due to null/undefined parent.`);
                return undefined;
            }

            const arrayMatch = part.match(/^(.+)\[(\d+)]$/);
            if (arrayMatch) {
                const arrayKey = arrayMatch[1];
                const index = parseInt(arrayMatch[2], 10);
                // console.log(`${logPrefixHelper} getNestedValue: Accessing array "${arrayKey}" at index ${index}.`);
                current = current[arrayKey];
                if (!Array.isArray(current) || index >= current.length) {
                    // console.log(`${logPrefixHelper} getNestedValue: Array "${arrayKey}" not found, not an array, or index ${index} out of bounds.`);
                    return undefined;
                }
                current = current[index];
            } else {
                // console.log(`${logPrefixHelper} getNestedValue: Accessing property "${part}".`);
                current = current[part];
            }
        }
        // console.log(`${logPrefixHelper} getNestedValue: Path "${path}" resolved to value:`, current);
        return current;
    } catch (error) {
        console.error(`${logPrefixHelper} getNestedValue: Error accessing path "${path}":`, error);
        return undefined;
    }
};


/**
 * Parses a value to a number, returning 0 for invalid or non-numeric types.
 * Logs the conversion attempt.
 * @param value The value to parse.
 * @param fieldName Optional field name for logging context.
 * @returns The parsed number, or 0 if parsing fails.
 */
export const parseNumericValue = (value: any, fieldName: string = 'value'): number => {
    // console.log(`${logPrefixHelper} parseNumericValue: Attempting to parse ${fieldName}:`, value);
    if (typeof value === 'number' && !isNaN(value)) {
        // console.log(`${logPrefixHelper} parseNumericValue: Parsed ${fieldName} as number: ${value}`);
        return value;
    }
    if (typeof value === 'string') {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            // console.log(`${logPrefixHelper} parseNumericValue: Parsed string "${value}" for ${fieldName} as number: ${num}`);
            return num;
        }
    }
    // console.log(`${logPrefixHelper} parseNumericValue: Failed to parse ${fieldName} (value: ${value}). Returning 0.`);
    return 0;
};