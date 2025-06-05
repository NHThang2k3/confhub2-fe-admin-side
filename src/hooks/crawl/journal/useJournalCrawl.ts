// src/hooks/crawl/journal/useJournalCrawl.ts

import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Papa from 'papaparse'; // Keep for local parsing for preview if desired, or just for raw content reading
import {
    JournalWithStatus, // For data from DB check, used in UI selection table
    DbCheckImportResponse,
    DbCheckImportResult,
    BackendCrawlApiResponse,
    BackendCrawlProgress,
    ScimagoJournal, // For typing the preview data if we parse SCImago locally
    UiProgress
} from '../../../models/logAnalysis/importJournalCrawl'; // Adjust path
import { appConfig } from '@/src/middleware';

// --- Configuration ---
const API_DB_CHECK_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/journals/check-import`;
const API_BACKEND_CRAWL_ENDPOINT = `${appConfig.NEXT_PUBLIC_BACKEND_URL}/api/v1/crawl-journals`; // Old endpoint

export interface UseJournalCrawlReturn {
    file: File | null;
    rawCsvContent: string | null; // For sending to backend crawl API

    // States for local file reading and parsing for preview (optional, SCImago format)
    isReadingFile: boolean;
    fileReadError: string | null;
    scimagoPreviewData: ScimagoJournal[] | null; // Optional: if you want a local preview of SCImago structure

    // States for DB Check API (/check-import)
    isCheckingDB: boolean;
    checkDBError: string | null;
    parsedDataForSelectionTable: JournalWithStatus[] | null; // Data from DB Check for UI table
    dbCheckSummary: { // Summary from DB check
        totalProcessed?: number;
        totalExists?: number;
        totalNew?: number;
    } | null;
    dbCheckMessages: string[];


    // States for Backend Crawl API (/crawl-journals)
    isCrawlingBackend: boolean;
    crawlBackendError: string | null;
    crawlBackendProgress: BackendCrawlProgress;
    crawlBackendMessages: string[];

    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    startBackendCrawl: () => Promise<void>; // Renamed from startCrawl
    resetAll: () => void; // Renamed from resetCrawl
}

export const useJournalCrawl = (): UseJournalCrawlReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [rawCsvContent, setRawCsvContent] = useState<string | null>(null);

    const [isReadingFile, setIsReadingFile] = useState(false);
    const [fileReadError, setFileReadError] = useState<string | null>(null);
    const [scimagoPreviewData, setScimagoPreviewData] = useState<ScimagoJournal[] | null>(null);


    const [isCheckingDB, setIsCheckingDB] = useState(false);
    const [checkDBError, setCheckDBError] = useState<string | null>(null);
    const [parsedDataForSelectionTable, setParsedDataForSelectionTable] = useState<JournalWithStatus[] | null>(null);
    const [dbCheckSummary, setDbCheckSummary] = useState<UseJournalCrawlReturn['dbCheckSummary']>(null);
    const [dbCheckMessages, setDbCheckMessages] = useState<string[]>([]);

    const [isCrawlingBackend, setIsCrawlingBackend] = useState(false);
    const [crawlBackendError, setCrawlBackendError] = useState<string | null>(null);
    const [crawlBackendProgress, setCrawlBackendProgress] = useState<BackendCrawlProgress>({ status: 'idle' });
    const [crawlBackendMessages, setCrawlBackendMessages] = useState<string[]>([]);

    const resetAll = useCallback(() => {
        setFile(null);
        setRawCsvContent(null);
        setIsReadingFile(false);
        setFileReadError(null);
        setScimagoPreviewData(null);

        setIsCheckingDB(false);
        setCheckDBError(null);
        setParsedDataForSelectionTable(null);
        setDbCheckSummary(null);
        setDbCheckMessages([]);

        setIsCrawlingBackend(false);
        setCrawlBackendError(null);
        setCrawlBackendProgress({ status: 'idle' });
        setCrawlBackendMessages([]);
        console.log("All journal states reset.");
    }, []);

    const readFileContentAndCheckDB = useCallback(async (selectedFile: File) => {
        setIsReadingFile(true);
        setFileReadError(null);
        setRawCsvContent(null);
        setScimagoPreviewData(null); // Reset preview
        setDbCheckMessages(prev => [...prev, "Reading file..."]);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const fileContent = event.target?.result as string;
            if (!fileContent) {
                setFileReadError("Could not read file content.");
                setIsReadingFile(false);
                setDbCheckMessages(prev => [...prev, "Error: Could not read file content."]);
                return;
            }
            setRawCsvContent(fileContent); // Store raw content for backend crawl
            setDbCheckMessages(prev => [...prev, `File read successfully (${fileContent.length} chars). Stored for backend crawl.`]);

            // Optional: Parse for SCImago preview locally (like old hook)
            // This is useful if you want to show a preview based on the SCImago structure
            // before or alongside the DB check results.
            Papa.parse<ScimagoJournal>(fileContent, {
                header: true, delimiter: ";", skipEmptyLines: true, dynamicTyping: false,
                transformHeader: header => header.trim(), transform: (value) => value.trim(),
                complete: (results) => {
                    if (results.data) {
                        const validScimagoJournals = results.data.filter(row => row.Title && row.Title.trim() !== '');
                        if (validScimagoJournals.length > 0) {
                            setScimagoPreviewData(validScimagoJournals);
                            setDbCheckMessages(prev => [...prev, `Local SCImago preview: ${validScimagoJournals.length} journals.`]);
                        } else {
                            setDbCheckMessages(prev => [...prev, `Local SCImago preview: No valid journals found.`]);
                        }
                    }
                    if (results.errors.length > 0) {
                        setDbCheckMessages(prev => [...prev, `Local SCImago preview: ${results.errors.length} parsing errors.`]);
                    }
                },
                error: (error: Error) => {
                    setDbCheckMessages(prev => [...prev, `Local SCImago preview error: ${error.message}.`]);
                }
            });


            // Now, proceed with DB check API
            setIsReadingFile(false); // File reading part is done
            setIsCheckingDB(true);
            setCheckDBError(null);
            setParsedDataForSelectionTable(null);
            setDbCheckSummary(null);
            setDbCheckMessages(prev => [...prev, "Checking journals against database..."]);


            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await axios.post<DbCheckImportResponse>(API_DB_CHECK_ENDPOINT, formData, {
                    headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' }
                });

                const data = response.data;
                if (data.results && Array.isArray(data.results)) {
                    const journalsForTable: JournalWithStatus[] = data.results.map((journal: DbCheckImportResult) => ({
                        // Map DbCheckImportResult to JournalWithStatus
                        Title: journal.title,
                        Issn: journal.issn,
                        Publisher: journal.publisher || '',
                        Type: journal.crawled ? 'Already in DB' : 'New to DB', // Or use journal.type
                        Country: journal.country || '',
                        Region: journal.region || '',
                        lastUpdated: journal.lastUpdated,
                        message: journal.message,
                        crawled: journal.crawled,
                        actionType: journal.crawled ? 'update' : 'crawl' // Default action
                    }));
                    setParsedDataForSelectionTable(journalsForTable);
                    setDbCheckSummary({
                        totalProcessed: data.totalProcessed,
                        totalExists: data.totalExists,
                        totalNew: data.totalNew
                    });
                    setDbCheckMessages(prev => [...prev, `Database check complete. ${journalsForTable.length} records processed.`]);
                } else {
                    throw new Error("DB check response data is not in the expected format or is empty.");
                }
            } catch (error: any) {
                const axiosError = error as AxiosError<any>;
                let errorMsg = `DB Check API Error: ${axiosError.message}`;
                if (axiosError.response) {
                    errorMsg = `DB Check API Error: ${axiosError.response.status} - ${axiosError.response.data?.message || axiosError.response.data?.error || 'Server error'}`;
                }
                console.error("Error during DB check:", error);
                setCheckDBError(errorMsg);
                setDbCheckMessages(prev => [...prev, errorMsg]);
                setParsedDataForSelectionTable(null);
            } finally {
                setIsCheckingDB(false);
            }
        };
        reader.onerror = () => {
            setFileReadError(`Error reading file: ${reader.error?.message}`);
            setDbCheckMessages(prev => [...prev, `Error: Failed to read file - ${reader.error?.message}`]);
            setIsReadingFile(false);
        };
        reader.readAsText(selectedFile); // Read as text to get rawCsvContent

    }, []);


    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        resetAll();
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
                setFileReadError("Invalid file type. Please select a CSV file.");
                setDbCheckMessages(["Error: Invalid file type. Please select a CSV file."]);
                setFile(null);
                return;
            }
            setFile(selectedFile);
            readFileContentAndCheckDB(selectedFile);
        } else {
            setFile(null);
        }
        if (event.target) event.target.value = ''; // Allow re-selecting the same file
    }, [resetAll, readFileContentAndCheckDB]);


    const startBackendCrawl = useCallback(async () => {
        if (!rawCsvContent) {
            const errorMsg = "Cannot start backend crawl: No raw CSV content available.";
            console.warn(errorMsg);
            setCrawlBackendError(errorMsg);
            setCrawlBackendMessages(prev => [errorMsg, ...prev]); // Add error to messages
            return;
        }
        if (isCrawlingBackend) {
            console.warn("Backend crawl already in progress.");
            return;
        }

        setIsCrawlingBackend(true);
        setCrawlBackendError(null);
        // Clear previous backend messages or decide if you want to append
        setCrawlBackendMessages([`Sending journal data (raw CSV) to backend for crawling...`]);
        setCrawlBackendProgress({ status: 'crawling' });

        console.log("Starting backend journal crawl: Sending raw CSV content.");
        try {
            const params = { dataSource: 'client' }; // <--- THÊM LẠI DÒNG NÀY

            const response = await axios.post<BackendCrawlApiResponse>(API_BACKEND_CRAWL_ENDPOINT, rawCsvContent, {
                params: params, // <--- VÀ THÊM LẠI params VÀO ĐÂY
                headers: { 'Content-Type': 'text/csv' }, // Hoặc 'text/csv' tùy theo backend của bạn
                timeout: 600000 // 10 phút
            });

            console.log(`Backend Crawl - Response Status:`, response.status);
            setCrawlBackendMessages(prev => [...prev, `Backend Crawl: ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`]);

            if (response.data.error) { // Check if backend itself reported an error in the response body
                setCrawlBackendError(`Backend error: ${response.data.error}`);
                setCrawlBackendProgress({ status: 'error' });
                // No need to throw here if we set error and progress, unless you want to catch it again
            } else {
                setCrawlBackendProgress({ status: 'success' });
            }

        } catch (err) {
            const error = err as AxiosError<BackendCrawlApiResponse>;
            console.error(`API Error during Backend Crawl:`, error);
            let errorMessage = `Error during backend crawl: ${error.message}`;
            if (error.response) {
                errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown server error'})`;
            } else if (error.request) {
                errorMessage += ' (No response received from server)';
            }
            setCrawlBackendError(errorMessage);
            setCrawlBackendMessages(prev => [...prev, `FAILED backend crawl. ${errorMessage}`]);
            setCrawlBackendProgress({ status: 'error' });
        } finally {
            setIsCrawlingBackend(false);
        }
    }, [rawCsvContent, isCrawlingBackend, API_BACKEND_CRAWL_ENDPOINT]); // Added API_BACKEND_CRAWL_ENDPOINT to dependencies
    return {
        file,
        rawCsvContent,
        isReadingFile,
        fileReadError,
        scimagoPreviewData, // if you want to display this
        isCheckingDB,
        checkDBError,
        parsedDataForSelectionTable,
        dbCheckSummary,
        dbCheckMessages,
        isCrawlingBackend,
        crawlBackendError,
        crawlBackendProgress,
        crawlBackendMessages,
        handleFileChange,
        startBackendCrawl,
        resetAll,
    };
};