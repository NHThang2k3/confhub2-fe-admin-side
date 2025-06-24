// src/services/logAnalysisApi.ts
import { ConferenceLogAnalysisResult } from '../../../models/logAnalysis';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchLogAnalysisData = async (
    filterStartTime?: number,
    filterEndTime?: number,
    // Đổi tên tham số
    textFilter?: string
): Promise<ConferenceLogAnalysisResult> => {
    const url = new URL(`${API_BASE_URL}/api/v1/logs/analysis/conference/latest`);
    if (filterStartTime !== undefined) { url.searchParams.append('filterStartTime', filterStartTime.toString()); }
    if (filterEndTime !== undefined) { url.searchParams.append('filterEndTime', filterEndTime.toString()); }
    // Cập nhật tên tham số query
    if (textFilter) { url.searchParams.append('textFilter', textFilter); }



    console.log(`Fetching log analysis data from: ${url.toString()}`); // Log URL để debug

    const response = await fetch(url.toString()); // Gọi API với URL đã có tham số

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: 'Failed to fetch log analysis data and parse error response.' };
        }
        // Sử dụng message từ backend nếu có, nếu không thì dùng status code
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const data: ConferenceLogAnalysisResult = await response.json();
    return data;
};