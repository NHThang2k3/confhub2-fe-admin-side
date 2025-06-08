// src/hooks/crawl/conference/useFileParser.ts
'use client';
import { useState, useCallback } from 'react';
import { Conference } from '../../../models/logAnalysis/importConferenceCrawl';
import { UPLOAD_FILE_ENDPOINT } from '../constants';

export const useFileParser = () => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Conference[] | null>(null);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [parseError, setParseError] = useState<string | null>(null);

    const parseCSV = useCallback(async (csvFile: File): Promise<{ data: Conference[] | null, message: string }> => {
        setIsParsing(true);
        setParseError(null);
        setParsedData(null);

        const body = new FormData();
        body.append('file', csvFile);

        try {
            const response = await fetch(UPLOAD_FILE_ENDPOINT, {
                method: 'POST',
                body: body,
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                let errorMsg = `Failed to upload/parse file. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData?.message || errorData?.error || errorMsg;
                } catch (jsonError) {
                    try {
                        const textError = await response.text();
                        if (textError) errorMsg = `${errorMsg} - Server response: ${textError.substring(0, 200)}`;
                    } catch (textParseError) { /* Ignore */ }
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            if (result.data && Array.isArray(result.data)) {
                const conferencesWithDefaults: Conference[] = result.data.map((conf: any, index: number) => ({
                    ...conf,
                    id: conf.id || `${conf.acronym || 'conf'}-${Date.now()}-${index}`,
                    crawlType: 'crawl',
                }));
                setParsedData(conferencesWithDefaults);
                return { data: conferencesWithDefaults, message: `File uploaded and parsed successfully. ${conferencesWithDefaults.length} records found.` };
            } else {
                setParsedData([]);
                throw new Error("Parsed data is not in the expected format or is empty.");
            }
        } catch (error: any) {
            console.error("Error uploading or parsing CSV file:", error);
            setParseError(error.message || "Error uploading or parsing file.");
            setParsedData(null);
            throw error; // Re-throw to be caught by caller
        } finally {
            setIsParsing(false);
        }
    }, []);

    const handleFileChange = useCallback(async (
        event: React.ChangeEvent<HTMLInputElement>,
        onSuccess: (message: string) => void,
        onReset: () => void
    ) => {
        onReset(); // Reset all states in the parent hook

        const currentFile = event.target.files?.[0];
        if (event.target) event.target.value = ''; // Clear input for re-selection

        if (currentFile) {
            if (currentFile.type !== 'text/csv' && !currentFile.name.toLowerCase().endsWith('.csv')) {
                setParseError("Invalid file type. Please select a CSV file.");
                return;
            }
            setFile(currentFile);
            try {
                const { message } = await parseCSV(currentFile);
                onSuccess(message);
            } catch (e) {
                // Error state is already set within parseCSV
            }
        }
    }, [parseCSV]);

    const reset = useCallback(() => {
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);
    }, []);

    return {
        file,
        parsedData,
        isParsing,
        parseError,
        handleFileChange,
        setParsedData, // Expose setter for selection manager
        reset,
    };
};