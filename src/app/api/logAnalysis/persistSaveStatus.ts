// src/app/api/logAnalysis/persistSaveStatus.ts
import axios, { AxiosError } from 'axios';

const API_PERSIST_SAVE_STATUS_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/log/conference-save-event`;

export interface PersistSaveStatusPayload {
    batchRequestId: string;
    acronym: string;
    title: string;
    status: 'SAVED_TO_DATABASE';
    clientTimestamp: string; // ISO string
}

// Result for a single item after batch persistence attempt
export interface BatchPersistItemResult {
    acronym: string;
    title: string;
    success: boolean;
    message: string;
}

// Overall result for the batch persistence operation
export interface BatchPersistSaveStatusResult {
    overallSuccess: boolean;
    overallMessage: string;
    itemResults: BatchPersistItemResult[];
}

/**
 * Persists the save status for a batch of conferences.
 * NOTE: This assumes the backend endpoint `/api/v1/log/conference-save-event`
 * has been updated to accept an array of PersistSaveStatusPayload
 * and ideally returns itemized results.
 *
 * If the backend still processes one by one, this function would need to loop
 * and call the single persistence endpoint, or this function should not be used
 * and the old `persistConferenceSaveStatus` (single) should be called in a loop.
 */
export const persistBatchConferenceSaveStatus = async (
    payloads: PersistSaveStatusPayload[]
): Promise<BatchPersistSaveStatusResult> => {
    if (!payloads || payloads.length === 0) {
        return {
            overallSuccess: true,
            overallMessage: "No conference statuses to persist.",
            itemResults: []
        };
    }

    try {
        // Assuming the backend API now accepts an array and returns a response like:
        // { success: boolean, message: string, data: [{ acronym, title, success, message }, ...] }
        // If the backend only returns an overall status, we'll have to infer item statuses.
        const response = await axios.post<{
            success: boolean; // Overall success of the batch persistence by the API
            message: string;
            // 'data' field might contain itemized results if backend supports it
            data?: Array<{ acronym: string; title: string; success: boolean; message: string }>;
        }>(
            API_PERSIST_SAVE_STATUS_ENDPOINT,
            payloads // Send the array of payloads
        );

        const itemResults: BatchPersistItemResult[] = [];

        if (response.data.success) {
            if (response.data.data && response.data.data.length > 0) {
                // Backend provided itemized results
                response.data.data.forEach(item => {
                    itemResults.push({
                        acronym: item.acronym,
                        title: item.title,
                        success: item.success,
                        message: item.message,
                    });
                });
                // Ensure all sent payloads have a corresponding result
                payloads.forEach(p => {
                    if (!itemResults.some(r => r.acronym === p.acronym && r.title === p.title)) {
                        itemResults.push({
                            acronym: p.acronym,
                            title: p.title,
                            success: false, // Assume failure if not explicitly in response
                            message: "Status persistence result not found in API response."
                        });
                    }
                });
            } else {
                // Backend confirmed overall success but didn't return itemized results.
                // Assume all items in the batch were persisted successfully.
                payloads.forEach(p => {
                    itemResults.push({
                        acronym: p.acronym,
                        title: p.title,
                        success: true,
                        message: response.data.message || "Successfully persisted (batch confirmation)."
                    });
                });
            }
            return {
                overallSuccess: true,
                overallMessage: response.data.message || "Batch persistence successful.",
                itemResults,
            };
        } else {
            // Batch persistence failed at the API level
            payloads.forEach(p => {
                itemResults.push({
                    acronym: p.acronym,
                    title: p.title,
                    success: false,
                    message: response.data.message || "Batch persistence failed at API level.",
                });
            });
            return {
                overallSuccess: false,
                overallMessage: response.data.message || "Batch persistence failed at API level.",
                itemResults,
            };
        }

    } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        let errorMessage = 'Failed to persist batch save status due to an unknown error.';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        console.error(`API Error persisting batch save status:`, errorMessage, payloads);

        const itemResults: BatchPersistItemResult[] = payloads.map(p => ({
            acronym: p.acronym,
            title: p.title,
            success: false,
            message: errorMessage,
        }));

        return {
            overallSuccess: false,
            overallMessage: errorMessage,
            itemResults,
        };
    }
};

// Keep the single persist function for now, in case it's needed elsewhere or as a fallback
// If the backend for batch persistence is not ready, the hook will use this in a loop.
export const persistSingleConferenceSaveStatus = async (
    payload: PersistSaveStatusPayload
): Promise<BatchPersistItemResult> => { // Adjusted to return BatchPersistItemResult for consistency
    try {
        const response = await axios.post<{ success: boolean; message: string }>(
            API_PERSIST_SAVE_STATUS_ENDPOINT, // This endpoint might only take one
            payload // Sending single object
        );
        return { ...payload, ...response.data };
    } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        let errorMessage = 'Failed to persist save status due to an unknown error.';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        console.error(`API Error persisting save status for ${payload.acronym} - ${payload.title}:`, errorMessage);
        return {
            acronym: payload.acronym,
            title: payload.title,
            success: false,
            message: errorMessage,
        };
    }
};