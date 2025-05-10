// src/hooks/logAnalysis/useJournalCrawl.ts

import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Papa from 'papaparse';
// Keep Journal type for preview, but add state for raw content
import { Journal, ApiCrawlResponse, CrawlProgress } from '../../models/logAnalysis/importJournalCrawl';
import { appConfig } from '@/src/middleware';

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
    // Keep parsed data for UI preview, but it's not what we send
    const [parsedDataForPreview, setParsedDataForPreview] = useState<Journal[] | null>(null);
    // NEW: State for the raw CSV content to be sent
    const [rawCsvContent, setRawCsvContent] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [parseError, setParseError] = useState<string | null>(null);

    const [isCrawling, setIsCrawling] = useState<boolean>(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    // Simplified progress state for single request
    const [crawlProgress, setCrawlProgress] = useState<UseJournalCrawlReturn['crawlProgress']>({ status: 'idle' });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);

    // --- Reset Function ---
    const resetCrawl = useCallback(() => {
        setFile(null);
        setParsedDataForPreview(null);
        setRawCsvContent(null); // Reset raw content
        setIsParsing(false);
        setParseError(null);
        // No chunking state to reset
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ status: 'idle' });
        setCrawlMessages([]);
        console.log("Journal crawl state reset.");
    }, []);

    // --- File Handling and Parsing (Now reads raw content too) ---
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        resetCrawl();
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
                setParseError("Invalid file type. Please select a CSV file.");
                setFile(null);
                setParsedDataForPreview(null);
                setRawCsvContent(null);
                return;
            }
            setFile(selectedFile);
            setParseError(null);
            // Start reading and parsing
            readAndParseCSV(selectedFile);
        } else {
            setFile(null);
            setParsedDataForPreview(null);
            setRawCsvContent(null);
        }
        event.target.value = '';
    }, [resetCrawl]);

    // --- Read Raw Content and Parse for Preview ---
    const readAndParseCSV = useCallback((csvFile: File) => {
        setIsParsing(true);
        setParsedDataForPreview(null);
        setRawCsvContent(null);
        setParseError(null);
        setCrawlMessages([]);

        const reader = new FileReader();

        reader.onload = (event) => {
            const fileContent = event.target?.result as string;
            if (!fileContent) {
                 setParseError("Could not read file content.");
                 setIsParsing(false);
                 return;
            }
            // Store the raw content
            setRawCsvContent(fileContent);
            console.log(`Stored raw CSV content (${fileContent.length} chars).`);

            // Now parse the content *for preview purposes only*
            Papa.parse<Journal>(fileContent, {
                header: true,
                delimiter: ";",
                skipEmptyLines: true,
                dynamicTyping: false,
                transformHeader: header => header.trim(),
                transform: (value) => value.trim(),
                complete: (results) => {
                    console.log("Papaparse Raw Results (for preview):", results);
                    const validJournals = results.data.filter(row => row.Title && row.Title.trim() !== '');

                    if (results.errors.length > 0) {
                        console.warn("CSV Parsing Errors (for preview):", results.errors);
                        setCrawlMessages(prev => [...prev, `Warning: Encountered ${results.errors.length} parsing errors during preview generation.`]);
                    }

                    if (validJournals.length > 0) {
                        setParsedDataForPreview(validJournals); // Set data for preview table
                        setCrawlMessages(prev => [...prev, `Successfully parsed ${validJournals.length} journals for preview.`]);
                        console.log("Parsed Journals (for preview):", validJournals.slice(0, 5));
                    } else {
                        // We still have the raw content, but parsing for preview failed
                        setParseError(`No valid journal data found for preview. Check header and delimiter (';'). Raw data is still available for sending.`);
                        setParsedDataForPreview(null);
                    }
                    setIsParsing(false);
                },
                error: (error: Error) => {
                    console.error("CSV Parsing Error (for preview):", error);
                    // Critical parsing error likely means the raw content is also bad
                    setParseError(`Error parsing CSV for preview: ${error.message}. Cannot proceed reliably.`);
                    setRawCsvContent(null); // Clear raw content if parsing fails badly
                    setIsParsing(false);
                    setParsedDataForPreview(null);
                }
            });
        };

        reader.onerror = () => {
            setParseError(`Error reading file: ${reader.error?.message}`);
            setIsParsing(false);
            setRawCsvContent(null);
            setParsedDataForPreview(null);
        };

        // Read the file as text
        reader.readAsText(csvFile);

    }, []);

    // --- API Call Logic (Sends RAW CSV String) ---
    const sendApiRequest = useCallback(async (csvString: string): Promise<boolean> => {
        setCrawlError(null);
        const description = "Client Journal Data"; // Single request description
        try {
            const params = { dataSource: 'client' };
            // Send the raw string as the body
            // Set Content-Type to text/plain or text/csv
            const response = await axios.post<ApiCrawlResponse>(API_JOURNAL_ENDPOINT, csvString, {
                params: params,
                headers: {
                    // 'Content-Type': 'text/csv', // More specific
                    'Content-Type': 'text/plain', // Generally acceptable
                 },
                timeout: 600000 // 10 minutes timeout (might need adjustment)
            });

            console.log(`${description} - Response Status:`, response.status);
            setCrawlMessages(prev => [...prev, `${description}: ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`]);
            // Add any data returned in the response if needed
            // if (response.data.data) {
            //     setCrawlMessages(prev => [...prev, `Backend processed ${response.data.data.length} items.`]);
            // }
            return true;

        } catch (err) {
            const error = err as AxiosError<ApiCrawlResponse>;
            console.error(`API Error during ${description}:`, error);
            let errorMessage = `Error sending ${description}: ${error.message}`;
            if (error.response) {
                // Include backend error message if available
                errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown error'})`;
            } else if (error.request) {
                errorMessage += ' (No response received from server)';
            }

            setCrawlError(errorMessage);
            setCrawlMessages(prev => [...prev, `FAILED to send ${description}. See error details.`]);
            return false;
        }
    }, []); // Dependencies: API_JOURNAL_ENDPOINT

    // --- Crawl Execution Logic (Simplified for single request) ---
    const startCrawl = useCallback(async () => {
        // Check if we have the RAW content to send
        if (!rawCsvContent || isCrawling) {
            console.warn("Cannot start journal crawl: No raw CSV content available or already crawling.");
            setCrawlError("No valid CSV content loaded to send.");
            return;
        }

        setIsCrawling(true);
        setCrawlError(null);
        setCrawlMessages(prev => [`Sending journal data to backend...`]);
        setCrawlProgress({ status: 'crawling' }); // Set progress to crawling

        console.log("Starting journal crawl: Sending raw CSV content.");
        const success = await sendApiRequest(rawCsvContent);

        if (success) {
            console.log("Finished sending journal data successfully.");
            setCrawlProgress({ status: 'success' });
            setCrawlMessages(prev => [...prev, `Backend acknowledged processing request.`]);
        } else {
            console.error(`Journal crawl failed during API request.`);
            setCrawlProgress({ status: 'error' });
            // Error message is already set by sendApiRequest
        }

        setIsCrawling(false); // Mark as finished

    }, [rawCsvContent, isCrawling, sendApiRequest]);

    // --- Return Values ---
    return {
        file,
        parsedDataForPreview, // Use this for the table
        rawCsvContent,        // This is what gets sent
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