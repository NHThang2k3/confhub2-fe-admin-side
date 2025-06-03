// src/app/api/logAnalysis/persistJournalSaveStatus.ts (NEW FILE)
import axios, { AxiosError } from 'axios';

const API_PERSIST_JOURNAL_SAVE_STATUS_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/log/journal-save-event`;

export interface PersistJournalSaveStatusPayload {
  batchRequestId: string;
  sourceId: string;
  journalTitle: string;
  status: 'SAVED_TO_DATABASE';
  clientTimestamp: string;
}

export interface PersistJournalSaveStatusResult {
  success: boolean;
  message: string;
}

export const persistJournalSaveStatus = async (
  payload: PersistJournalSaveStatusPayload
): Promise<PersistJournalSaveStatusResult> => {
  try {
    const response = await axios.post<{ success: boolean; message: string }>(
      API_PERSIST_JOURNAL_SAVE_STATUS_ENDPOINT,
      payload
    );
    console.log(`Persisted journal save status for ${payload.sourceId}: ${response.data.message}`);
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    let errorMessage = 'Failed to persist journal save status.';
    if (error.response?.data?.message) errorMessage = error.response.data.message;
    else if (error.message) errorMessage = error.message;
    console.error(`API Error persisting journal save status for ${payload.sourceId}:`, errorMessage);
    return { success: false, message: errorMessage };
  }
};