// src/api/envApi.ts

import { appConfig } from "@/src/middleware";

const API_BASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api`;

interface EnvResponse {
    success: boolean;
    data?: any;
    error?: string;
}

export const getEnvVariables = async (): Promise<EnvResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/get-env`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data };
    } catch (error: any) {
        console.error("Could not fetch environment variables:", error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};

export const saveAllEnvVariables = async (updatedEnvVariables: any): Promise<EnvResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/save-all-env`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedEnvVariables),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data };
    } catch (error: any) {
        console.error("Could not save environment variables:", error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};