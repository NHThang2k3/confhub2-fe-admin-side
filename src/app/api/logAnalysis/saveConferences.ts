// src/app/api/logAnalysis/saveConferences.ts
import axios, { AxiosError } from 'axios';

const API_SAVE_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/save-conference`; // Or read from config

interface SaveResult {
    title: string;
    success: boolean;
    message: string;
}

interface SaveError extends SaveResult { // Extend for consistency when rejecting
    success: false;
}


/**
 * Saves a single conference's data to a JSON file via the API.
 * @param acronym - The conference acronym.
 * @param title - The conference title.
 * @returns A promise that resolves with SaveResult if the API call itself succeeds,
 *          or rejects with SaveError if the call fails or title is missing.
 */
export const saveConferenceToJson = async (acronym: string, title: string | undefined): Promise<SaveResult> => {
    if (!title) {
        const errorMsg = `Conference title is missing for acronym ${acronym}.`;
        console.error("Save Validation Error:", errorMsg);
        // Reject with a structured error matching the expected failure format
        return Promise.reject<SaveError>({ title, success: false, message: errorMsg });
    }

    console.log(`API Call: Saving ${title}`);
    try {
        // Explicitly define expected response structure
        const response = await axios.post<{ success: boolean; message: string }>(
            API_SAVE_ENDPOINT,
            { acronym, title }
        );

        // Backend explicitly indicated success or failure in the response body
        console.log(`API Response for ${acronym}:`, response.data);
        return {
            title,
            success: response.data.success,
            message: response.data.message || (response.data.success ? 'Saved successfully.' : 'Save failed (backend logic).')
        };

    } catch (err) {
        const error = err as AxiosError<{ message?: string }>; // Type assertion
        console.error(`API Request Error saving ${acronym}:`, error);
        const backendMessage = error.response?.data?.message;
        const errorMessage = backendMessage || error.message || 'An unknown network or server error occurred.';
        // Reject the promise with details in the SaveError format
        return Promise.reject<SaveError>({ acronym, success: false, message: errorMessage });
    }
};

// Add other conference-related API calls here in the future
// export const crawlConferenceAgain = async (acronyms: string[]) => { ... }