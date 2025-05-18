// src/services/logAnalysisApi.ts
import { LogAnalysisResult } from '../../../models/logAnalysis/logAnalysis';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchLogAnalysisData = async (
    filterStartTime?: number, // Milliseconds
    filterEndTime?: number   // Milliseconds
): Promise<LogAnalysisResult> => {
    // Xây dựng URL với các tham số query nếu chúng tồn tại
    const url = new URL(`${API_BASE_URL}/api/v1/logs/analysis/latest`);
    if (filterStartTime !== undefined) {
        url.searchParams.append('filterStartTime', filterStartTime.toString());
    }
    if (filterEndTime !== undefined) {
        url.searchParams.append('filterEndTime', filterEndTime.toString());
    }

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

    const data: LogAnalysisResult = await response.json();
    return data;
};