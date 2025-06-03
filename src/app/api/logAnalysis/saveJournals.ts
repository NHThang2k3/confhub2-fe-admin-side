// src/app/api/logAnalysis/saveJournals.ts (NEW FILE)
import axios, { AxiosError } from 'axios';

const API_SAVE_JOURNAL_ENDPOINT = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/admin/journals/import`;

export interface JournalImportPayload {
  sourceId: string;
  title: string;
  [key: string]: any; // Represents the structure of journalData.dataToSave
}

export interface SaveJournalResult {
  success: boolean;
  message: string;
  identifier?: string;
}

export const saveJournalToDB = async (
  sourceId: string,
  title: string,
  dataToSave: any // This should be the structured journal data object
): Promise<SaveJournalResult> => {
  const identifier = `${sourceId} - ${title}`;

  if (!sourceId || !title) {
    return { identifier, success: false, message: `Source ID ('${sourceId}') or Title ('${title}') is missing.` };
  }
  if (!dataToSave || typeof dataToSave !== 'object' || Object.keys(dataToSave).length === 0) {
    return { identifier, success: false, message: `Data to save for journal ${identifier} is missing or invalid.` };
  }

  const payload: JournalImportPayload[] = [{
    sourceId: dataToSave.sourceId || sourceId,
    title: dataToSave.title || title,
    ...dataToSave
  }];

  console.log(`API Call: Saving Journal ${identifier} with payload:`, payload);

  try {
    const response = await axios.post<{
      success: boolean;
      message: string;
      results?: Array<{ sourceId?: string; title?: string; success: boolean; message: string; id?: string; }>;
    }>(API_SAVE_JOURNAL_ENDPOINT, payload);

    console.log(`API Response for Journal ${identifier}:`, response.data);

    if (response.data.results && response.data.results.length > 0) {
      const itemResult = response.data.results[0];
      return {
        identifier: itemResult.sourceId || sourceId,
        success: itemResult.success,
        message: itemResult.message || (itemResult.success ? 'Journal saved (backend).' : 'Journal save failed (backend).'),
      };
    }
    return {
      identifier,
      success: response.data.success,
      message: response.data.message || (response.data.success ? 'Journal saved (backend).' : 'Journal save failed (backend).'),
    };
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    let errorMessage = 'Unknown network/server error saving journal.';
    if (error.response) {
      errorMessage = (error.response.data as any)?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'No response from server for journal save.';
    } else {
      errorMessage = error.message;
    }
    console.error(`API Error saving journal ${identifier}:`, errorMessage, error.response?.data);
    return { identifier, success: false, message: errorMessage };
  }
};