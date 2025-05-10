// src/handlers/backendService.ts

// --- Helper Functions ---

/**
 * Safely gets a nested property from an object.
 * @param obj The object to traverse.
 * @param path A dot-separated path string or an array of keys.
 * @param defaultValue The value to return if the path doesn't exist.
 * @returns The value at the path or the default value.
 */
const safeGet = (obj: any, path: string | string[], defaultValue: any = undefined): any => {
    if (!obj) return defaultValue;
    const pathArray = Array.isArray(path) ? path : path.split('.');
    let current = obj;
    for (let i = 0; i < pathArray.length; i++) {
        if (current === null || current === undefined || current[pathArray[i]] === undefined) {
            return defaultValue;
        }
        current = current[pathArray[i]];
    }
    return current !== undefined ? current : defaultValue;
};

/**
 * Formats an ISO date string into a more readable format.
 * Handles date ranges (e.g., "Month Day - Day, Year" or just "Month Day, Year").
 * @param fromDateStr ISO date string for the start date.
 * @param toDateStr ISO date string for the end date.
 * @returns Formatted date string or "N/A".
 */
const formatDateRange = (fromDateStr?: string | null, toDateStr?: string | null): string => {
    if (!fromDateStr) return "N/A";

    try {
        const fromDate = new Date(fromDateStr);
        const toDate = toDateStr ? new Date(toDateStr) : fromDate; // If no toDate, assume it's the same as fromDate

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return "N/A"; // Invalid date check

        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
        const yearOption: Intl.DateTimeFormatOptions = { year: 'numeric' };

        const fromFormatted = fromDate.toLocaleDateString('en-US', options);
        const toFormatted = toDate.toLocaleDateString('en-US', options);
        const year = fromDate.toLocaleDateString('en-US', yearOption);

        if (fromDate.toDateString() === toDate.toDateString()) {
            return `${fromFormatted}, ${year}`;
        } else {
            // Check if dates are in the same month and year to avoid redundancy
            if (fromDate.getFullYear() === toDate.getFullYear() && fromDate.getMonth() === toDate.getMonth()) {
                 const fromDay = fromDate.toLocaleDateString('en-US', { day: 'numeric' });
                 const toDay = toDate.toLocaleDateString('en-US', { day: 'numeric' });
                 const month = fromDate.toLocaleDateString('en-US', { month: 'long' });
                 return `${month} ${fromDay} - ${toDay}, ${year}`;
            } else {
                // Different months or years
                 return `${fromFormatted} - ${toFormatted}, ${year}`; // Consider adding year to 'toFormatted' if needed
            }
        }
    } catch (error) {
        // logToFile(`Error formatting date range (${fromDateStr}, ${toDateStr}): ${error}`);
        return "N/A";
    }
};

/**
 * Formats a single ISO date string.
 * @param dateStr ISO date string.
 * @returns Formatted date string "Month Day, Year" or "N/A".
 */
const formatSingleDate = (dateStr?: string | null): string => {
     if (!dateStr) return "N/A";
     try {
         const date = new Date(dateStr);
         if (isNaN(date.getTime())) return "N/A";
         const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
         return date.toLocaleDateString('en-US', options);
     } catch (error) {
        // logToFile(`Error formatting single date (${dateStr}): ${error}`);
        return "N/A";
     }
};

/**
 * Compares two values and adds a change indicator if they differ.
 * @param currentValue The current value.
 * @param previousValue The previous value.
 * @param formatter Optional function to format the previous value for display.
 * @returns A string indicating the change, or an empty string if no change or no previous value.
 */
const formatChange = (currentValue: any, previousValue: any, formatter?: (val: any) => string): string => {
    if (previousValue === undefined || previousValue === null || currentValue === previousValue) {
        return "";
    }
    const formattedPrev = formatter ? formatter(previousValue) : String(previousValue || "N/A");
    // Only show change if current value is also defined, otherwise it might be a removal (handled elsewhere if needed)
    if (currentValue !== undefined && currentValue !== null) {
         return ` (changed from "${formattedPrev}")`;
    }
    return ""; // Or handle removal case if required by prompt later
};


// --- Data Transformation Logic ---


// Define an interface for the expected structure for better type safety
interface ConferenceApiResponse {
    payload: any[]; // Or define a more specific Conference type: Conference[]
    meta: Record<string, any>; // Or define a more specific Meta type
}

// Helper type guard to check if the input matches the expected structure
function isConferenceApiResponse(data: any): data is ConferenceApiResponse {
    return (
        data &&
        typeof data === 'object' &&
        data !== null && // Ensure it's not null
        Array.isArray(data.payload) && // Check if payload is an array
        typeof data.meta === 'object' && // Check if meta is an object
        data.meta !== null // Ensure meta is not null
    );
}

export function transformConferenceData(
    // Change input type from string to unknown for flexibility and safety
    dataInput: unknown,
    searchQuery: string | undefined
): string { // Return type is string (for the LLM)
    // logToFile(`Transforming conference data. Search query: ${searchQuery}`);

    // 1. Validate the input data structure using the type guard
    if (!isConferenceApiResponse(dataInput)) {
        console.error("Transformation Error: Input data does not match expected structure { payload: [], meta: {} }.", dataInput);
        // logToFile(`Transformation Error: Invalid data structure received.`);
        // Provide a more informative error message
        return "Error: Invalid data structure received from API. Expected 'payload' array and 'meta' object.";
    }

    // 2. If validation passes, we know dataInput is ConferenceApiResponse
    // No need for JSON.parse() anymore!
    const data: ConferenceApiResponse = dataInput;
    const payload = data.payload; // Direct access is now safe
    const meta = data.meta;       // Direct access is now safe

    // 3. Determine mode (optional, from original logic)
    const isDetailMode = searchQuery?.includes("mode=detail");

    // 1. Format Metadata
    let metaString = "Meta:\n";
    metaString += `Current page: ${safeGet(meta, 'curPage', 'N/A')}\n`;
    metaString += `Per page: ${safeGet(meta, 'perPage', 'N/A')}\n`;
    metaString += `Total items: ${safeGet(meta, 'totalItems', 'N/A')}\n`;
    metaString += `Total page: ${safeGet(meta, 'totalPage', 'N/A')}\n`;
    metaString += `Prev page: ${safeGet(meta, 'prevPage', 'null')}\n`; // Explicitly show 'null'
    metaString += `Next page: ${safeGet(meta, 'nextPage', 'null')}\n`; // Explicitly show 'null'

    // 2. Format Payload
    let payloadString = "\nPayload:\n";

    if (!Array.isArray(payload) || payload.length === 0) {
        payloadString += "No conferences found matching your criteria.\n";
    } else {
        payload.forEach((conf: any, index: number) => {
            payloadString += `\n- Conference ${index + 1}.\n`;

            if (isDetailMode) {
                // --- Detail Mode Transformation ---
                payloadString += `Title: ${safeGet(conf, 'title', 'N/A')}\n`;
                payloadString += `Acronym: ${safeGet(conf, 'acronym', 'N/A')}\n`;

                // Ranks
                const ranks = safeGet(conf, 'ranks', []);
                if (Array.isArray(ranks) && ranks.length > 0) {
                    payloadString += `Ranks:\n`;
                    ranks.forEach((rank: any, rankIndex: number) => {
                        payloadString += `  ${rankIndex + 1}.\n`;
                        payloadString += `  Rank: ${safeGet(rank, 'rank', 'N/A')}\n`;
                        payloadString += `  Source: ${safeGet(rank, 'source', 'N/A')}\n`;
                        payloadString += `  Research field: ${safeGet(rank, 'researchField', 'N/A')}\n`;
                       // payloadString += `  Year: ${safeGet(rank, 'year', 'N/A')}\n`; // Year is often less relevant per-rank listing, but can be added
                    });
                } else {
                     payloadString += `Ranks: N/A\n`;
                }

                // Organizations - Use latest, compare with previous if exists
                const organizations = safeGet(conf, 'organizations', []);
                const currentOrg = organizations && organizations.length > 0 ? organizations[organizations.length - 1] : {};
                const previousOrg = organizations && organizations.length > 1 ? organizations[organizations.length - 2] : undefined;

                const currentLocation = safeGet(currentOrg, 'locations.0', {});
                const previousLocation = safeGet(previousOrg, 'locations.0', undefined); // Use undefined for comparison

                const currentDates = safeGet(currentOrg, 'dates', []);
                const previousDates = safeGet(previousOrg, 'dates', []); // Empty array if not found

                // Year (from current organization)
                payloadString += `Year: ${safeGet(currentOrg, 'year', 'N/A')}\n`;

                // Type (Access Type) with change tracking
                const currentAccessType = safeGet(currentOrg, 'accessType', 'N/A');
                const previousAccessType = safeGet(previousOrg, 'accessType', undefined);
                payloadString += `Type: ${currentAccessType}${formatChange(currentAccessType, previousAccessType)}\n`;

                 // Location (address) with change tracking
                const currentAddress = safeGet(currentLocation, 'address', 'N/A');
                const previousAddress = safeGet(previousLocation, 'address', undefined);
                payloadString += `Location: ${currentAddress}${formatChange(currentAddress, previousAddress)}\n`;
                payloadString += `Continent: ${safeGet(currentLocation, 'continent', 'N/A')}\n`; // Continent unlikely to change, show current


                // Website link with change tracking
                const currentLink = safeGet(currentOrg, 'link', 'N/A');
                const previousLink = safeGet(previousOrg, 'link', undefined);
                payloadString += `Website link: ${currentLink}${formatChange(currentLink, previousLink)}\n`;

                // CFP link with change tracking
                const currentCfpLink = safeGet(currentOrg, 'cfpLink', 'N/A');
                const previousCfpLink = safeGet(previousOrg, 'cfpLink', undefined);
                payloadString += `Call for papers link: ${currentCfpLink}${formatChange(currentCfpLink, previousCfpLink)}\n`;

                 // Important Dates link (Assuming 'impLink', adjust if key is different) - with change tracking
                const currentImpLink = safeGet(currentOrg, 'impLink', 'N/A'); // Adjust 'impLink' if the key name is different
                const previousImpLink = safeGet(previousOrg, 'impLink', undefined);
                if (currentImpLink !== 'N/A' || previousImpLink) { // Only show if it ever existed
                     payloadString += `Important dates link: ${currentImpLink}${formatChange(currentImpLink, previousImpLink)}\n`;
                }

                 // Publisher with change tracking
                const currentPublisher = safeGet(currentOrg, 'publisher', 'N/A');
                const previousPublisher = safeGet(previousOrg, 'publisher', undefined);
                 if (currentPublisher !== 'N/A' || previousPublisher) { // Only show if it ever existed
                    payloadString += `Publisher: ${currentPublisher}${formatChange(currentPublisher, previousPublisher)}\n`;
                 }


                // Topics
                const topics = safeGet(currentOrg, 'topics', []);
                payloadString += `Topics: ${Array.isArray(topics) && topics.length > 0 ? topics.join(', ') : 'N/A'}\n`;

                // Dates (Conference Dates first, then others with change tracking)
                let conferenceDateStr = "N/A";
                const importantDates: string[] = [];
                const processedPrevDateIndices = new Set<number>(); // Keep track of previous dates matched

                // Process current dates and compare with previous
                currentDates.forEach((date: any) => {
                    const dateType = safeGet(date, 'type', '');
                    const dateName = safeGet(date, 'name', 'Unnamed Date');
                    const fromDate = safeGet(date, 'fromDate');
                    const toDate = safeGet(date, 'toDate');
                    const formattedCurrentDate = formatDateRange(fromDate, toDate);

                    // Find corresponding previous date
                    let foundPrevIndex = -1;
                    const prevDate = previousDates.find((pDate: any, index: number) => {
                         if (safeGet(pDate, 'type') === dateType && safeGet(pDate, 'name') === dateName) {
                              foundPrevIndex = index;
                              return true;
                         }
                         return false;
                    });

                    let changeIndicator = "";
                    if (prevDate) {
                        processedPrevDateIndices.add(foundPrevIndex); // Mark as processed
                        const prevFromDate = safeGet(prevDate, 'fromDate');
                        const prevToDate = safeGet(prevDate, 'toDate');
                        const formattedPrevDate = formatDateRange(prevFromDate, prevToDate);
                        if (formattedCurrentDate !== formattedPrevDate) {
                            changeIndicator = ` (changed from "${formattedPrevDate}")`;
                        }
                    } else if (previousOrg) { // Only mark as new if there *was* a previous org to compare against
                        changeIndicator = " (new)";
                    }

                    if (dateType === 'conferenceDates') {
                        conferenceDateStr = `${formattedCurrentDate}${changeIndicator}`;
                    } else {
                        importantDates.push(`${dateName}: ${formattedCurrentDate}${changeIndicator}`);
                    }
                });

                 // Check for removed dates (present in previous but not current)
                if (previousOrg) {
                    previousDates.forEach((pDate: any, index: number) => {
                        if (!processedPrevDateIndices.has(index)) { // If this previous date wasn't matched/processed
                             const dateType = safeGet(pDate, 'type', '');
                             // Avoid adding removed conferenceDates again if already handled
                             if (dateType !== 'conferenceDates') {
                                 const dateName = safeGet(pDate, 'name', 'Unnamed Date');
                                 const formattedPrevDate = formatDateRange(safeGet(pDate, 'fromDate'), safeGet(pDate, 'toDate'));
                                 importantDates.push(`${dateName}: ${formattedPrevDate} (removed)`);
                             } else if (conferenceDateStr === "N/A") {
                                // Handle removed conference date if no current one exists
                                const formattedPrevDate = formatDateRange(safeGet(pDate, 'fromDate'), safeGet(pDate, 'toDate'));
                                conferenceDateStr = `${formattedPrevDate} (removed)`
                             }
                        }
                    });
                }


                payloadString += `Conference dates: ${conferenceDateStr}\n`;
                importantDates.forEach(dateStr => {
                    payloadString += `${dateStr}\n`;
                });


                // Summary and Call for Papers
                payloadString += `Summary: ${safeGet(currentOrg, 'summary', 'N/A')}\n`;
                payloadString += `Call for papers: ${safeGet(currentOrg, 'callForPaper', 'N/A')}\n`;


            } else {
                // --- Summary Mode Transformation ---
                payloadString += `Title: ${safeGet(conf, 'title', 'N/A')}\n`;
                payloadString += `Acronym: ${safeGet(conf, 'acronym', 'N/A')}\n`;
                payloadString += `Location: ${safeGet(conf, 'location.address', 'N/A')}\n`;
                payloadString += `Continent: ${safeGet(conf, 'location.continent', 'N/A')}\n`;
                payloadString += `Rank: ${safeGet(conf, 'rank', 'N/A')}\n`;
                payloadString += `Source: ${safeGet(conf, 'source', 'N/A')}\n`;
                const researchFields = safeGet(conf, 'researchFields', []);
                payloadString += `Research field: ${Array.isArray(researchFields) && researchFields.length > 0 ? researchFields.join(', ') : 'N/A'}\n`;
                payloadString += `Year: ${safeGet(conf, 'year', 'N/A')}\n`;
                payloadString += `Type: ${safeGet(conf, 'accessType', 'N/A')}\n`;
                const topics = safeGet(conf, 'topics', []);
                payloadString += `Topics: ${Array.isArray(topics) && topics.length > 0 ? topics.join(', ') : 'N/A'}\n`;
                payloadString += `Conference dates: ${formatDateRange(safeGet(conf, 'dates.fromDate'), safeGet(conf, 'dates.toDate'))}\n`;
                payloadString += `Website link: ${safeGet(conf, 'link', 'N/A')}\n`;
            }
        });
    }

    // 3. Combine Meta and Payload
    return `${metaString}${payloadString}`;
}

