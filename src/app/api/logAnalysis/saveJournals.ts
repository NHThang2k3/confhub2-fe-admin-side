import axios, { AxiosError } from 'axios';

// Endpoint của Backend, không phải của Database
const API_IMPORT_JOURNALS_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/journals/import-from-log`;

// Interface cho kết quả trả về từ Backend
export interface BackendImportResult {
  results: Array<{
    success: boolean;
    message: string;
    
    data?: {
      id: string;
      title: string;
      issn: string;
    };
    // Backend nên trả về một định danh để khớp với dữ liệu trên UI
    // Giả sử nó trả về sourceId hoặc title từ dữ liệu gốc
    sourceId: string;
    title?: string;
  }>;
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
}

/**
 * Gửi yêu cầu đến Backend để bắt đầu quá trình import từ file log.
 * @param batchRequestId ID của batch cần import.
 */
export const importJournalsFromLog = async (
  batchRequestId: string,
  imports : any[] // Mảng các đối tượng import, có thể chứa title, issn, v.v.
): Promise<BackendImportResult> => {
  try {
    const response = await axios.post<BackendImportResult>(
      API_IMPORT_JOURNALS_ENDPOINT,
      { batchRequestId,
        imports
       } // Payload chỉ cần batchRequestId
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    const errorMessage = error.response?.data?.message || error.message || 'Failed to trigger journal import.';
    console.error('API Error triggering journal import:', errorMessage, error.response?.data);
    // Ném lỗi để hook có thể bắt và xử lý
    throw new Error(errorMessage);
  }
};