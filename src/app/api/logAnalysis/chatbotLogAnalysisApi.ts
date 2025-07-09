// src/types/logAnalysisChatbot/logAnalysisChatbot.types.ts

import { ChatbotLogAnalysisResult } from "./logAnalysisChatbot.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Fetches the latest chatbot log analysis data from the backend.
 */
export const fetchChatbotLogAnalysisData = async (): Promise<ChatbotLogAnalysisResult> => {
    if (!API_BASE_URL) {
        throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured.");
    }

    const url = new URL(`${API_BASE_URL}/api/v1/logs/analysis/chatbot/latest`);
    
    console.log(`Fetching chatbot log analysis data from: ${url.toString()}`);

    const response = await fetch(url.toString());

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: 'Failed to fetch chatbot log analysis data and parse error response.' };
        }
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const data: ChatbotLogAnalysisResult = await response.json();
    return data;
};