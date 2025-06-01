// src/hooks/logAnalysis/useJournalCrawl.ts

import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Papa from 'papaparse';
// Keep Journal type for preview, but add state for raw content
import { Journal, ApiCrawlResponse, CrawlProgress } from '../../models/logAnalysis/importJournalCrawl';
import { appConfig } from '@/src/middleware';
import { JournalCsvImportResponse } from '@/src/models/logAnalysis/importJournalCrawl';

// --- Configuration ---
const API_JOURNAL_ENDPOINT = `${appConfig.NEXT_PUBLIC_BACKEND_URL}/api/v1/crawl-journals`;

// --- Return Type for the Hook (Remove chunking config) ---
export interface UseJournalCrawlReturn {
    file: File | null;
    parsedDataForPreview: Journal[] | null; // Renamed for clarity
    rawCsvContent: string | null; // NEW: State to hold raw CSV string
    isParsing: boolean;
    parseError: string | null;
    isCrawling: boolean;
    crawlError: string | null;
    crawlProgress: Omit<CrawlProgress, 'current' | 'total'> & { status: 'idle' | 'crawling' | 'success' | 'error' | 'stopped' }; // Simplified progress for non-chunked
    crawlMessages: string[];
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    startCrawl: () => Promise<void>;
    resetCrawl: () => void;
}

// --- The Hook Implementation ---
export const useJournalCrawl = (): UseJournalCrawlReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedDataForPreview, setParsedDataForPreview] = useState<Journal[]>([]);
    const [rawCsvContent, setRawCsvContent] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [isCrawling, setIsCrawling] = useState(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({
        status: 'idle',
    });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsParsing(true);
        setParseError(null);
        setParsedDataForPreview([]);

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setRawCsvContent(content);

            try {
                Papa.parse(content, {
                    delimiter: ';',
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        if (results.errors.length > 0) {
                            setParseError('Error parsing CSV: ' + results.errors[0].message);
                            return;
                        }

                        const journals = results.data as Journal[];
                        if (journals.length === 0) {
                            setParseError('No valid journal data found in the file');
                            return;
                        }

                        setParsedDataForPreview(journals.slice(0, 10)); // Preview first 10 journals
                    },
                    error: (error: Error) => {
                        setParseError('Error reading file: ' + error.message);
                    },
                });
            } catch (error) {
                setParseError('Error processing file: ' + (error instanceof Error ? error.message : 'Unknown error'));
            } finally {
                setIsParsing(false);
            }
        };

        reader.onerror = () => {
            setParseError('Error reading file');
            setIsParsing(false);
        };

        reader.readAsText(selectedFile);
    }, []);

    const startCrawl = useCallback(async () => {
        if (!file || !rawCsvContent) return;

        setIsCrawling(true);
        setCrawlError(null);
        setCrawlProgress({ status: 'crawling' });
        setCrawlMessages([]);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post<JournalCsvImportResponse>(
                '/api/journals/check-import',
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
                current: totalProcessed,
                total: totalProcessed,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setCrawlError(errorMessage);
            setCrawlProgress({ status: 'error' });
            setCrawlMessages([`Error: ${errorMessage}`]);
        } finally {
            setIsCrawling(false);
        }
    }, [file, rawCsvContent]);

    const resetCrawl = useCallback(() => {
        setFile(null);
        setRawCsvContent(null);
        setParsedDataForPreview([]);
        setIsParsing(false);
        setParseError(null);
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ status: 'idle' });
        setCrawlMessages([]);
    }, []);

    return {
        file,
        parsedDataForPreview,
        rawCsvContent,
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