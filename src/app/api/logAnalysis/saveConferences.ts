// src/app/api/logAnalysis/saveConferences.ts
import axios, { AxiosError } from 'axios';

const API_SAVE_ENDPOINT = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/admin/conferences/import`;

// Kiểu dữ liệu cho payload gửi lên API (có thể cần điều chỉnh dựa trên backend)
interface ConferenceImportPayload {
    acronym: string;
    title: string;
    extractedData?: any; // Dữ liệu trích xuất từ finalResult
}

// Kiểu dữ liệu kết quả trả về từ hàm này (và có thể từ API)
export interface SaveConferenceResult {
    // identifier: string; // Có thể là acronym, title, hoặc một ID duy nhất
    success: boolean;
    message: string;
    // details?: any; // Thông tin chi tiết thêm từ backend nếu có
}

/**
 * Saves a single conference's data via the API.
 * @param acronym - The conference acronym.
 * @param title - The conference title.
 * @param extractedData - Optional data to be saved along with the conference.
 * @returns A promise that resolves with SaveConferenceResult.
 *          The promise will always resolve, success/failure is indicated in the result object.
 */
export const saveConferenceToJson = async (
    acronym: string,
    title: string, // Đảm bảo title là string
    extractedData?: any
): Promise<SaveConferenceResult> => {
    const identifier = `${acronym} - ${title}`; // Hoặc chỉ acronym nếu nó đủ duy nhất

    if (!acronym || !title) {
        const errorMsg = `Acronym ('${acronym}') or Title ('${title}') is missing. Cannot save.`;
        console.error("Save Validation Error:", errorMsg);
        return { // Luôn resolve, không reject ở đây để Promise.allSettled dễ xử lý
            // identifier,
            success: false,
            message: errorMsg
        };
    }

    const payload: ConferenceImportPayload[] = [{ acronym, title }];

    console.log(`API Call: Saving ${identifier}`, payload);

    try {
        // Giả sử API trả về một object có cấu trúc tương tự SaveConferenceResult hoặc một mảng các kết quả
        // Hoặc một cấu trúc đơn giản hơn như { success: boolean; message: string; data?: any }
        const response = await axios.post<{
            success: boolean; // Cờ chung cho request batch
            message: string;  // Thông báo chung
            results?: Array<{ // Nếu API xử lý từng item và trả về kết quả cho từng item
                acronym: string;
                title: string;
                success: boolean;
                message: string;
                // id?: string; // ID của record đã lưu/cập nhật
            }>;
            // Hoặc nếu API chỉ trả về trạng thái cho item duy nhất được gửi:
            // id?: string;
            // data?: any;
        }>(
            API_SAVE_ENDPOINT,
            payload // Gửi dưới dạng mảng, ngay cả khi chỉ có một item
        );

        console.log(`Full API response`, response)
        console.log(`API Response for ${identifier}:`, response.data);

        // Xử lý response từ backend
        // Kịch bản 1: API trả về trạng thái chung cho cả batch (nếu gửi nhiều)
        // hoặc cho item duy nhất.
        if (response.data.results && response.data.results.length > 0) {
            // Nếu API trả về kết quả cho từng item trong mảng (dù chỉ gửi 1)
            const itemResult = response.data.results[0];
            return {
                // identifier: `${itemResult.acronym} - ${itemResult.title}`,
                success: itemResult.success,
                message: itemResult.message || (itemResult.success ? 'Saved successfully (backend).' : 'Save failed (backend logic).'),
                // details: itemResult // Có thể bao gồm ID từ DB
            };
        } else {
            // Nếu API trả về trạng thái chung cho request
            return {
                // identifier,
                success: response.data.success,
                message: response.data.message || (response.data.success ? 'Saved successfully (backend).' : 'Save failed (backend logic).'),
                // details: response.data // Có thể bao gồm ID từ DB hoặc dữ liệu đã lưu
            };
        }

    } catch (err) {
        const error = err as AxiosError<{ message?: string; errors?: any[] }>; // Mở rộng để bắt lỗi validation chi tiết
        console.error(`API Request Error saving ${identifier}:`, error.isAxiosError ? {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        } : err);

        let errorMessage = 'An unknown network or server error occurred.';
        if (error.response) {
            // Ưu tiên message từ response.data
            const responseData = error.response.data;
            if (responseData && typeof responseData === 'object' && 'message' in responseData && typeof responseData.message === 'string') {
                errorMessage = responseData.message;
            } else if (error.response.statusText) {
                errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
            }
        } else if (error.request) {
            errorMessage = 'No response received from server. Check network connection.';
        } else {
            errorMessage = error.message;
        }

        return { // Luôn resolve
            // identifier,
            success: false,
            message: errorMessage,
            // details: error.response?.data // Gửi thêm chi tiết lỗi từ backend nếu có
        };
    }
};