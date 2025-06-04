// src/app/api/logAnalysis/saveConferences.ts
import axios, { AxiosError } from 'axios';

const API_SAVE_ENDPOINT = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/admin/conferences/import`;

// Data for a single conference to be saved in the batch
export interface ConferenceToSavePayload {
    acronym: string;
    title: string;
    // uniqueRowId: string; // Client-side ID to map results back, if not relying on acronym/title matching
    extractedData?: any; // Dữ liệu trích xuất từ finalResult
}

// Expected structure of an individual item in the backend's response `data` array
export interface ConferenceSaveDBResponseItem {
    id: string;
    title: string;
    acronym: string;
    creatorId: string | null;
    adminId: string | null;
    createdAt: string;
    updatedAt: string;
    status: "SAVED" | "ERROR" | "DUPLICATE" | string; // Backend status for this item
    message?: string; // Optional message from backend for this specific item
}

// Result for a single conference item after the batch save attempt
export interface BatchSaveConferenceItemResult {
    acronym: string;
    title: string;
    // uniqueRowId: string; // To map back to the UI row
    success: boolean;
    message: string;
    dbId?: string; // ID from the database if saved
    dbStatus?: string; // Status from the database
}

// Overall result for the batch save operation
export interface BatchSaveConferencesResult {
    overallSuccess: boolean; // True if the API call was made and a response (even with partial failures) was received
    overallMessage: string; // General message for the batch operation
    itemResults: BatchSaveConferenceItemResult[];
}

/**
 * Saves a batch of conferences' data via the API.
 * @param conferences - An array of conference data to save.
 * @returns A promise that resolves with BatchSaveConferencesResult.
 */
export const saveConferencesToDB = async (
    conferences: ConferenceToSavePayload[]
): Promise<BatchSaveConferencesResult> => {
    if (!conferences || conferences.length === 0) {
        return {
            overallSuccess: true,
            overallMessage: "No conferences to save.",
            itemResults: []
        };
    }

    // Validate input conferences (basic check)
    const invalidItems = conferences.filter(c => !c.acronym || !c.title);
    if (invalidItems.length > 0) {
        const errorMsg = `Some conferences have missing Acronym or Title. Cannot save batch. Problematic items: ${invalidItems.map(i => `${i.acronym}-${i.title}`).join(', ')}`;
        console.error("Batch Save Validation Error:", errorMsg);
        // Create error results for all items if we decide to fail the whole batch here
        const itemResults: BatchSaveConferenceItemResult[] = conferences.map(conf => ({
            acronym: conf.acronym,
            title: conf.title,
            success: false,
            message: (!conf.acronym || !conf.title) ? "Missing Acronym or Title." : "Batch validation failed before sending.",
        }));
        return {
            overallSuccess: false,
            overallMessage: errorMsg,
            itemResults,
        };
    }

    // Backend expects an array of objects, where each object is the conference data.
    // The `extractedData` should contain all necessary fields for the backend.
    // If `acronym` and `title` are part of `extractedData`, this is fine.
    // Otherwise, construct the payload items explicitly.
    const payload = conferences.map(conf => ({
        acronym: conf.acronym,
        title: conf.title,
        ...(conf.extractedData || {}) // Spread extractedData, ensure acronym & title are top-level
    }));

    console.log(`API Call: Saving ${conferences.length} conferences in batch.`, payload);

    try {
        const response = await axios.post<{
            success: boolean; // Overall success of the batch request by the API
            data: ConferenceSaveDBResponseItem[]; // Array of results for each conference
            message?: string; // Overall message from the API for the batch
        }>(
            API_SAVE_ENDPOINT,
            payload
        );

        console.log(`Batch Save API Full Response:`, response);
        console.log(`Batch Save API Response Data:`, response.data);

        const itemResults: BatchSaveConferenceItemResult[] = [];

        if (response.data && response.data.data) {
            // Map backend results back to original items.
            // This assumes the backend returns results that can be matched (e.g., by acronym/title)
            // or are in the same order.
            response.data.data.forEach(dbItem => {
                // Try to find the original item. This is important if order is not guaranteed
                // or if not all items sent result in a response item.
                const originalConf = conferences.find(c => c.acronym === dbItem.acronym && c.title === dbItem.title);
                const success = dbItem.status === "SAVED";

                itemResults.push({
                    acronym: dbItem.acronym,
                    title: dbItem.title,
                    success: success,
                    message: dbItem.message || (success ? 'Saved successfully to DB.' : `DB processing status: ${dbItem.status}`),
                    dbId: dbItem.id,
                    dbStatus: dbItem.status,
                });
            });

            // Check for any conferences sent but not found in the response (edge case)
            conferences.forEach(sentConf => {
                if (!itemResults.some(r => r.acronym === sentConf.acronym && r.title === sentConf.title)) {
                    itemResults.push({
                        acronym: sentConf.acronym,
                        title: sentConf.title,
                        success: false,
                        message: "Conference not found in API response data. Saving may have been skipped or failed silently on backend.",
                    });
                }
            });

            return {
                overallSuccess: response.data.success, // Reflects backend's view of the batch
                overallMessage: response.data.message || (response.data.success ? "Batch processed by DB." : "Batch processing by DB reported issues."),
                itemResults,
            };

        } else {
            // Fallback if response.data.data is not as expected, treat all as failed
            const errorMessage = response.data?.message || 'Batch save failed: Invalid response structure from backend.';
            conferences.forEach(conf => {
                itemResults.push({
                    acronym: conf.acronym,
                    title: conf.title,
                    success: false,
                    message: errorMessage,
                });
            });
            return {
                overallSuccess: false,
                overallMessage: errorMessage,
                itemResults,
            };
        }

    } catch (err) {
        const error = err as AxiosError<{ message?: string; errors?: any[] }>;
        console.error(`API Request Error saving batch of conferences:`, error.isAxiosError ? {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        } : err);

        let errorMessage = 'An unknown network or server error occurred during batch save.';
        if (error.response) {
            const responseData = error.response.data as any; // Type assertion
            if (responseData && typeof responseData === 'object' && 'message' in responseData && typeof responseData.message === 'string') {
                errorMessage = responseData.message;
            } else if (error.response.statusText) {
                errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
            }
        } else if (error.request) {
            errorMessage = 'No response received from server for batch save. Check network connection.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        // Create error results for all items in the batch
        const itemResults: BatchSaveConferenceItemResult[] = conferences.map(conf => ({
            acronym: conf.acronym,
            title: conf.title,
            success: false,
            message: errorMessage, // Apply the general error to all items in this case
        }));

        return {
            overallSuccess: false,
            overallMessage: errorMessage,
            itemResults,
        };
    }
};