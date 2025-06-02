// src/hooks/logAnalysis/useJournalCrawl.ts

import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Journal, JournalCsvImportResponse } from '@/src/models/logAnalysis/importJournalCrawl';
import { appConfig } from '@/src/middleware';

// Extended Journal interface for the response data
export interface JournalWithStatus extends Journal {
    lastUpdated: string | null;
    message: string;
}

// --- Configuration ---
const API_JOURNAL_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/journals/check-import`;

// --- Return Type for the Hook ---
export interface UseJournalCrawlReturn {
    file: File | null;
    parsedData: JournalWithStatus[] | null;
    isParsing: boolean;
    parseError: string | null;
    isCrawling: boolean;
    crawlError: string | null;
    crawlProgress: {
        status: 'idle' | 'crawling' | 'success' | 'error' | 'stopped';
        totalProcessed?: number;
        totalExists?: number;
        totalNew?: number;
    };
    crawlMessages: string[];
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    startCrawl: () => Promise<void>;
    resetCrawl: () => void;
}

// --- The Hook Implementation ---
export const useJournalCrawl = (): UseJournalCrawlReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<JournalWithStatus[] | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [isCrawling, setIsCrawling] = useState(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    const [crawlProgress, setCrawlProgress] = useState<UseJournalCrawlReturn['crawlProgress']>({
        status: 'idle'
    });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);

    const parseCSV = useCallback(async (csvFile: File) => {
        setIsParsing(true);
        setParseError(null);
        setParsedData(null);

        const body = new FormData();
        body.append('file', csvFile);

        try {
            const response = await fetch(API_JOURNAL_ENDPOINT, {
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

            const data = await response.json();
            if (data.results && Array.isArray(data.results)) {
                const journalsWithStatus: JournalWithStatus[] = data.results.map((journal: any) => ({
                    Title: journal.title,
                    Issn: journal.issn,
                    Publisher: journal.publisher || '',
                    Type: journal.crawled ? 'Crawled' : 'Not Crawled',
                    Country: journal.country || '',
                    Region: journal.region || '',
                    lastUpdated: journal.lastUpdated,
                    message: journal.message
                }));
                setParsedData(journalsWithStatus);
                setCrawlMessages([`File uploaded and parsed successfully. ${journalsWithStatus.length} records found.`]);
            } else {
                setParsedData([]);
                throw new Error("Parsed data is not in the expected format or is empty.");
            }
        } catch (error: any) {
            console.error("Error uploading or parsing CSV file:", error);
            setParseError(error.message || "Error uploading or parsing file.");
            setParsedData(null);
        } finally {
            setIsParsing(false);
        }
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
            setParseError("Invalid file type. Please select a CSV file.");
            return;
        }

        parseCSV(selectedFile);
        setFile(selectedFile);
        setIsParsing(true);
        setParseError(null);
        setParsedData(null);
        setCrawlMessages([]);
    }, []);

    const startCrawl = useCallback(async () => {
        if (!file) return;

        setIsCrawling(true);
        setCrawlError(null);
        setCrawlProgress({ status: 'crawling' });
        setCrawlMessages([]);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post<JournalCsvImportResponse>(
                API_JOURNAL_ENDPOINT,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const { results, totalProcessed, totalExists, totalNew } = response.data;

            // Process results and create messages
            const messages = results.map((result) => {
                const status = result.crawled ? 'CRAWLED' : 'NOT CRAWLED';
                const date = result.lastUpdated ? new Date(result.lastUpdated).toLocaleDateString() : 'N/A';
                return `${status}: ${result.title} (${result.issn}) - ${result.message} [Last Updated: ${date}]`;
            });

            setCrawlMessages(messages);
            setCrawlProgress({
                status: 'success',
                totalProcessed,
                totalExists,
                totalNew
            });

            // Set parsed data for AG Grid
            setParsedData(results.map(result => ({
                Title: result.title,
                Issn: result.issn,
                Publisher: '', // These fields will be populated by the backend
                Type: result.crawled ? 'Crawled' : 'Not Crawled',
                Country: '', // Required by Journal interface
                Region: '', // Required by Journal interface
                lastUpdated: result.lastUpdated,
                message: result.message
            })));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setCrawlError(errorMessage);
            setCrawlProgress({ status: 'error' });
            setCrawlMessages([`Error: ${errorMessage}`]);
        } finally {
            setIsCrawling(false);
        }
    }, [file]);

    const resetCrawl = useCallback(() => {
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ status: 'idle' });
        setCrawlMessages([]);
    }, []);

    return {
        file,
        parsedData,
        isParsing,
        parseError,
        isCrawling,
        crawlError,
        crawlProgress,
        crawlMessages,
        handleFileChange,
        startCrawl,
        resetCrawl,
    };
};