// src/app/api/logAnalysis/persistSaveStatus.ts
import axios, { AxiosError } from 'axios';

const API_PERSIST_SAVE_STATUS_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/log/conference-save-event`; // Giả sử API_BASE_URL là URL backend của bạn

export interface PersistSaveStatusPayload {
    batchRequestId: string;
    acronym: string;
    title: string;
    status: 'SAVED_TO_DATABASE'; // Hoặc một enum nếu có nhiều loại status
    clientTimestamp: string; // ISO string
}

export interface PersistSaveStatusResult {
    success: boolean;
    message: string;
}

export const persistConferenceSaveStatus = async (
    payload: PersistSaveStatusPayload
): Promise<PersistSaveStatusResult> => {
    try {
        const response = await axios.post<{ success: boolean; message: string }>(
            API_PERSIST_SAVE_STATUS_ENDPOINT,
            payload
        );
        return response.data;
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
            success: false,
            message: errorMessage,
        };
    }
};